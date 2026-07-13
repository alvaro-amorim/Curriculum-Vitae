"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { isSafeAdminNextPath } from "@/lib/admin/auth-rules";

import styles from "./admin.module.css";

type LoginResponse = {
  error?: {
    message?: string;
  };
  ok: boolean;
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json()) as LoginResponse;

      if (!response.ok || !body.ok) {
        setMessage(body.error?.message || "Não foi possível entrar.");
        return;
      }

      const requestedNext = searchParams.get("next");
      router.replace(isSafeAdminNextPath(requestedNext) ? requestedNext : "/admin");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar ao painel agora.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <label htmlFor="admin-email">
        E-mail administrativo
        <input
          autoComplete="username"
          id="admin-email"
          inputMode="email"
          name="email"
          placeholder="voce@exemplo.com"
          required
          type="email"
        />
      </label>
      <label htmlFor="admin-password">
        Senha
        <input
          autoComplete="current-password"
          id="admin-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <button disabled={pending} type="submit">
        {pending ? "Autenticando..." : "Entrar no painel"}
      </button>
      <p aria-live="polite" className={styles.formMessage} data-tone={message ? "error" : "neutral"}>
        {message}
      </p>
    </form>
  );
}
