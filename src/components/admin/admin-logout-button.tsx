"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./admin.module.css";

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button className={styles.logoutButton} disabled={pending} onClick={() => void signOut()} type="button">
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}
