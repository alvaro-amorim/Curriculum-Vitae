"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { clampScore } from "@/lib/lab-score";
import type { Locale, LocalizedText } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ArenaStatus = "idle" | "playing" | "feedback" | "completed" | "failed";
type FixKind = "safe" | "partial" | "danger";

type ArenaOption = {
  id: string;
  label: LocalizedText;
  detail: LocalizedText;
  kind: FixKind;
  points: number;
  stability: number;
  feedback: LocalizedText;
  review: LocalizedText;
};

type ArenaScenario = {
  id: string;
  title: LocalizedText;
  symptom: LocalizedText;
  context: LocalizedText;
  severity: "api" | "render" | "security" | "layout" | "asset" | "network";
  code: string[];
  suspectLine: number;
  options: ArenaOption[];
};

type ArenaResult = {
  optionId: string;
  kind: FixKind;
  earned: number;
  scoreAfter: number;
  stabilityAfter: number;
  streakAfter: number;
  timedOut: boolean;
  feedback: LocalizedText;
  review: LocalizedText;
};

type DebugArenaProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-debug-arena-best-v1";
const ROUND_TIME = 24;
const REDUCED_ROUND_TIME = 30;

const arenaScenarios: ArenaScenario[] = [
  {
    id: "api-validation-500",
    title: {
      pt: "API retornando 500",
      en: "API returning 500",
    },
    symptom: {
      pt: "Payload incompleto derruba o endpoint em produ\u00e7\u00e3o.",
      en: "Incomplete payload crashes the production endpoint.",
    },
    context: {
      pt: "A rota salva dados antes de validar o contrato recebido.",
      en: "The route saves data before validating the received contract.",
    },
    severity: "api",
    suspectLine: 4,
    code: [
      "export async function POST(request: Request) {",
      "  const body = await request.json();",
      "  const lead = await db.lead.create({",
      "    data: { email: body.email, plan: body.plan },",
      "  });",
      "  return Response.json({ lead });",
      "}",
    ],
    options: [
      {
        id: "schema-first",
        label: {
          pt: "Validar com schema e retornar 400 controlado.",
          en: "Validate with a schema and return a controlled 400.",
        },
        detail: {
          pt: "Bloqueia payload inv\u00e1lido antes do banco.",
          en: "Blocks invalid payload before the database.",
        },
        kind: "safe",
        points: 15,
        stability: 8,
        feedback: {
          pt: "Corre\u00e7\u00e3o segura aplicada.",
          en: "Safe fix applied.",
        },
        review: {
          pt: "Validar entrada antes da escrita reduz 500, evita dados quebrados e preserva contrato de API.",
          en: "Validating input before writes reduces 500s, avoids broken data, and preserves the API contract.",
        },
      },
      {
        id: "try-catch-only",
        label: {
          pt: "Envolver tudo em try/catch e manter o payload livre.",
          en: "Wrap everything in try/catch and keep the payload loose.",
        },
        detail: {
          pt: "Melhora a resposta, mas n\u00e3o corrige a causa.",
          en: "Improves the response, but not the cause.",
        },
        kind: "partial",
        points: 7,
        stability: -8,
        feedback: {
          pt: "Patch parcial.",
          en: "Partial patch.",
        },
        review: {
          pt: "O try/catch ajuda a controlar erro, mas ainda aceita dados inv\u00e1lidos e empurra risco para camadas internas.",
          en: "The try/catch helps control errors, but still accepts invalid data and pushes risk inward.",
        },
      },
      {
        id: "cast-any",
        label: {
          pt: "Tipar body como any e ignorar campos ausentes.",
          en: "Type body as any and ignore missing fields.",
        },
        detail: {
          pt: "Remove prote\u00e7\u00e3o e mascara o bug.",
          en: "Removes protection and hides the bug.",
        },
        kind: "danger",
        points: -10,
        stability: -26,
        feedback: {
          pt: "Risco aumentado.",
          en: "Risk increased.",
        },
        review: {
          pt: "any desliga o alarme do TypeScript e n\u00e3o cria valida\u00e7\u00e3o real em runtime.",
          en: "any disables the TypeScript alarm and does not create real runtime validation.",
        },
      },
    ],
  },
  {
    id: "react-render-storm",
    title: {
      pt: "Render em loop",
      en: "Render loop",
    },
    symptom: {
      pt: "A tela trava ap\u00f3s carregar filtros de projeto.",
      en: "The screen freezes after project filters load.",
    },
    context: {
      pt: "Um efeito atualiza estado derivado a cada render.",
      en: "An effect updates derived state on every render.",
    },
    severity: "render",
    suspectLine: 3,
    code: [
      "function ProjectList({ projects }) {",
      "  const [visible, setVisible] = useState([]);",
      "  useEffect(() => {",
      "    setVisible(projects.filter((item) => item.featured));",
      "  });",
      "  return <Grid items={visible} />;",
      "}",
    ],
    options: [
      {
        id: "derive-with-memo",
        label: {
          pt: "Derivar com useMemo ou corrigir depend\u00eancias.",
          en: "Derive with useMemo or fix dependencies.",
        },
        detail: {
          pt: "Remove estado redundante e estabiliza render.",
          en: "Removes redundant state and stabilizes render.",
        },
        kind: "safe",
        points: 14,
        stability: 7,
        feedback: {
          pt: "Render estabilizado.",
          en: "Render stabilized.",
        },
        review: {
          pt: "Dados derivados n\u00e3o precisam virar estado quando podem ser calculados de forma previs\u00edvel.",
          en: "Derived data does not need state when it can be calculated predictably.",
        },
      },
      {
        id: "debounce-render",
        label: {
          pt: "Adicionar debounce antes do setVisible.",
          en: "Add debounce before setVisible.",
        },
        detail: {
          pt: "Reduz sintomas, mas mant\u00e9m o desenho fr\u00e1gil.",
          en: "Reduces symptoms, but keeps the fragile design.",
        },
        kind: "partial",
        points: 6,
        stability: -9,
        feedback: {
          pt: "Sintoma reduzido.",
          en: "Symptom reduced.",
        },
        review: {
          pt: "Debounce pode aliviar custo, mas n\u00e3o resolve efeito sem depend\u00eancias nem estado derivado desnecess\u00e1rio.",
          en: "Debounce can lower cost, but does not fix the missing dependencies or redundant derived state.",
        },
      },
      {
        id: "disable-eslint",
        label: {
          pt: "Desativar o lint do hook.",
          en: "Disable the hook lint rule.",
        },
        detail: {
          pt: "Silencia o aviso e deixa o loop vivo.",
          en: "Silences the warning and keeps the loop alive.",
        },
        kind: "danger",
        points: -12,
        stability: -24,
        feedback: {
          pt: "Loop preservado.",
          en: "Loop preserved.",
        },
        review: {
          pt: "Desligar a regra remove evid\u00eancia do problema e aumenta risco de regress\u00e3o.",
          en: "Turning off the rule removes evidence of the problem and increases regression risk.",
        },
      },
    ],
  },
  {
    id: "secret-in-client",
    title: {
      pt: "Token exposto",
      en: "Exposed token",
    },
    symptom: {
      pt: "Uma chave privada apareceu no bundle do browser.",
      en: "A private key appeared in the browser bundle.",
    },
    context: {
      pt: "A chamada para provider externo foi feita direto no client.",
      en: "The external provider call was made directly on the client.",
    },
    severity: "security",
    suspectLine: 2,
    code: [
      "\"use client\";",
      "const token = process.env.SECRET_API_KEY;",
      "await fetch(providerUrl, {",
      "  headers: { Authorization: `Bearer ${token}` },",
      "});",
    ],
    options: [
      {
        id: "server-route",
        label: {
          pt: "Mover a chamada para uma rota server-side validada.",
          en: "Move the call to a validated server-side route.",
        },
        detail: {
          pt: "Mant\u00e9m segredo fora do bundle.",
          en: "Keeps the secret out of the bundle.",
        },
        kind: "safe",
        points: 18,
        stability: 10,
        feedback: {
          pt: "Credencial protegida.",
          en: "Credential protected.",
        },
        review: {
          pt: "Segredo privado deve ficar no servidor; o client chama uma API pr\u00f3pria com valida\u00e7\u00e3o.",
          en: "A private secret belongs on the server; the client calls your own validated API.",
        },
      },
      {
        id: "rename-env",
        label: {
          pt: "Renomear a vari\u00e1vel e manter no client.",
          en: "Rename the variable and keep it on the client.",
        },
        detail: {
          pt: "N\u00e3o resolve exposi\u00e7\u00e3o se ainda for usada no browser.",
          en: "Does not fix exposure if it is still used in the browser.",
        },
        kind: "partial",
        points: 2,
        stability: -12,
        feedback: {
          pt: "Corre\u00e7\u00e3o ilus\u00f3ria.",
          en: "Illusory fix.",
        },
        review: {
          pt: "Nome de env n\u00e3o \u00e9 barreira de seguran\u00e7a. O local de execu\u00e7\u00e3o \u00e9 o que importa.",
          en: "An env name is not a security boundary. The execution location is what matters.",
        },
      },
      {
        id: "hide-in-localstorage",
        label: {
          pt: "Guardar token no localStorage para reutilizar.",
          en: "Store the token in localStorage for reuse.",
        },
        detail: {
          pt: "Aumenta vazamento e superf\u00edcie de ataque.",
          en: "Increases leakage and attack surface.",
        },
        kind: "danger",
        points: -18,
        stability: -34,
        feedback: {
          pt: "Incidente cr\u00edtico.",
          en: "Critical incident.",
        },
        review: {
          pt: "localStorage \u00e9 leg\u00edvel por scripts no browser. Segredo privado n\u00e3o deve passar por ali.",
          en: "localStorage is readable by browser scripts. A private secret should not go there.",
        },
      },
    ],
  },
  {
    id: "mobile-overflow",
    title: {
      pt: "Overflow mobile",
      en: "Mobile overflow",
    },
    symptom: {
      pt: "A primeira dobra cria rolagem horizontal em 400px.",
      en: "The first fold creates horizontal scroll at 400px.",
    },
    context: {
      pt: "Um grid fixa largura maior que a viewport.",
      en: "A grid locks a width larger than the viewport.",
    },
    severity: "layout",
    suspectLine: 2,
    code: [
      ".showcase {",
      "  grid-template-columns: 34rem 42rem;",
      "  gap: 3rem;",
      "}",
      ".frame { min-width: 40rem; }",
    ],
    options: [
      {
        id: "responsive-minmax",
        label: {
          pt: "Trocar para minmax(0, 1fr) e limites responsivos.",
          en: "Use minmax(0, 1fr) and responsive limits.",
        },
        detail: {
          pt: "Permite encolher sem quebrar o stage.",
          en: "Allows shrinking without breaking the stage.",
        },
        kind: "safe",
        points: 15,
        stability: 7,
        feedback: {
          pt: "Layout contido.",
          en: "Layout contained.",
        },
        review: {
          pt: "Tracks flex\u00edveis e `max-width: 100%` evitam overflow sem remover a composi\u00e7\u00e3o premium.",
          en: "Flexible tracks and `max-width: 100%` prevent overflow without removing the premium composition.",
        },
      },
      {
        id: "overflow-hidden",
        label: {
          pt: "Aplicar overflow-x hidden no body.",
          en: "Apply overflow-x hidden to body.",
        },
        detail: {
          pt: "Esconde o sintoma e pode cortar conte\u00fado.",
          en: "Hides the symptom and can cut content.",
        },
        kind: "partial",
        points: 5,
        stability: -8,
        feedback: {
          pt: "Sintoma mascarado.",
          en: "Symptom masked.",
        },
        review: {
          pt: "Pode ser prote\u00e7\u00e3o extra, mas a largura do componente ainda precisa ser corrigida.",
          en: "It can be extra protection, but the component width still needs to be fixed.",
        },
      },
      {
        id: "scale-page",
        label: {
          pt: "Reduzir tudo com transform: scale().",
          en: "Shrink everything with transform: scale().",
        },
        detail: {
          pt: "Borra texto e prejudica acessibilidade.",
          en: "Blurs text and hurts accessibility.",
        },
        kind: "danger",
        points: -10,
        stability: -22,
        feedback: {
          pt: "Nitidez degradada.",
          en: "Sharpness degraded.",
        },
        review: {
          pt: "Escalar a p\u00e1gina inteira costuma criar texto serrilhado, hit targets ruins e layout fr\u00e1gil.",
          en: "Scaling the whole page often creates jagged text, bad hit targets, and fragile layout.",
        },
      },
    ],
  },
  {
    id: "broken-image",
    title: {
      pt: "Imagem quebrada",
      en: "Broken image",
    },
    symptom: {
      pt: "Cards de projeto aparecem com \u00edcone de asset faltando.",
      en: "Project cards show a missing asset icon.",
    },
    context: {
      pt: "A UI assume screenshot real antes de o asset existir.",
      en: "The UI assumes a real screenshot before the asset exists.",
    },
    severity: "asset",
    suspectLine: 3,
    code: [
      "<Image",
      "  src={project.visuals.heroImage}",
      "  alt={project.title}",
      "  fill",
      "/>",
    ],
    options: [
      {
        id: "honest-fallback",
        label: {
          pt: "Usar fallback premium honesto quando a imagem estiver pendente.",
          en: "Use an honest premium fallback while the image is pending.",
        },
        detail: {
          pt: "Evita screenshot falso e asset quebrado.",
          en: "Avoids fake screenshots and broken assets.",
        },
        kind: "safe",
        points: 14,
        stability: 6,
        feedback: {
          pt: "Fallback confi\u00e1vel.",
          en: "Reliable fallback.",
        },
        review: {
          pt: "Quando n\u00e3o h\u00e1 imagem real, o placeholder deve ser intencional e declarar que est\u00e1 em prepara\u00e7\u00e3o.",
          en: "When there is no real image, the placeholder should be intentional and state that it is in preparation.",
        },
      },
      {
        id: "remote-random",
        label: {
          pt: "Usar uma imagem externa parecida at\u00e9 ter screenshot.",
          en: "Use a similar external image until there is a screenshot.",
        },
        detail: {
          pt: "Pode enganar sobre o projeto real.",
          en: "Can misrepresent the real project.",
        },
        kind: "danger",
        points: -13,
        stability: -25,
        feedback: {
          pt: "Asset enganoso.",
          en: "Misleading asset.",
        },
        review: {
          pt: "Imagem externa gen\u00e9rica parece screenshot falso e quebra a honestidade do case.",
          en: "A generic external image looks like a fake screenshot and breaks case-study honesty.",
        },
      },
      {
        id: "empty-alt",
        label: {
          pt: "Deixar src vazio e esconder o alt.",
          en: "Leave src empty and hide the alt.",
        },
        detail: {
          pt: "Remove contexto e ainda pode quebrar render.",
          en: "Removes context and can still break render.",
        },
        kind: "partial",
        points: 3,
        stability: -12,
        feedback: {
          pt: "Corre\u00e7\u00e3o incompleta.",
          en: "Incomplete fix.",
        },
        review: {
          pt: "O fallback precisa ser tratado como estado de produto, n\u00e3o como aus\u00eancia silenciosa.",
          en: "The fallback should be treated as a product state, not silent absence.",
        },
      },
    ],
  },
  {
    id: "fetch-no-error",
    title: {
      pt: "Fetch sem tratamento",
      en: "Fetch without handling",
    },
    symptom: {
      pt: "A tela fica vazia quando a API retorna 404.",
      en: "The screen goes blank when the API returns 404.",
    },
    context: {
      pt: "O c\u00f3digo l\u00ea JSON sem verificar status.",
      en: "The code reads JSON without checking status.",
    },
    severity: "network",
    suspectLine: 2,
    code: [
      "async function loadCase(slug: string) {",
      "  const response = await fetch(`/api/projects/${slug}`);",
      "  const data = await response.json();",
      "  return data.project;",
      "}",
    ],
    options: [
      {
        id: "check-ok",
        label: {
          pt: "Checar response.ok e renderizar estado controlado.",
          en: "Check response.ok and render a controlled state.",
        },
        detail: {
          pt: "Separa erro esperado de falha inesperada.",
          en: "Separates expected errors from unexpected failure.",
        },
        kind: "safe",
        points: 15,
        stability: 7,
        feedback: {
          pt: "Fluxo resiliente.",
          en: "Resilient flow.",
        },
        review: {
          pt: "fetch n\u00e3o lan\u00e7a exce\u00e7\u00e3o para HTTP 404/500. A UI precisa de estado de erro previs\u00edvel.",
          en: "fetch does not throw for HTTP 404/500. The UI needs a predictable error state.",
        },
      },
      {
        id: "retry-forever",
        label: {
          pt: "Tentar novamente em loop at\u00e9 funcionar.",
          en: "Retry in a loop until it works.",
        },
        detail: {
          pt: "Amplifica carga e piora incidentes.",
          en: "Amplifies load and worsens incidents.",
        },
        kind: "danger",
        points: -11,
        stability: -24,
        feedback: {
          pt: "Incidente amplificado.",
          en: "Incident amplified.",
        },
        review: {
          pt: "Retry precisa de limite, backoff e condi\u00e7\u00f5es claras; loop infinito \u00e9 risco operacional.",
          en: "Retry needs limits, backoff, and clear conditions; an infinite loop is operational risk.",
        },
      },
      {
        id: "catch-empty",
        label: {
          pt: "Usar catch e retornar objeto vazio.",
          en: "Use catch and return an empty object.",
        },
        detail: {
          pt: "Evita crash, mas esconde diagn\u00f3stico.",
          en: "Avoids a crash, but hides diagnosis.",
        },
        kind: "partial",
        points: 5,
        stability: -9,
        feedback: {
          pt: "Erro silenciado.",
          en: "Error silenced.",
        },
        review: {
          pt: "Fallback vazio pode proteger a renderiza\u00e7\u00e3o, mas deve preservar mensagem e observabilidade.",
          en: "An empty fallback can protect rendering, but should preserve messaging and observability.",
        },
      },
    ],
  },
];

const copy = {
  pt: {
    eyebrow: "Debug Arena",
    title: "Corrija antes do build cair.",
    subtitle: "Uma arena de decis\u00e3o t\u00e9cnica com editor visual, timer, risco, streak e feedback de code review.",
    start: "Entrar na arena",
    restart: "Reiniciar arena",
    next: "Pr\u00f3ximo bug",
    finish: "Ver resumo",
    choosePrefix: "Patch",
    score: "score",
    best: "melhor",
    streak: "streak",
    stability: "estabilidade",
    time: "tempo",
    round: "rodada",
    idleStatus: "aguardando triagem",
    playingStatus: "build em risco",
    feedbackStatus: "review aplicado",
    completedStatus: "arena conclu\u00edda",
    failedStatus: "build derrubado",
    idleTitle: "Escolha o patch mais seguro.",
    idleText: "Use 1/2/3, setas + Enter ou toque nos patches. Cada decis\u00e3o altera score, estabilidade e streak.",
    completedTitle: "Build protegido.",
    failedTitle: "Estabilidade esgotada.",
    timeout: "Tempo esgotado. O bug avan\u00e7ou para produ\u00e7\u00e3o.",
    selected: "selecionado",
    safe: "seguro",
    partial: "parcial",
    danger: "risco",
    review: "code review",
    controlsTitle: "Controles",
    controls: ["1/2/3 escolhem patches.", "Setas alternam foco; Enter confirma.", "N avan\u00e7a depois do feedback.", "R reinicia a arena."],
    reduced: "Modo reduced motion: efeitos decorativos reduzidos, timer e regras preservados.",
  },
  en: {
    eyebrow: "Debug Arena",
    title: "Fix before the build falls.",
    subtitle: "A technical decision arena with visual editor, timer, risk, streak, and code review feedback.",
    start: "Enter arena",
    restart: "Restart arena",
    next: "Next bug",
    finish: "View summary",
    choosePrefix: "Patch",
    score: "score",
    best: "best",
    streak: "streak",
    stability: "stability",
    time: "time",
    round: "round",
    idleStatus: "waiting for triage",
    playingStatus: "build at risk",
    feedbackStatus: "review applied",
    completedStatus: "arena completed",
    failedStatus: "build failed",
    idleTitle: "Choose the safest patch.",
    idleText: "Use 1/2/3, arrows + Enter, or tap the patches. Each decision changes score, stability, and streak.",
    completedTitle: "Build protected.",
    failedTitle: "Stability depleted.",
    timeout: "Time expired. The bug advanced to production.",
    selected: "selected",
    safe: "safe",
    partial: "partial",
    danger: "risk",
    review: "code review",
    controlsTitle: "Controls",
    controls: ["1/2/3 choose patches.", "Arrows change focus; Enter confirms.", "N advances after feedback.", "R restarts the arena."],
    reduced: "Reduced motion mode: decorative effects are reduced, timer and rules stay available.",
  },
} as const;

const optionToneClasses: Record<FixKind, string> = {
  safe: styles.arenaOptionSafe,
  partial: styles.arenaOptionPartial,
  danger: styles.arenaOptionDanger,
};

function readBestScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function DebugArena({ locale, onComplete }: DebugArenaProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<ArenaStatus>("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stability, setStability] = useState(100);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [focusedOption, setFocusedOption] = useState(0);
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const currentScenario = arenaScenarios[roundIndex];
  const roundCount = arenaScenarios.length;
  const progress = ((roundIndex + (status === "completed" || status === "failed" ? 1 : 0)) / roundCount) * 100;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const finishArena = useCallback(
    (nextStatus: "completed" | "failed", nextScore: number) => {
      setStatus(nextStatus);
      setBestScore((current) => {
        const best = Math.max(current, nextScore);
        window.localStorage.setItem(BEST_SCORE_KEY, String(best));
        return best;
      });
      onComplete(nextScore);
    },
    [onComplete],
  );

  const startArena = useCallback(() => {
    setStatus("playing");
    setRoundIndex(0);
    setScore(0);
    setStability(100);
    setStreak(0);
    setFocusedOption(0);
    setResult(null);
    setTimeLeft(reducedMotion ? REDUCED_ROUND_TIME : ROUND_TIME);
  }, [reducedMotion]);

  const resolveChoice = useCallback(
    (option: ArenaOption, timedOut = false) => {
      if (status !== "playing") {
        return;
      }

      const nextStreak = option.kind === "safe" && !timedOut ? streak + 1 : 0;
      const timeBonus = timedOut ? 0 : option.kind === "safe" ? Math.ceil(timeLeft / 3) : option.kind === "partial" ? Math.ceil(timeLeft / 6) : 0;
      const streakBonus = option.kind === "safe" ? Math.min(12, nextStreak * 3) : 0;
      const earned = timedOut ? -12 : option.points + timeBonus + streakBonus;
      const nextScore = clampScore(score + earned);
      const nextStability = Math.max(0, Math.min(100, stability + (timedOut ? -22 : option.stability)));
      const nextResult: ArenaResult = {
        optionId: option.id,
        kind: timedOut ? "danger" : option.kind,
        earned,
        scoreAfter: nextScore,
        stabilityAfter: nextStability,
        streakAfter: nextStreak,
        timedOut,
        feedback: timedOut ? { pt: copy.pt.timeout, en: copy.en.timeout } : option.feedback,
        review: option.review,
      };

      setResult(nextResult);
      setScore(nextScore);
      setStability(nextStability);
      setStreak(nextStreak);
      setStatus("feedback");
    },
    [score, stability, status, streak, timeLeft],
  );

  const handleTimeout = useCallback(() => {
    const danger = currentScenario.options.find((option) => option.kind === "danger") ?? currentScenario.options[0];
    resolveChoice(danger, true);
  }, [currentScenario.options, resolveChoice]);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          handleTimeout();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [handleTimeout, status]);

  const advanceRound = useCallback(() => {
    if (!result) {
      return;
    }

    if (result.stabilityAfter <= 0) {
      finishArena("failed", result.scoreAfter);
      return;
    }

    if (roundIndex >= roundCount - 1) {
      finishArena("completed", result.scoreAfter);
      return;
    }

    setRoundIndex((current) => current + 1);
    setFocusedOption(0);
    setResult(null);
    setTimeLeft(reducedMotion ? REDUCED_ROUND_TIME : ROUND_TIME);
    setStatus("playing");
  }, [finishArena, reducedMotion, result, roundCount, roundIndex]);

  const chooseFocused = useCallback(() => {
    const option = currentScenario.options[focusedOption];
    if (option) {
      resolveChoice(option);
    }
  }, [currentScenario.options, focusedOption, resolveChoice]);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        startArena();
        return;
      }

      if (status === "feedback" && event.key.toLowerCase() === "n") {
        event.preventDefault();
        advanceRound();
        return;
      }

      if (status !== "playing") {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setFocusedOption((current) => (current + 1) % currentScenario.options.length);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setFocusedOption((current) => (current - 1 + currentScenario.options.length) % currentScenario.options.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        chooseFocused();
      } else if (["1", "2", "3"].includes(event.key)) {
        event.preventDefault();
        const index = Number.parseInt(event.key, 10) - 1;
        const option = currentScenario.options[index];
        if (option) {
          resolveChoice(option);
        }
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [advanceRound, chooseFocused, currentScenario.options, resolveChoice, startArena, status]);

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && status === "playing") {
      event.preventDefault();
      chooseFocused();
    }
  }

  const statusLabel =
    status === "idle"
      ? t.idleStatus
      : status === "playing"
        ? t.playingStatus
        : status === "feedback"
          ? t.feedbackStatus
          : status === "completed"
            ? t.completedStatus
            : t.failedStatus;
  const terminalTitle = status === "completed" ? t.completedTitle : status === "failed" ? t.failedTitle : t.idleTitle;
  const resultOption = result ? currentScenario.options.find((option) => option.id === result.optionId) : null;

  return (
    <section aria-labelledby="debug-arena-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 className={styles.sectionTitle} id="debug-arena-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.arenaLayout}>
        <div
          className={[
            styles.arenaStage,
            status === "feedback" && result ? styles[`arenaStage${result.kind[0].toUpperCase()}${result.kind.slice(1)}`] : "",
            status === "completed" ? styles.arenaStageCompleted : "",
            status === "failed" ? styles.arenaStageFailed : "",
          ].join(" ")}
          onKeyDown={handlePanelKeyDown}
          role="group"
          tabIndex={0}
        >
          <div className={styles.arenaHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite">{score}</strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{Math.max(bestScore, score)}</strong>
            </div>
            <div>
              <span>{t.streak}</span>
              <strong>{streak}</strong>
            </div>
            <div>
              <span>{t.time}</span>
              <strong>{timeLeft}s</strong>
            </div>
          </div>

          <div className={styles.arenaProgress} aria-hidden="true">
            <span style={{ "--progress": `${progress}%` } as StyleVars} />
          </div>

          <div className={styles.arenaBody}>
            <div className={styles.arenaEditor}>
              <div className={styles.arenaEditorHeader}>
                <span>{currentScenario.severity}</span>
                <strong>{currentScenario.title[locale]}</strong>
              </div>
              <div className={styles.arenaCode} aria-label={currentScenario.title[locale]}>
                {currentScenario.code.map((line, index) => (
                  <div
                    className={[
                      styles.arenaLine,
                      index + 1 === currentScenario.suspectLine ? styles.arenaLineSuspect : "",
                      result?.kind === "safe" && index + 1 === currentScenario.suspectLine ? styles.arenaLineResolved : "",
                    ].join(" ")}
                    key={`${currentScenario.id}-${index}`}
                  >
                    <span className={styles.arenaGutter}>{index + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </div>
            </div>

            <aside className={styles.arenaBugPanel}>
              <p className={styles.gameStatus}>{statusLabel}</p>
              <h3>{currentScenario.symptom[locale]}</h3>
              <p>{currentScenario.context[locale]}</p>

              <div className={styles.arenaMeter} aria-label={`${t.stability}: ${stability}`}>
                <span>{t.stability}</span>
                <strong>{stability}</strong>
                <i style={{ "--stability": `${stability}%` } as StyleVars} />
              </div>
            </aside>
          </div>

          {status === "idle" || status === "completed" || status === "failed" ? (
            <div className={styles.arenaOverlay}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{statusLabel}</p>
                <h3>{terminalTitle}</h3>
                <p>{status === "idle" ? t.idleText : result?.review[locale]}</p>
                <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={startArena} type="button">
                  {status === "idle" ? t.start : t.restart}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.arenaSide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>
              {t.round} {Math.min(roundIndex + 1, roundCount)}/{roundCount}
            </p>
            <div className={styles.arenaTimeline} aria-hidden="true">
              {arenaScenarios.map((scenario, index) => (
                <span
                  className={[
                    styles.arenaNode,
                    index === roundIndex ? styles.arenaNodeActive : "",
                    index < roundIndex || status === "completed" ? styles.arenaNodeDone : "",
                  ].join(" ")}
                  key={scenario.id}
                />
              ))}
            </div>
          </div>

          <div className={styles.arenaOptions} role="group" aria-label={currentScenario.symptom[locale]}>
            {currentScenario.options.map((option, index) => {
              const isFocused = focusedOption === index;
              const isSelected = result?.optionId === option.id;

              return (
                <button
                  aria-describedby={`debug-arena-option-${option.id}`}
                  aria-pressed={isSelected}
                  className={[
                    styles.arenaOption,
                    optionToneClasses[option.kind],
                    isFocused && status === "playing" ? styles.arenaOptionFocused : "",
                    isSelected ? styles.arenaOptionSelected : "",
                  ].join(" ")}
                  disabled={status !== "playing"}
                  key={option.id}
                  onClick={() => resolveChoice(option)}
                  type="button"
                >
                  <span className={styles.arenaOptionMeta}>
                    {t.choosePrefix} {index + 1} / {t[option.kind]}
                  </span>
                  <strong>{option.label[locale]}</strong>
                  <span id={`debug-arena-option-${option.id}`}>{option.detail[locale]}</span>
                </button>
              );
            })}
          </div>

          {status === "feedback" && result ? (
            <div className={[styles.arenaFeedback, styles[`arenaFeedback${result.kind[0].toUpperCase()}${result.kind.slice(1)}`]].join(" ")}>
              <p className={styles.gameStatus}>
                {result.timedOut ? t.timeout : result.feedback[locale]} / {signed(result.earned)}
              </p>
              <h3>{resultOption?.label[locale]}</h3>
              <p>{result.review[locale]}</p>
              <p>
                {t.score}: {result.scoreAfter} / {t.stability}: {result.stabilityAfter} / {t.streak}: {result.streakAfter}
              </p>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={advanceRound} type="button">
                {roundIndex >= roundCount - 1 || result.stabilityAfter <= 0 ? t.finish : t.next}
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
