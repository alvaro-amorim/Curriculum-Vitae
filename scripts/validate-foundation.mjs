const baseUrl = (process.env.PORTFOLIO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const routeChecks = [
  "/",
  "/curriculo",
  "/projetos",
  "/lab",
  "/api/health",
  "/resume/ALVARO.MARTINS-PT.pdf",
];

const badEncodingPatterns = [
  { label: "replacement character", pattern: /\uFFFD/ },
  { label: "latin1 mojibake", pattern: /[ÃÂ][\u0080-\u00bf]/ },
  { label: "replacement character mojibake", pattern: /ï¿½/ },
];
const requiredPtTokens = ["lang=\"pt-BR\"", "Currículo", "Projetos", "Baixar PDF", "Tema", "Álvaro.dev Portfolio OS"];
const forbiddenPtNavTokens = ["Resume", "Download PDF", "Theme"];

async function requestRoute(path) {
  const url = `${baseUrl}${path}`;
  let response = await fetch(url, { method: "HEAD" });

  if (response.status === 405) {
    response = await fetch(url, { method: "GET" });
  }

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
}

async function validateRoutes() {
  for (const route of routeChecks) {
    await requestRoute(route);
  }
}

async function validateHomeHtml() {
  const response = await fetch(`${baseUrl}/`);

  if (!response.ok) {
    throw new Error(`/ returned HTTP ${response.status}`);
  }

  const html = await response.text();

  for (const { label, pattern } of badEncodingPatterns) {
    if (pattern.test(html)) {
      throw new Error(`Rendered HTML contains ${label}`);
    }
  }

  for (const token of requiredPtTokens) {
    if (!html.includes(token)) {
      throw new Error(`Rendered PT HTML is missing required token: ${token}`);
    }
  }

  for (const token of forbiddenPtNavTokens) {
    if (html.includes(token)) {
      throw new Error(`Rendered PT HTML contains unexpected EN navigation token: ${token}`);
    }
  }
}

await validateRoutes();
await validateHomeHtml();

console.log(`Foundation validation passed for ${baseUrl}`);
