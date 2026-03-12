// Central photo registry — all photos from src/photos
// We use Vite's import.meta.glob to load them all at build time

const photoModules = import.meta.glob("../photos/*.{jpg,jpeg,JPG,JPEG}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// Convert to a flat, sorted array of URLs
export const ALL_PHOTOS: string[] = Object.values(photoModules).sort();

// Shuffle seed from localStorage (set by admin)
const seedStr = typeof window !== 'undefined' ? window.localStorage.getItem('alameen_photo_seed') : '0';
const seed = parseInt(seedStr || '0', 10);

/**
 * Returns a deterministic selection of N photos from the list,
 * using a simple seeded spread so they're always the same set.
 */
export function pickPhotos(count: number, offset = 0): string[] {
  const step = Math.floor(ALL_PHOTOS.length / count);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const pos = (offset + seed + i * step) % ALL_PHOTOS.length;
    result.push(ALL_PHOTOS[pos]);
  }
  return result;
}

/**
 * Seeded shuffle — returns `count` unique photos starting from `seed` position
 * so each package gets a different photo every time the seed is different.
 */
export function pickPhotoForIndex(index: number): string {
  // Use a prime multiplier to spread through the array based on seed
  const pos = ((index + seed) * 47) % ALL_PHOTOS.length;
  return ALL_PHOTOS[pos];
}

// Pre-selected sets for specific UI areas
export const HERO_PHOTO = ALL_PHOTOS[(7 + seed) % ALL_PHOTOS.length] ?? ALL_PHOTOS[0];

// 15 photos evenly spread for the about slideshow
export const SLIDESHOW_PHOTOS = pickPhotos(15, 0);

// 4 photos for wedding package rows
export const WEDDING_PHOTOS = pickPhotos(4, 30);
