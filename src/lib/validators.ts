import { z } from "zod";

import { GAME_SCORE_LIMITS, GAME_VERSIONS } from "./lab-score.ts";

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

export const PlayerSessionPayloadSchema = z
  .object({
    alias: z.union([z.string(), z.null()]).optional(),
  })
  .strict();

export const LeaderboardGameSchema = z.enum(["runtime", "bug-maze", "code-snake", "stack-tetris"]);
export const LeaderboardPeriodSchema = z.enum(["all", "month", "week"]).default("all");
export const LeaderboardLimitSchema = z.coerce.number().finite().int().min(1).max(50).default(10);

const durationSchema = z.number().finite().int("Duracao deve ser inteira.").min(250, "Duracao muito curta.").max(900_000, "Duracao muito longa.");
const deviceTypeSchema = z.enum(["desktop", "mobile", "unknown"]).optional();
const nonNegativeIntSchema = z.number().finite().int().min(0);
const gameScoreSchema = (game: keyof typeof GAME_SCORE_LIMITS) =>
  z
    .number()
    .finite()
    .int("Score deve ser inteiro.")
    .min(0, "Score minimo e 0.")
    .max(GAME_SCORE_LIMITS[game], "Score acima do limite esperado para o jogo.");

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
} as const;

export const ScorePayloadSchema = z.discriminatedUnion("game", [
  z
    .object({
      ...baseScorePayload,
      game: z.literal("runtime"),
      gameVersion: z.literal(GAME_VERSIONS.runtime),
      metadata: runtimeMetadataSchema,
      score: gameScoreSchema("runtime"),
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("bug-maze"),
      gameVersion: z.literal(GAME_VERSIONS["bug-maze"]),
      metadata: bugMazeMetadataSchema,
      score: gameScoreSchema("bug-maze"),
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("code-snake"),
      gameVersion: z.literal(GAME_VERSIONS["code-snake"]),
      metadata: codeSnakeMetadataSchema,
      score: gameScoreSchema("code-snake"),
    })
    .strict(),
  z
    .object({
      ...baseScorePayload,
      game: z.literal("stack-tetris"),
      gameVersion: z.literal(GAME_VERSIONS["stack-tetris"]),
      metadata: stackTetrisMetadataSchema,
      score: gameScoreSchema("stack-tetris"),
    })
    .strict(),
]);

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>;
export type TerminalPayload = z.infer<typeof TerminalPayloadSchema>;
export type PlayerSessionPayload = z.infer<typeof PlayerSessionPayloadSchema>;
export type LeaderboardGame = z.infer<typeof LeaderboardGameSchema>;
export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriodSchema>;
export type ScorePayload = z.infer<typeof ScorePayloadSchema>;
