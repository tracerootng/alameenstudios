import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, UserMinus, RefreshCw } from "lucide-react";

export function AdminSettings() {
  const { toast } = useToast();
  const [allowSignup, setAllowSignup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "allow_signup")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAllowSignup(data.value === true || data.value === "true");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSignup = async () => {
    setUpdating(true);
    try {
      const newValue = !allowSignup;

      const { error } = await supabase
        .from("app_settings")
        .update({ value: newValue })
        .eq("key", "allow_signup");

      if (error) throw error;

      setAllowSignup(newValue);

      toast({
        title: "Settings updated",
        description: newValue
          ? "New signups are now allowed"
          : "Signups are now disabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReshufflePhotos = () => {
    const newSeed = Math.floor(Math.random() * 10000);
    window.localStorage.setItem('alameen_photo_seed', newSeed.toString());
    toast({
      title: "Photos Reshuffled",
      description: "Gallery photos have been randomly reassigned across the website.",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">
          Settings
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Configure admin portal settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Signup Toggle */}
        <div className="bg-card border border-primary/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 ${
                  allowSignup ? "bg-primary/10" : "bg-muted"
                } transition-colors`}
              >
                {allowSignup ? (
                  <UserPlus className="w-5 h-5 text-primary" />
                ) : (
                  <UserMinus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">
                  Allow New Signups
                </h3>
                <p className="font-body text-sm text-muted-foreground max-w-md">
                  {allowSignup
                    ? "New users can create accounts on the admin login page. Disable this after creating all admin accounts."
                    : "Signups are disabled. Only existing users can log in to the admin portal."}
                </p>
              </div>
            </div>

            <button
              onClick={toggleSignup}
              disabled={updating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowSignup ? "bg-primary" : "bg-muted"
              } disabled:opacity-50`}
            >
              {updating ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                </span>
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowSignup ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className={`p-4 border ${
            allowSignup
              ? "border-primary/20 bg-primary/5"
              : "border-muted bg-muted/30"
          }`}
        >
          <p className="font-body text-sm">
            <span className="font-medium text-foreground">Current status:</span>{" "}
            <span className={allowSignup ? "text-primary" : "text-muted-foreground"}>
              {allowSignup ? "Signups enabled" : "Signups disabled"}
            </span>
          </p>
        </div>
        {/* Photo Reshuffle Setting */}
        <div className="bg-card border border-primary/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 transition-colors">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">
                  Reshuffle Gallery Photos
                </h3>
                <p className="font-body text-sm text-muted-foreground max-w-md">
                  Click this button to randomly re-assign all photos used in the Hero, Slideshow, and Packages sections from the 700+ photos in your gallery.
                </p>
              </div>
            </div>

            <button
              onClick={handleReshufflePhotos}
              className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-6 font-body text-xs tracking-[0.2em] uppercase text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reshuffle Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
