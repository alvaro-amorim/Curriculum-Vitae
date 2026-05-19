import type { ArchitectureChallenge, DebugChallengeItem, LabPageCopy, LatencyChallenge } from "@/types/portfolio";

export const labPageCopy: LabPageCopy = {
  title: {
    pt: "Developer Lab",
    en: "Developer Lab",
  },
  description: {
    pt: "Desafios interativos para demonstrar raciocínio técnico em depuração, arquitetura e performance sem executar código do usuário nem depender de backend persistente.",
    en: "Interactive challenges that show technical reasoning in debugging, architecture, and performance without executing user code or depending on persistent backend.",
  },
  sessionScore: {
    pt: "Pontuação da sessão",
    en: "Session score",
  },
  pending: {
    pt: "Pendente",
    en: "Pending",
  },
  completed: {
    pt: "Concluído",
    en: "Completed",
  },
  apiSynced: {
    pt: "Score enviado para API mock.",
    en: "Score sent to mock API.",
  },
  apiPending: {
    pt: "Enviando score para API mock.",
    en: "Sending score to mock API.",
  },
  apiFailed: {
    pt: "Score local mantido; API mock não respondeu agora.",
    en: "Local score kept; mock API did not respond now.",
  },
  backLinksLabel: {
    pt: "Links principais",
    en: "Main links",
  },
};

export const debugChallenges: DebugChallengeItem[] = [
  {
    id: "reduce-empty-array",
    title: {
      pt: "Reduce sem valor inicial",
      en: "Reduce without initial value",
    },
    prompt: {
      pt: "Qual correção evita erro quando a lista estiver vazia?",
      en: "Which fix avoids an error when the list is empty?",
    },
    code: `const total = orders
  .filter((order) => order.status === "paid")
  .map((order) => order.amount)
  .reduce((sum, amount) => sum + amount);`,
    options: [
      {
        id: "initial-value",
        label: {
          pt: "Adicionar valor inicial no reduce.",
          en: "Add an initial value to reduce.",
        },
        isCorrect: true,
        feedback: {
          pt: "Correto. reduce precisa de valor inicial quando o array pode estar vazio.",
          en: "Correct. reduce needs an initial value when the array can be empty.",
        },
      },
      {
        id: "optional-chain",
        label: {
          pt: "Adicionar optional chaining em orders.",
          en: "Add optional chaining to orders.",
        },
        isCorrect: false,
        feedback: {
          pt: "Isso pode proteger orders indefinido, mas não resolve reduce em array vazio.",
          en: "That can protect an undefined orders value, but it does not fix reduce on an empty array.",
        },
      },
      {
        id: "parse-float",
        label: {
          pt: "Converter amount com parseFloat.",
          en: "Convert amount with parseFloat.",
        },
        isCorrect: false,
        feedback: {
          pt: "Conversão de tipo não resolve a exceção gerada por reduce sem item inicial.",
          en: "Type conversion does not solve the exception raised by reduce without an initial item.",
        },
      },
    ],
    explanation: {
      pt: "A correção segura é `.reduce((sum, amount) => sum + amount, 0)`, deixando o acumulador definido mesmo sem pedidos pagos.",
      en: "The safe fix is `.reduce((sum, amount) => sum + amount, 0)`, keeping the accumulator defined even with no paid orders.",
    },
  },
  {
    id: "react-stale-state",
    title: {
      pt: "Estado React com valor antigo",
      en: "React state with stale value",
    },
    prompt: {
      pt: "Qual alternativa evita perder incrementos em cliques rápidos?",
      en: "Which option avoids losing increments on fast clicks?",
    },
    code: `function Counter() {
  const [count, setCount] = useState(0);

  function incrementTwice() {
    setCount(count + 1);
    setCount(count + 1);
  }
}`,
    options: [
      {
        id: "functional-update",
        label: {
          pt: "Usar atualização funcional: setCount((current) => current + 1).",
          en: "Use functional update: setCount((current) => current + 1).",
        },
        isCorrect: true,
        feedback: {
          pt: "Correto. A atualização funcional lê o estado mais recente na fila de updates.",
          en: "Correct. The functional update reads the latest state in the update queue.",
        },
      },
      {
        id: "timeout",
        label: {
          pt: "Colocar o segundo setCount dentro de setTimeout.",
          en: "Put the second setCount inside setTimeout.",
        },
        isCorrect: false,
        feedback: {
          pt: "Adiar a execução não é uma garantia de consistência e torna o fluxo menos previsível.",
          en: "Delaying execution does not guarantee consistency and makes the flow less predictable.",
        },
      },
      {
        id: "let-variable",
        label: {
          pt: "Trocar useState por uma variável let.",
          en: "Replace useState with a let variable.",
        },
        isCorrect: false,
        feedback: {
          pt: "Variáveis locais não preservam estado entre renders nem disparam atualização visual.",
          en: "Local variables do not preserve state across renders or trigger visual updates.",
        },
      },
    ],
    explanation: {
      pt: "`setCount((current) => current + 1)` evita depender do valor fechado no render atual e funciona melhor com updates em lote.",
      en: "`setCount((current) => current + 1)` avoids depending on the value captured in the current render and works better with batched updates.",
    },
  },
  {
    id: "api-error-handling",
    title: {
      pt: "Chamada de API sem tratamento",
      en: "API call without handling",
    },
    prompt: {
      pt: "O que falta para tornar a chamada mais previsível?",
      en: "What is missing to make this call more predictable?",
    },
    code: `async function loadProject(slug: string) {
  const response = await fetch(\`/api/projects/\${slug}\`);
  return response.json();
}`,
    options: [
      {
        id: "check-ok",
        label: {
          pt: "Validar response.ok e tratar erro antes de ler o JSON.",
          en: "Check response.ok and handle errors before reading JSON.",
        },
        isCorrect: true,
        feedback: {
          pt: "Correto. Status HTTP de erro não lança exceção automaticamente no fetch.",
          en: "Correct. Error HTTP statuses do not throw automatically with fetch.",
        },
      },
      {
        id: "force-cache",
        label: {
          pt: "Forçar cache em todas as chamadas.",
          en: "Force cache on every call.",
        },
        isCorrect: false,
        feedback: {
          pt: "Cache pode ajudar performance, mas não resolve falha de status ou payload inválido.",
          en: "Cache can help performance, but it does not solve failed statuses or invalid payloads.",
        },
      },
      {
        id: "any-return",
        label: {
          pt: "Tipar o retorno como any para evitar erro de TypeScript.",
          en: "Type the return as any to avoid TypeScript errors.",
        },
        isCorrect: false,
        feedback: {
          pt: "Isso remove proteção estática e não melhora o comportamento em runtime.",
          en: "That removes static protection and does not improve runtime behavior.",
        },
      },
    ],
    explanation: {
      pt: "Uma chamada robusta valida `response.ok`, retorna mensagem controlada e só processa JSON depois de confirmar o contrato esperado.",
      en: "A robust call checks `response.ok`, returns a controlled message, and only processes JSON after confirming the expected contract.",
    },
  },
];

export const architectureChallenge: ArchitectureChallenge = {
  id: "saas-architecture",
  title: {
    pt: "Architecture Builder",
    en: "Architecture Builder",
  },
  scenario: {
    pt: "Monte uma arquitetura básica para um SaaS com autenticação, banco, API, pagamento e integração com IA.",
    en: "Build a basic architecture for a SaaS with authentication, database, API, payment, and AI integration.",
  },
  blocks: [
    {
      id: "client",
      label: { pt: "Client", en: "Client" },
      description: {
        pt: "Interface usada pelo usuário para navegar, preencher formulários e visualizar dados.",
        en: "Interface used by the user to navigate, fill forms, and view data.",
      },
      role: "required",
      feedback: {
        pt: "O client é necessário, mas não deve acessar segredos ou banco direto.",
        en: "The client is necessary, but it must not access secrets or the database directly.",
      },
    },
    {
      id: "next-app",
      label: { pt: "Next.js App", en: "Next.js App" },
      description: {
        pt: "Camada de aplicação para rotas, renderização e composição do produto.",
        en: "Application layer for routes, rendering, and product composition.",
      },
      role: "required",
      feedback: {
        pt: "A aplicação organiza a experiência e separa o que roda no client e no server.",
        en: "The app organizes the experience and separates client and server responsibilities.",
      },
    },
    {
      id: "api-route",
      label: { pt: "API/Server", en: "API/Server" },
      description: {
        pt: "Medeia operações sensíveis, valida payloads e protege integrações.",
        en: "Mediates sensitive operations, validates payloads, and protects integrations.",
      },
      role: "required",
      feedback: {
        pt: "A API/server deve mediar operações sensíveis em vez de expor segredos no browser.",
        en: "The API/server should mediate sensitive operations instead of exposing secrets in the browser.",
      },
    },
    {
      id: "auth",
      label: { pt: "Auth", en: "Auth" },
      description: {
        pt: "Identifica usuários e protege recursos privados.",
        en: "Identifies users and protects private resources.",
      },
      role: "required",
      feedback: {
        pt: "Autenticação é requisito para separar dados públicos e privados.",
        en: "Authentication is required to separate public and private data.",
      },
    },
    {
      id: "database",
      label: { pt: "Database", en: "Database" },
      description: {
        pt: "Persistência dos dados principais da aplicação.",
        en: "Persistence for the application's core data.",
      },
      role: "required",
      feedback: {
        pt: "O banco deve ser acessado por uma camada server-side com regras e validação.",
        en: "The database should be accessed through a server-side layer with rules and validation.",
      },
    },
    {
      id: "payments",
      label: { pt: "Payment Provider", en: "Payment Provider" },
      description: {
        pt: "Serviço externo para checkout, cobrança e webhooks.",
        en: "External service for checkout, billing, and webhooks.",
      },
      role: "required",
      feedback: {
        pt: "Pagamentos ficam isolados em provider externo e webhooks server-side.",
        en: "Payments stay isolated in an external provider and server-side webhooks.",
      },
    },
    {
      id: "ai-provider",
      label: { pt: "AI Provider", en: "AI Provider" },
      description: {
        pt: "Integração de IA chamada pelo servidor quando houver chave secreta.",
        en: "AI integration called by the server when a secret key is involved.",
      },
      role: "required",
      feedback: {
        pt: "Chamadas com chave de IA devem ficar server-side para proteger credenciais.",
        en: "AI calls with a key should stay server-side to protect credentials.",
      },
    },
    {
      id: "queue",
      label: { pt: "Queue/Worker", en: "Queue/Worker" },
      description: {
        pt: "Processa tarefas longas fora do request principal.",
        en: "Processes long tasks outside the main request.",
      },
      role: "bonus",
      feedback: {
        pt: "Fila/worker é bônus quando há processamento pesado, retries ou integração assíncrona.",
        en: "Queue/worker is a bonus for heavy processing, retries, or asynchronous integration.",
      },
    },
    {
      id: "cache",
      label: { pt: "Cache", en: "Cache" },
      description: {
        pt: "Reduz latência e custo em leituras repetidas.",
        en: "Reduces latency and cost for repeated reads.",
      },
      role: "bonus",
      feedback: {
        pt: "Cache ajuda performance, mas precisa de estratégia de invalidação.",
        en: "Cache helps performance, but needs an invalidation strategy.",
      },
    },
    {
      id: "client-database",
      label: { pt: "Client -> Database direto", en: "Client -> Database direct" },
      description: {
        pt: "Acesso direto do browser ao banco para operações sensíveis.",
        en: "Direct browser access to the database for sensitive operations.",
      },
      role: "unsafe",
      feedback: {
        pt: "Risco: o client não deve contornar a camada server-side em operações sensíveis.",
        en: "Risk: the client should not bypass the server-side layer for sensitive operations.",
      },
    },
    {
      id: "secret-in-browser",
      label: { pt: "Chave secreta no browser", en: "Secret key in browser" },
      description: {
        pt: "Uso de segredo privado em código client-side.",
        en: "Use of private secret in client-side code.",
      },
      role: "unsafe",
      feedback: {
        pt: "Risco: segredos privados nunca devem ser expostos em bundles client-side.",
        en: "Risk: private secrets must never be exposed in client-side bundles.",
      },
    },
  ],
};

export const latencyChallenge: LatencyChallenge = {
  id: "api-latency",
  title: {
    pt: "API Latency Game",
    en: "API Latency Game",
  },
  scenario: {
    pt: "Uma tela de busca está lenta porque carrega muitos dados, repete chamadas e executa processamento pesado durante o request.",
    en: "A search screen is slow because it loads too much data, repeats calls, and runs heavy processing during the request.",
  },
  options: [
    {
      id: "pagination",
      label: { pt: "Paginar resultados", en: "Paginate results" },
      description: {
        pt: "Reduz payload e tempo de renderização.",
        en: "Reduces payload and rendering time.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha. Paginação limita trabalho por request.",
        en: "Good choice. Pagination limits work per request.",
      },
    },
    {
      id: "database-index",
      label: { pt: "Criar índice no banco", en: "Add a database index" },
      description: {
        pt: "Ajuda filtros e ordenações frequentes.",
        en: "Helps frequent filters and sorting.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha quando o gargalo está em consulta filtrada ou ordenada.",
        en: "Good choice when the bottleneck is a filtered or sorted query.",
      },
    },
    {
      id: "cache",
      label: { pt: "Adicionar cache", en: "Add cache" },
      description: {
        pt: "Evita recomputar respostas repetidas.",
        en: "Avoids recomputing repeated responses.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha para dados que podem ser reutilizados com invalidação clara.",
        en: "Good choice for reusable data with clear invalidation.",
      },
    },
    {
      id: "remove-duplicate-call",
      label: { pt: "Remover chamada duplicada", en: "Remove duplicate call" },
      description: {
        pt: "Evita trabalho de rede e servidor sem valor.",
        en: "Avoids network and server work with no value.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha. Chamadas duplicadas costumam ser ganhos rápidos e seguros.",
        en: "Good choice. Duplicate calls are often quick and safe wins.",
      },
    },
    {
      id: "debounce",
      label: { pt: "Usar debounce no input", en: "Use input debounce" },
      description: {
        pt: "Evita buscar a cada tecla digitada.",
        en: "Avoids searching on every keystroke.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha para busca textual acionada por digitação.",
        en: "Good choice for text search triggered by typing.",
      },
    },
    {
      id: "background-processing",
      label: { pt: "Mover processamento pesado para background", en: "Move heavy processing to background" },
      description: {
        pt: "Mantém o request principal previsível.",
        en: "Keeps the main request predictable.",
      },
      impact: "positive",
      feedback: {
        pt: "Boa escolha quando a tarefa não precisa bloquear a resposta imediata.",
        en: "Good choice when the task does not need to block the immediate response.",
      },
    },
    {
      id: "fetch-everything-client",
      label: { pt: "Buscar tudo no client sem filtro", en: "Fetch everything on the client without filters" },
      description: {
        pt: "Transfere o gargalo para rede, memória e renderização.",
        en: "Moves the bottleneck to network, memory, and rendering.",
      },
      impact: "negative",
      feedback: {
        pt: "Evite. Isso aumenta payload e expõe dados que talvez nem sejam necessários.",
        en: "Avoid it. This increases payload and may expose data that is not needed.",
      },
    },
    {
      id: "infinite-retry",
      label: { pt: "Adicionar retry infinito", en: "Add infinite retry" },
      description: {
        pt: "Pode piorar incidentes e amplificar carga.",
        en: "Can worsen incidents and amplify load.",
      },
      impact: "negative",
      feedback: {
        pt: "Evite. Retry precisa de limite, backoff e tratamento de erro.",
        en: "Avoid it. Retry needs limits, backoff, and error handling.",
      },
    },
  ],
};
