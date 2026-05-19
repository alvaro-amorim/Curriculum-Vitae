import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success";
  size?: "sm" | "md";
};

export function buttonClassName(
  variant: ButtonProps["variant"] = "secondary",
  size: ButtonProps["size"] = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "min-h-9 px-3 py-1.5 text-sm" : "min-h-11 px-4 py-2.5 text-sm",
    variant === "primary" && "border-transparent bg-[var(--accent)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--accent-strong)]",
    variant === "success" && "border-transparent bg-[var(--success)] text-white hover:bg-[var(--success-strong)]",
    variant === "secondary" && "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-strong)]",
    variant === "ghost" && "border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
    className,
  );
}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button className={buttonClassName(variant, size, className)} type={type} {...props} />;
}
