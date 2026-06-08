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

const scoreSchema = z.number().finite().int("Score deve ser inteiro.").min(0, "Score minimo e 0.").max(100, "Score maximo e 100.");
const durationSchema = z.number().finite().int("Duracao deve ser inteira.").min(250, "Duracao muito curta.").max(900_000, "Duracao muito longa.");
const deviceTypeSchema = z.enum(["desktop", "mobile", "unknown"]).optional();
const nonNegativeIntSchema = z.number().finite().int().min(0);

const runtimeMetadataSchema = z
  .object({
    collisions: nonNegativeIntSchema.max(10),
    cleared: nonNegativeIntSchema.max(2_000),
    distance: nonNegativeIntSchema.max(50_000),
    maxSpeed: z.number().finite().min(0).max(80),
    nearMisses: nonNegativeIntSchema.max(2_000).optional(),
    stageReached: z.enum(["dev-server", "staging", "production", "incident-mode", "zero-downtime"]),
  })
  .strict();

const bugMazeMetadataSchema = z
  .object({
    damageTaken: nonNegativeIntSchema.max(3),
    deployStage: z.number().finite().int().min(1).max(20),
    livesRemaining: z.number().finite().int().min(0).max(3),
    tokensCollected: nonNegativeIntSchema.max(20),
    totalTokens: z.number().finite().int().min(1).max(20),
    virusesActive: nonNegativeIntSchema.max(12),
  })
  .strict()
  .superRefine((metadata, context) => {
    if (metadata.tokensCollected > metadata.totalTokens) {
      context.addIssue({
        code: "custom",
        message: "Tokens coletados nao podem exceder o total.",
        path: ["tokensCollected"],
      });
    }
  });

const codeSnakeMetadataSchema = z
  .object({
    hazardsHit: nonNegativeIntSchema.max(20),
    length: z.number().finite().int().min(3).max(180),
    maxCombo: nonNegativeIntSchema.max(100).optional(),
    tokensCollected: nonNegativeIntSchema.max(180),
    wallsEnabled: z.boolean(),
    wrapAround: z.boolean(),
  })
  .strict()
  .superRefine((metadata, context) => {
    if (metadata.wallsEnabled && metadata.wrapAround) {
      context.addIssue({
        code: "custom",
        message: "Wrap-around nao deve estar ativo com paredes ligadas.",
        path: ["wrapAround"],
      });
    }
  });

const stackTetrisMetadataSchema = z
  .object({
    hardDrops: nonNegativeIntSchema.max(1_000),
    level: z.number().finite().int().min(1).max(99),
    linesCleared: nonNegativeIntSchema.max(1_000),
    maxCombo: nonNegativeIntSchema.max(1_000),
    piecesPlaced: nonNegativeIntSchema.max(3_000),
  })
  .strict();

const baseScorePayload = {
  deviceType: deviceTypeSchema,
  durationMs: durationSchema,
  score: scoreSchema,
} as const;

export const ScorePayloadSchema = z.discriminatedUnion("game", [
  z
    .object({
      ...baseScorePayload,
      game: z.literal("runtime"),
      gameVersion: z.literal("runtime@2.0.0"),
      metadata: runtimeMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("bug-maze"),
      gameVersion: z.literal("bug-maze@2.0.0"),
      metadata: bugMazeMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("code-snake"),
      gameVersion: z.literal("code-snake@2.0.0"),
      metadata: codeSnakeMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("stack-tetris"),
      gameVersion: z.literal("stack-tetris@2.0.0"),
      metadata: stackTetrisMetadataSchema,
    })
    .strict(),
]);

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>;
export type TerminalPayload = z.infer<typeof TerminalPayloadSchema>;
export type ScorePayload = z.infer<typeof ScorePayloadSchema>;
