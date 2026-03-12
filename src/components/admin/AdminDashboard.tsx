import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle, TrendingUp, Package, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface Booking {
  id: string;
  name: string;
  email: string;
  event_date: string;
  package_name: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .order("event_date", { ascending: true });

      if (bookingsData) {
        setBookings(bookingsData);
        
        const pending = bookingsData.filter(b => b.status === "pending").length;
        const confirmed = bookingsData.filter(b => b.status === "confirmed").length;
        
        setStats({
          totalBookings: bookingsData.length,
          pendingBookings: pending,
          confirmedBookings: confirmed,
          totalRevenue: 0, // Would calculate from package prices
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Find booking clashes (same date)
  const clashes = useMemo(() => {
    const dateMap = new Map<string, Booking[]>();
    
    bookings.forEach(booking => {
      const date = booking.event_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(booking);
    });

    return Array.from(dateMap.entries())
      .filter(([_, bookings]) => bookings.length > 1)
      .map(([date, bookings]) => ({ date, bookings }));
  }, [bookings]);

  // Calendar days for current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => isSameDay(parseISO(b.event_date), day));
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your studio activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/10 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Bookings</span>
          </div>
          <p className="font-display text-3xl text-foreground">{stats.totalBookings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-primary/10 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Pending</span>
          </div>
          <p className="font-display text-3xl text-foreground">{stats.pendingBookings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-primary/10 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Confirmed</span>
          </div>
          <p className="font-display text-3xl text-foreground">{stats.confirmedBookings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-primary/10 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Clashes</span>
          </div>
          <p className="font-display text-3xl text-foreground">{clashes.length}</p>
        </motion.div>
      </div>

      {/* Booking Clashes Warning */}
      {clashes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-lg text-foreground">Booking Clashes Detected</h3>
          </div>
          <div className="space-y-3">
            {clashes.map(({ date, bookings }) => (
              <div key={date} className="bg-background/50 p-4 border border-red-500/20">
                <p className="font-body text-sm text-red-400 mb-2">
                  {format(parseISO(date), "MMMM d, yyyy")} - {bookings.length} bookings
                </p>
                <div className="space-y-1">
                  {bookings.map(b => (
                    <p key={b.id} className="text-xs text-muted-foreground">
                      • {b.name} ({b.package_name || "No package"})
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Calendar View */}
      <div className="bg-card border border-primary/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))}
              className="px-3 py-1 text-sm border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))}
              className="px-3 py-1 text-sm border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {calendarDays.map(day => {
            const dayBookings = getBookingsForDay(day);
            const hasClash = dayBookings.length > 1;
            const hasBooking = dayBookings.length > 0;
            
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border p-1 text-xs relative ${
                  hasClash
                    ? "bg-red-500/20 border-red-500/50"
                    : hasBooking
                    ? "bg-primary/10 border-primary/30"
                    : "border-primary/10"
                }`}
              >
                <span className={`${isSameDay(day, new Date()) ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </span>
                {hasBooking && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className={`text-[10px] truncate ${hasClash ? "text-red-400" : "text-primary"}`}>
                      {dayBookings.length} booking{dayBookings.length > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-card border border-primary/10 p-6">
        <h3 className="font-display text-lg text-foreground mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="flex items-center justify-between py-3 border-b border-primary/10 last:border-0">
                <div>
                  <p className="font-body text-sm text-foreground">{booking.name}</p>
                  <p className="text-xs text-muted-foreground">{booking.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary">{format(parseISO(booking.event_date), "MMM d, yyyy")}</p>
                  <span className={`text-xs px-2 py-0.5 ${
                    booking.status === "confirmed" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
