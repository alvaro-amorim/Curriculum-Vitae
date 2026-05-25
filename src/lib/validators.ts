import { z } from "zod";

const metadataValueSchema = z.union([z.string().trim().max(500), z.number().finite(), z.boolean(), z.null()]);

export const MetadataSchema = z
  .record(z.string().trim().min(1).max(80), metadataValueSchema)
  .refine((metadata) => Object.keys(metadata).length <= 20, "Metadata deve ter no máximo 20 chaves.");

export const ContactPayloadSchema = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres.").max(120, "Nome muito longo."),
    email: z.string().trim().email("E-mail inválido.").max(160, "E-mail muito longo."),
    message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres.").max(2000, "Mensagem muito longa."),
    source: z.string().trim().max(120, "Origem muito longa.").optional(),
  })
  .strict();

export const AnalyticsEventSchema = z.enum(
  [
    "page_view",
    "project_view",
    "resume_download",
    "contact_copy",
    "github_click",
    "terminal_command",
    "command_palette_action",
    "lab_score",
    "api_health_check",
  ],
  {
    error: "Evento inválido.",
  },
);

export const AnalyticsPayloadSchema = z
  .object({
    event: AnalyticsEventSchema,
    metadata: MetadataSchema.optional(),
  })
  .strict();

export const TerminalPayloadSchema = z
  .object({
    command: z.string().trim().min(1, "Comando obrigatório.").max(120, "Comando muito longo."),
  })
  .strict();

export const ScorePayloadSchema = z
  .object({
    game: z.enum(["runtime", "bug-maze", "debug-arena", "latency-lab", "debug", "architecture", "latency", "terminal", "portfolio"], {
      error: "Jogo inválido.",
    }),
    score: z.number().finite().min(0, "Score mínimo é 0.").max(100, "Score máximo é 100."),
    metadata: MetadataSchema.optional(),
  })
  .strict();

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>;
export type TerminalPayload = z.infer<typeof TerminalPayloadSchema>;
export type ScorePayload = z.infer<typeof ScorePayloadSchema>;
