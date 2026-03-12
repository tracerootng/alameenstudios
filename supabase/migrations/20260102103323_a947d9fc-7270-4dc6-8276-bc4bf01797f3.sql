-- Add new columns to packages table for full admin control
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS additional_features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_time text,
ADD COLUMN IF NOT EXISTS ideal_for text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

-- Update existing packages with their current hardcoded data
UPDATE public.packages SET 
  description = 'The Nairobi Collection is designed for couples who appreciate timeless, elegant photography without compromise. Perfect for intimate ceremonies, this package captures every precious moment with artistic precision.',
  additional_features = '["6-8 hours of coverage", "200+ professionally edited images", "Private online gallery for 6 months", "Complimentary engagement consultation", "Travel within Lagos included"]'::jsonb,
  delivery_time = '4-6 weeks',
  ideal_for = 'Intimate ceremonies & traditional weddings'
WHERE slug = 'nairobi';

UPDATE public.packages SET 
  description = 'Our most sought-after collection, the Moscow Package offers comprehensive coverage with dual perspectives. Two photographers ensure no moment goes uncaptured, from the bride''s preparation to the last dance.',
  additional_features = '["Full day coverage (10+ hours)", "400+ professionally edited images", "Cinematic highlight video (3-5 min)", "Private online gallery for 12 months", "Luxury presentation box", "Travel within Nigeria included"]'::jsonb,
  delivery_time = '6-8 weeks',
  ideal_for = 'Grand celebrations & destination weddings'
WHERE slug = 'moscow';

UPDATE public.packages SET 
  description = 'The ultimate luxury experience. The Helsinki Collection is our most exclusive offering, providing unparalleled coverage, premium products, and personalized service that transforms your wedding memories into timeless art.',
  additional_features = '["Unlimited coverage with lead photographer", "600+ professionally edited images", "Full wedding film (15-20 min)", "Same-day edit slideshow", "Luxury leather-bound album", "Complimentary anniversary session", "Worldwide travel included"]'::jsonb,
  delivery_time = '8-10 weeks',
  ideal_for = 'Luxury celebrations & international weddings'
WHERE slug = 'helsinki';

-- Pre-wedding packages
UPDATE public.packages SET 
  description = 'A beautifully curated session for couples seeking a taste of our signature style. Perfect for announcements and save-the-dates.',
  additional_features = '["1-hour photo session", "1 location", "Professional makeup consultation", "Digital delivery"]'::jsonb,
  delivery_time = '1-2 weeks',
  ideal_for = 'Save-the-dates & social announcements'
WHERE slug = 'prewedding-tier1';

UPDATE public.packages SET 
  description = 'Extended coverage allowing for outfit changes and creative exploration across multiple scenes.',
  additional_features = '["2-hour photo session", "2 locations", "Outfit change included", "Professional styling tips", "Digital delivery"]'::jsonb,
  delivery_time = '2 weeks',
  ideal_for = 'Engagement announcements & invitations'
WHERE slug = 'prewedding-tier2';

UPDATE public.packages SET 
  description = 'Our premium pre-wedding experience with printed products and extended creative time.',
  additional_features = '["3-hour photo session", "Multiple locations", "2 outfit changes", "Professional hair & makeup recommendations", "High-quality print included", "Digital delivery"]'::jsonb,
  delivery_time = '2-3 weeks',
  ideal_for = 'Full engagement story & printed keepsakes'
WHERE slug = 'prewedding-tier3';

UPDATE public.packages SET 
  description = 'The ultimate pre-wedding experience with custom backdrops, premium prints, and unlimited creative freedom.',
  additional_features = '["4-hour photo session", "Unlimited locations", "Multiple outfit changes", "Custom printed backdrop", "Premium framed print", "Professional styling team", "Digital delivery"]'::jsonb,
  delivery_time = '3-4 weeks',
  ideal_for = 'Magazine-style shoots & exhibition prints'
WHERE slug = 'prewedding-tier4';

-- Studio packages
UPDATE public.packages SET 
  description = 'A refined studio portrait session capturing your essence with our signature lighting and styling.',
  additional_features = '["30-minute session", "Professional studio lighting", "1 outfit", "Basic retouching", "Digital delivery"]'::jsonb,
  delivery_time = '1 week',
  ideal_for = 'Professional headshots & personal branding'
WHERE slug = 'studio-essential';

UPDATE public.packages SET 
  description = 'An extended studio experience with multiple looks, advanced retouching, and creative direction.',
  additional_features = '["1-hour session", "Multiple lighting setups", "2 outfits", "Advanced retouching", "Creative direction", "Digital delivery"]'::jsonb,
  delivery_time = '1-2 weeks',
  ideal_for = 'Portfolio building & special occasions'
WHERE slug = 'studio-premium';