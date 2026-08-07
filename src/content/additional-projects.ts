import type { Project } from "@/types/portfolio";

export const additionalProjects: Project[] = [
  {
    slug: "fluxo",
    title: {
      pt: "FLUXO",
      en: "FLUXO",
    },
    subtitle: {
      pt: "Editor visual de fluxogramas local-first",
      en: "Local-first visual flowchart editor",
    },
    shortDescription: {
      pt: "Editor web gratuito para criar, conectar, organizar, apresentar e exportar processos diretamente no navegador, sem cadastro obrigatório.",
      en: "Free web editor for creating, connecting, organizing, presenting, and exporting processes directly in the browser, without mandatory registration.",
    },
    fullDescription: {
      pt: "Produto local-first voltado à criação de fluxogramas e jornadas visuais. O MVP combina canvas interativo, formas SVG, roteamento de conexões, prevenção de sobreposição, atalhos, modo apresentação e portabilidade por arquivos .flow.",
      en: "A local-first product for creating flowcharts and visual journeys. The MVP combines an interactive canvas, SVG shapes, connection routing, overlap prevention, shortcuts, presentation mode, and portability through .flow files.",
    },
    status: {
      pt: "MVP publicado",
      en: "Published MVP",
    },
    category: ["Produto", "Local-first", "Editor visual"],
    stack: ["React 19", "TypeScript", "Vite", "TanStack Router", "XYFlow", "Tailwind CSS", "Nitro", "Vercel"],
    problem: {
      pt: "Ferramentas de fluxograma podem exigir cadastro, depender de serviços pesados ou introduzir complexidade antes que o usuário consiga estruturar uma ideia simples.",
      en: "Flowchart tools may require registration, depend on heavy services, or introduce complexity before users can structure a simple idea.",
    },
    solution: {
      pt: "Um editor rápido que funciona no navegador, salva localmente, exporta arquivos portáteis e trata formas e conexões com regras geométricas próprias.",
      en: "A fast browser-based editor that saves locally, exports portable files, and handles shapes and connections with dedicated geometric rules.",
    },
    highlights: {
      pt: [
        "Canvas com grid, snap, zoom, minimapa e biblioteca local de fluxos.",
        "Formas SVG, handles geométricos e roteamento que desvia blocos como obstáculos.",
        "Undo/redo, organização automática, modo apresentação e atalhos contextuais.",
        "Importação e exportação .flow, além de exportação do canvas como PNG.",
      ],
      en: [
        "Canvas with grid, snap, zoom, minimap, and a local flow library.",
        "SVG shapes, geometric handles, and routing that avoids blocks as obstacles.",
        "Undo/redo, automatic organization, presentation mode, and contextual shortcuts.",
        ".flow import and export, plus canvas export as PNG.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Calcular pontos de conexão com base na geometria real de diferentes formas.",
        "Separar múltiplas conexões e recalcular rotas sem comprometer a fluidez do drag.",
        "Evitar sobreposição entre blocos durante criação, duplicação, resize e movimentação.",
      ],
      en: [
        "Calculate connection points from the real geometry of different shapes.",
        "Separate multiple connections and recalculate routes without compromising drag performance.",
        "Prevent block overlap during creation, duplication, resizing, and movement.",
      ],
    },
    whatItShows: {
      pt: "Demonstra construção de produto front-end com lógica geométrica, estado complexo, foco em usabilidade e evolução incremental orientada por testes visuais.",
      en: "Shows front-end product development with geometric logic, complex state, usability focus, and incremental evolution guided by visual testing.",
    },
    links: {
      website: "https://fluxo-nine-theta.vercel.app/",
      repository: "https://github.com/alvaro-amorim/fluxo",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do editor FLUXO.",
        en: "Visual area prepared for the FLUXO editor image.",
      },
      status: "pending",
      accent: {
        primary: "#fb923c",
        secondary: "#f97316",
        tertiary: "#facc15",
      },
      layout: "data-monitoring",
      mockupHint: {
        pt: "Moldura para canvas, blocos, conexões e ferramentas de edição visual.",
        en: "Frame for canvas, blocks, connections, and visual editing tools.",
      },
    },
    featured: true,
  },
  {
    slug: "layerart-store",
    title: {
      pt: "LAYERART STORE",
      en: "LAYERART STORE",
    },
    subtitle: {
      pt: "Plataforma comercial para impressão 3D",
      en: "Commercial platform for 3D printing",
    },
    shortDescription: {
      pt: "Loja online e sistema de pré-atendimento para produtos personalizados, com catálogo, orçamento contextual, painel administrativo e analytics próprio.",
      en: "Online store and pre-sales system for custom products, with catalog, contextual quoting, admin panel, and first-party analytics.",
    },
    fullDescription: {
      pt: "Plataforma comercial criada para apresentar produtos personalizados em impressão 3D, captar pedidos de orçamento, organizar leads e permitir que o administrador gerencie catálogo, conteúdo, mídias e indicadores.",
      en: "Commercial platform built to showcase custom 3D-printed products, capture quote requests, organize leads, and let administrators manage catalog content, media, and indicators.",
    },
    status: {
      pt: "Publicado e em evolução",
      en: "Published and evolving",
    },
    category: ["E-commerce", "CMS", "Atendimento", "IA"],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "RLS", "Cloudinary", "Zod", "OpenAI", "Gemini", "Cohere"],
    problem: {
      pt: "Produtos personalizados exigem apresentação visual forte e coleta de requisitos antes que seja possível calcular um orçamento útil.",
      en: "Custom products require strong visual presentation and requirements gathering before a useful quote can be calculated.",
    },
    solution: {
      pt: "Uma experiência pública com catálogo e chat contextual, conectada a um painel com CMS, gestão de leads, uploads, analytics e relatórios assistidos por IA.",
      en: "A public catalog and contextual chat experience connected to an admin panel with CMS, lead management, uploads, analytics, and AI-assisted reports.",
    },
    highlights: {
      pt: [
        "Catálogo com filtros, mídias, características, materiais, cores e faixa de preço.",
        "Chat contextual para briefing de orçamento e continuidade pelo WhatsApp.",
        "Painel administrativo com CMS, catálogo, leads, Kanban e exportações CSV.",
        "Analytics próprio, uploads Cloudinary e providers de IA com fallback controlado.",
      ],
      en: [
        "Catalog with filters, media, features, materials, colors, and price ranges.",
        "Contextual chat for quote briefings and continuation through WhatsApp.",
        "Admin panel with CMS, catalog, leads, Kanban, and CSV exports.",
        "First-party analytics, Cloudinary uploads, and AI providers with controlled fallback.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Conectar navegação pública, chat, catálogo e leads sem perder o contexto do produto selecionado.",
        "Proteger operações administrativas com autenticação, RLS e chaves somente no servidor.",
        "Manter integrações externas resilientes por meio de providers e fallbacks explícitos.",
      ],
      en: [
        "Connect public navigation, chat, catalog, and leads without losing selected-product context.",
        "Protect administrative operations with authentication, RLS, and server-only keys.",
        "Keep external integrations resilient through explicit providers and fallbacks.",
      ],
    },
    whatItShows: {
      pt: "Demonstra capacidade de estruturar um produto comercial completo, conectando experiência pública, operação interna, dados, segurança e integrações.",
      en: "Shows the ability to structure a complete commercial product connecting public experience, internal operations, data, security, and integrations.",
    },
    links: {
      website: "https://layerart-store.vercel.app/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem da plataforma LayerArt Store.",
        en: "Visual area prepared for the LayerArt Store platform image.",
      },
      status: "pending",
      accent: {
        primary: "#a78bfa",
        secondary: "#7c3aed",
        tertiary: "#22d3ee",
      },
      layout: "commerce-catalog",
      mockupHint: {
        pt: "Moldura para catálogo premium, chat de orçamento e painel administrativo.",
        en: "Frame for a premium catalog, quote chat, and admin panel.",
      },
    },
    featured: true,
  },
  {
    slug: "audio-emotion",
    title: {
      pt: "AUDIO EMOTION",
      en: "AUDIO EMOTION",
    },
    subtitle: {
      pt: "Contexto emocional de voz para agentes de IA",
      en: "Voice emotion context for AI agents",
    },
    shortDescription: {
      pt: "Ecossistema local-first que transcreve áudio, extrai métricas acústicas e gera contexto emocional estruturado para consumo por outros agentes de IA.",
      en: "Local-first ecosystem that transcribes audio, extracts acoustic metrics, and generates structured emotional context for other AI agents.",
    },
    fullDescription: {
      pt: "MVP experimental composto por uma API FastAPI e um cliente de demonstração. O pipeline preserva métricas acústicas reais, usa transcrição local com faster-whisper e combina heurísticas locais com Cohere opcional para produzir contexto interpretativo.",
      en: "Experimental MVP composed of a FastAPI service and a demo client. The pipeline preserves real acoustic metrics, uses local faster-whisper transcription, and combines local heuristics with optional Cohere analysis to produce interpretive context.",
    },
    status: {
      pt: "MVP experimental local",
      en: "Local experimental MVP",
    },
    category: ["IA", "Áudio", "API", "Local-first"],
    stack: ["Python", "FastAPI", "SQLModel", "SQLite", "FFmpeg", "NumPy", "faster-whisper", "Cohere", "pytest", "JavaScript"],
    problem: {
      pt: "A transcrição textual remove sinais da fala, como ritmo, pausas, intensidade, hesitação e urgência, que podem ser relevantes para a resposta de um agente.",
      en: "Text transcription removes speech signals such as pace, pauses, intensity, hesitation, and urgency that may matter to an agent's response.",
    },
    solution: {
      pt: "Uma API que padroniza o áudio, mede sinais acústicos, transcreve localmente e retorna uma análise probabilística com contexto recomendado para outro agente de IA.",
      en: "An API that standardizes audio, measures acoustic signals, transcribes locally, and returns a probabilistic analysis with recommended context for another AI agent.",
    },
    highlights: {
      pt: [
        "Conversão FFmpeg e métricas de volume, silêncio, dinâmica, picos e ritmo de fala.",
        "Transcrição local com faster-whisper e indicadores explícitos de qualidade.",
        "Análise híbrida com fallback local, feedback humano e exemplos reutilizáveis.",
        "Contrato de API preparado para ser consumido por um cliente ou outro agente.",
      ],
      en: [
        "FFmpeg conversion and metrics for volume, silence, dynamics, peaks, and speech pace.",
        "Local faster-whisper transcription with explicit quality indicators.",
        "Hybrid analysis with local fallback, human feedback, and reusable examples.",
        "API contract designed for consumption by a client or another agent.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Separar afirmações acústicas mensuráveis de interpretações emocionais probabilísticas.",
        "Otimizar o áudio para transcrição sem contaminar as métricas extraídas do sinal original.",
        "Manter o fluxo funcional quando o provider externo estiver desativado ou indisponível.",
      ],
      en: [
        "Separate measurable acoustic claims from probabilistic emotional interpretation.",
        "Optimize audio for transcription without contaminating metrics extracted from the original signal.",
        "Keep the flow functional when the external provider is disabled or unavailable.",
      ],
    },
    whatItShows: {
      pt: "Demonstra integração entre processamento de áudio, APIs, modelos locais, IA externa, contratos estruturados e documentação responsável de limites.",
      en: "Shows integration across audio processing, APIs, local models, external AI, structured contracts, and responsible documentation of limitations.",
    },
    links: {
      website: "",
      repository: "https://github.com/alvaro-amorim/emotion-api",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para o pipeline Audio Emotion.",
        en: "Visual area prepared for the Audio Emotion pipeline.",
      },
      status: "pending",
      accent: {
        primary: "#38bdf8",
        secondary: "#6366f1",
        tertiary: "#c084fc",
      },
      layout: "social-ai",
      mockupHint: {
        pt: "Moldura para waveform, transcrição e sinais emocionais estruturados.",
        en: "Frame for waveform, transcription, and structured emotional signals.",
      },
    },
    featured: true,
  },
  {
    slug: "femhealth-ml-triage",
    title: {
      pt: "FEMHEALTH ML TRIAGE",
      en: "FEMHEALTH ML TRIAGE",
    },
    subtitle: {
      pt: "Machine Learning tabular e explicabilidade",
      en: "Tabular Machine Learning and explainability",
    },
    shortDescription: {
      pt: "MVP acadêmico em Python e Streamlit para exploração do WDBC, comparação de modelos, inferência demonstrativa e explicabilidade com limites éticos explícitos.",
      en: "Academic Python and Streamlit MVP for WDBC exploration, model comparison, demonstrative inference, and explainability with explicit ethical limits.",
    },
    fullDescription: {
      pt: "Projeto acadêmico reproduzível que reúne análise exploratória, pré-processamento, três modelos tabulares, baseline persistido, predição demonstrativa, SHAP com fallback e documentação crítica por model card.",
      en: "Reproducible academic project combining exploratory analysis, preprocessing, three tabular models, a persisted baseline, demonstrative prediction, SHAP with fallback, and critical model-card documentation.",
    },
    status: {
      pt: "Projeto acadêmico",
      en: "Academic project",
    },
    category: ["Machine Learning", "Dados", "Explicabilidade", "Saúde"],
    stack: ["Python", "Streamlit", "scikit-learn", "Pandas", "SHAP", "pytest"],
    problem: {
      pt: "Um projeto de classificação pode parecer convincente sem deixar claros o dataset, o split, as métricas, as limitações e a diferença entre demonstração acadêmica e uso clínico.",
      en: "A classification project may look convincing without clearly documenting the dataset, split, metrics, limitations, and the difference between academic demonstration and clinical use.",
    },
    solution: {
      pt: "Um fluxo documentado com fontes canônicas, baseline congelado, comparação de modelos, explicabilidade e avisos que impedem interpretar a saída como diagnóstico médico.",
      en: "A documented workflow with canonical sources, a frozen baseline, model comparison, explainability, and warnings that prevent interpreting output as a medical diagnosis.",
    },
    highlights: {
      pt: [
        "EDA bilíngue das 30 features e comparação de três modelos tabulares.",
        "Baseline persistido com ordem canônica de features e metadados.",
        "Importância global, explicação local e SHAP com fallback por coeficientes.",
        "Testes, quality gate, model card e limites éticos visíveis na interface.",
      ],
      en: [
        "Bilingual EDA of 30 features and comparison of three tabular models.",
        "Persisted baseline with canonical feature order and metadata.",
        "Global importance, local explanation, and SHAP with coefficient fallback.",
        "Tests, quality gate, model card, and visible ethical limits in the interface.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Preservar o contrato das 30 features entre treino, persistência e inferência.",
        "Apresentar probabilidades e explicações sem sugerir certeza ou validade clínica.",
        "Separar artefatos congelados de comandos que retreinariam o baseline.",
      ],
      en: [
        "Preserve the 30-feature contract across training, persistence, and inference.",
        "Present probabilities and explanations without implying certainty or clinical validity.",
        "Separate frozen artifacts from commands that would retrain the baseline.",
      ],
    },
    whatItShows: {
      pt: "Demonstra fundamentos de Machine Learning, reprodutibilidade, explicabilidade, testes e comunicação responsável de resultados.",
      en: "Shows Machine Learning fundamentals, reproducibility, explainability, testing, and responsible communication of results.",
    },
    links: {
      website: "",
      repository: "https://github.com/alvaro-amorim/femhealth-ml-triage",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para o dashboard FemHealth ML Triage.",
        en: "Visual area prepared for the FemHealth ML Triage dashboard.",
      },
      status: "pending",
      accent: {
        primary: "#f472b6",
        secondary: "#a855f7",
        tertiary: "#60a5fa",
      },
      layout: "data-monitoring",
      mockupHint: {
        pt: "Moldura para métricas de modelos, predição demonstrativa e explicabilidade.",
        en: "Frame for model metrics, demonstrative prediction, and explainability.",
      },
    },
  },
  {
    slug: "typographic-story-engine",
    title: {
      pt: "TYPOGRAPHIC STORY ENGINE",
      en: "TYPOGRAPHIC STORY ENGINE",
    },
    subtitle: {
      pt: "Motor local de histórias tipográficas",
      en: "Local typographic story engine",
    },
    shortDescription: {
      pt: "Motor em Python que transforma prompts em cenas e vídeos SVG formados exclusivamente pelas letras semanticamente permitidas de cada objeto.",
      en: "Python engine that turns prompts into SVG scenes and videos formed exclusively from the semantically allowed letters of each object.",
    },
    fullDescription: {
      pt: "Laboratório criativo local que combina registro de assets, planner determinístico ou Ollama, relações espaciais, scene graphs, composição de texto SVG, animação e exportação MP4 com FFmpeg.",
      en: "Local creative lab combining an asset registry, deterministic or Ollama planning, spatial relations, scene graphs, SVG text composition, animation, and MP4 export with FFmpeg.",
    },
    status: {
      pt: "Laboratório local",
      en: "Local laboratory",
    },
    category: ["Computação gráfica", "IA local", "SVG", "Vídeo"],
    stack: ["Python", "FastAPI", "SVG", "FFmpeg", "Ollama", "pytest", "HTML", "JavaScript"],
    problem: {
      pt: "Gerar narrativas visuais tipográficas exige preservar regras semânticas de cada objeto e, ao mesmo tempo, posicionar, orientar e animar múltiplos elementos de forma coerente.",
      en: "Generating typographic visual narratives requires preserving each object's semantic rules while coherently positioning, orienting, and animating multiple elements.",
    },
    solution: {
      pt: "Um motor que valida assets aprovados, calcula relações espaciais, compõe cada objeto apenas com suas letras permitidas e gera frames e vídeos reproduzíveis.",
      en: "An engine that validates approved assets, calculates spatial relations, composes each object only from its allowed letters, and generates reproducible frames and videos.",
    },
    highlights: {
      pt: [
        "Toda parte visível do SVG é texto; grupos servem apenas para organização e transformação.",
        "Planner determinístico ou Ollama local com fallback e validação controlada.",
        "Relações espaciais medidas e espelhamento que mantém as letras legíveis.",
        "Studio web, API, comandos oficiais, diagnóstico e exportação MP4.",
      ],
      en: [
        "Every visible SVG element is text; groups are used only for organization and transformation.",
        "Deterministic or local Ollama planner with fallback and controlled validation.",
        "Measured spatial relations and mirroring that keeps letters readable.",
        "Web studio, API, official commands, diagnostics, and MP4 export.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Preservar a identidade semântica de cada objeto em cenas com múltiplos elementos.",
        "Aplicar orientação e movimento sem inverter ou deformar a leitura das letras.",
        "Manter planejamento por LLM subordinado às regras determinísticas do motor.",
      ],
      en: [
        "Preserve each object's semantic identity in scenes with multiple elements.",
        "Apply orientation and movement without reversing or deforming letter readability.",
        "Keep LLM planning subordinate to the engine's deterministic rules.",
      ],
    },
    whatItShows: {
      pt: "Demonstra originalidade técnica, modelagem de regras, composição gráfica, integração com IA local e criação de ferramentas reproduzíveis.",
      en: "Shows technical originality, rule modeling, graphical composition, local AI integration, and reproducible tooling.",
    },
    links: {
      website: "",
      repository: "https://github.com/alvaro-amorim/typographic-story-engine",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para uma cena do Typographic Story Engine.",
        en: "Visual area prepared for a Typographic Story Engine scene.",
      },
      status: "pending",
      accent: {
        primary: "#facc15",
        secondary: "#f97316",
        tertiary: "#ec4899",
      },
      layout: "social-ai",
      mockupHint: {
        pt: "Moldura para cena SVG composta por letras e timeline de geração.",
        en: "Frame for an SVG scene made of letters and a generation timeline.",
      },
    },
  },
  {
    slug: "checktask-explorer",
    title: {
      pt: "CHECKTASK EXPLORER",
      en: "CHECKTASK EXPLORER",
    },
    subtitle: {
      pt: "Organizador de tarefas local-first",
      en: "Local-first task organizer",
    },
    shortDescription: {
      pt: "Aplicação visual de tarefas em árvore, com persistência IndexedDB, importação e exportação JSON, drag and drop, PWA e empacotamento desktop com Tauri.",
      en: "Visual tree-based task application with IndexedDB persistence, JSON import and export, drag and drop, PWA support, and Tauri desktop packaging.",
    },
    fullDescription: {
      pt: "Mini produto inspirado em pastas e arquivos, criado para organizar seções e tarefas hierárquicas sem depender de conta ou servidor. A mesma base roda no navegador, como PWA e como aplicativo Windows.",
      en: "Mini product inspired by folders and files, built to organize hierarchical sections and tasks without an account or server. The same base runs in the browser, as a PWA, and as a Windows application.",
    },
    status: {
      pt: "MVP local-first",
      en: "Local-first MVP",
    },
    category: ["Produtividade", "Local-first", "PWA", "Desktop"],
    stack: ["Next.js 16", "React 19", "TypeScript", "Zustand", "Dexie", "IndexedDB", "dnd-kit", "Tauri 2", "PWA"],
    problem: {
      pt: "Organizadores simples perdem estrutura quando as tarefas precisam formar uma hierarquia, enquanto soluções completas podem exigir conta, nuvem e configuração excessiva.",
      en: "Simple task organizers lose structure when tasks need a hierarchy, while full solutions may require accounts, cloud services, and excessive setup.",
    },
    solution: {
      pt: "Uma árvore local de seções e tarefas com nós normalizados, reordenação, persistência no navegador, portabilidade por JSON e opção de instalação desktop.",
      en: "A local tree of sections and tasks with normalized nodes, reordering, browser persistence, JSON portability, and optional desktop installation.",
    },
    highlights: {
      pt: [
        "Persistência IndexedDB com nós normalizados por parentId e ordem.",
        "Importação, exportação e normalização de workspaces em JSON.",
        "Drag and drop, estado com Zustand e migração de dados legados.",
        "PWA instalável e build desktop Windows com Tauri.",
      ],
      en: [
        "IndexedDB persistence with nodes normalized by parentId and order.",
        "JSON workspace import, export, and normalization.",
        "Drag and drop, Zustand state, and legacy data migration.",
        "Installable PWA and Windows desktop build with Tauri.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Normalizar uma árvore editável sem regravar toda a estrutura em cada alteração.",
        "Manter importações robustas diante de IDs ausentes ou duplicados.",
        "Compartilhar a experiência entre web, PWA e shell desktop.",
      ],
      en: [
        "Normalize an editable tree without rewriting the whole structure on every change.",
        "Keep imports robust when IDs are missing or duplicated.",
        "Share the experience across web, PWA, and desktop shell.",
      ],
    },
    whatItShows: {
      pt: "Demonstra arquitetura local-first, modelagem de árvore, persistência no cliente, portabilidade de dados e distribuição multiplataforma.",
      en: "Shows local-first architecture, tree modeling, client-side persistence, data portability, and cross-platform distribution.",
    },
    links: {
      website: "",
      repository: "https://github.com/alvaro-amorim/checktask",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para a árvore de tarefas do Checktask Explorer.",
        en: "Visual area prepared for the Checktask Explorer task tree.",
      },
      status: "pending",
      accent: {
        primary: "#34d399",
        secondary: "#14b8a6",
        tertiary: "#60a5fa",
      },
      layout: "operational-saas",
      mockupHint: {
        pt: "Moldura para árvore hierárquica, tarefas e controles local-first.",
        en: "Frame for a hierarchical tree, tasks, and local-first controls.",
      },
    },
  },
  {
    slug: "robet",
    title: {
      pt: "ROBET",
      en: "ROBET",
    },
    subtitle: {
      pt: "Laboratório probabilístico para futebol",
      en: "Football probability laboratory",
    },
    shortDescription: {
      pt: "Laboratório local que calcula probabilidades, edge, valor esperado, simulação de banca e inteligência de mercado, com mocks seguros por padrão.",
      en: "Local laboratory that calculates probabilities, edge, expected value, bankroll simulation, and market intelligence, using safe mocks by default.",
    },
    fullDescription: {
      pt: "MVP full stack para estudar decisões probabilísticas em partidas pré-jogo. O sistema persiste jogos, odds e avaliações, mantém integrações reais manuais e separadas, e bloqueia apostas reais ou automação de casas.",
      en: "Full-stack MVP for studying probabilistic decisions in pre-match football. The system persists matches, odds, and evaluations, keeps real integrations manual and separate, and blocks real-money betting or bookmaker automation.",
    },
    status: {
      pt: "Laboratório com dados simulados",
      en: "Laboratory with simulated data",
    },
    category: ["Probabilidade", "Dados", "Esportes", "Full Stack"],
    stack: ["Python", "FastAPI", "Pydantic", "SQLAlchemy", "Alembic", "PostgreSQL", "React", "TypeScript", "Vite", "pytest"],
    problem: {
      pt: "Análises de odds podem esconder premissas, misturar dados simulados e reais ou incentivar automação arriscada sem que o usuário entenda os cálculos.",
      en: "Odds analysis can hide assumptions, mix simulated and real data, or encourage risky automation without users understanding the calculations.",
    },
    solution: {
      pt: "Um ambiente de estudo com cálculos explícitos, histórico persistido, flags de segurança, providers mockados e sincronizações reais somente por confirmação manual.",
      en: "A study environment with explicit calculations, persisted history, safety flags, mocked providers, and real synchronization only through manual confirmation.",
    },
    highlights: {
      pt: [
        "Probabilidade implícita e interna, edge, EV, stake e combinadas manuais.",
        "Simulação de banca, histórico persistido e aprendizados simples.",
        "API-Football e The Odds API em fluxos manuais separados do modo padrão.",
        "Testes para cálculos, endpoints, persistência e bloqueio de recursos proibidos.",
      ],
      en: [
        "Implied and internal probability, edge, EV, stake, and manual combinations.",
        "Bankroll simulation, persisted history, and simple learning insights.",
        "API-Football and The Odds API in manual flows separated from the default mode.",
        "Tests for calculations, endpoints, persistence, and blocked prohibited features.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Separar claramente dados mockados, fixtures reais e eventos de odds ainda não vinculados.",
        "Persistir cálculos e histórico sem transformar o laboratório em automação de apostas.",
        "Controlar consumo de APIs externas por flags, confirmação e limites locais.",
      ],
      en: [
        "Clearly separate mocked data, real fixtures, and odds events that are not yet linked.",
        "Persist calculations and history without turning the lab into betting automation.",
        "Control external API usage through flags, confirmation, and local limits.",
      ],
    },
    whatItShows: {
      pt: "Demonstra modelagem probabilística, backend em Python, persistência relacional, integração controlada com APIs e preocupação com limites de produto.",
      en: "Shows probabilistic modeling, Python backend development, relational persistence, controlled API integration, and attention to product boundaries.",
    },
    links: {
      website: "",
      repository: "https://github.com/alvaro-amorim/robet",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para o dashboard probabilístico Robet.",
        en: "Visual area prepared for the Robet probability dashboard.",
      },
      status: "pending",
      accent: {
        primary: "#22c55e",
        secondary: "#15803d",
        tertiary: "#facc15",
      },
      layout: "data-monitoring",
      mockupHint: {
        pt: "Moldura para partidas, odds, probabilidades e simulação de banca.",
        en: "Frame for matches, odds, probabilities, and bankroll simulation.",
      },
    },
  },
];
