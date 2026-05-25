export type Locale = "pt" | "en";

export type ThemeName = "dark" | "light";

export type LocalizedText = Record<Locale, string>;

export type SkillCategory = "front" | "back" | "devops" | "other";

export type SkillDomain = "front" | "back" | "database" | "devops" | "ai" | "product";

export type SkillLevel = "practical" | "project" | "learning" | "foundation";

export type Skill = {
  name: string;
  category: SkillCategory;
  domain?: SkillDomain;
  level?: SkillLevel;
  evidence?: LocalizedText;
};

export type ProjectVisualLayout =
  | "operational-saas"
  | "social-ai"
  | "crm-pipeline"
  | "institutional-site"
  | "data-monitoring"
  | "commerce-catalog";

export type ProjectVisuals = {
  thumbnail: string | null;
  heroImage: string | null;
  gallery: string[];
  alt: LocalizedText;
  status: "pending" | "available";
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  layout: ProjectVisualLayout;
  mockupHint: LocalizedText;
};

export type DownloadAsset = {
  label: string;
  href: string;
  fileName: string;
};

export type ProfileLink = {
  label: LocalizedText;
  href: string;
  display: string;
  kind: "portfolio" | "github" | "project" | "repo";
};

export type Project = {
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  shortDescription: LocalizedText;
  fullDescription: LocalizedText;
  status: LocalizedText;
  category: string[];
  stack: string[];
  problem: LocalizedText;
  solution: LocalizedText;
  highlights: Record<Locale, string[]>;
  technicalChallenges: Record<Locale, string[]>;
  whatItShows: LocalizedText;
  links: {
    website: string;
    repository?: string;
  };
  visuals?: ProjectVisuals;
  featured?: boolean;
};

export type ExperienceItem = {
  title: LocalizedText;
  organization?: string;
  period: LocalizedText;
  badge: LocalizedText;
  items?: Record<Locale, string[]>;
};

export type EducationItem = {
  title: LocalizedText;
  institution: LocalizedText;
  period: string;
};

export type CertificationGroup = {
  title: LocalizedText;
  meta: LocalizedText;
  badge: LocalizedText;
  items: LocalizedText[];
};

export type LabGameId = "runtime" | "bug-maze" | "debug-arena" | "latency-lab" | "debug" | "architecture" | "latency";

export type LabPageCopy = {
  title: LocalizedText;
  description: LocalizedText;
  sessionScore: LocalizedText;
  pending: LocalizedText;
  completed: LocalizedText;
  apiSynced: LocalizedText;
  apiPending: LocalizedText;
  apiFailed: LocalizedText;
  backLinksLabel: LocalizedText;
};

export type DebugChallengeItem = {
  id: string;
  title: LocalizedText;
  prompt: LocalizedText;
  code: string;
  options: {
    id: string;
    label: LocalizedText;
    isCorrect: boolean;
    feedback: LocalizedText;
  }[];
  explanation: LocalizedText;
};

export type ArchitectureBlock = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  role: "required" | "bonus" | "unsafe";
  feedback: LocalizedText;
};

export type ArchitectureChallenge = {
  id: string;
  title: LocalizedText;
  scenario: LocalizedText;
  blocks: ArchitectureBlock[];
};

export type LatencyOption = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  impact: "positive" | "negative";
  feedback: LocalizedText;
};

export type LatencyChallenge = {
  id: string;
  title: LocalizedText;
  scenario: LocalizedText;
  options: LatencyOption[];
};
