import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Upload, X, Image, Loader2, Copy, Check, Images, ChevronRight, Search, CheckSquare, Square, Trash, CalendarIcon, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { generateAccessCode, logError } from "@/lib/security";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { UploadProgress, UploadFile } from "./UploadProgress";

interface Event {
  id: string;
  title: string;
  client_name: string;
  event_date: string;
  package_type: string;
  cover_image_url: string | null;
  access_code: string;
  photo_count: number;
}

interface EventPhoto {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

const packageOptions = [
  { value: "nairobi", label: "NAIROBI" },
  { value: "moscow", label: "MOSCOW" },
  { value: "helsinki", label: "HELSINKI" },
  { value: "vienna", label: "VIENNA" },
  { value: "prewedding-tier1", label: "Pre-Wedding Tier 1" },
  { value: "prewedding-tier2", label: "Pre-Wedding Tier 2" },
  { value: "prewedding-tier3", label: "Pre-Wedding Tier 3" },
  { value: "prewedding-tier4", label: "Pre-Wedding Tier 4" },
  { value: "studio-essential", label: "Studio Essential" },
  { value: "studio-premium", label: "Studio Premium" },
];

const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT = 30000; // 30 seconds

export function AdminEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [signedUrlsLoading, setSignedUrlsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Bulk selection state
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPackage, setFilterPackage] = useState<string>("all");
  
  // Photo gallery management
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [selectedEventForPhotos, setSelectedEventForPhotos] = useState<Event | null>(null);
  const [eventPhotos, setEventPhotos] = useState<EventPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [slowConnection, setSlowConnection] = useState(false);
  const [photoSignedUrls, setPhotoSignedUrls] = useState<Record<string, string>>({});
  const multiPhotoInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortController = useRef<AbortController | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    event_date: "",
    package_type: "nairobi",
    cover_image_url: "",
    access_code: "",
  });

  // Drag and drop state
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const dragCounterPhotos = useRef(0);
  const dragCounterCover = useRef(0);

  // Filtered events based on search and package filter
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.access_code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPackage = filterPackage === "all" || event.package_type === filterPackage;
      
      return matchesSearch && matchesPackage;
    });
  }, [events, searchQuery, filterPackage]);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Generate signed URLs for all event cover images
  useEffect(() => {
    const generateSignedUrls = async () => {
      setSignedUrlsLoading(true);
      const urls: Record<string, string> = {};
      
      // Process in parallel for better performance
      const urlPromises = events
        .filter(event => event.cover_image_url)
        .map(async (event) => {
          const url = await getSignedCoverUrl(event.cover_image_url!);
          return { id: event.id, url };
        });
      
      const results = await Promise.all(urlPromises);
      results.forEach(({ id, url }) => {
        urls[id] = url;
      });
      
      setSignedUrls(urls);
      setSignedUrlsLoading(false);
    };
    
    if (events.length > 0) {
      generateSignedUrls();
    } else {
      setSignedUrlsLoading(false);
    }
  }, [events]);

  // Helper to get signed URL for cover images
  const getSignedCoverUrl = async (coverUrl: string): Promise<string> => {
    if (!coverUrl) return "";
    
    // If it's already a signed URL, return as-is
    if (coverUrl.includes('token=')) return coverUrl;
    
    // If it's already a full external URL (not supabase), return as-is
    if (coverUrl.startsWith('http') && !coverUrl.includes('supabase')) {
      return coverUrl;
    }
    
    // The path is stored as a relative path (e.g., "covers/xxx.jpg")
    // Use it directly for signing
    const path = coverUrl.startsWith('http') 
      ? coverUrl.match(/\/event-photos\/(.+)$/)?.[1] || coverUrl
      : coverUrl;
    
    try {
      const { data, error } = await supabase.storage
        .from('event-photos')
        .createSignedUrl(path, 3600);
      
      if (error) {
        console.error('Failed to create signed URL for:', path, error);
        return "";
      }
      
      return data?.signedUrl || "";
    } catch (err) {
      console.error('Error creating signed URL:', err);
      return "";
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      logError("FetchEvents", error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        client_name: event.client_name,
        event_date: event.event_date,
        package_type: event.package_type,
        cover_image_url: event.cover_image_url || "",
        access_code: event.access_code,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        client_name: "",
        event_date: "",
        package_type: "nairobi",
        cover_image_url: "",
        access_code: generateAccessCode(),
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      client_name: "",
      event_date: "",
      package_type: "nairobi",
      cover_image_url: "",
      access_code: "",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `covers/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setFormData({ ...formData, cover_image_url: fileName });
      toast({ title: "Image uploaded", description: "Cover image uploaded successfully" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveEvent = async () => {
    if (!formData.title || !formData.client_name || !formData.event_date) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(formData)
          .eq("id", editingEvent.id);

        if (error) throw error;

        setEvents(prev =>
          prev.map(e => (e.id === editingEvent.id ? { ...e, ...formData } : e))
        );
        toast({ title: "Event updated" });
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        setEvents(prev => [data, ...prev]);
        toast({ title: "Event created", description: `Access code: ${formData.access_code}` });
      }

      closeForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save event", variant: "destructive" });
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event and all its photos?")) return;

    try {
      // First delete all photos for this event
      const { error: photosError } = await supabase
        .from("event_photos")
        .delete()
        .eq("event_id", id);
      
      if (photosError) throw photosError;

      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Bulk selection functions
  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const clearSelection = () => {
    setSelectedEvents(new Set());
  };

  const bulkDeleteEvents = async () => {
    if (selectedEvents.size === 0) return;
    
    const count = selectedEvents.size;
    if (!confirm(`Are you sure you want to delete ${count} event(s) and ALL their photos? This cannot be undone.`)) return;

    setBulkDeleting(true);
    
    try {
      const eventIds = Array.from(selectedEvents);
      
      // First, get all photos for these events to delete from storage
      const { data: photosToDelete } = await supabase
        .from("event_photos")
        .select("photo_url")
        .in("event_id", eventIds);
      
      // Delete photos from storage
      if (photosToDelete && photosToDelete.length > 0) {
        const photoPaths = photosToDelete.map(p => p.photo_url);
        await supabase.storage.from("event-photos").remove(photoPaths);
      }
      
      // Delete all photo records for these events
      const { error: photosError } = await supabase
        .from("event_photos")
        .delete()
        .in("event_id", eventIds);
      
      if (photosError) throw photosError;

      // Delete cover images from storage
      const coverImagesToDelete = events
        .filter(e => eventIds.includes(e.id) && e.cover_image_url)
        .map(e => e.cover_image_url as string);
      
      if (coverImagesToDelete.length > 0) {
        await supabase.storage.from("event-photos").remove(coverImagesToDelete);
      }

      // Delete the events
      const { error } = await supabase
        .from("events")
        .delete()
        .in("id", eventIds);
      
      if (error) throw error;

      // Update local state
      setEvents(prev => prev.filter(e => !selectedEvents.has(e.id)));
      setSelectedEvents(new Set());
      
      toast({ 
        title: "Events deleted", 
        description: `Successfully deleted ${count} event(s) and all associated photos` 
      });
    } catch (error) {
      logError("BulkDeleteEvents", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete some events", 
        variant: "destructive" 
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Photo Manager Functions
  const openPhotoManager = async (event: Event) => {
    setSelectedEventForPhotos(event);
    setShowPhotoManager(true);
    setLoadingPhotos(true);
    
    try {
      // Use service role through RPC for admin access
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", event.id)
        .order("sort_order");

      if (error) throw error;
      
      setEventPhotos(data || []);
      
      // Generate signed URLs for photos
      const urls: Record<string, string> = {};
      for (const photo of data || []) {
        const url = await getSignedPhotoUrl(photo.photo_url);
        urls[photo.id] = url;
      }
      setPhotoSignedUrls(urls);
    } catch (error) {
      logError("FetchEventPhotos", error);
      toast({ title: "Error", description: "Failed to load photos", variant: "destructive" });
    } finally {
      setLoadingPhotos(false);
    }
  };

  const getSignedPhotoUrl = async (photoUrl: string): Promise<string> => {
    if (!photoUrl) return "";
    if (photoUrl.includes('token=')) return photoUrl;
    
    // The path is stored as a relative path
    const path = photoUrl.startsWith('http') 
      ? photoUrl.match(/\/event-photos\/([^?]+)/)?.[1] || photoUrl
      : photoUrl;
    
    try {
      const { data, error } = await supabase.storage
        .from('event-photos')
        .createSignedUrl(path, 3600);
      
      if (error) {
        console.error('Failed to create signed URL for photo:', path, error);
        return "";
      }
      
      return data?.signedUrl || "";
    } catch (err) {
      console.error('Error creating signed photo URL:', err);
      return "";
    }
  };

  const closePhotoManager = () => {
    setShowPhotoManager(false);
    setSelectedEventForPhotos(null);
    setEventPhotos([]);
    setPhotoSignedUrls({});
  };

  // Upload single file with retry logic
  const uploadSingleFile = useCallback(async (
    file: File,
    fileName: string,
    retryCount = 0
  ): Promise<{ success: boolean; error?: string }> => {
    const startTime = Date.now();
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);
      
      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file);

      clearTimeout(timeoutId);
      
      // Check if upload took too long (slow connection indicator)
      if (Date.now() - startTime > 5000) {
        setSlowConnection(true);
      }

      if (uploadError) {
        throw uploadError;
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      
      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return uploadSingleFile(file, fileName, retryCount + 1);
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Process files for upload (shared between click and drag-drop)
  const processFilesForUpload = async (files: File[]) => {
    if (files.length === 0 || !selectedEventForPhotos) return;

    // Filter to only accept image files
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({ title: "Invalid files", description: "Please select image files only", variant: "destructive" });
      return;
    }

    if (imageFiles.length !== files.length) {
      toast({ title: "Some files skipped", description: `${files.length - imageFiles.length} non-image files were ignored` });
    }

    // Initialize upload files with previews
    const initialFiles: UploadFile[] = imageFiles.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      status: "queued" as const,
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadFiles(initialFiles);
    setUploadingPhotos(true);
    setSlowConnection(false);
    uploadAbortController.current = new AbortController();

    const uploadedPhotos: EventPhoto[] = [];
    const currentMaxOrder = eventPhotos.length > 0 
      ? Math.max(...eventPhotos.map(p => p.sort_order)) 
      : 0;

    try {
      for (let i = 0; i < initialFiles.length; i++) {
        // Check if upload was cancelled
        if (uploadAbortController.current?.signal.aborted) {
          break;
        }

        const uploadFile = initialFiles[i];
        const file = uploadFile.file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${selectedEventForPhotos.id}/${Date.now()}-${i}.${fileExt}`;

        // Update status to uploading
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: "uploading" as const, progress: 50 } : f
        ));

        // Upload with retry logic
        const result = await uploadSingleFile(file, fileName);

        if (!result.success) {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "failed" as const, error: result.error } 
              : f
          ));
          continue;
        }

        // Insert photo record
        const { data: photoData, error: insertError } = await supabase
          .from("event_photos")
          .insert({
            event_id: selectedEventForPhotos.id,
            photo_url: fileName,
            sort_order: currentMaxOrder + i + 1,
          })
          .select()
          .single();

        if (insertError) {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "failed" as const, error: "Failed to save record" } 
              : f
          ));
          continue;
        }

        uploadedPhotos.push(photoData);
        
        // Update status to complete
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: "complete" as const, progress: 100 } : f
        ));
      }

      // Update photo count on event
      if (uploadedPhotos.length > 0) {
        const newCount = eventPhotos.length + uploadedPhotos.length;
        await supabase
          .from("events")
          .update({ photo_count: newCount })
          .eq("id", selectedEventForPhotos.id);

        // Update local state
        setEventPhotos(prev => [...prev, ...uploadedPhotos]);
        setEvents(prev => 
          prev.map(e => e.id === selectedEventForPhotos.id 
            ? { ...e, photo_count: newCount } 
            : e
          )
        );

        // Generate signed URLs for new photos
        const newUrls = { ...photoSignedUrls };
        for (const photo of uploadedPhotos) {
          newUrls[photo.id] = await getSignedPhotoUrl(photo.photo_url);
        }
        setPhotoSignedUrls(newUrls);
      }

      const failedCount = initialFiles.length - uploadedPhotos.length;
      if (failedCount > 0) {
        toast({ 
          title: "Upload partially complete", 
          description: `${uploadedPhotos.length} uploaded, ${failedCount} failed`,
          variant: failedCount === initialFiles.length ? "destructive" : "default"
        });
      } else {
        toast({ 
          title: "Upload complete", 
          description: `${uploadedPhotos.length} photos uploaded successfully` 
        });
      }
    } catch (error) {
      logError("MultiPhotoUpload", error);
      toast({ title: "Upload failed", description: "An error occurred during upload", variant: "destructive" });
    } finally {
      setUploadingPhotos(false);
      setSlowConnection(false);
      uploadAbortController.current = null;
      if (multiPhotoInputRef.current) {
        multiPhotoInputRef.current.value = "";
      }
      // Clean up preview URLs after a delay
      setTimeout(() => {
        initialFiles.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
      }, 2000);
    }
  };

  const handleMultiPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFilesForUpload(Array.from(files));
  };

  // Drag and drop handlers for photo upload
  const handlePhotoDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterPhotos.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingPhotos(true);
    }
  };

  const handlePhotoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterPhotos.current--;
    if (dragCounterPhotos.current === 0) {
      setIsDraggingPhotos(false);
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterPhotos.current = 0;
    setIsDraggingPhotos(false);

    const files = Array.from(e.dataTransfer.files);
    await processFilesForUpload(files);
  };

  // Drag and drop handlers for cover image
  const handleCoverDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterCover.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingCover(true);
    }
  };

  const handleCoverDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterCover.current--;
    if (dragCounterCover.current === 0) {
      setIsDraggingCover(false);
    }
  };

  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterCover.current = 0;
    setIsDraggingCover(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({ title: "Invalid file", description: "Please drop an image file", variant: "destructive" });
      return;
    }

    if (imageFiles.length > 1) {
      toast({ title: "Multiple files", description: "Only one cover image allowed. Using the first image." });
    }

    // Trigger upload with the first image
    const file = imageFiles[0];
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `covers/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setFormData({ ...formData, cover_image_url: fileName });
      toast({ title: "Image uploaded", description: "Cover image uploaded successfully" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRetryUpload = async (fileId: string) => {
    const uploadFile = uploadFiles.find(f => f.id === fileId);
    if (!uploadFile || !selectedEventForPhotos) return;

    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "retrying" as const, retryCount: (f.retryCount || 0) + 1 } : f
    ));

    const file = uploadFile.file;
    const fileExt = file.name.split(".").pop();
    const fileName = `${selectedEventForPhotos.id}/${Date.now()}.${fileExt}`;

    const result = await uploadSingleFile(file, fileName);

    if (!result.success) {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "failed" as const, error: result.error } : f
      ));
      return;
    }

    const currentMaxOrder = eventPhotos.length > 0 
      ? Math.max(...eventPhotos.map(p => p.sort_order)) 
      : 0;

    const { data: photoData, error: insertError } = await supabase
      .from("event_photos")
      .insert({
        event_id: selectedEventForPhotos.id,
        photo_url: fileName,
        sort_order: currentMaxOrder + 1,
      })
      .select()
      .single();

    if (insertError) {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "failed" as const, error: "Failed to save record" } : f
      ));
      return;
    }

    // Update local state
    setEventPhotos(prev => [...prev, photoData]);
    const newCount = eventPhotos.length + 1;
    await supabase
      .from("events")
      .update({ photo_count: newCount })
      .eq("id", selectedEventForPhotos.id);

    setEvents(prev => 
      prev.map(e => e.id === selectedEventForPhotos.id 
        ? { ...e, photo_count: newCount } 
        : e
      )
    );

    // Generate signed URL
    const signedUrl = await getSignedPhotoUrl(photoData.photo_url);
    setPhotoSignedUrls(prev => ({ ...prev, [photoData.id]: signedUrl }));

    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "complete" as const, progress: 100 } : f
    ));

    toast({ title: "Photo uploaded", description: "Retry successful" });
  };

  const handleRetryAllFailed = async () => {
    const failedFiles = uploadFiles.filter(f => f.status === "failed");
    for (const file of failedFiles) {
      await handleRetryUpload(file.id);
    }
  };

  const handleCancelUpload = () => {
    uploadAbortController.current?.abort();
    setUploadingPhotos(false);
    setUploadFiles([]);
    toast({ title: "Upload cancelled" });
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    if (!confirm("Delete this photo?")) return;

    try {
      // Delete from storage
      await supabase.storage.from("event-photos").remove([photoUrl]);

      // Delete record
      const { error } = await supabase
        .from("event_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      // Update local state
      setEventPhotos(prev => prev.filter(p => p.id !== photoId));
      
      // Update photo count
      if (selectedEventForPhotos) {
        const newCount = eventPhotos.length - 1;
        await supabase
          .from("events")
          .update({ photo_count: newCount })
          .eq("id", selectedEventForPhotos.id);

        setEvents(prev => 
          prev.map(e => e.id === selectedEventForPhotos.id 
            ? { ...e, photo_count: newCount } 
            : e
          )
        );
      }

      toast({ title: "Photo deleted" });
    } catch (error) {
      logError("DeletePhoto", error);
      toast({ title: "Error", description: "Failed to delete photo", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }

  const isAllSelected = filteredEvents.length > 0 && selectedEvents.size === filteredEvents.length;
  const hasSelection = selectedEvents.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">Event Library</h1>
          <p className="text-muted-foreground text-sm">
            {events.length} events • {filteredEvents.length} shown
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, client, or access code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-primary/20 pl-10 pr-4 py-2 text-foreground text-sm outline-none focus:border-primary/60 placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={filterPackage}
          onChange={(e) => setFilterPackage(e.target.value)}
          className="bg-card border border-primary/20 px-4 py-2 text-foreground text-sm outline-none min-w-[180px]"
        >
          <option value="all">All Packages</option>
          {packageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex items-center gap-3 py-3 px-4 border border-primary/10 bg-card/50">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {isAllSelected ? "Deselect All" : "Select All"}
        </button>
        
        {hasSelection && (
          <>
            <span className="text-muted-foreground text-sm">
              {selectedEvents.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={clearSelection}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
            <button
              onClick={bulkDeleteEvents}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {bulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash className="w-4 h-4" />
              )}
              Delete Selected
            </button>
          </>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => {
          const isSelected = selectedEvents.has(event.id);
          
          return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-card border overflow-hidden transition-colors ${
              isSelected ? "border-primary ring-2 ring-primary/30" : "border-primary/10"
            }`}
          >
            <div className="aspect-video bg-muted relative">
              {/* Selection Checkbox */}
              <button
                onClick={() => toggleEventSelection(event.id)}
                className="absolute top-2 left-2 z-10 p-1.5 bg-background/80 hover:bg-background transition-colors"
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {signedUrlsLoading && event.cover_image_url ? (
                <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
                  <Loader2 className="w-6 h-6 text-muted-foreground/50 animate-spin" />
                </div>
              ) : event.cover_image_url && signedUrls[event.id] ? (
                <img
                  src={signedUrls[event.id]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => openPhotoManager(event)}
                  className="p-2 bg-background/80 hover:bg-background transition-colors"
                  title="Manage Photos"
                >
                  <Images className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => openForm(event)}
                  className="p-2 bg-background/80 hover:bg-background transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 bg-background/80 hover:bg-background transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              
              {/* Photo count badge */}
              <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 text-xs text-primary flex items-center gap-1">
                <Images className="w-3 h-3" />
                {event.photo_count} photos
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-display text-foreground">{event.title}</h3>
              <p className="text-xs text-muted-foreground">{event.client_name}</p>
              <p className="text-xs text-muted-foreground">
                {event.event_date 
                  ? format(new Date(event.event_date), "MMMM d, yyyy")
                  : "Date not set"}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1">
                  {packageOptions.find(p => p.value === event.package_type)?.label || event.package_type}
                </span>
                <button
                  onClick={() => copyAccessCode(event.access_code)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedCode === event.access_code ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {event.access_code}
                </button>
              </div>
              
              {/* Manage Photos Button */}
              <button
                onClick={() => openPhotoManager(event)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 border border-primary/20 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <Images className="w-3.5 h-3.5" />
                Manage Gallery
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
          );
        })}

        {filteredEvents.length === 0 && events.length > 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events match your search criteria.
          </div>
        )}

        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events yet. Create your first event library.
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-primary/20 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-foreground">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h3>
                <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-transparent border border-primary/20 px-4 py-2 text-foreground outline-none focus:border-primary/60"
                    placeholder="Wedding of John & Jane"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Client Name *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-transparent border border-primary/20 px-4 py-2 text-foreground outline-none focus:border-primary/60"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Event Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full flex items-center justify-between bg-transparent border border-primary/20 px-4 py-2 text-left outline-none focus:border-primary/60",
                          !formData.event_date && "text-muted-foreground"
                        )}
                      >
                        {formData.event_date ? format(new Date(formData.event_date), "PPP") : "Select date"}
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.event_date ? new Date(formData.event_date) : undefined}
                        onSelect={(date) => setFormData({ ...formData, event_date: date ? format(date, "yyyy-MM-dd") : "" })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Package</label>
                  <select
                    value={formData.package_type}
                    onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
                    className="w-full bg-card border border-primary/20 px-4 py-2 text-foreground outline-none"
                  >
                    {packageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Access Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.access_code}
                      onChange={(e) => setFormData({ ...formData, access_code: e.target.value.toUpperCase() })}
                      className="flex-1 bg-transparent border border-primary/20 px-4 py-2 text-foreground outline-none focus:border-primary/60 uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, access_code: generateAccessCode() })}
                      className="px-3 border border-primary/20 text-xs text-primary hover:bg-primary/10 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cover Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.cover_image_url ? (
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={signedUrls[editingEvent?.id || ""] || ""}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                        className="absolute top-2 right-2 p-1 bg-background/80 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleCoverDragEnter}
                      onDragLeave={handleCoverDragLeave}
                      onDragOver={handleCoverDragOver}
                      onDrop={handleCoverDrop}
                      className={cn(
                        "relative w-full aspect-video border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200",
                        isDraggingCover 
                          ? "border-primary bg-primary/20 scale-[1.02]" 
                          : "border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isDraggingCover ? (
                        <>
                          <Upload className="w-8 h-8 text-primary animate-bounce" />
                          <span className="text-sm font-medium text-primary">Drop image here</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Click or drag to upload</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
                <button
                  onClick={closeForm}
                  className="flex-1 py-2 border border-primary/20 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="flex-1 py-2 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Manager Modal */}
      <AnimatePresence>
        {showPhotoManager && selectedEventForPhotos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-primary/20 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl text-foreground">
                    {selectedEventForPhotos.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {eventPhotos.length} photos • Access code: {selectedEventForPhotos.access_code}
                  </p>
                </div>
                <button onClick={closePhotoManager} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Section */}
              <div 
                onDragEnter={handlePhotoDragEnter}
                onDragLeave={handlePhotoDragLeave}
                onDragOver={handlePhotoDragOver}
                onDrop={handlePhotoDrop}
                className={cn(
                  "relative mb-6 p-4 border-2 border-dashed transition-all duration-200",
                  isDraggingPhotos 
                    ? "border-primary bg-primary/20 scale-[1.01]" 
                    : "border-primary/30 bg-primary/5"
                )}
              >
                <input
                  type="file"
                  ref={multiPhotoInputRef}
                  onChange={handleMultiPhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                {/* Drag overlay */}
                {isDraggingPhotos && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary/20 z-10"
                  >
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
                      <p className="text-lg font-medium text-primary">Drop photos here</p>
                      <p className="text-sm text-primary/70">Release to upload</p>
                    </div>
                  </motion.div>
                )}
                
                {uploadFiles.length > 0 ? (
                  <UploadProgress
                    files={uploadFiles}
                    onRetry={handleRetryUpload}
                    onRetryAll={handleRetryAllFailed}
                    onCancel={handleCancelUpload}
                    isUploading={uploadingPhotos}
                    slowConnection={slowConnection}
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={() => multiPhotoInputRef.current?.click()}
                      disabled={uploadingPhotos}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photos
                    </button>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click</span> to select or <span className="font-medium">drag & drop</span> photos here. Supported: JPG, PNG, WEBP
                    </p>
                  </div>
                )}
              </div>

              {/* Photos Grid */}
              {loadingPhotos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : eventPhotos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos yet. Upload photos to this gallery.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {eventPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="relative group aspect-square bg-muted overflow-hidden"
                    >
                      <img
                        src={photoSignedUrls[photo.id] || ""}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => deletePhoto(photo.id, photo.photo_url)}
                          className="p-2 bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 text-xs text-muted-foreground">
                        #{index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
