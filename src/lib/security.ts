import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const bookingSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(25, "Phone number is too long")
    .regex(/^[\+]?[0-9\s\-\(\)]{10,25}$/, "Please enter a valid phone number"),
  location: z.string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be less than 200 characters"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
  package: z.string().optional(),
  message: z.string()
    .max(2000, "Message must be less than 2000 characters")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
});

export const accessCodeSchema = z.object({
  code: z.string()
    .trim()
    .min(6, "Access code must be at least 6 characters")
    .max(20, "Access code is too long")
    .regex(/^[A-Z0-9]+$/, "Access code must contain only letters and numbers"),
});

export const packageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  subtitle: z.string().trim().max(200).optional(),
  price: z.number().positive("Price must be positive").max(100000000),
  description: z.string().max(2000).optional(),
  features: z.array(z.string().max(500)).max(20).optional(),
  additional_features: z.array(z.string().max(500)).max(20).optional(),
  delivery_time: z.string().max(100).optional(),
  ideal_for: z.string().max(200).optional(),
  image_url: z.string().url().max(500).optional().or(z.literal("")),
  hidden: z.boolean().optional(),
  popular: z.boolean().optional(),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  client_name: z.string().trim().min(1).max(100),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  package_type: z.string().min(1).max(50),
  access_code: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/),
  cover_image_url: z.string().url().max(500).optional().or(z.literal("")),
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

type PostgresErrorCode = string;

const errorMessages: Record<PostgresErrorCode, string> = {
  "23505": "This entry already exists.",
  "23503": "This action references data that doesn't exist.",
  "23502": "Required information is missing.",
  "22001": "Some text is too long.",
  "PGRST116": "Unable to process the request.",
  "PGRST301": "Connection issue. Please try again.",
  "invalid_credentials": "Invalid email or password.",
  "user_already_exists": "An account with this email already exists.",
};

export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  // Handle Supabase/Postgres errors
  if (typeof error === "object" && error !== null) {
    const err = error as { code?: string; message?: string };
    
    // Check for known error codes
    if (err.code && errorMessages[err.code]) {
      return errorMessages[err.code];
    }
    
    // Check for auth-specific errors
    if (err.message?.includes("Invalid login credentials")) {
      return "Invalid email or password.";
    }
    if (err.message?.includes("User already registered")) {
      return "An account with this email already exists.";
    }
    if (err.message?.includes("Email not confirmed")) {
      return "Please verify your email address.";
    }
  }

  return "An error occurred. Please try again.";
}

// Development-only logging
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}

// =============================================================================
// RATE LIMITING (Client-side)
// =============================================================================

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

const rateLimitStates: Map<string, RateLimitState> = new Map();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(key: string): { allowed: boolean; remainingTime?: number } {
  const state = rateLimitStates.get(key) || { attempts: 0, lockedUntil: null };
  
  // Check if currently locked
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    const remainingTime = Math.ceil((state.lockedUntil - Date.now()) / 1000 / 60);
    return { allowed: false, remainingTime };
  }
  
  // Reset if lockout has expired
  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    rateLimitStates.set(key, { attempts: 0, lockedUntil: null });
    return { allowed: true };
  }
  
  return { allowed: state.attempts < MAX_ATTEMPTS };
}

export function recordAttempt(key: string, success: boolean): void {
  if (success) {
    rateLimitStates.delete(key);
    return;
  }
  
  const state = rateLimitStates.get(key) || { attempts: 0, lockedUntil: null };
  state.attempts += 1;
  
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  rateLimitStates.set(key, state);
}

// =============================================================================
// ACCESS CODE GENERATION
// =============================================================================

// Use 12 characters for better security (41+ bits of entropy)
export function generateAccessCode(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
