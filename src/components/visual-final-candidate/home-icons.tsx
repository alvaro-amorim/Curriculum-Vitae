import type { CSSProperties, ReactNode, SVGProps } from "react";

import type { HomeProjectAccent as Accent, HomeProjectIconKey as ProjectIconKey } from "@/content/home-projects";

import styles from "./visual-final-candidate.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;
export type HomeIconName =
  | "activity"
  | "arrow"
  | "bar-chart"
  | "bot"
  | "brain"
  | "code"
  | "compass"
  | "external"
  | "gamepad"
  | "github"
  | "layout"
  | "layers"
  | "line-chart"
  | "mail"
  | "palette"
  | "rocket"
  | "shield"
  | "sparkles"
  | "trophy"
  | "user"
  | "users"
  | "zap";

const accentGradient: Record<Accent, string> = {
  "blue-purple": "linear-gradient(135deg, #2563eb, #7c3aed)",
  "amber-pink": "linear-gradient(135deg, #f59e0b, #ec4899)",
  "emerald-teal": "linear-gradient(135deg, #10b981, #06b6d4)",
  "rose-indigo": "linear-gradient(135deg, #f43f5e, #6366f1)",
  "violet-cyan": "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  "sky-purple": "linear-gradient(135deg, #0ea5e9, #a855f7)",
};

export function Icon({ name, className }: { name: HomeIconName; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", focusable: false, "aria-hidden": true };

  switch (name) {
    case "activity":
      return <svg {...common}><path d="M4 12h4l2-6 4 12 2-6h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "bar-chart":
      return <svg {...common}><path d="M5 19h14M7 16V9m5 7V5m5 11v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "bot":
      return <svg {...common}><path d="M12 8V4m-5 8h10M7 20h10a3 3 0 0 0 3-3v-4a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v4a3 3 0 0 0 3 3Zm2-5h.01M15 15h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "brain":
      return <svg {...common}><path d="M9 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3m0-14a3 3 0 0 1 3 3v11m-3-14v14m6-14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3m0-14a3 3 0 0 0-3 3v11m3-14v14M6 10h3m6 0h3M6 15h3m6 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
    case "code":
      return <svg {...common}><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-10-4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "compass":
      return <svg {...common}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "external":
      return <svg {...common}><path d="M8 7h9v9M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "gamepad":
      return <svg {...common}><path d="M7.1 8.2h9.8c2 0 3.7 1.35 4.15 3.28l.78 3.36c.48 2.08-1.08 4.06-3.18 4.06-.86 0-1.69-.34-2.3-.95l-1.4-1.4h-5.9l-1.4 1.4c-.61.61-1.44.95-2.3.95-2.1 0-3.66-1.98-3.18-4.06l.78-3.36A4.27 4.27 0 0 1 7.1 8.2Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.2 11.4v3.2M6.6 13h3.2M15.55 12.25h.01M18.05 14.25h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><path d="M10.1 8.2c.18-1.18.84-1.9 1.9-1.9s1.72.72 1.9 1.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M17.95 4.4v1.4m-.7-.7h1.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.72" /></svg>;
    case "github":
      return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7.4 5.6.7 5.6.7a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.8 1.9V22" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "layout":
      return <svg {...common}><path d="M4 5h16v14H4V5Zm0 5h16M10 10v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "layers":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Zm-7 9 7 4 7-4M5 16l7 4 7-4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "line-chart":
      return <svg {...common}><path d="M4 19h16M6 15l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "mail":
      return <svg {...common}><path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "palette":
      return <svg {...common}><path d="M12 21a9 9 0 1 1 9-9 3 3 0 0 1-3 3h-1.5a1.5 1.5 0 0 0 0 3H17a5 5 0 0 1-5 3ZM7.5 11h.01M9.5 7.5h.01M14.5 7.5h.01M16.5 11h.01" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "rocket":
      return <svg {...common}><rect x="4.2" y="5" width="15.6" height="12.6" rx="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M4.9 8.75h14.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" opacity="0.66" /><path d="M9.2 13.4 12 10.6l2.8 2.8M12 10.75v5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="m14.55 18.25 1.45 1.45 3.25-3.55" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.1" cy="6.9" r=".52" fill="currentColor" opacity="0.72" /><circle cx="9.05" cy="6.9" r=".52" fill="currentColor" opacity="0.45" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-5" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "sparkles":
      return <svg {...common}><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm6 12 .9 3.1L22 18l-3.1.9L18 22l-.9-3.1L14 18l3.1-.9L18 14Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "trophy":
      return <svg {...common}><path d="M8 4.5h8v4.8a4 4 0 0 1-8 0V4.5Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 6.3h3.2v1.6A3.2 3.2 0 0 1 16 11.1M8 6.3H4.8v1.6A3.2 3.2 0 0 0 8 11.1" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" opacity="0.86" /><path d="M12 13.4v3.1M8.9 20h6.2M10 16.5h4l.8 3.5H9.2l.8-3.5Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="m10.55 8.85.88.88 2.02-2.16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.1 17.2c-1.1-.75-1.85-1.78-2.25-3.1M17.9 17.2c1.1-.75 1.85-1.78 2.25-3.1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.58" /></svg>;
    case "user":
      return <svg {...common}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
    case "users":
      return <svg {...common}><path d="M16 11a3 3 0 1 0 0-6m4 15a5 5 0 0 0-6-4.9M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" /></svg>;
    case "zap":
      return <svg {...common}><path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
}

type LogoProps = SVGProps<SVGSVGElement> & { className?: string };

function SvgWrap({ children, ...props }: LogoProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

export function StackLogo({ name, className = styles.stackLogo }: { name: string; className?: string }) {
  switch (name) {
    case "Next.js":
      return <SvgWrap className={className}><circle cx="16" cy="16" r="14" fill="currentColor" /><path d="M10 9v14M10 9l13 14" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" /><rect x="20" y="9" width="2.2" height="9" fill="var(--background)" /></SvgWrap>;
    case "React":
      return <SvgWrap className={className}><g stroke="#61DAFB" strokeWidth="1.4"><circle cx="16" cy="16" r="2" fill="#61DAFB" /><ellipse cx="16" cy="16" rx="11" ry="4.2" /><ellipse cx="16" cy="16" rx="11" ry="4.2" transform="rotate(60 16 16)" /><ellipse cx="16" cy="16" rx="11" ry="4.2" transform="rotate(120 16 16)" /></g></SvgWrap>;
    case "TypeScript":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#3178C6" /><path d="M17.6 17.4h3.2v1.7h-2.4v6h-1.9v-6h-2.4v-1.7h3.5Zm5.4 6.8c.4.5 1.2.9 2.2.9.9 0 1.5-.4 1.5-1 0-.7-.5-1-1.7-1.4-1.6-.6-2.6-1.3-2.6-2.7 0-1.5 1.3-2.6 3.1-2.6 1.1 0 1.9.3 2.5.7l-.6 1.5c-.4-.3-1-.6-1.9-.6-.9 0-1.3.4-1.3.9 0 .6.5.9 1.8 1.4 1.7.6 2.5 1.4 2.5 2.7 0 1.5-1.2 2.7-3.4 2.7-1.2 0-2.3-.3-2.8-.7Z" fill="#fff" /></SvgWrap>;
    case "Supabase":
      return <SvgWrap className={className}><defs><linearGradient id="sbHomeLiteral" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3ECF8E" /><stop offset="1" stopColor="#249361" /></linearGradient></defs><path d="M18 3 7 17.5h8L13 29l11-14.5h-8L18 3Z" fill="url(#sbHomeLiteral)" /></SvgWrap>;
    case "Prisma":
      return <SvgWrap className={className}><path d="M11.5 4 5.1 22.6c-.2.5 0 1 .5 1.2l11.8 4.2c.6.2 1.2-.2 1.3-.8l3-19.6c0-.3-.1-.6-.4-.8L13 3.4c-.6-.3-1.3 0-1.5.6Z" fill="currentColor" /></SvgWrap>;
    case "Tailwind CSS":
    case "Tailwind":
      return <SvgWrap className={className}><path d="M16 8c-4 0-6.5 2-7.5 6 1.5-2 3.2-2.7 5.2-2.2 1.1.3 1.9 1.1 2.8 2 1.5 1.5 3.2 3.2 6.7 3.2 4 0 6.5-2 7.5-6-1.5 2-3.2 2.7-5.2 2.2-1.1-.3-1.9-1.1-2.8-2-1.5-1.5-3.2-3.2-6.7-3.2ZM8.5 17C4.5 17 2 19 1 23c1.5-2 3.2-2.7 5.2-2.2 1.1.3 1.9 1.1 2.8 2 1.5 1.5 3.2 3.2 6.7 3.2 4 0 6.5-2 7.5-6-1.5 2-3.2 2.7-5.2 2.2-1.1-.3-1.9-1.1-2.8-2-1.5-1.5-3.2-3.2-6.7-3.2Z" fill="#38BDF8" /></SvgWrap>;
    case "PostgreSQL":
      return <SvgWrap className={className}><circle cx="16" cy="16" r="13" fill="#336791" /><text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">Pg</text></SvgWrap>;
    case "Node.js":
      return <SvgWrap className={className}><path d="M16 2 4 9v14l12 7 12-7V9L16 2Z" fill="#539E43" /><text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">JS</text></SvgWrap>;
    case "Vite":
      return <SvgWrap className={className}><defs><linearGradient id="viteHomeLiteral" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#41D1FF" /><stop offset="1" stopColor="#BD34FE" /></linearGradient></defs><path d="M3 7 16 29 29 7l-13 4L3 7Z" fill="url(#viteHomeLiteral)" /></SvgWrap>;
    case "Python":
      return <SvgWrap className={className}><path d="M16 3c-4 0-5 2-5 4v3h5v1H7c-2 0-4 1-4 5s2 5 4 5h2v-3c0-2 1-4 4-4h7c2 0 3-1 3-3V7c0-2-1-4-7-4Zm-3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="#3776AB" /><path d="M16 29c4 0 5-2 5-4v-3h-5v-1h9c2 0 4-1 4-5s-2-5-4-5h-2v3c0 2-1 4-4 4h-7c-2 0-3 1-3 3v4c0 2 1 4 7 4Zm3-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFD43B" /></SvgWrap>;
    case "Go":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#00ADD8" /><text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">Go</text></SvgWrap>;
    case "RabbitMQ":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#FF6600" /><path d="M9 9h3v6h2V9h3v6h2V9h3v8c0 1-1 2-2 2h-3v4h-3v-4H9V9Z" fill="#fff" /></SvgWrap>;
    case "Bootstrap":
      return <SvgWrap className={className}><rect width="32" height="32" rx="6" fill="#7952B3" /><text x="16" y="21" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="ui-sans-serif">B</text></SvgWrap>;
    default: {
      const initials = name.split(/\s|\./).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
      return <span className={styles.stackFallback}>{initials || "•"}</span>;
    }
  }
}

export function ProjectIcon({ iconKey, accent, size = "lg" }: { iconKey: ProjectIconKey; accent: Accent; size?: "sm" | "lg" }) {
  const iconName: Record<ProjectIconKey, IconName> = {
    margem: "bar-chart",
    comerc: "bot",
    gdash: "activity",
    sdr: "users",
    arcade: "gamepad",
    "portfolio-os": "layout",
  };

  return (
    <div className={`${styles.projectIcon} ${size === "sm" ? styles.projectIconSm : ""}`} style={{ "--accent-gradient": accentGradient[accent] } as StyleVars}>
      <div />
      <span>
        <Icon name={iconName[iconKey]} />
      </span>
    </div>
  );
}

