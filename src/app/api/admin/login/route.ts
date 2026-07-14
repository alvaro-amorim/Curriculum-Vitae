import { NextResponse } from "next/server";
import { z } from "zod";

import { readJsonPayload } from "@/lib/api-response";
import { setAdminSessionCookie } from "@/lib/admin/auth";
import { isSameOriginAdminRequest, normalizeAdminEmail } from "@/lib/admin/auth-rules";
import {
  ADMIN_LOGIN_ATTEMPT_LIMIT,
  consumeAdminLoginAttempt,
  createAdminLoginAttemptKeyHash,
  resetAdminLoginAttempts,
} from "@/lib/admin/rate-limit";
import { createAdminSession } from "@/lib/admin/sessions";
import {
  DUMMY_ADMIN_PASSWORD_CREDENTIAL,
  MAX_ADMIN_PASSWORD_LENGTH,
  verifyAdminPassword,
} from "@/lib/admin/password";
import { getMongoCollections } from "@/lib/mongodb/collections";

export const runtime = "nodejs";

const ADMIN_LOGIN_MAX_BYTES = 4 * 1024;
const GENERIC_LOGIN_ERROR = "Credenciais inválidas";

const AdminLoginPayloadSchema = z
  .object({
    email: z.string().trim().email().max(160),
    password: z.string().min(1).max(MAX_ADMIN_PASSWORD_LENGTH),
  })
  .strict();

function loginError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    {
      error: {
        code: status === 429 ? "RATE_LIMITED" : status === 403 ? "FORBIDDEN" : "UNAUTHORIZED",
        message,
      },
      ok: false,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...headers,
      },
      status,
    },
  );
}

function rateLimitHeaders(rateLimit: Awaited<ReturnType<typeof consumeAdminLoginAttempt>>) {
  return {
    "X-RateLimit-Limit": String(ADMIN_LOGIN_ATTEMPT_LIMIT),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1_000)),
    ...(rateLimit.retryAfterSeconds > 0 ? { "Retry-After": String(rateLimit.retryAfterSeconds) } : {}),
  };
}

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request.url, request.headers.get("origin"))) {
    return loginError("Origem da requisição inválida.", 403);
  }

  const json = await readJsonPayload(request, ADMIN_LOGIN_MAX_BYTES);

  if (!json.ok) {
    json.response.headers.set("Cache-Control", "no-store");
    return json.response;
  }

  const parsed = AdminLoginPayloadSchema.safeParse(json.payload);

  if (!parsed.success) {
    return loginError(GENERIC_LOGIN_ERROR, 401);
  }

  const normalizedEmail = normalizeAdminEmail(parsed.data.email);
  const keyHash = createAdminLoginAttemptKeyHash(request, normalizedEmail);
  const rateLimit = await consumeAdminLoginAttempt(keyHash);

  if (!rateLimit.allowed) {
    return loginError("Muitas tentativas. Aguarde antes de tentar novamente.", 429, rateLimitHeaders(rateLimit));
  }

  try {
    const { adminUsers } = await getMongoCollections();
    const user = await adminUsers.findOne({ normalizedEmail });
    const credential = user ?? DUMMY_ADMIN_PASSWORD_CREDENTIAL;
    const passwordMatches = await verifyAdminPassword(parsed.data.password, credential);

    if (!user || !user.active || !passwordMatches) {
      return loginError(GENERIC_LOGIN_ERROR, 401, rateLimitHeaders(rateLimit));
    }

    const now = new Date();
    const session = await createAdminSession(user, {
      now,
      userAgent: request.headers.get("user-agent"),
    });

    await Promise.all([
      adminUsers.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLoginAt: now,
            updatedAt: now,
          },
        },
      ),
      resetAdminLoginAttempts(keyHash),
    ]);

    const response = NextResponse.json(
      {
        data: {
          email: user.email,
          ready: true,
        },
        ok: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
    setAdminSessionCookie(response, session.token, session.expiresAt, now);
    return response;
  } catch {
    return loginError("Não foi possível autenticar agora.", 503);
  }
}

export function GET() {
  return loginError("Método não permitido.", 405, {
    Allow: "POST",
  });
}
