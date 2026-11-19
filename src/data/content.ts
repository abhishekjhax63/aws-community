export type LearningLevel = "Beginner" | "Intermediate" | "Advanced";

export type LearningPath = {
  number: string;
  title: string;
  description: string;
  objective: string;
  services: string;
  level: LearningLevel;
  href: string;
};

export const learningPaths: LearningPath[] = [
  {
    number: "01",
    title: "Cloud computing",
    description: "Learn how on-demand computing changes the way teams build and scale.",
    objective: "Explain cloud essentials",
    services: "FOUNDATIONS · BEGINNER",
    level: "Beginner",
    href: "https://aws.amazon.com/what-is-cloud-computing/",
  },
  {
    number: "02",
    title: "AWS global infrastructure",
    description: "Explore Regions, Availability Zones, and the infrastructure behind AWS services.",
    objective: "Understand where workloads run",
    services: "FOUNDATIONS · BEGINNER",
    level: "Beginner",
    href: "https://aws.amazon.com/about-aws/global-infrastructure/",
  },
  {
    number: "03",
    title: "Amazon EC2",
    description: "Discover virtual servers, instance choices, and the basics of launching compute.",
    objective: "Describe elastic compute",
    services: "COMPUTE · INTERMEDIATE",
    level: "Intermediate",
    href: "https://docs.aws.amazon.com/ec2/",
  },
  {
    number: "04",
    title: "Amazon S3",
    description: "Learn object storage concepts, buckets, access patterns, and data protection.",
    objective: "Store and retrieve objects",
    services: "STORAGE · BEGINNER",
    level: "Beginner",
    href: "https://docs.aws.amazon.com/s3/",
  },
  {
    number: "05",
    title: "AWS Lambda",
    description: "Understand event-driven compute and how to run code without managing servers.",
    objective: "Build a serverless function",
    services: "SERVERLESS · INTERMEDIATE",
    level: "Intermediate",
    href: "https://docs.aws.amazon.com/lambda/",
  },
  {
    number: "06",
    title: "AWS IAM",
    description: "Explore users, roles, and policies while learning the principle of least privilege.",
    objective: "Control access responsibly",
    services: "IDENTITY · FOUNDATIONS",
    level: "Beginner",
    href: "https://docs.aws.amazon.com/iam/",
  },
  {
    number: "07",
    title: "Amazon VPC",
    description: "Learn how virtual networks, subnets, and routes shape cloud connectivity.",
    objective: "Map a basic cloud network",
    services: "NETWORKING · INTERMEDIATE",
    level: "Intermediate",
    href: "https://docs.aws.amazon.com/vpc/",
  },
  {
    number: "08",
    title: "Amazon CloudFront",
    description: "See how content delivery networks bring web experiences closer to users.",
    objective: "Explain edge delivery",
    services: "EDGE · INTERMEDIATE",
    level: "Intermediate",
    href: "https://docs.aws.amazon.com/cloudfront/",
  },
  {
    number: "09",
    title: "Amazon DynamoDB",
    description: "Explore managed NoSQL data modeling, tables, keys, and access patterns.",
    objective: "Design a simple key-value model",
    services: "DATABASE · INTERMEDIATE",
    level: "Intermediate",
    href: "https://docs.aws.amazon.com/dynamodb/",
  },
  {
    number: "10",
    title: "Cloud architecture",
    description: "Use the Well-Architected Framework to reason about resilient cloud systems.",
    objective: "Review architecture trade-offs",
    services: "ARCHITECTURE · ADVANCED",
    level: "Advanced",
    href: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
  },
  {
    number: "11",
    title: "Security fundamentals",
    description: "Build a foundation in shared responsibility, identity, and layered protection.",
    objective: "Recognize core security practices",
    services: "SECURITY · ALL LEVELS",
    level: "Advanced",
    href: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html",
  },
  {
    number: "12",
    title: "AI & machine learning",
    description: "Get oriented with AWS machine learning tools and responsible AI learning paths.",
    objective: "Explore practical ML concepts",
    services: "AI / ML · EXPLORATION",
    level: "Advanced",
    href: "https://skillbuilder.aws/",
  },
];

export const learningLevels: LearningLevel[] = ["Beginner", "Intermediate", "Advanced"];

export const suggestionCategories = [
  "New Event Idea",
  "AWS Workshop",
  "Hackathon",
  "Learning Resources",
  "Community Improvement",
  "Technical Project",
  "Other",
] as const;

export const eventCategories = [
  "AWS Workshops",
  "Cloud Bootcamps",
  "Hackathons",
  "Technical Sessions",
  "Tech Talks",
  "AWS Learning Sessions",
  "Project Showcases",
  "Community Meetups",
] as const;

export const updateCategories = [
  "Community News",
  "Event Announcements",
  "AWS Learning",
  "Registration Updates",
  "Opportunities",
  "Achievements",
] as const;

/* ------------------------------------------------------------------
   Community teams. Each team keeps three seats. Members whose profiles
   are not published yet stay as empty frames (placeholder) so the
   structure is ready without inventing names or details.
   ------------------------------------------------------------------ */
export type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
  placeholder?: boolean;
};

export type Team = {
  id: string;
  name: string;
  tagline: string;
  members: TeamMember[];
};

export const teams: Team[] = [
  {
    id: "leadership",
    name: "Leadership",
    tagline: "Guiding the community forward",
    members: [
      {
        name: "Ayush Kumar",
        role: "Student Builder Group Leader",
        photo: "/assets/ayush-kumar.jpg",
        bio: "B.Tech CSE · AI & ML · Year 2",
      },
      { name: "—", role: "Coming soon", placeholder: true },
      { name: "—", role: "Coming soon", placeholder: true },
    ],
  },
  {
    id: "media",
    name: "Media & Design",
    tagline: "Content, design & visual storytelling",
    members: [
      { name: "—", role: "Coming soon", placeholder: true },
      { name: "—", role: "Coming soon", placeholder: true },
      { name: "—", role: "Coming soon", placeholder: true },
    ],
  },
  {
    id: "events",
    name: "Events & Outreach",
    tagline: "Workshops, meetups & community building",
    members: [
      { name: "—", role: "Coming soon", placeholder: true },
      { name: "—", role: "Coming soon", placeholder: true },
      { name: "—", role: "Coming soon", placeholder: true },
    ],
  },
];
