export type CommunityStats = {
  members: number;
  events: number;
  workshops: number;
  projects: number | null;
};

export type AgendaItem = { time?: string; title?: string; description?: string };
export type Speaker = { name?: string; role?: string; bio?: string };

export type CommunityEvent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  event_format: string | null;
  attendance_note: string | null;
  cover_image_url: string | null;
  short_description: string;
  full_description: string | null;
  agenda: AgendaItem[];
  speakers: Speaker[];
  starts_at: string | null;
  ends_at: string | null;
  venue: string | null;
  eligibility: string | null;
  registration_deadline: string | null;
  capacity: number | null;
  registration_status: string;
  important_instructions: string | null;
};

export type CommunityMember = {
  id: string;
  full_name: string;
  designation: string;
  department: string | null;
  course: string | null;
  academic_year: string | null;
  bio: string | null;
  skills: string[];
  linkedin_url: string | null;
  github_url: string | null;
  photo_url: string | null;
  team_id: string | null;
  team?: { name: string } | null;
};

export type GalleryItem = {
  id: string;
  event_id: string | null;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  title: string | null;
  caption: string | null;
  category: string;
};

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  description: string;
  category: string;
  priority: "normal" | "important";
  external_url: string | null;
  published_at: string | null;
};

export type SiteSettings = Record<string, string>;

export type StudentProfile = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  course: string | null;
  department: string | null;
  academic_year: string | null;
  photo_url: string | null;
};

export type RegistrationSummary = {
  id: string;
  registration_code: string;
  event_title: string | null;
  event_slug: string | null;
  status: string;
  created_at: string;
};

export type SuggestionCategory =
  | "New Event Idea"
  | "AWS Workshop"
  | "Hackathon"
  | "Learning Resources"
  | "Community Improvement"
  | "Technical Project"
  | "Other";

export type Suggestion = {
  id: string;
  reference_code: string;
  name: string | null;
  email: string | null;
  category: string;
  title: string;
  details: string;
  is_anonymous: boolean;
  status: "new" | "under_review" | "accepted" | "rejected";
  admin_note: string | null;
  created_at: string;
};
