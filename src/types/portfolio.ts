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

export type LabGameId =
  | "runtime"
  | "bug-maze"
  | "code-snake"
  | "stack-tetris";

export type GameDeviceType = "desktop" | "mobile" | "unknown";
export type LeaderboardPeriod = "all" | "month" | "week";

export type LeaderboardEntry = {
  alias: string;
  createdAt: string;
  score: number;
};

export type LeaderboardResponse = {
  game: LabGameId;
  leaderboard: LeaderboardEntry[];
  period: LeaderboardPeriod;
};

export type PlayerGameRanking = {
  createdAt: string | null;
  rank: number | null;
  score: number | null;
};

export type PlayerLeaderboardResponse = {
  alias: string | null;
  rankings: {
    bugMaze: PlayerGameRanking;
    codeSnake: PlayerGameRanking;
    runtime: PlayerGameRanking;
    stackTetris: PlayerGameRanking;
  };
};

export type ScoreSubmitResponse = {
  accepted: true;
  contractVersion: "v3";
  game: LabGameId;
  mode: "persistent";
  score: number;
};

export type RuntimeScoreMetadata = {
  distance: number;
  cleared: number;
  maxSpeed: number;
  stageReached: string;
  collisions: number;
  nearMisses?: number;
};

export type BugMazeScoreMetadata = {
  tokensCollected: number;
  totalTokens: number;
  deployStage: number;
  livesRemaining: number;
  damageTaken: number;
  virusesActive: number;
};

export type CodeSnakeScoreMetadata = {
  length: number;
  tokensCollected: number;
  hazardsHit: number;
  wallsEnabled: boolean;
  wrapAround: boolean;
  maxCombo?: number;
};

export type StackTetrisScoreMetadata = {
  linesCleared: number;
  level: number;
  piecesPlaced: number;
  hardDrops: number;
  maxCombo: number;
};

export type GameScoreMetadata =
  | RuntimeScoreMetadata
  | BugMazeScoreMetadata
  | CodeSnakeScoreMetadata
  | StackTetrisScoreMetadata;

export type GameScorePayloadV3 =
  | {
      deviceType?: GameDeviceType;
      durationMs: number;
      game: "runtime";
      gameVersion: "runtime@3.0.0";
      metadata: RuntimeScoreMetadata;
      score: number;
    }
  | {
      deviceType?: GameDeviceType;
      durationMs: number;
      game: "bug-maze";
      gameVersion: "bug-maze@3.0.0";
      metadata: BugMazeScoreMetadata;
      score: number;
    }
  | {
      deviceType?: GameDeviceType;
      durationMs: number;
      game: "code-snake";
      gameVersion: "code-snake@3.0.0";
      metadata: CodeSnakeScoreMetadata;
      score: number;
    }
  | {
      deviceType?: GameDeviceType;
      durationMs: number;
      game: "stack-tetris";
      gameVersion: "stack-tetris@3.0.0";
      metadata: StackTetrisScoreMetadata;
      score: number;
    };

export type GameScorePayloadV2 = GameScorePayloadV3;

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
