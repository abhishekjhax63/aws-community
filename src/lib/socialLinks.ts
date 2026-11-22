export type CommunitySocialLink = {
  id: string;
  platform: string;
  handle: string;
  url: string;
  order: number;
  enabled: boolean;
  kind?: "profile" | "post";
};

export const DEFAULT_SOCIAL_LINKS: CommunitySocialLink[] = [
  {
    id: "instagram",
    platform: "Instagram",
    handle: "@sbg.community",
    url: "https://www.instagram.com/sbg.community/",
    order: 1,
    enabled: true,
  },
  {
    id: "meetup",
    platform: "Meetup",
    handle: "AWS SBG at Amity University Patna Campus",
    url: "https://www.meetup.com/aws-sbg-at-amity-university-patna-campus/",
    order: 2,
    enabled: true,
  },
  {
    id: "youtube",
    platform: "YouTube",
    handle: "@awssbg_26",
    url: "https://www.youtube.com/@awssbg_26",
    order: 3,
    enabled: true,
  },
  {
    id: "linkedin-post",
    platform: "LinkedIn",
    handle: "Community post",
    url: "https://www.linkedin.com/posts/aws-student-builder-group-at-amity-university_promptpixel-thrillanza-amityuniversitypatna-activity-7510907739657711616-L5HQ",
    order: 4,
    enabled: true,
    kind: "post",
  },
];

function isSocialLink(value: unknown): value is CommunitySocialLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Partial<CommunitySocialLink>;
  if (
    typeof link.id !== "string" ||
    typeof link.platform !== "string" ||
    typeof link.handle !== "string" ||
    typeof link.url !== "string" ||
    typeof link.order !== "number" ||
    !Number.isFinite(link.order) ||
    typeof link.enabled !== "boolean"
  ) return false;
  if (link.kind !== undefined && link.kind !== "profile" && link.kind !== "post") return false;
  try {
    return new URL(link.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Parses public site settings, falling back only to existing project links. */
export function getCommunitySocialLinks(serialized?: string): CommunitySocialLink[] {
  if (serialized === undefined) return DEFAULT_SOCIAL_LINKS.filter((link) => link.enabled);
  try {
    const value: unknown = JSON.parse(serialized);
    if (!Array.isArray(value)) return DEFAULT_SOCIAL_LINKS.filter((link) => link.enabled);
    return value
      .filter(isSocialLink)
      .filter((link) => link.enabled)
      .sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_SOCIAL_LINKS.filter((link) => link.enabled);
  }
}
