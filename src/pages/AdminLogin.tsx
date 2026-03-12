import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, signupSchema, getErrorMessage, logError, checkRateLimit, recordAttempt } from "@/lib/security";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [signupAllowed, setSignupAllowed] = useState(true);
  const [checkingSettings, setCheckingSettings] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);

  useEffect(() => {
    const checkSignupSetting = async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "allow_signup")
          .maybeSingle();

        if (data) {
          setSignupAllowed(data.value === true || data.value === "true");
        }
      } catch (error) {
        logError("CheckSignupSetting", error);
      } finally {
        setCheckingSettings(false);
      }
    };
    checkSignupSetting();
  }, []);

  // Check rate limit on mount and update
  useEffect(() => {
    const checkLimit = () => {
      const result = checkRateLimit("admin-login");
      setIsLocked(!result.allowed);
      setLockoutMinutes(result.remainingTime || 0);
    };
    
    checkLimit();
    const interval = setInterval(checkLimit, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const schema = isLogin ? loginSchema : signupSchema;
    const dataToValidate = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;
    
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    if (isLocked) {
      toast({
        title: "Too many attempts",
        description: `Please try again in ${lockoutMinutes} minutes.`,
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        if (error) {
          recordAttempt("admin-login", false);
          throw error;
        }

        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          recordAttempt("admin-login", false);
          throw new Error("You don't have admin access");
        }

        recordAttempt("admin-login", true);
        toast({ title: "Welcome back!", description: "Logged in successfully" });
        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: formData.fullName.trim() },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Contact the site owner to get admin access.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      logError("AdminAuth", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-[0.1em] text-foreground mb-2">
            Admin Portal
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {isLogin ? "Sign in to manage your studio" : "Create an account"}
          </p>
        </div>

        {/* Lockout Warning */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-500">
              Too many failed attempts. Please wait {lockoutMinutes} minutes before trying again.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={100}
                className={`w-full bg-transparent border ${errors.fullName ? "border-red-500" : "border-primary/20"} focus:border-primary/60 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors`}
                placeholder="Your name"
                required={!isLogin}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
          )}

          <div>
            <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={255}
                className={`w-full bg-transparent border ${errors.email ? "border-red-500" : "border-primary/20"} focus:border-primary/60 pl-12 pr-4 py-3 font-body text-sm text-foreground outline-none transition-colors`}
                placeholder="admin@example.com"
                required
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength={128}
                className={`w-full bg-transparent border ${errors.password ? "border-red-500" : "border-primary/20"} focus:border-primary/60 pl-12 pr-4 py-3 font-body text-sm text-foreground outline-none transition-colors`}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {!checkingSettings && (signupAllowed || !isLogin) && (
          <p className="text-center mt-6 font-body text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={!signupAllowed && isLogin}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
