"use client";

import dynamic from "next/dynamic";
import type { FormEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { GameScorePayloadV2, LabGameId, LeaderboardEntry, LeaderboardResponse, PlayerLeaderboardResponse } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";
type ArcadeGameId = Extract<LabGameId, "runtime" | "bug-maze" | "code-snake" | "stack-tetris">;
type LeaderboardStatus = "idle" | "loading" | "ready" | "failed";
type LeaderboardState = Record<ArcadeGameId, LeaderboardEntry[]>;
type AliasStatus = "loading" | "ready" | "saving" | "success" | "error";
type PlayerSession = {
  alias: string | null;
  maxAliasLength: number;
  ready: true;
};
type LastScoreResult = {
  alias: string | null;
  game: ArcadeGameId;
  leaderboard: LeaderboardEntry[];
  rank: number | null;
  score: number;
};

const arcadeGameIds = ["runtime", "bug-maze", "code-snake", "stack-tetris"] as const satisfies readonly ArcadeGameId[];
const rankingKeyByGame = {
  runtime: "runtime",
  "bug-maze": "bugMaze",
  "code-snake": "codeSnake",
  "stack-tetris": "stackTetris",
} as const satisfies Record<ArcadeGameId, keyof PlayerLeaderboardResponse["rankings"]>;

const emptyLeaderboardState: LeaderboardState = {
  runtime: [],
  "bug-maze": [],
  "code-snake": [],
  "stack-tetris": [],
};

function GameLoading() {
  return <div aria-hidden="true" className={styles.gameLoading} />;
}

function handleLabPointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--lab-px", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--lab-py", `${(y * 100).toFixed(2)}%`);
}

const RuntimeRunner = dynamic(() => import("@/components/lab/runtime-runner").then((module) => module.RuntimeRunner), {
  loading: GameLoading,
  ssr: false,
});

const BugMaze = dynamic(() => import("@/components/lab/bug-maze").then((module) => module.BugMaze), {
  loading: GameLoading,
  ssr: false,
});

const CodeSnake = dynamic(() => import("@/components/lab/code-snake").then((module) => module.CodeSnake), {
  loading: GameLoading,
  ssr: false,
});

const StackTetris = dynamic(() => import("@/components/lab/stack-tetris").then((module) => module.StackTetris), {
  loading: GameLoading,
  ssr: false,
});

const labCopy = {
  pt: {
    eyebrow: "Developer Arcade",
    title: "Developer Arcade",
    description: "Mini-games técnicos para testar reflexo, lógica e debugging.",
    heroLead: "Jogue, registre seu melhor score e compare no ranking.",
    howItWorks: "Como participar",
    chooseStep: "Escolha um dos 4 jogos",
    playStep: "Jogue e envie seu score",
    rankStep: "Vale seu melhor resultado",
    hubEyebrow: "Jogos",
    hubTitle: "Escolha um jogo",
    hubText: "Abra um jogo por vez. O jogo selecionado aparece em uma área dedicada logo abaixo.",
    openGame: "Abrir jogo",
    activeGame: "Jogo ativo",
    backToHub: "Voltar ao Hub",
    switchGame: "Trocar jogo",
    focusEyebrow: "modo foco",
    focusHint: "HUD compacto, controles visíveis e troca rápida entre jogos.",
    focusLoading: "Carregando arena",
    controlsLabel: "controles",
    panelLabel: "Regras rápidas",
    panelTitle: "Seu melhor score conta",
    panelText: "Cada jogo tem seu próprio ranking. Você pode editar o alias a qualquer momento.",
    gameCount: "4 mini-games",
    rankingRule: "1 melhor score por jogo",
    editableAlias: "Alias editável",
    runtimeCardText: "Runner de pipeline com pulo, colisão e score.",
    mazeCardText: "Maze dev com tokens, vírus, 3 vidas e Safe Deploy bloqueado.",
    snakeCardText: "Snake de programação com wrap-around, paredes opcionais, tokens e bugs.",
    tetrisCardText: "Puzzle de build com módulos e linhas compiladas.",
    runtimeControls: "Space / ArrowUp / toque",
    mazeControls: "Swipe no mobile / Setas no desktop",
    snakeControls: "Swipe no mobile / Setas no desktop",
    tetrisControls: "Swipe no mobile / Space no desktop",
    session: "score da sessão",
    topPlayersEyebrow: "Ranking geral",
    topPlayersTitle: "Melhores jogadores",
    topPlayersText: "Top 3 de cada jogo, considerando o melhor score de cada jogador.",
    leaderboardLoading: "Carregando ranking",
    leaderboardEmpty: "Sem scores ainda",
    anonymousAlias: "Anonymous Dev",
    scoreSubmitted: "Resultado registrado",
    yourScore: "Seu score",
    aliasLabel: "Alias",
    yourPosition: "Sua posição",
    leaderboardSummary: "Ranking deste jogo",
    playAgain: "Jogar novamente",
    playerEyebrow: "Seu jogador",
    playerTitle: "Seu nome no ranking",
    playerDescription: "Escolha como você aparece no Developer Arcade.",
    playerAnonymous: "Você ainda está como Anonymous Dev",
    playerCurrent: "Jogando como",
    aliasPlaceholder: "Ex: Álvaro Dev",
    saveAlias: "Salvar alias",
    savingAlias: "Salvando...",
    aliasUpdated: "Alias atualizado.",
    aliasRequired: "Digite um alias antes de salvar.",
    aliasError: "Não foi possível atualizar o alias agora.",
    aliasLoading: "Carregando seu jogador...",
    characterLimit: "caracteres",
    performanceEyebrow: "Ranking pessoal",
    performanceTitle: "Seu desempenho",
    performanceText: "Sua melhor pontuação e posição em cada jogo.",
    bestScore: "Melhor score",
    position: "Posição",
    topThree: "Top 3",
    arcadeStatus: "Arcade final jogável",
    futureStatus: "em preparação",
    archivedNote:
      "Treinos antigos, Debug Arena e Latency Lab foram retirados da UI e do contrato ativo de score. A tela principal mostra somente os quatro jogos finais.",
    roadmapEyebrow: "direção final",
    roadmapTitle: "Quatro slots do Developer Arcade final.",
    pending: "planejado",
    playable: "jogável",
  },
  en: {
    eyebrow: "Developer Arcade",
    title: "Developer Arcade",
    description: "Technical mini-games that test reflexes, logic, and debugging.",
    heroLead: "Play, save your best score, and compare it on the ranking.",
    howItWorks: "How to join",
    chooseStep: "Choose one of 4 games",
    playStep: "Play and submit your score",
    rankStep: "Your best result counts",
    hubEyebrow: "Games",
    hubTitle: "Choose a game",
    hubText: "Open one game at a time. The selected game appears in a dedicated area below.",
    openGame: "Open game",
    activeGame: "Active game",
    backToHub: "Back to Hub",
    switchGame: "Switch game",
    focusEyebrow: "focus mode",
    focusHint: "Compact HUD, visible controls, and fast switching between games.",
    focusLoading: "Loading arena",
    controlsLabel: "controls",
    panelLabel: "Quick rules",
    panelTitle: "Your best score counts",
    panelText: "Each game has its own ranking. You can edit your alias at any time.",
    gameCount: "4 mini-games",
    rankingRule: "1 best score per game",
    editableAlias: "Editable alias",
    runtimeCardText: "Pipeline runner with jump, collision, and score.",
    mazeCardText: "Dev maze with tokens, viruses, 3 lives, and locked Safe Deploy.",
    snakeCardText: "Programming snake with wrap-around, optional walls, tokens, and bugs.",
    tetrisCardText: "Build puzzle with modules and compiled lines.",
    runtimeControls: "Space / ArrowUp / tap",
    mazeControls: "Mobile swipe / desktop arrows",
    snakeControls: "Mobile swipe / desktop arrows",
    tetrisControls: "Mobile swipe / desktop Space",
    session: "session score",
    topPlayersEyebrow: "Overall ranking",
    topPlayersTitle: "Top players",
    topPlayersText: "Top 3 for each game, using every player's best score.",
    leaderboardLoading: "Loading ranking",
    leaderboardEmpty: "No scores yet",
    anonymousAlias: "Anonymous Dev",
    scoreSubmitted: "Result saved",
    yourScore: "Your Score",
    aliasLabel: "Alias",
    yourPosition: "Your position",
    leaderboardSummary: "This game's ranking",
    playAgain: "Play again",
    playerEyebrow: "Your player",
    playerTitle: "Your ranking name",
    playerDescription: "Choose how you appear in the Developer Arcade.",
    playerAnonymous: "You are still playing as Anonymous Dev",
    playerCurrent: "Playing as",
    aliasPlaceholder: "E.g. Álvaro Dev",
    saveAlias: "Save alias",
    savingAlias: "Saving...",
    aliasUpdated: "Alias updated.",
    aliasRequired: "Enter an alias before saving.",
    aliasError: "The alias could not be updated right now.",
    aliasLoading: "Loading your player...",
    characterLimit: "characters",
    performanceEyebrow: "Personal ranking",
    performanceTitle: "Your performance",
    performanceText: "Your best score and position in each game.",
    bestScore: "Best score",
    position: "Position",
    topThree: "Top 3",
    arcadeStatus: "Playable final arcade",
    futureStatus: "in preparation",
    archivedNote:
      "Legacy training, Debug Arena, and Latency Lab were retired from the UI and active score contract. The main screen shows the four final games only.",
    roadmapEyebrow: "final direction",
    roadmapTitle: "Four slots for the final Developer Arcade.",
    pending: "planned",
    playable: "playable",
  },
} as const;

export function DeveloperLab() {
  const { locale } = usePortfolioUi();
  const copy = labCopy[locale];
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    runtime: "idle",
    "bug-maze": "idle",
    "code-snake": "idle",
    "stack-tetris": "idle",
  });
  const [leaderboards, setLeaderboards] = useState<LeaderboardState>(emptyLeaderboardState);
  const [leaderboardStatus, setLeaderboardStatus] = useState<LeaderboardStatus>("idle");
  const [playerLeaderboard, setPlayerLeaderboard] = useState<PlayerLeaderboardResponse | null>(null);
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);
  const [aliasInput, setAliasInput] = useState("");
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>("loading");
  const [aliasMessage, setAliasMessage] = useState("");
  const [lastScoreResult, setLastScoreResult] = useState<LastScoreResult | null>(null);
  const [activeGame, setActiveGame] = useState<ArcadeGameId | null>(null);
  const [isSwitchingGame, setIsSwitchingGame] = useState(false);
  const [gameRunKey, setGameRunKey] = useState(0);
  const focusRef = useRef<HTMLElement | null>(null);
  const hubRef = useRef<HTMLElement | null>(null);
  const switchTimerRef = useRef<number | null>(null);

  const sessionScore = useMemo(() => calculateSessionScore(scores), [scores]);
  const arcadeGames = useMemo(
    () =>
      [
        {
          controls: copy.runtimeControls,
          description: copy.runtimeCardText,
          id: "runtime" as const,
          title: "Runtime Runner",
        },
        {
          controls: copy.mazeControls,
          description: copy.mazeCardText,
          id: "bug-maze" as const,
          title: "Bug Maze",
        },
        {
          controls: copy.snakeControls,
          description: copy.snakeCardText,
          id: "code-snake" as const,
          title: "Code Snake",
        },
        {
          controls: copy.tetrisControls,
          description: copy.tetrisCardText,
          id: "stack-tetris" as const,
          title: "Stack Tetris",
        },
      ] satisfies { controls: string; description: string; id: ArcadeGameId; title: string }[],
    [copy],
  );
  const selectedGame = activeGame ? arcadeGames.find((game) => game.id === activeGame) ?? null : null;

  const fetchLeaderboard = useCallback(async (game: ArcadeGameId) => {
    const response = await fetch(`/api/leaderboard?game=${game}&period=all&limit=3`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Leaderboard API rejected the request.");
    }

    const body = (await response.json()) as { data?: LeaderboardResponse; ok: boolean };

    if (!body.ok || !body.data) {
      throw new Error("Leaderboard API returned an invalid response.");
    }

    return body.data.leaderboard;
  }, []);

  const refreshLeaderboards = useCallback(
    async (targetGame?: ArcadeGameId) => {
      const games = targetGame ? [targetGame] : arcadeGameIds;
      setLeaderboardStatus("loading");

      try {
        const entries = await Promise.all(
          games.map(async (game) => [game, await fetchLeaderboard(game)] as const),
        );
        const updates = entries.reduce<Partial<LeaderboardState>>(
          (current, [game, leaderboard]) => ({
            ...current,
            [game]: leaderboard,
          }),
          {},
        );

        setLeaderboards((current) => ({
          ...current,
          ...updates,
        }));
        setLeaderboardStatus("ready");

        return targetGame ? updates[targetGame] ?? [] : [];
      } catch {
        setLeaderboardStatus("failed");
        throw new Error("Could not refresh leaderboard.");
      }
    },
    [fetchLeaderboard],
  );

  const refreshPlayerLeaderboard = useCallback(async () => {
    const response = await fetch("/api/leaderboard/me", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Player leaderboard API rejected the request.");
    }

    const body = (await response.json()) as { data?: PlayerLeaderboardResponse; ok: boolean };

    if (!body.ok || !body.data) {
      throw new Error("Player leaderboard API returned an invalid response.");
    }

    setPlayerLeaderboard(body.data);

    return body.data;
  }, []);

  const refreshPlayerSession = useCallback(async () => {
    const response = await fetch("/api/player-session", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Player session API rejected the request.");
    }

    const body = (await response.json()) as { data?: PlayerSession; ok: boolean };

    if (!body.ok || !body.data) {
      throw new Error("Player session API returned an invalid response.");
    }

    setPlayerSession(body.data);
    setAliasInput(body.data.alias ?? "");

    return body.data;
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshLeaderboards().catch(() => {
        // The leaderboard is secondary; the games must remain playable if it fails.
      });
      void refreshPlayerLeaderboard().catch(() => {
        // The player position is optional until a score exists for this session.
      });
      void refreshPlayerSession()
        .then(() => setAliasStatus("ready"))
        .catch(() => {
          setAliasStatus("error");
          setAliasMessage(copy.aliasError);
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [copy.aliasError, refreshLeaderboards, refreshPlayerLeaderboard, refreshPlayerSession]);

  useEffect(() => {
    if (!activeGame) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      focusRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeGame]);

  const handleComplete = useCallback((payload: GameScorePayloadV2) => {
    setScores((current) => ({
      ...current,
      [payload.game]: payload.score,
    }));
    setScoreStatus((current) => ({
      ...current,
      [payload.game]: "syncing",
    }));
    setLastScoreResult(null);

    void submitLabScore(payload)
      .then(async (result) => {
        setScoreStatus((current) => ({
          ...current,
          [payload.game]: "synced",
        }));

        const [freshLeaderboard, freshPlayerLeaderboard] = await Promise.all([
          refreshLeaderboards(payload.game).catch(() => leaderboards[payload.game]),
          refreshPlayerLeaderboard().catch(() => playerLeaderboard),
        ]);
        const playerRanking = freshPlayerLeaderboard?.rankings[rankingKeyByGame[payload.game]] ?? null;

        setLastScoreResult({
          alias: freshPlayerLeaderboard?.alias ?? null,
          game: payload.game,
          leaderboard: freshLeaderboard,
          rank: playerRanking?.rank ?? null,
          score: result.score,
        });
      })
      .catch(() => {
        setScoreStatus((current) => ({
          ...current,
          [payload.game]: "failed",
        }));
      });
  }, [leaderboards, playerLeaderboard, refreshLeaderboards, refreshPlayerLeaderboard]);

  const openGame = useCallback((game: ArcadeGameId) => {
    setActiveGame(game);
    setIsSwitchingGame(true);
    setLastScoreResult(null);

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
    }

    switchTimerRef.current = window.setTimeout(() => {
      setIsSwitchingGame(false);
      switchTimerRef.current = null;
    }, 420);
  }, []);

  const backToHub = useCallback(() => {
    setActiveGame(null);
    setIsSwitchingGame(false);
    setLastScoreResult(null);

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }

    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      hubRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }, []);

  const playAgain = useCallback(() => {
    setLastScoreResult(null);
    setGameRunKey((current) => current + 1);
  }, []);

  const saveAlias = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const alias = aliasInput.trim();

    if (!alias) {
      setAliasStatus("error");
      setAliasMessage(copy.aliasRequired);
      return;
    }

    setAliasStatus("saving");
    setAliasMessage("");

    try {
      const response = await fetch("/api/player-session", {
        body: JSON.stringify({ alias }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json()) as {
        data?: PlayerSession;
        error?: { message?: string };
        ok: boolean;
      };

      if (!response.ok || !body.ok || !body.data) {
        throw new Error(body.error?.message || copy.aliasError);
      }

      const [freshSession] = await Promise.all([
        refreshPlayerSession(),
        refreshPlayerLeaderboard(),
        refreshLeaderboards(activeGame ?? undefined),
      ]);

      setLastScoreResult((current) => current ? { ...current, alias: freshSession.alias } : current);
      setAliasStatus("success");
      setAliasMessage(copy.aliasUpdated);
    } catch (error) {
      setAliasStatus("error");
      setAliasMessage(error instanceof Error ? error.message : copy.aliasError);
    }
  }, [activeGame, aliasInput, copy.aliasError, copy.aliasRequired, copy.aliasUpdated, refreshLeaderboards, refreshPlayerLeaderboard, refreshPlayerSession]);

  function statusLabel(game: LabGameId) {
    const score = scores[game];

    if (score === null) {
      return labPageCopy.pending[locale];
    }

    return `${labPageCopy.completed[locale]}: ${score}`;
  }

  function apiStatusLabel(game: LabGameId) {
    const status = scoreStatus[game];

    if (scores[game] === null) {
      return "";
    }

    if (status === "synced") {
      return labPageCopy.apiSynced[locale];
    }

    if (status === "failed") {
      return labPageCopy.apiFailed[locale];
    }

    return labPageCopy.apiPending[locale];
  }

  function displayAlias(alias: string | null | undefined) {
    return alias?.trim() ? alias : copy.anonymousAlias;
  }

  function leaderboardFallbackLabel() {
    return leaderboardStatus === "loading" ? copy.leaderboardLoading : copy.leaderboardEmpty;
  }

  function playerRankLabel(game: ArcadeGameId) {
    const rank = playerLeaderboard?.rankings[rankingKeyByGame[game]].rank;

    return rank ? `#${rank}` : "--";
  }

  function renderActiveGame(game: ArcadeGameId) {
    if (game === "runtime") {
      return <RuntimeRunner key={`runtime-${gameRunKey}`} locale={locale} onComplete={handleComplete} />;
    }

    if (game === "bug-maze") {
      return <BugMaze key={`bug-maze-${gameRunKey}`} locale={locale} onComplete={handleComplete} />;
    }

    if (game === "code-snake") {
      return <CodeSnake key={`code-snake-${gameRunKey}`} locale={locale} onComplete={handleComplete} />;
    }

    return <StackTetris key={`stack-tetris-${gameRunKey}`} locale={locale} onComplete={handleComplete} />;
  }

  return (
    <main className={styles.labExperience} onPointerMove={handleLabPointer}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.heroTitle}>{copy.title}</h1>
            <p className={styles.heroText}>{copy.description}</p>
            <p className={styles.heroLead}>{copy.heroLead}</p>

            <ol className={styles.heroSteps} aria-label={copy.howItWorks}>
              {[copy.chooseStep, copy.playStep, copy.rankStep].map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroPanelCopy}>
              <p className={styles.panelLabel}>{copy.panelLabel}</p>
              <h2>{copy.panelTitle}</h2>
              <p className={styles.panelText}>{copy.panelText}</p>
              <ul className={styles.heroFacts}>
                <li>{copy.gameCount}</li>
                <li>{copy.rankingRule}</li>
                <li>{copy.editableAlias}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.playerShell} aria-labelledby="arcade-player-title">
          <div className={styles.playerIntro}>
            <div>
              <p className={styles.eyebrow}>{copy.playerEyebrow}</p>
              <h2 className={styles.sectionTitle} id="arcade-player-title">{copy.playerTitle}</h2>
              <p className={styles.trainingNote}>{copy.playerDescription}</p>
            </div>
            <div className={styles.playerIdentity} data-anonymous={playerSession?.alias ? "false" : "true"}>
              <span>{playerSession?.alias ? copy.playerCurrent : copy.playerAnonymous}</span>
              <strong>{displayAlias(playerSession?.alias)}</strong>
            </div>
          </div>

          <form className={styles.aliasForm} onSubmit={saveAlias}>
            <div className={styles.aliasField}>
              <label htmlFor="arcade-player-alias">{copy.playerTitle}</label>
              <div className={styles.aliasInputRow}>
                <input
                  autoComplete="nickname"
                  disabled={aliasStatus === "loading" || aliasStatus === "saving"}
                  id="arcade-player-alias"
                  maxLength={playerSession?.maxAliasLength ?? 24}
                  onChange={(event) => {
                    setAliasInput(event.target.value);
                    if (aliasStatus === "error" || aliasStatus === "success") {
                      setAliasStatus("ready");
                      setAliasMessage("");
                    }
                  }}
                  placeholder={copy.aliasPlaceholder}
                  type="text"
                  value={aliasInput}
                />
                <span>{aliasInput.length}/{playerSession?.maxAliasLength ?? 24} {copy.characterLimit}</span>
              </div>
            </div>
            <button
              className={styles.actionPrimary}
              disabled={aliasStatus === "loading" || aliasStatus === "saving" || !aliasInput.trim()}
              type="submit"
            >
              {aliasStatus === "saving" ? copy.savingAlias : copy.saveAlias}
            </button>
          </form>

          <p
            aria-live="polite"
            className={styles.aliasFeedback}
            data-status={aliasStatus}
          >
            {aliasStatus === "loading" ? copy.aliasLoading : aliasMessage}
          </p>
        </section>

        <section className={styles.arcadeHub} data-mode={activeGame ? "focus" : "hub"} ref={hubRef}>
          <div className={styles.hubHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.hubEyebrow}</p>
              <h2 className={styles.sectionTitle}>{copy.hubTitle}</h2>
            </div>
            <div className={styles.hubScore} aria-label={copy.session}>
              <span>{copy.session}</span>
              <strong aria-live="polite">{sessionScore === null ? "--" : sessionScore}</strong>
            </div>
            <p className={styles.trainingNote}>{copy.hubText}</p>
          </div>

          <div className={styles.hubGrid} aria-label={copy.arcadeStatus}>
            {arcadeGames.map((game) => (
              <button
                aria-pressed={activeGame === game.id}
                className={styles.hubCard}
                data-active={activeGame === game.id ? "true" : "false"}
                key={game.id}
                onClick={() => openGame(game.id)}
                type="button"
              >
                <span className={styles.hubCardMeta}>{copy.playable}</span>
                <strong>{game.title}</strong>
                <span className={styles.hubCardText}>{game.description}</span>
                <span className={styles.hubCardControls}>
                  {copy.controlsLabel}: {game.controls}
                </span>
                <span className={styles.hubCardStatus}>
                  {statusLabel(game.id)} {apiStatusLabel(game.id)}
                </span>
                <span className={styles.hubCardAction}>{activeGame === game.id ? copy.activeGame : copy.openGame}</span>
              </button>
            ))}
          </div>
        </section>

        {!activeGame ? (
          <>
            <section className={styles.performanceShell} aria-labelledby="arcade-performance-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>{copy.performanceEyebrow}</p>
                  <h2 className={styles.sectionTitle} id="arcade-performance-title">{copy.performanceTitle}</h2>
                </div>
                <p className={styles.trainingNote}>{copy.performanceText}</p>
              </div>

              <div className={styles.performanceGrid}>
                {arcadeGames.map((game) => {
                  const ranking = playerLeaderboard?.rankings[rankingKeyByGame[game.id]];

                  return (
                    <article className={styles.performanceCard} key={game.id}>
                      <h3>{game.title}</h3>
                      <dl>
                        <div><dt>{copy.bestScore}</dt><dd>{ranking?.score ?? "--"}</dd></div>
                        <div><dt>{copy.position}</dt><dd>{playerRankLabel(game.id)}</dd></div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.leaderboardShell} aria-labelledby="arcade-leaderboard-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>{copy.topPlayersEyebrow}</p>
                  <h2 className={styles.sectionTitle} id="arcade-leaderboard-title">{copy.topPlayersTitle}</h2>
                </div>
                <p className={styles.trainingNote}>{copy.topPlayersText}</p>
              </div>

              <div className={styles.leaderboardGrid}>
                {arcadeGames.map((game) => (
                  <article className={styles.leaderboardCard} key={game.id}>
                    <div className={styles.leaderboardCardHeader}>
                      <h3>{game.title}</h3>
                      <span>{copy.topThree}</span>
                    </div>

                    <ol className={styles.leaderboardList}>
                      {leaderboards[game.id].length > 0 ? (
                        leaderboards[game.id].map((entry, index) => (
                          <li className={styles.leaderboardRow} key={`${game.id}-${entry.createdAt}-${index}`}>
                            <span className={styles.leaderboardRank}>#{index + 1}</span>
                            <span className={styles.leaderboardAlias}>{entry.alias}</span>
                            <strong className={styles.leaderboardScore}>{entry.score}</strong>
                          </li>
                        ))
                      ) : (
                        <li className={styles.leaderboardEmpty}>{leaderboardFallbackLabel()}</li>
                      )}
                    </ol>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {activeGame && selectedGame ? (
          <section
            aria-labelledby="active-arcade-game-title"
            className={styles.focusShell}
            data-game={activeGame}
            data-switching={isSwitchingGame ? "true" : "false"}
            ref={focusRef}
          >
            <div className={styles.focusHeader}>
              <div className={styles.focusTitleBlock}>
                <p className={styles.eyebrow}>{copy.focusEyebrow}</p>
                <h2 className={styles.sectionTitle} id="active-arcade-game-title">
                  {selectedGame.title}
                </h2>
                <p className={styles.trainingNote}>{selectedGame.description}</p>
              </div>

              <div className={styles.focusMeta} aria-label={copy.session}>
                <span>{statusLabel(activeGame)}</span>
                <strong>{sessionScore === null ? "--" : sessionScore}</strong>
              </div>

              <div className={styles.focusActions}>
                <button className={styles.actionSecondary} onClick={backToHub} type="button">
                  {copy.backToHub}
                </button>
                <span className={styles.focusHint}>{copy.focusHint}</span>
              </div>
            </div>

            <div className={styles.focusSwitch} aria-label={copy.switchGame}>
              {arcadeGames.map((game) => (
                <button
                  aria-pressed={activeGame === game.id}
                  className={styles.focusTab}
                  key={game.id}
                  onClick={() => openGame(game.id)}
                  type="button"
                >
                  {game.title}
                </button>
              ))}
            </div>

            <div className={styles.focusStage}>
              {isSwitchingGame ? (
                <div aria-live="polite" className={styles.focusLoading}>
                  <span aria-hidden="true" />
                  {copy.focusLoading}
                </div>
              ) : null}
              {renderActiveGame(activeGame)}
            </div>

            {lastScoreResult?.game === activeGame ? (
              <aside className={styles.scoreResultPanel} aria-live="polite">
                <div className={styles.scoreResultSummary}>
                  <p className={styles.eyebrow}>{copy.scoreSubmitted}</p>
                  <div className={styles.scoreResultMetrics}>
                    <div>
                      <span>{copy.yourScore}</span>
                      <strong>{lastScoreResult.score}</strong>
                    </div>
                    <div>
                      <span>{copy.aliasLabel}</span>
                      <strong>{displayAlias(lastScoreResult.alias)}</strong>
                    </div>
                    <div>
                      <span>{copy.yourPosition}</span>
                      <strong>{lastScoreResult.rank ? `#${lastScoreResult.rank}` : "--"}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.scoreResultLeaderboard}>
                  <h3>{copy.leaderboardSummary}</h3>
                  <ol className={styles.leaderboardList}>
                    {lastScoreResult.leaderboard.length > 0 ? (
                      lastScoreResult.leaderboard.map((entry, index) => (
                        <li className={styles.leaderboardRow} key={`${lastScoreResult.game}-result-${entry.createdAt}-${index}`}>
                          <span className={styles.leaderboardRank}>#{index + 1}</span>
                          <span className={styles.leaderboardAlias}>{entry.alias}</span>
                          <strong className={styles.leaderboardScore}>{entry.score}</strong>
                        </li>
                      ))
                    ) : (
                      <li className={styles.leaderboardEmpty}>{copy.leaderboardEmpty}</li>
                    )}
                  </ol>
                </div>

                <button className={styles.actionPrimary} onClick={playAgain} type="button">
                  {copy.playAgain}
                </button>
              </aside>
            ) : null}
          </section>
        ) : null}

      </div>
    </main>
  );
}
