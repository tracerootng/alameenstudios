import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Mail, Phone, Calendar, MapPin, Check, X, Eye, AlertTriangle, Clock, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, logError } from "@/lib/security";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  event_date: string;
  package_name: string;
  message: string;
  status: string;
  created_at: string;
}

interface DateClash {
  date: string;
  bookings: Booking[];
}

export function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showClashModal, setShowClashModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      logError("FetchBookings", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === id ? { ...b, status } : b))
      );

      toast({ title: "Status updated", description: `Booking marked as ${status}` });
    } catch (error) {
      logError("UpdateBookingStatus", error);
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  // Detect date clashes (confirmed bookings on same date)
  const dateClashes = useMemo(() => {
    const confirmedBookings = bookings.filter(b => b.status === "confirmed");
    const dateMap = new Map<string, Booking[]>();
    
    confirmedBookings.forEach(booking => {
      const date = booking.event_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(booking);
    });

    const clashes: DateClash[] = [];
    dateMap.forEach((bookingList, date) => {
      if (bookingList.length > 1) {
        clashes.push({ date, bookings: bookingList });
      }
    });

    return clashes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings]);

  // Check if a booking has a clash
  const hasClash = (booking: Booking) => {
    if (booking.status !== "confirmed") return false;
    return dateClashes.some(clash => clash.date === booking.event_date);
  };

  // Stats
  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;
    return { pending, confirmed, cancelled, total: bookings.length };
  }, [bookings]);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage client inquiries and bookings</p>
        </div>
        
        {/* Clash Alert */}
        {dateClashes.length > 0 && (
          <button
            onClick={() => setShowClashModal(true)}
            className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 text-sm hover:bg-amber-500/30 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            {dateClashes.length} Date Clash{dateClashes.length > 1 ? "es" : ""} Detected
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-yellow-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-green-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 flex items-center justify-center">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{stats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            placeholder="Search by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-primary/20 focus:border-primary/60 pl-12 pr-4 py-3 font-body text-sm text-foreground outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-card border border-primary/20 pl-12 pr-10 py-3 font-body text-sm text-foreground outline-none min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Event Date</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Location</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-t border-primary/10 hover:bg-muted/20 ${
                      hasClash(booking) ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {hasClash(booking) && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-body text-sm text-foreground">{booking.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${hasClash(booking) ? "text-amber-400 font-medium" : "text-foreground"}`}>
                        {format(parseISO(booking.event_date), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(booking.created_at), "MMM d")} request
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">{booking.location}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">{booking.package_name || "Not selected"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 ${
                        booking.status === "confirmed"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "cancelled"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 hover:bg-primary/10 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                        {booking.status !== "confirmed" && (
                          <button
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="p-2 hover:bg-green-500/10 transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="p-2 hover:bg-red-500/10 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                        {booking.status !== "pending" && (
                          <button
                            onClick={() => updateStatus(booking.id, "pending")}
                            className="p-2 hover:bg-yellow-500/10 transition-colors"
                            title="Mark Pending"
                          >
                            <Clock className="w-4 h-4 text-yellow-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-primary/20 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl text-foreground">Booking Details</h3>
                {hasClash(selectedBooking) && (
                  <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-1">
                    <AlertTriangle className="w-3 h-3" />
                    Date Clash
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30">
                <div className={`px-3 py-1 text-xs ${
                  selectedBooking.status === "confirmed"
                    ? "bg-green-500/20 text-green-400"
                    : selectedBooking.status === "cancelled"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {selectedBooking.status.toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground">
                  Submitted {format(parseISO(selectedBooking.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedBooking.email}`} className="text-foreground hover:text-primary transition-colors">
                      {selectedBooking.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedBooking.phone}`} className="text-foreground hover:text-primary transition-colors">
                      {selectedBooking.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-foreground">{selectedBooking.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Event Date</p>
                  <p className={hasClash(selectedBooking) ? "text-amber-400 font-medium" : "text-foreground"}>
                    {format(parseISO(selectedBooking.event_date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              {selectedBooking.package_name && (
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Package</p>
                  <p className="text-foreground">{selectedBooking.package_name}</p>
                </div>
              )}

              {selectedBooking.message && (
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground mb-2">Client Message</p>
                  <p className="text-foreground text-sm bg-muted/30 p-3">{selectedBooking.message}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
              <button
                onClick={() => {
                  updateStatus(selectedBooking.id, "confirmed");
                  setSelectedBooking(null);
                }}
                disabled={selectedBooking.status === "confirmed"}
                className="flex-1 bg-green-500/20 text-green-400 py-2 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedBooking.id, "pending");
                  setSelectedBooking(null);
                }}
                disabled={selectedBooking.status === "pending"}
                className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pending
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedBooking.id, "cancelled");
                  setSelectedBooking(null);
                }}
                disabled={selectedBooking.status === "cancelled"}
                className="flex-1 bg-red-500/20 text-red-400 py-2 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Date Clash Modal */}
      {showClashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-amber-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h3 className="font-display text-xl text-foreground">Date Clashes Detected</h3>
              </div>
              <button onClick={() => setShowClashModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              The following dates have multiple confirmed bookings. Please review and resolve conflicts.
            </p>

            <div className="space-y-4">
              {dateClashes.map((clash) => (
                <div key={clash.date} className="border border-amber-500/20 p-4 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="font-display text-foreground">
                      {format(parseISO(clash.date), "EEEE, MMMM d, yyyy")}
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5">
                      {clash.bookings.length} bookings
                    </span>
                  </div>
                  <div className="space-y-2">
                    {clash.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 bg-background/50">
                        <div>
                          <p className="text-sm text-foreground">{booking.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.location} • {booking.package_name || "No package"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowClashModal(false);
                              setSelectedBooking(booking);
                            }}
                            className="p-1.5 hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="p-1.5 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
