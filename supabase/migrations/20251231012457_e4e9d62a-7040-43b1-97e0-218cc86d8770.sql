-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packages table for editable pricing
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table to store form submissions
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  package_id UUID REFERENCES public.packages(id),
  package_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles (only admins can view)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for packages (public read, admin write)
CREATE POLICY "Anyone can view packages"
ON public.packages
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage packages"
ON public.packages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for bookings (admin only)
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update bookings"
ON public.bookings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view event photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-photos');

CREATE POLICY "Admins can upload event photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

-- Insert default packages
INSERT INTO public.packages (slug, name, subtitle, category, price, features, popular, sort_order) VALUES
('nairobi', 'NAIROBI', 'Timeless Starter', 'wedding', 550000, '["One event coverage", "12×24 premium photobook", "All edited soft copies", "Branded flash drive delivery"]', false, 1),
('moscow', 'MOSCOW', 'Most Popular', 'wedding', 750000, '["Two professional photographers", "12×32 premium photobook", "16×20 framed print", "Private online gallery access", "Branded flash drive"]', true, 2),
('helsinki', 'HELSINKI', 'Ultimate Luxury', 'wedding', 1000000, '["12×36 premium photobook", "Two 20×24 framed prints", "Full bridal prep coverage", "Two complimentary pre/post sessions"]', false, 3),
('prewedding-tier1', 'Tier 1', 'Essential', 'prewedding', 75000, '["7 retouched images", "Professional editing", "Digital delivery"]', false, 1),
('prewedding-tier2', 'Tier 2', 'Standard', 'prewedding', 105000, '["12 retouched images", "Professional editing", "Digital delivery"]', false, 2),
('prewedding-tier3', 'Tier 3', 'Premium', 'prewedding', 150000, '["12 retouched images", "16×20 framed print", "Digital delivery"]', false, 3),
('prewedding-tier4', 'Tier 4', 'Luxury', 'prewedding', 200000, '["15 retouched images", "Printed backdrop", "20×24 framed print"]', false, 4),
('studio-essential', 'Studio Essential', 'Quick Session', 'studio', 50000, '["1-hour session", "5 retouched images", "Digital delivery"]', false, 1),
('studio-premium', 'Studio Premium', 'Full Experience', 'studio', 85000, '["2-hour session", "10 retouched images", "16×20 print included"]', false, 2);

-- Create indexes
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_packages_category ON public.packages(category);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);