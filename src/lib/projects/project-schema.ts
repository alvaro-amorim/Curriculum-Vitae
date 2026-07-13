import { z } from "zod";

const SlugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const ShortTextSchema = z.string().trim().min(1).max(180);
const LongTextSchema = z.string().trim().min(1).max(4_000);
const UrlSchema = z
  .string()
  .trim()
  .url()
  .max(2_048)
  .refine((value) => /^https?:\/\//i.test(value), "A URL precisa usar HTTP ou HTTPS.");
const AssetPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_048)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Use uma URL HTTP(S) ou um caminho iniciado por /.");
const LocalizedShortTextSchema = z.object({
  en: ShortTextSchema,
  pt: ShortTextSchema,
}).strict();
const LocalizedLongTextSchema = z.object({
  en: LongTextSchema,
  pt: LongTextSchema,
}).strict();
const LocalizedListSchema = z.object({
  en: z.array(ShortTextSchema).min(1).max(24),
  pt: z.array(ShortTextSchema).min(1).max(24),
}).strict();

export const ProjectContentSchema = z.object({
  category: z.array(ShortTextSchema).min(1).max(12),
  featured: z.boolean().optional(),
  fullDescription: LocalizedLongTextSchema,
  highlights: LocalizedListSchema,
  links: z.object({
    repository: UrlSchema.optional(),
    website: UrlSchema,
  }).strict(),
  problem: LocalizedLongTextSchema,
  shortDescription: LocalizedLongTextSchema,
  slug: SlugSchema,
  solution: LocalizedLongTextSchema,
  stack: z.array(ShortTextSchema).min(1).max(24),
  status: LocalizedShortTextSchema,
  subtitle: LocalizedShortTextSchema,
  technicalChallenges: LocalizedListSchema,
  title: LocalizedShortTextSchema,
  visuals: z.object({
    accent: z.object({
      primary: z.string().trim().min(1).max(80),
      secondary: z.string().trim().min(1).max(80),
      tertiary: z.string().trim().min(1).max(80),
    }).strict(),
    alt: LocalizedShortTextSchema,
    gallery: z.array(AssetPathSchema).max(12),
    heroImage: AssetPathSchema.nullable(),
    layout: z.enum([
      "operational-saas",
      "social-ai",
      "crm-pipeline",
      "institutional-site",
      "data-monitoring",
      "commerce-catalog",
    ]),
    mockupHint: LocalizedLongTextSchema,
    status: z.enum(["pending", "available"]),
    thumbnail: AssetPathSchema.nullable(),
  }).strict().optional(),
  whatItShows: LocalizedLongTextSchema,
}).strict();

export const AdminProjectMutationSchema = z.object({
  project: ProjectContentSchema,
  publicationStatus: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
}).strict();

export type AdminProjectMutation = z.infer<typeof AdminProjectMutationSchema>;
export type ProjectContent = z.infer<typeof ProjectContentSchema>;
