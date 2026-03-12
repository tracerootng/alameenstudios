import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Lock, X, Eye, ArrowLeft, Filter, Loader2, Download, ZoomIn, ChevronLeft, ChevronRight, Archive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { accessCodeSchema, getErrorMessage, logError, checkRateLimit, recordAttempt } from "@/lib/security";
import JSZip from "jszip";

interface Event {
  id: string;
  title: string;
  client_name: string;
  event_date: string;
  package_type: string;
  cover_image_url: string | null;
  photo_count: number;
}

interface Photo {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

const packageLabels: Record<string, string> = {
  nairobi: "NAIROBI",
  moscow: "MOSCOW",
  helsinki: "HELSINKI",
  vienna: "VIENNA",
  "prewedding-tier1": "Pre-Wedding Tier 1",
  "prewedding-tier2": "Pre-Wedding Tier 2",
  "prewedding-tier3": "Pre-Wedding Tier 3",
  "prewedding-tier4": "Pre-Wedding Tier 4",
  "studio-essential": "Studio Essential",
  "studio-premium": "Studio Premium",
};

export default function Library() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  
  // Access modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [accessError, setAccessError] = useState("");
  
  // Gallery state
  const [unlockedPhotos, setUnlockedPhotos] = useState<Photo[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [coverSignedUrls, setCoverSignedUrls] = useState<Record<string, string>>({});
  const [coverUrlsLoading, setCoverUrlsLoading] = useState(true);
  const [currentEventTitle, setCurrentEventTitle] = useState<string>("");
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Generate signed URLs for cover images via backend function
  useEffect(() => {
    const generateCoverUrls = async () => {
      if (events.length === 0) {
        setCoverUrlsLoading(false);
        return;
      }
      
      setCoverUrlsLoading(true);
      
      try {
        // Collect all cover paths
        const coverPaths = events
          .filter(event => event.cover_image_url)
          .map(event => event.cover_image_url!);
        
        if (coverPaths.length === 0) {
          setCoverUrlsLoading(false);
          return;
        }
        
        // Call backend function to get signed URLs
        const { data, error } = await supabase.functions.invoke('get-library-covers', {
          body: { coverPaths }
        });
        
        if (error) {
          console.error('Error fetching signed cover URLs:', error);
          setCoverUrlsLoading(false);
          return;
        }
        
        // Map signed URLs back to event IDs
        const urls: Record<string, string> = {};
        events.forEach(event => {
          if (event.cover_image_url && data?.signedUrls?.[event.cover_image_url]) {
            urls[event.id] = data.signedUrls[event.cover_image_url];
          }
        });
        
        setCoverSignedUrls(urls);
      } catch (err) {
        console.error('Error generating cover URLs:', err);
      } finally {
        setCoverUrlsLoading(false);
      }
    };
    
    generateCoverUrls();
  }, [events]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, client_name, event_date, package_type, cover_image_url, photo_count")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      logError("FetchEvents", error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.client_name.toLowerCase().includes(query)
      );
    }

    // Package filter
    if (selectedPackage) {
      result = result.filter((event) => event.package_type === selectedPackage);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.event_date).getTime();
      const dateB = new Date(b.event_date).getTime();
      return sortBy === "date-desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [events, searchQuery, selectedPackage, sortBy]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setAccessCode("");
    setAccessError("");
  };

  const handleVerifyAccess = async () => {
    if (!selectedEvent || !accessCode.trim()) return;

    const code = accessCode.trim().toUpperCase();
    
    // Validate access code format
    const validation = accessCodeSchema.safeParse({ code });
    if (!validation.success) {
      setAccessError(validation.error.errors[0].message);
      return;
    }

    // Check rate limit for this event
    const rateLimitKey = `access-${selectedEvent.id}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${rateLimit.remainingTime} minutes before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setAccessError("");
    
    try {
      // Use backend function to verify access and get signed URLs
      const { data, error } = await supabase.functions.invoke('unlock-event-gallery', {
        body: { 
          eventId: selectedEvent.id,
          accessCode: code
        }
      });

      if (error) throw error;

      if (data?.photos && data.photos.length > 0) {
        recordAttempt(rateLimitKey, true);
        
        // Photos already have signed URLs from the backend
        const photosWithSignedUrls = data.photos.map((photo: any) => ({
          id: photo.id,
          photo_url: photo.signed_photo_url || photo.photo_url,
          thumbnail_url: photo.signed_thumbnail_url || photo.thumbnail_url,
          caption: photo.caption,
          sort_order: photo.sort_order,
        }));
        
        setUnlockedPhotos(photosWithSignedUrls);
        setCurrentEventTitle(selectedEvent.title);
        setShowGallery(true);
        setSelectedEvent(null);
        toast({
          title: "Access Granted",
          description: `Welcome! Viewing ${selectedEvent.title}`,
        });
      } else {
        recordAttempt(rateLimitKey, false);
        setAccessError("Invalid access code. Please check and try again.");
      }
    } catch (error) {
      logError("VerifyAccess", error);
      recordAttempt(rateLimitKey, false);
      setAccessError("Unable to verify access. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setAccessCode("");
    setAccessError("");
  };

  const closeGallery = () => {
    setShowGallery(false);
    setUnlockedPhotos([]);
    setCurrentEventTitle("");
    setLightboxOpen(false);
  };

  // Download single photo
  const downloadPhoto = async (photo: Photo, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(photo.photo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentEventTitle.replace(/\s+/g, "-")}-photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Downloaded",
        description: "Photo saved successfully",
      });
    } catch (error) {
      logError("DownloadPhoto", error);
      toast({
        title: "Download Failed",
        description: "Unable to download photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  // Download all photos
  const downloadAllPhotos = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    
    toast({
      title: "Downloading...",
      description: `Preparing ${unlockedPhotos.length} photos for download`,
    });

    try {
      for (let i = 0; i < unlockedPhotos.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Stagger downloads
        const photo = unlockedPhotos[i];
        const response = await fetch(photo.photo_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentEventTitle.replace(/\s+/g, "-")}-photo-${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      toast({
        title: "Download Complete",
        description: `All ${unlockedPhotos.length} photos downloaded`,
      });
    } catch (error) {
      logError("DownloadAllPhotos", error);
      toast({
        title: "Download Failed",
        description: "Some photos may not have downloaded. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  // Download all as ZIP
  const downloadAsZip = async () => {
    if (downloadingAll || unlockedPhotos.length === 0) return;
    setDownloadingAll(true);

    toast({
      title: "Creating ZIP...",
      description: `Preparing ${unlockedPhotos.length} photos`,
    });

    try {
      const zip = new JSZip();
      
      for (let i = 0; i < unlockedPhotos.length; i++) {
        const photo = unlockedPhotos[i];
        const response = await fetch(photo.photo_url);
        const blob = await response.blob();
        zip.file(`photo-${String(i + 1).padStart(3, "0")}.jpg`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentEventTitle.replace(/\s+/g, "-")}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "ZIP Downloaded",
        description: `All ${unlockedPhotos.length} photos in one file`,
      });
    } catch (error) {
      logError("DownloadZip", error);
      toast({
        title: "Download Failed",
        description: "Failed to create ZIP file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev === 0 ? unlockedPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setLightboxIndex((prev) => (prev === unlockedPhotos.length - 1 ? 0 : prev + 1));
  };

  const uniquePackages = useMemo(() => {
    const packages = new Set(events.map((e) => e.package_type));
    return Array.from(packages);
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-xl tracking-[0.15em] text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              DONYASS
            </Link>
            <h1 className="font-display text-lg tracking-[0.1em] text-foreground">
              Client Library
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs tracking-[0.4em] uppercase text-primary mb-4">
              Exclusive Access
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[0.1em] text-foreground mb-4">
              Event <span className="italic">Gallery</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground max-w-xl mx-auto">
              Browse through our collection of beautifully captured moments. Enter your access code to unlock your gallery.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-10"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <input
                type="text"
                placeholder="Search by title or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxLength={100}
                className="w-full bg-transparent border border-primary/20 focus:border-primary/60 pl-12 pr-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
              />
            </div>

            {/* Package Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="appearance-none bg-card border border-primary/20 focus:border-primary/60 pl-12 pr-10 py-3 font-body text-sm text-foreground outline-none transition-colors cursor-pointer min-w-[180px]"
              >
                <option value="">All Packages</option>
                {uniquePackages.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {packageLabels[pkg] || pkg}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date-desc" | "date-asc")}
                className="appearance-none bg-card border border-primary/20 focus:border-primary/60 pl-12 pr-10 py-3 font-body text-sm text-foreground outline-none transition-colors cursor-pointer min-w-[160px]"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
            </div>
          </motion.div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Lock className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No events found matching your criteria.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleEventClick(event)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
                    {/* Cover Image with Blur/Lock Effect */}
                    {coverUrlsLoading && event.cover_image_url ? (
                      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-muted-foreground/50 animate-spin" />
                      </div>
                    ) : coverSignedUrls[event.id] ? (
                      <img
                        src={coverSignedUrls[event.id]}
                        alt={event.title}
                        className="w-full h-full object-cover filter blur-sm grayscale-[30%] group-hover:blur-none group-hover:grayscale-0 transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Lock Overlay */}
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center group-hover:bg-background/40 transition-colors duration-300">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-body text-xs tracking-[0.2em] uppercase text-primary">
                          Enter Code to View
                        </p>
                      </div>
                    </div>

                    {/* Photo Count Badge */}
                    <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 font-body text-xs text-primary">
                      {event.photo_count} Photos
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-1">
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-primary">
                      {packageLabels[event.package_type] || event.package_type}
                    </p>
                    <h3 className="font-display text-lg tracking-[0.05em] text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date not set"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Access Code Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-card border border-primary/20 p-8 max-w-md w-full"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl tracking-[0.1em] text-foreground mb-2">
                  {selectedEvent.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  Enter your access code to view this gallery
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value.toUpperCase());
                      setAccessError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyAccess()}
                    maxLength={20}
                    className={`w-full bg-transparent border ${accessError ? "border-red-500" : "border-primary/20"} focus:border-primary/60 px-4 py-4 font-body text-lg text-center tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors uppercase`}
                    autoFocus
                  />
                  {accessError && (
                    <p className="text-red-500 text-xs mt-2 text-center">{accessError}</p>
                  )}
                </div>

                <button
                  onClick={handleVerifyAccess}
                  disabled={!accessCode.trim() || verifying}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Unlock Gallery
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery View */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-primary/10">
              <div className="container mx-auto px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeGallery}
                    className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Library
                  </button>
                  <div className="hidden sm:block h-4 w-px bg-primary/20" />
                  <h2 className="font-display text-lg tracking-[0.1em] text-foreground hidden sm:block">
                    {currentEventTitle}
                  </h2>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <p className="font-body text-sm text-primary">
                    {unlockedPhotos.length} Photos
                  </p>
                  <button
                    onClick={downloadAsZip}
                    disabled={downloadingAll || unlockedPhotos.length === 0}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-body text-xs tracking-[0.15em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingAll ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                    Download ZIP
                  </button>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 py-8">
              {unlockedPhotos.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unlockedPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative aspect-square overflow-hidden bg-muted cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || "Event photo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(index);
                          }}
                          className="w-10 h-10 bg-primary/80 flex items-center justify-center text-primary-foreground hover:bg-primary transition-colors"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPhoto(photo, index);
                          }}
                          disabled={downloadingIndex === index}
                          className="w-10 h-10 bg-primary/80 flex items-center justify-center text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50"
                        >
                          {downloadingIndex === index ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {/* Photo Number */}
                      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 font-body text-xs text-primary">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="font-body text-muted-foreground">
                    No photos available in this gallery yet.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && unlockedPhotos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-primary/20 hover:bg-primary/40 text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-primary/20 hover:bg-primary/40 text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={unlockedPhotos[lightboxIndex].photo_url}
                alt={unlockedPhotos[lightboxIndex].caption || "Event photo"}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </motion.div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <span className="font-body text-sm text-muted-foreground">
                {lightboxIndex + 1} / {unlockedPhotos.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPhoto(unlockedPhotos[lightboxIndex], lightboxIndex);
                }}
                disabled={downloadingIndex === lightboxIndex}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-body text-xs tracking-[0.15em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {downloadingIndex === lightboxIndex ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
