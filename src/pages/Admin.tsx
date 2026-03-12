import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Image, 
  LogOut, 
  Menu,
  X,
  AlertTriangle,
  Loader2,
  Users,
  Settings
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminPackages } from "@/components/admin/AdminPackages";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSettings } from "@/components/admin/AdminSettings";

type Tab = "dashboard" | "bookings" | "packages" | "events" | "users" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Link to="/" className="text-primary hover:underline">
            Return to site
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings" as Tab, label: "Bookings", icon: Calendar },
    { id: "packages" as Tab, label: "Packages", icon: Package },
    { id: "events" as Tab, label: "Event Library", icon: Image },
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-primary/20 text-foreground"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-primary/10 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-primary/10">
          <Link to="/" className="font-display text-xl tracking-[0.15em] text-foreground">
            DONYASS
          </Link>
          <p className="font-body text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-body text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/10">
          <div className="text-xs text-muted-foreground mb-3 px-4">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "bookings" && <AdminBookings />}
          {activeTab === "packages" && <AdminPackages />}
          {activeTab === "events" && <AdminEvents />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "settings" && <AdminSettings />}
        </motion.div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
