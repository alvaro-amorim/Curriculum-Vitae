const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const SITE_URL = (configuredAppUrl || "http://localhost:3000").replace(/\/$/, "");

export const APP_NAME = "Alvaro.dev Portfolio OS";

export const STORAGE_KEYS = {
  theme: "alvaro-dev-theme",
  locale: "alvaro-dev-locale",
} as const;
