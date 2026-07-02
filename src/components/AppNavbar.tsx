"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "@/lib/api/client";

interface AppNavbarProps {
  username?: string;
  email?: string;
  walletBalance?: number;
}

export function AppNavbar({ username, email, walletBalance }: AppNavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-amber-400">
          Crypto Derby
        </Link>

        <div className="flex items-center gap-4">
          {username ? (
            <div className="text-right text-sm">
              <p className="font-medium text-white">{username}</p>
              {email ? <p className="text-slate-400">{email}</p> : null}
            </div>
          ) : null}

          {typeof walletBalance === "number" ? (
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Wallet: {walletBalance.toLocaleString()} coins
            </div>
          ) : null}

          <nav className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <Link
              href="/challenges/create"
              className="text-slate-300 hover:text-white"
            >
              Create
            </Link>
            <Link href="/history" className="text-slate-300 hover:text-white">
              History
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
