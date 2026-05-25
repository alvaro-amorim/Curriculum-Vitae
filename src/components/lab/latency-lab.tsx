"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { clampScore } from "@/lib/lab-score";
import type { Locale, LocalizedText } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type LatencyStatus = "idle" | "running" | "decision" | "feedback" | "won" | "failed";
type ActionKind = "optimize" | "tradeoff" | "regress";

type LatencyMetrics = {
  latency: number;
  errorRate: number;
  rpm: number;
  load: number;
  cacheHit: number;
  budget: number;
};

type LatencyDelta = Partial<LatencyMetrics>;

type LatencyAction = {
  id: string;
  label: LocalizedText;
  detail: LocalizedText;
  kind: ActionKind;
  points: number;
  delta: LatencyDelta;
  feedback: LocalizedText;
};

type LatencyIncident = {
  id: string;
  title: LocalizedText;
  symptom: LocalizedText;
  pressure: LocalizedText;
  node: "client" | "gateway" | "cache" | "database" | "worker";
  drift: LatencyDelta;
  actions: LatencyAction[];
};

type LatencyResult = {
  actionId: string;
  kind: ActionKind;
  earned: number;
  previous: LatencyMetrics;
  next: LatencyMetrics;
  feedback: LocalizedText;
  status: LocalizedText;
};

type LatencyLabProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-latency-lab-best-v1";
const START_METRICS: LatencyMetrics = {
  latency: 640,
  errorRate: 4.8,
  rpm: 1320,
  load: 74,
  cacheHit: 22,
  budget: 68,
};

const metricLimits = {
  latency: { min: 120, max: 1500 },
  errorRate: { min: 0, max: 24 },
  rpm: { min: 680, max: 2300 },
  load: { min: 18, max: 100 },
  cacheHit: { min: 0, max: 98 },
  budget: { min: 0, max: 100 },
} as const;

const incidents: LatencyIncident[] = [
  {
    id: "cold-cache",
    title: {
      pt: "Cache frio no primeiro pico",
      en: "Cold cache on first spike",
    },
    symptom: {
      pt: "p95 sobe enquanto o gateway repete leituras iguais.",
      en: "p95 rises while the gateway repeats identical reads.",
    },
    pressure: {
      pt: "Tr\u00e1fego realista, sem request externo: a simula\u00e7\u00e3o est\u00e1 local.",
      en: "Realistic traffic, no external request: the simulation is local.",
    },
    node: "cache",
    drift: { latency: 90, load: 6, cacheHit: -10, budget: -8 },
    actions: [
      {
        id: "edge-cache",
        label: {
          pt: "Ativar cache por chave est\u00e1vel.",
          en: "Enable stable-key cache.",
        },
        detail: {
          pt: "Reduz leituras repetidas e aumenta hit rate sem mascarar erro.",
          en: "Reduces repeated reads and increases hit rate without hiding errors.",
        },
        kind: "optimize",
        points: 15,
        delta: { latency: -170, load: -12, cacheHit: 30, budget: 14 },
        feedback: {
          pt: "Cache aplicado. O fluxo respirou.",
          en: "Cache applied. The flow recovered.",
        },
      },
      {
        id: "increase-timeout-cache",
        label: {
          pt: "Aumentar timeout do gateway.",
          en: "Raise gateway timeout.",
        },
        detail: {
          pt: "Evita queda imediata, mas n\u00e3o remove chamadas repetidas.",
          en: "Avoids immediate failure, but does not remove repeated calls.",
        },
        kind: "tradeoff",
        points: 6,
        delta: { latency: 70, errorRate: -1.2, load: 4, budget: -4 },
        feedback: {
          pt: "Timeout ganhou tempo, mas a lat\u00eancia piorou.",
          en: "Timeout bought time, but latency worsened.",
        },
      },
      {
        id: "disable-cache",
        label: {
          pt: "Desligar cache para simplificar.",
          en: "Disable cache to simplify.",
        },
        detail: {
          pt: "Amplifica leituras e empurra carga para o banco.",
          en: "Amplifies reads and pushes load to the database.",
        },
        kind: "regress",
        points: -12,
        delta: { latency: 160, errorRate: 2.2, load: 16, cacheHit: -18, budget: -18 },
        feedback: {
          pt: "Regress\u00e3o introduzida. O banco virou gargalo.",
          en: "Regression introduced. The database became the bottleneck.",
        },
      },
    ],
  },
  {
    id: "missing-index",
    title: {
      pt: "Consulta sem \u00edndice",
      en: "Query without index",
    },
    symptom: {
      pt: "Database esquenta quando filtros de projeto entram em cena.",
      en: "Database heats up when project filters enter the flow.",
    },
    pressure: {
      pt: "O budget cai quando load e p95 passam do limite.",
      en: "Budget drops when load and p95 pass the limit.",
    },
    node: "database",
    drift: { latency: 130, load: 10, errorRate: 1, budget: -10 },
    actions: [
      {
        id: "add-index",
        label: {
          pt: "Adicionar \u00edndice para o filtro dominante.",
          en: "Add an index for the dominant filter.",
        },
        detail: {
          pt: "Ataca a causa e reduz varredura desnecess\u00e1ria.",
          en: "Targets the cause and reduces unnecessary scans.",
        },
        kind: "optimize",
        points: 16,
        delta: { latency: -210, load: -18, budget: 16 },
        feedback: {
          pt: "\u00cdndice aplicado. O p95 voltou para dentro do budget.",
          en: "Index applied. p95 returned inside budget.",
        },
      },
      {
        id: "paginate-only",
        label: {
          pt: "Paginar resposta sem revisar consulta.",
          en: "Paginate response without reviewing query.",
        },
        detail: {
          pt: "Ajuda payload, mas a consulta ainda faz trabalho demais.",
          en: "Helps payload, but the query still does too much work.",
        },
        kind: "tradeoff",
        points: 7,
        delta: { latency: -55, load: -4, rpm: 60, budget: 2 },
        feedback: {
          pt: "Melhora parcial. Ainda h\u00e1 custo escondido.",
          en: "Partial improvement. Hidden cost remains.",
        },
      },
      {
        id: "fetch-all-client",
        label: {
          pt: "Buscar tudo e filtrar no client.",
          en: "Fetch everything and filter client-side.",
        },
        detail: {
          pt: "Aumenta payload e transfere o problema para a UI.",
          en: "Increases payload and moves the problem to the UI.",
        },
        kind: "regress",
        points: -14,
        delta: { latency: 180, errorRate: 1.8, load: 12, cacheHit: -8, budget: -16 },
        feedback: {
          pt: "O payload explodiu. O client come\u00e7ou a sofrer.",
          en: "Payload exploded. The client started to suffer.",
        },
      },
    ],
  },
  {
    id: "retry-storm",
    title: {
      pt: "Retry storm",
      en: "Retry storm",
    },
    symptom: {
      pt: "Falhas intermitentes geram novas chamadas em cadeia.",
      en: "Intermittent failures trigger chained calls.",
    },
    pressure: {
      pt: "Retries sem limite parecem resili\u00eancia, mas viram amplificador.",
      en: "Unbounded retries look resilient, but become an amplifier.",
    },
    node: "gateway",
    drift: { latency: 110, errorRate: 2.4, rpm: 220, load: 12, budget: -12 },
    actions: [
      {
        id: "cap-backoff",
        label: {
          pt: "Aplicar limite, backoff e circuit breaker.",
          en: "Apply limits, backoff, and circuit breaker.",
        },
        detail: {
          pt: "Cont\u00e9m cascata e protege servi\u00e7os lentos.",
          en: "Contains cascades and protects slow services.",
        },
        kind: "optimize",
        points: 17,
        delta: { latency: -140, errorRate: -3.2, rpm: -180, load: -14, budget: 15 },
        feedback: {
          pt: "Tempestade contida. A fila estabilizou.",
          en: "Storm contained. The queue stabilized.",
        },
      },
      {
        id: "more-retries",
        label: {
          pt: "Dobrar tentativas autom\u00e1ticas.",
          en: "Double automatic attempts.",
        },
        detail: {
          pt: "Pode recuperar alguns casos, mas aumenta press\u00e3o.",
          en: "May recover some cases, but increases pressure.",
        },
        kind: "tradeoff",
        points: 2,
        delta: { latency: 95, errorRate: -0.8, rpm: 180, load: 10, budget: -9 },
        feedback: {
          pt: "Alguns erros ca\u00edram, mas a press\u00e3o subiu.",
          en: "Some errors dropped, but pressure rose.",
        },
      },
      {
        id: "retry-loop",
        label: {
          pt: "Repetir at\u00e9 responder.",
          en: "Retry until it answers.",
        },
        detail: {
          pt: "Cria loop operacional e derruba throughput saud\u00e1vel.",
          en: "Creates an operational loop and harms healthy throughput.",
        },
        kind: "regress",
        points: -18,
        delta: { latency: 230, errorRate: 4, rpm: 420, load: 18, budget: -24 },
        feedback: {
          pt: "Incidente amplificado. O gateway entrou em alarme.",
          en: "Incident amplified. The gateway entered alarm.",
        },
      },
    ],
  },
  {
    id: "heavy-payload",
    title: {
      pt: "Payload pesado",
      en: "Heavy payload",
    },
    symptom: {
      pt: "A rota entrega campos grandes que a tela nem usa.",
      en: "The route delivers large fields the screen does not use.",
    },
    pressure: {
      pt: "Throughput parece alto, mas cada resposta carrega peso demais.",
      en: "Throughput looks high, but each response carries too much weight.",
    },
    node: "client",
    drift: { latency: 90, load: 8, rpm: -80, budget: -9 },
    actions: [
      {
        id: "reduce-payload",
        label: {
          pt: "Projetar resposta curta por contexto.",
          en: "Shape a short response per context.",
        },
        detail: {
          pt: "Remove bytes mortos sem esconder informa\u00e7\u00e3o essencial.",
          en: "Removes dead bytes without hiding essential information.",
        },
        kind: "optimize",
        points: 15,
        delta: { latency: -150, load: -9, rpm: 130, budget: 12 },
        feedback: {
          pt: "Payload enxuto. O cliente voltou a responder.",
          en: "Payload trimmed. The client became responsive again.",
        },
      },
      {
        id: "compress-only",
        label: {
          pt: "Ativar compress\u00e3o e manter shape.",
          en: "Enable compression and keep the shape.",
        },
        detail: {
          pt: "Ajuda rede, mas n\u00e3o resolve parse/render pesado.",
          en: "Helps the network, but not heavy parse/render work.",
        },
        kind: "tradeoff",
        points: 7,
        delta: { latency: -55, load: 2, budget: 1 },
        feedback: {
          pt: "Rede aliviada. Ainda h\u00e1 custo no client.",
          en: "Network relieved. Client cost remains.",
        },
      },
      {
        id: "eager-details",
        label: {
          pt: "Incluir detalhes completos em toda listagem.",
          en: "Include full details in every list.",
        },
        detail: {
          pt: "Entrega excesso e aumenta custo de render.",
          en: "Ships excess and increases render cost.",
        },
        kind: "regress",
        points: -12,
        delta: { latency: 145, errorRate: 1.2, load: 14, rpm: -120, budget: -16 },
        feedback: {
          pt: "A tela ficou pesada. O budget entrou em risco.",
          en: "The screen became heavy. Budget entered risk.",
        },
      },
    ],
  },
  {
    id: "queue-backlog",
    title: {
      pt: "Fila acumulada",
      en: "Queue backlog",
    },
    symptom: {
      pt: "Processamento pesado compete com resposta interativa.",
      en: "Heavy processing competes with interactive response.",
    },
    pressure: {
      pt: "A decis\u00e3o precisa proteger a experi\u00eancia sem inventar infra real.",
      en: "The decision must protect the experience without inventing real infrastructure.",
    },
    node: "worker",
    drift: { latency: 115, errorRate: 1.6, load: 11, budget: -11 },
    actions: [
      {
        id: "move-worker",
        label: {
          pt: "Mover tarefa pesada para fila simulada.",
          en: "Move heavy work to a simulated queue.",
        },
        detail: {
          pt: "Separa caminho cr\u00edtico e estabiliza resposta.",
          en: "Separates the critical path and stabilizes response.",
        },
        kind: "optimize",
        points: 16,
        delta: { latency: -180, errorRate: -1.8, load: -15, rpm: 90, budget: 15 },
        feedback: {
          pt: "Caminho cr\u00edtico protegido. Worker absorveu a carga.",
          en: "Critical path protected. Worker absorbed the load.",
        },
      },
      {
        id: "bigger-machine",
        label: {
          pt: "Aumentar capacidade sem separar fluxo.",
          en: "Increase capacity without separating flow.",
        },
        detail: {
          pt: "Ganha margem, mas mant\u00e9m acoplamento.",
          en: "Gains margin, but keeps coupling.",
        },
        kind: "tradeoff",
        points: 6,
        delta: { latency: -45, load: -8, budget: -1 },
        feedback: {
          pt: "Capacidade ajuda, mas a arquitetura continua fr\u00e1gil.",
          en: "Capacity helps, but architecture remains fragile.",
        },
      },
      {
        id: "sync-heavy",
        label: {
          pt: "Executar tudo antes de responder.",
          en: "Run everything before responding.",
        },
        detail: {
          pt: "Bloqueia resposta e aumenta chance de timeout.",
          en: "Blocks response and increases timeout risk.",
        },
        kind: "regress",
        points: -15,
        delta: { latency: 220, errorRate: 3.4, load: 15, rpm: -160, budget: -22 },
        feedback: {
          pt: "Timeout iminente. O usu\u00e1rio fica esperando.",
          en: "Timeout imminent. The user waits.",
        },
      },
    ],
  },
  {
    id: "n-plus-one",
    title: {
      pt: "N+1 request",
      en: "N+1 request",
    },
    symptom: {
      pt: "Uma lista dispara chamadas em cascata para cada item.",
      en: "A list triggers cascading calls for each item.",
    },
    pressure: {
      pt: "Resolver com batching melhora fluxo sem criar backend novo.",
      en: "Solving with batching improves flow without creating a new backend.",
    },
    node: "gateway",
    drift: { latency: 105, errorRate: 1.2, rpm: 260, load: 9, budget: -10 },
    actions: [
      {
        id: "batch-request",
        label: {
          pt: "Agrupar chamadas e devolver shape de lista.",
          en: "Batch calls and return a list-shaped payload.",
        },
        detail: {
          pt: "Reduz round trips e deixa o contrato previs\u00edvel.",
          en: "Reduces round trips and keeps the contract predictable.",
        },
        kind: "optimize",
        points: 16,
        delta: { latency: -175, errorRate: -1.5, rpm: -240, load: -11, budget: 15 },
        feedback: {
          pt: "Waterfall consolidado. O budget fechou verde.",
          en: "Waterfall consolidated. Budget closed green.",
        },
      },
      {
        id: "client-debounce",
        label: {
          pt: "Aplicar debounce na lista.",
          en: "Apply debounce to the list.",
        },
        detail: {
          pt: "Reduz disparos, mas n\u00e3o corrige N+1.",
          en: "Reduces triggers, but does not fix N+1.",
        },
        kind: "tradeoff",
        points: 6,
        delta: { latency: -35, rpm: -90, load: -3, budget: 0 },
        feedback: {
          pt: "Ru\u00eddo reduzido. O desenho ainda multiplica chamadas.",
          en: "Noise reduced. The design still multiplies calls.",
        },
      },
      {
        id: "parallel-all",
        label: {
          pt: "Abrir tudo em paralelo sem limite.",
          en: "Open everything in parallel without limit.",
        },
        detail: {
          pt: "Parece r\u00e1pido no dev, mas pressiona gateway e rate limit.",
          en: "Looks fast in dev, but pressures gateway and rate limits.",
        },
        kind: "regress",
        points: -14,
        delta: { latency: 115, errorRate: 3.2, rpm: 360, load: 12, budget: -19 },
        feedback: {
          pt: "Rate limit se aproximou. A cascata ficou mais agressiva.",
          en: "Rate limit approached. The cascade became more aggressive.",
        },
      },
    ],
  },
];

const copy = {
  pt: {
    eyebrow: "Latency Lab",
    title: "Estabilize a pipeline antes do timeout.",
    subtitle:
      "Um jogo de performance com m\u00e9tricas simuladas, incidentes locais, budget, score e decis\u00f5es de otimiza\u00e7\u00e3o.",
    start: "Iniciar simula\u00e7\u00e3o",
    restart: "Reiniciar lab",
    next: "Pr\u00f3ximo incidente",
    finish: "Fechar diagn\u00f3stico",
    score: "score",
    best: "melhor",
    round: "rodada",
    budget: "budget",
    latency: "p95",
    errorRate: "erro",
    rpm: "req/min",
    load: "load",
    cacheHit: "cache hit",
    status: {
      idle: "laborat\u00f3rio em espera",
      running: "carga simulada ativa",
      decision: "decis\u00e3o requerida",
      feedback: "impacto aplicado",
      won: "pipeline estabilizada",
      failed: "budget degradado",
    },
    idleTitle: "Controle lat\u00eancia, erro e load.",
    idleText:
      "Escolha otimiza\u00e7\u00f5es para incidentes simulados. Nenhuma request externa \u00e9 feita; o jogo roda localmente no client.",
    wonTitle: "Budget preservado.",
    wonText: "A pipeline ficou dentro do limite e o score local foi registrado sem ranking real.",
    failedTitle: "Timeout operacional.",
    failedText: "A lat\u00eancia, o erro ou o budget sa\u00edram da zona segura. Reinicie e escolha a\u00e7\u00f5es mais contidas.",
    choosePrefix: "A\u00e7\u00e3o",
    optimize: "otimiza\u00e7\u00e3o",
    tradeoff: "trade-off",
    regress: "risco",
    impact: "impacto",
    controlsTitle: "Controles",
    controls: ["1/2/3 escolhem uma a\u00e7\u00e3o.", "Enter avan\u00e7a ap\u00f3s feedback.", "R reinicia a simula\u00e7\u00e3o.", "Toque nos bot\u00f5es no mobile."],
    reduced: "Modo reduced motion: fluxo decorativo reduzido, decis\u00f5es e m\u00e9tricas preservadas.",
    improved: "melhorou",
    worsened: "piorou",
    stable: "est\u00e1vel",
  },
  en: {
    eyebrow: "Latency Lab",
    title: "Stabilize the pipeline before timeout.",
    subtitle: "A performance game with simulated metrics, local incidents, budget, score, and optimization decisions.",
    start: "Start simulation",
    restart: "Restart lab",
    next: "Next incident",
    finish: "Close diagnosis",
    score: "score",
    best: "best",
    round: "round",
    budget: "budget",
    latency: "p95",
    errorRate: "error",
    rpm: "req/min",
    load: "load",
    cacheHit: "cache hit",
    status: {
      idle: "lab on standby",
      running: "simulated load active",
      decision: "decision required",
      feedback: "impact applied",
      won: "pipeline stabilized",
      failed: "budget degraded",
    },
    idleTitle: "Control latency, error, and load.",
    idleText: "Choose optimizations for simulated incidents. No external request is made; the game runs locally in the client.",
    wonTitle: "Budget preserved.",
    wonText: "The pipeline stayed within limit and the local score was recorded without a real ranking.",
    failedTitle: "Operational timeout.",
    failedText: "Latency, error, or budget left the safe zone. Restart and choose more contained actions.",
    choosePrefix: "Action",
    optimize: "optimization",
    tradeoff: "trade-off",
    regress: "risk",
    impact: "impact",
    controlsTitle: "Controls",
    controls: ["1/2/3 choose an action.", "Enter advances after feedback.", "R restarts the simulation.", "Tap the buttons on mobile."],
    reduced: "Reduced motion mode: decorative flow is reduced, decisions and metrics are preserved.",
    improved: "improved",
    worsened: "worsened",
    stable: "stable",
  },
} as const;

const nodeLabels: Record<LatencyIncident["node"], string> = {
  client: "Client",
  gateway: "API Gateway",
  cache: "Cache/CDN",
  database: "Database",
  worker: "Worker/Queue",
};

const actionToneClasses: Record<ActionKind, string> = {
  optimize: styles.latencyActionOptimize,
  tradeoff: styles.latencyActionTradeoff,
  regress: styles.latencyActionRegress,
};

const stageToneClasses: Record<ActionKind, string> = {
  optimize: styles.latencyStageOptimize,
  tradeoff: styles.latencyStageTradeoff,
  regress: styles.latencyStageRegress,
};

function clampMetric<K extends keyof LatencyMetrics>(key: K, value: number) {
  const limit = metricLimits[key];
  return Math.max(limit.min, Math.min(limit.max, Math.round(value * 10) / 10));
}

function applyDelta(metrics: LatencyMetrics, delta: LatencyDelta) {
  return {
    latency: clampMetric("latency", metrics.latency + (delta.latency ?? 0)),
    errorRate: clampMetric("errorRate", metrics.errorRate + (delta.errorRate ?? 0)),
    rpm: clampMetric("rpm", metrics.rpm + (delta.rpm ?? 0)),
    load: clampMetric("load", metrics.load + (delta.load ?? 0)),
    cacheHit: clampMetric("cacheHit", metrics.cacheHit + (delta.cacheHit ?? 0)),
    budget: clampMetric("budget", metrics.budget + (delta.budget ?? 0)),
  };
}

function pressurePenalty(metrics: LatencyMetrics) {
  let penalty = 0;
  if (metrics.latency > 850) {
    penalty += 8;
  }
  if (metrics.latency > 1050) {
    penalty += 9;
  }
  if (metrics.errorRate > 7) {
    penalty += 7;
  }
  if (metrics.errorRate > 11) {
    penalty += 10;
  }
  if (metrics.load > 88) {
    penalty += 7;
  }
  if (metrics.cacheHit < 20) {
    penalty += 5;
  }
  return penalty;
}

function healthLabel(previous: LatencyMetrics, next: LatencyMetrics, locale: Locale) {
  const t = copy[locale];
  const pressureBefore = previous.latency + previous.errorRate * 35 + previous.load * 4 - previous.cacheHit * 2;
  const pressureAfter = next.latency + next.errorRate * 35 + next.load * 4 - next.cacheHit * 2;
  if (pressureAfter < pressureBefore - 40) {
    return t.improved;
  }
  if (pressureAfter > pressureBefore + 40) {
    return t.worsened;
  }
  return t.stable;
}

function readBestScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDelta(label: string, previous: number, next: number, suffix = "") {
  const delta = Math.round((next - previous) * 10) / 10;
  const sign = delta > 0 ? "+" : "";
  return `${label} ${sign}${delta}${suffix}`;
}

function calculateRoundScore(action: LatencyAction, nextMetrics: LatencyMetrics, streak: number) {
  const budgetBonus = Math.max(0, Math.round((nextMetrics.budget - 50) / 7));
  const streakBonus = action.kind === "optimize" ? Math.min(10, streak * 3) : 0;
  const riskPenalty = nextMetrics.latency > 950 || nextMetrics.errorRate > 9 ? 8 : 0;
  return action.points + budgetBonus + streakBonus - riskPenalty;
}

function isFailure(metrics: LatencyMetrics) {
  return metrics.budget <= 0 || metrics.latency >= 1400 || metrics.errorRate >= 18 || metrics.load >= 100;
}

export function LatencyLab({ locale, onComplete }: LatencyLabProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<LatencyStatus>("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [metrics, setMetrics] = useState<LatencyMetrics>(START_METRICS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [focusedAction, setFocusedAction] = useState(0);
  const [result, setResult] = useState<LatencyResult | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const incident = incidents[roundIndex];
  const progress = ((roundIndex + (status === "won" || status === "failed" ? 1 : status === "feedback" ? 0.7 : 0.15)) / incidents.length) * 100;
  const budgetCritical = metrics.budget < 28 || metrics.latency > 1000 || metrics.errorRate > 10;
  const currentHealth = result ? healthLabel(result.previous, result.next, locale) : t.stable;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const finishLab = useCallback(
    (nextStatus: "won" | "failed", finalScore: number) => {
      const clamped = clampScore(finalScore);
      setStatus(nextStatus);
      setBestScore((current) => {
        const best = Math.max(current, clamped);
        window.localStorage.setItem(BEST_SCORE_KEY, String(best));
        return best;
      });
      onComplete(clamped);
    },
    [onComplete],
  );

  const startLab = useCallback(() => {
    setStatus("decision");
    setRoundIndex(0);
    setMetrics(START_METRICS);
    setScore(0);
    setStreak(0);
    setFocusedAction(0);
    setResult(null);
    setPulseKey(0);
  }, []);

  const chooseAction = useCallback(
    (action: LatencyAction) => {
      if (status !== "decision" && status !== "running") {
        return;
      }

      setStatus("running");
      const drifted = applyDelta(metrics, incident.drift);
      const applied = applyDelta(drifted, action.delta);
      const penalty = pressurePenalty(applied);
      const nextMetrics = applyDelta(applied, { budget: -penalty });
      const nextStreak = action.kind === "optimize" ? streak + 1 : 0;
      const earned = calculateRoundScore(action, nextMetrics, nextStreak);
      const nextScore = clampScore(score + earned);

      setMetrics(nextMetrics);
      setScore(nextScore);
      setStreak(nextStreak);
      setResult({
        actionId: action.id,
        kind: action.kind,
        earned,
        previous: metrics,
        next: nextMetrics,
        feedback: action.feedback,
        status: {
          pt: action.kind === "optimize" ? "budget contido" : action.kind === "tradeoff" ? "ganho parcial" : "degrada\u00e7\u00e3o",
          en: action.kind === "optimize" ? "budget contained" : action.kind === "tradeoff" ? "partial gain" : "degradation",
        },
      });
      setPulseKey((current) => current + 1);
      setStatus("feedback");
    },
    [incident.drift, metrics, score, status, streak],
  );

  const advanceRound = useCallback(() => {
    if (!result) {
      return;
    }

    if (isFailure(result.next)) {
      finishLab("failed", score);
      return;
    }

    if (roundIndex >= incidents.length - 1) {
      const budgetBonus = Math.max(0, Math.round(result.next.budget / 4));
      finishLab("won", score + budgetBonus);
      return;
    }

    setRoundIndex((current) => current + 1);
    setFocusedAction(0);
    setResult(null);
    setStatus("decision");
  }, [finishLab, result, roundIndex, score]);

  const chooseFocused = useCallback(() => {
    const action = incident.actions[focusedAction];
    if (action) {
      chooseAction(action);
    }
  }, [chooseAction, focusedAction, incident.actions]);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        startLab();
        return;
      }

      if (event.key === "Enter" && status === "feedback") {
        event.preventDefault();
        advanceRound();
        return;
      }

      if (event.key === "Enter" && status === "decision") {
        event.preventDefault();
        chooseFocused();
        return;
      }

      if (status !== "decision") {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setFocusedAction((current) => (current + 1) % incident.actions.length);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setFocusedAction((current) => (current - 1 + incident.actions.length) % incident.actions.length);
      } else if (["1", "2", "3"].includes(event.key)) {
        event.preventDefault();
        const index = Number.parseInt(event.key, 10) - 1;
        const action = incident.actions[index];
        if (action) {
          chooseAction(action);
        }
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [advanceRound, chooseAction, chooseFocused, incident.actions, startLab, status]);

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && status === "decision") {
      event.preventDefault();
      chooseFocused();
    }
  }

  const metricRows = useMemo(
    () => [
      { id: "latency", label: t.latency, value: `${Math.round(metrics.latency)}ms`, ratio: Math.min(100, (metrics.latency / 1200) * 100), danger: metrics.latency > 900 },
      { id: "error", label: t.errorRate, value: `${metrics.errorRate.toFixed(1)}%`, ratio: Math.min(100, (metrics.errorRate / 15) * 100), danger: metrics.errorRate > 8 },
      { id: "rpm", label: t.rpm, value: String(Math.round(metrics.rpm)), ratio: Math.min(100, (metrics.rpm / 2100) * 100), danger: false },
      { id: "load", label: t.load, value: `${Math.round(metrics.load)}%`, ratio: metrics.load, danger: metrics.load > 86 },
      { id: "cache", label: t.cacheHit, value: `${Math.round(metrics.cacheHit)}%`, ratio: metrics.cacheHit, danger: metrics.cacheHit < 24 },
    ],
    [metrics, t.cacheHit, t.errorRate, t.latency, t.load, t.rpm],
  );

  const resultAction = result ? incident.actions.find((action) => action.id === result.actionId) : null;
  const stageClassName = [
    styles.latencyStage,
    budgetCritical ? styles.latencyStageCritical : "",
    status === "won" ? styles.latencyStageWon : "",
    status === "failed" ? styles.latencyStageFailed : "",
    result ? stageToneClasses[result.kind] : "",
  ].join(" ");

  return (
    <section aria-labelledby="latency-lab-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 className={styles.sectionTitle} id="latency-lab-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.latencyLayout}>
        <div className={stageClassName} onKeyDown={handleStageKeyDown} role="group" tabIndex={0}>
          <div className={styles.latencyHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite" className={pulseKey > 0 ? styles.latencyScorePulse : ""} key={`latency-score-${pulseKey}`}>
                {score}
              </strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{Math.max(bestScore, score)}</strong>
            </div>
            <div>
              <span>{t.round}</span>
              <strong>
                {Math.min(roundIndex + 1, incidents.length)}/{incidents.length}
              </strong>
            </div>
            <div>
              <span>{t.budget}</span>
              <strong className={budgetCritical ? styles.latencyBudgetCritical : ""}>{Math.round(metrics.budget)}</strong>
            </div>
          </div>

          <div className={styles.latencyProgress} aria-hidden="true">
            <span style={{ "--progress": `${progress}%` } as StyleVars} />
          </div>

          <div className={styles.latencyTopology} aria-label={incident.title[locale]}>
            {(["client", "gateway", "cache", "database", "worker"] as const).map((node) => (
              <div
                className={[styles.latencyNode, node === incident.node ? styles.latencyNodeActive : ""].join(" ")}
                key={node}
                style={{ "--node-index": node === "client" ? 0 : node === "gateway" ? 1 : node === "cache" ? 2 : node === "database" ? 3 : 4 } as StyleVars}
              >
                <span>{nodeLabels[node]}</span>
                <i aria-hidden="true" />
              </div>
            ))}
          </div>

          <div className={styles.latencyMetrics}>
            {metricRows.map((metric) => (
              <div className={[styles.latencyMetric, metric.danger ? styles.latencyMetricDanger : ""].join(" ")} key={metric.id}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <i style={{ "--meter": `${metric.ratio}%` } as StyleVars} />
              </div>
            ))}
          </div>

          <div className={styles.latencyIncidentPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <h3>{incident.title[locale]}</h3>
            <p>{incident.symptom[locale]}</p>
            <small>{incident.pressure[locale]}</small>
          </div>

          {status === "idle" || status === "won" || status === "failed" ? (
            <div className={styles.latencyOverlay}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{t.status[status]}</p>
                <h3>{status === "won" ? t.wonTitle : status === "failed" ? t.failedTitle : t.idleTitle}</h3>
                <p>{status === "won" ? t.wonText : status === "failed" ? t.failedText : t.idleText}</p>
                <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={startLab} type="button">
                  {status === "idle" ? t.start : t.restart}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.latencySide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <div className={styles.latencyBudget}>
              <span>{t.budget}</span>
              <strong>{Math.round(metrics.budget)}</strong>
              <i style={{ "--budget": `${metrics.budget}%` } as StyleVars} />
            </div>
          </div>

          <div className={styles.latencyActions} role="group" aria-label={incident.title[locale]}>
            {incident.actions.map((action, index) => {
              const isFocused = status === "decision" && focusedAction === index;
              const isSelected = result?.actionId === action.id;

              return (
                <button
                  aria-describedby={`latency-action-${action.id}`}
                  aria-pressed={isSelected}
                  className={[
                    styles.latencyAction,
                    actionToneClasses[action.kind],
                    isFocused ? styles.latencyActionFocused : "",
                    isSelected ? styles.latencyActionSelected : "",
                  ].join(" ")}
                  disabled={status !== "decision"}
                  key={action.id}
                  onClick={() => chooseAction(action)}
                  type="button"
                >
                  <span className={styles.latencyActionMeta}>
                    {t.choosePrefix} {index + 1} / {t[action.kind]}
                  </span>
                  <strong>{action.label[locale]}</strong>
                  <span id={`latency-action-${action.id}`}>{action.detail[locale]}</span>
                </button>
              );
            })}
          </div>

          {status === "feedback" && result ? (
            <div className={[styles.latencyFeedback, styles[`latencyFeedback${result.kind[0].toUpperCase()}${result.kind.slice(1)}`]].join(" ")}>
              <p className={styles.gameStatus}>
                {result.status[locale]} / {t.impact}: {result.earned > 0 ? "+" : ""}
                {result.earned}
              </p>
              <h3>{resultAction?.label[locale] ?? result.feedback[locale]}</h3>
              <p>{result.feedback[locale]}</p>
              <div className={styles.latencyDeltaRail} aria-live="polite">
                <span>{currentHealth}</span>
                <span>{formatDelta(t.latency, result.previous.latency, result.next.latency, "ms")}</span>
                <span>{formatDelta(t.errorRate, result.previous.errorRate, result.next.errorRate, "%")}</span>
                <span>{formatDelta(t.budget, result.previous.budget, result.next.budget)}</span>
              </div>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={advanceRound} type="button">
                {roundIndex >= incidents.length - 1 || isFailure(result.next) ? t.finish : t.next}
              </button>
            </div>
          ) : null}

          <div className={styles.runnerPanel}>
            <h3>{t.controlsTitle}</h3>
            <ul>
              {t.controls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {reducedMotion ? <p>{t.reduced}</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
