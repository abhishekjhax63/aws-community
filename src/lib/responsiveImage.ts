/**
 * Responsive AVIF variants for the real community photographs.
 *
 * Every gallery JPEG in `public/assets/gallery` is published alongside three
 * pre-generated AVIF variants at the exact widths below (see
 * `public/assets/gallery/*-<width>.avif`). Each source photograph is at least
 * 1200px wide, so no variant is ever an upscale, and the originals themselves
 * are never modified — they remain the fallback for browsers without AVIF.
 */
export const PHOTO_AVIF_WIDTHS = [640, 960, 1200] as const;

const GALLERY_PHOTO = /^(\/assets\/gallery\/.+)\.jpe?g$/i;

/**
 * Builds an AVIF `srcset` for a local gallery photograph. Returns `null` for
 * anything else (remote URLs, videos, admin-uploaded assets) so callers can
 * fall back to the plain original image.
 */
export function avifSrcSet(src: string): string | null {
  const match = GALLERY_PHOTO.exec(src);
  if (!match) return null;
  return PHOTO_AVIF_WIDTHS.map((width) => `${match[1]}-${width}.avif ${width}w`).join(", ");
}
