import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-[var(--text)] md:text-5xl">Página não encontrada</h1>
      <p className="mt-4 text-base leading-7 text-[var(--muted)]">
        O endereço acessado não existe neste portfólio. Use os links abaixo para voltar às áreas principais.
      </p>
      <nav className="mt-8 flex flex-wrap gap-3" aria-label="Navegação de erro">
        <Link className={buttonClassName("primary")} href="/">
          Home
        </Link>
        <Link className={buttonClassName("secondary")} href="/projetos">
          Projetos
        </Link>
        <Link className={buttonClassName("secondary")} href="/curriculo">
          Currículo
        </Link>
      </nav>
    </main>
  );
}
