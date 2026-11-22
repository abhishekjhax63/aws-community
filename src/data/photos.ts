import type { GalleryItem } from "../lib/types";

/**
 * Bundled Prompt to Pixel event photographs. These are REAL community photos
 * that ship with the site; admin-uploaded gallery photos are merged on top.
 * Nothing here is fabricated and no captions are rendered inside the
 * photo-only slideshow — these entries only exist as a photo source.
 */
export const staticPhotos: GalleryItem[] = [
  { id: "ptp-01", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-01-session.jpeg", thumbnail_url: null, title: "Prompt to Pixel — session in progress", caption: "Students gathered for the Prompt to Pixel AI image generation workshop.", category: "Prompt to Pixel" },
  { id: "ptp-02", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-02-workshop.jpeg", thumbnail_url: null, title: "Hands-on AI prompting", caption: "Participants experimenting with AI image generation during the workshop.", category: "Prompt to Pixel" },
  { id: "ptp-03", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-03-students.jpeg", thumbnail_url: null, title: "Builders at work", caption: "AWS Student Builder Group members working on creative prompts.", category: "Prompt to Pixel" },
  { id: "ptp-04", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-04-audience.jpeg", thumbnail_url: null, title: "Engaged audience", caption: "Students following along during the Prompt to Pixel session.", category: "Prompt to Pixel" },
  { id: "ptp-05", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-05-keynote.jpeg", thumbnail_url: null, title: "Keynote address", caption: "Faculty member addressing participants at the Prompt to Pixel event.", category: "Prompt to Pixel" },
  { id: "ptp-06", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-06-awards.jpeg", thumbnail_url: null, title: "Award ceremony", caption: "Felicitation of winners at the Prompt to Pixel competition.", category: "Prompt to Pixel" },
  { id: "ptp-07", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-07-group.jpeg", thumbnail_url: null, title: "Winners group photo", caption: "All winners and participants at the Prompt to Pixel event.", category: "Prompt to Pixel" },
  { id: "ptp-08", event_id: null, media_type: "image", media_url: "/assets/gallery/prompt-to-pixel-08-ceremony.jpeg", thumbnail_url: null, title: "Trophy presentation", caption: "Trophy being presented to the Prompt to Pixel competition winner.", category: "Prompt to Pixel" },
];

export function eventPhotoFallback(title: string): GalleryItem | undefined {
  if (title.toLowerCase().includes("prompt2 pixel")) {
    return staticPhotos.find((item) => item.category.toLowerCase().includes("prompt to pixel"));
  }
  return undefined;
}

/** Admin-uploaded gallery items with the bundled photographs merged in (deduped by URL). */
export function mergePhotos(dbItems: GalleryItem[]): GalleryItem[] {
  const seen = new Set(dbItems.map((item) => item.media_url));
  const merged = [...dbItems];
  for (const item of staticPhotos) {
    if (!seen.has(item.media_url)) merged.push(item);
  }
  return merged;
}

/** Photographs only — videos are excluded so the slideshow stays photo-only. */
export function photoOnly(items: GalleryItem[]) {
  return items.filter((item) => item.media_type === "image");
}
