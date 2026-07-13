import { createHash } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { readJsonPayload } from "@/lib/api-response";
import { isSameOriginAdminRequest, normalizeAdminEmail } from "@/lib/admin/auth-rules";
import { setAdminSessionCookies, signInAdmin } from "@/lib/admin/auth";
import {
  ADMIN_LOGIN_ATTEMPT_LIMIT,
  consumeAdminLoginAttempt,
  resetAdminLoginAttempts,
} from "@/lib/admin/rate-limit";

const AdminLoginPayloadSchema = z
  .object({
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(256),
  })
  .strict();

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function loginAttemptKey(request: Request, email: string) {
  return createHash("sha256")
    .update(`${clientAddress(request)}:${normalizeAdminEmail(email)}`)
    .digest("hex");
}

function loginError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    {
      error: {
        code: status === 429 ? "RATE_LIMITED" : "UNAUTHORIZED",
        message,
      },
      ok: false,
    },
    {
      headers,
      status,
    },
  );
}

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request.url, request.headers.get("origin"))) {
    return loginError("Origem da requisicao invalida.", 403);
  }

  const json = await readJsonPayload(request);

  if (!json.ok) {
    return json.response;
  }

  const parsed = AdminLoginPayloadSchema.safeParse(json.payload);

  if (!parsed.success) {
    return loginError("Credenciais invalidas.", 401);
  }

  const key = loginAttemptKey(request, parsed.data.email);
  const rateLimit = consumeAdminLoginAttempt(key);

  if (!rateLimit.allowed) {
    return loginError("Muitas tentativas. Aguarde antes de tentar novamente.", 429, {
      "Retry-After": String(rateLimit.retryAfterSeconds),
      "X-RateLimit-Limit": String(ADMIN_LOGIN_ATTEMPT_LIMIT),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1_000)),
    });
  }

  try {
    const authenticated = await signInAdmin(parsed.data.email, parsed.data.password);

    if (!authenticated) {
      return loginError("Credenciais invalidas.", 401, {
        "X-RateLimit-Limit": String(ADMIN_LOGIN_ATTEMPT_LIMIT),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1_000)),
      });
    }

    resetAdminLoginAttempts(key);
    const response = NextResponse.json({
      data: {
        email: authenticated.user.email,
        ready: true,
      },
      ok: true,
    });
    setAdminSessionCookies(response, authenticated.session);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return loginError("Nao foi possivel autenticar agora.", 503);
  }
}

export function GET() {
  return loginError("Metodo nao permitido.", 405, {
    Allow: "POST",
  });
}
