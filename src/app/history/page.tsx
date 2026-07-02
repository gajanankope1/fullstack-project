"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppNavbar } from "@/components/AppNavbar";
import { formatProfitLoss } from "@/lib/utils/profitLoss";
import { apiRequest } from "@/lib/api/client";

interface Profile {
  username: string;
  email: string;
  walletBalance: number;
}

interface HistoryItem {
  challengeId: string;
  role: "PARTICIPANT" | "CREATOR";
  creator?: string;
  selectedCoinSymbol?: string;
  winningCoinSymbol?: string;
  result: "WIN" | "LOSS" | "CREATED";
  entryAmount: number;
  payout: number;
  profitLoss: number;
  durationMinutes: number;
  participationDate: string;
  percentageChange?: string;
  startingPrice?: string;
  endingPrice?: string;
  participantCount?: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<Profile>("/api/auth/me"),
      apiRequest<HistoryItem[]>("/api/history"),
    ])
      .then(([profileResponse, historyResponse]) => {
        setProfile(profileResponse.data);
        setHistory(historyResponse.data);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load history",
        );
        router.push("/login");
      });
  }, [router]);

  return (
    <div>
      <AppNavbar
        username={profile?.username}
        email={profile?.email}
        walletBalance={profile?.walletBalance}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-white">Challenge History</h1>
        <p className="mt-2 text-slate-400">
          Review challenges you joined or created, with net profit and loss.
        </p>

        {error ? <p className="mt-6 text-rose-400">{error}</p> : null}

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Selected</th>
                <th className="px-4 py-3">Winner</th>
                <th className="px-4 py-3">Entry</th>
                <th className="px-4 py-3">Payout</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Net P/L</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={`${item.challengeId}-${item.role}`} className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(item.participationDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.role}</td>
                  <td className="px-4 py-3 text-slate-300">{item.creator ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.selectedCoinSymbol ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.winningCoinSymbol ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.entryAmount > 0 ? item.entryAmount.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.payout > 0 ? item.payout.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.result}</td>
                  <td
                    className={`px-4 py-3 ${
                      item.profitLoss > 0
                        ? "text-emerald-400"
                        : item.profitLoss < 0
                          ? "text-rose-400"
                          : "text-slate-300"
                    }`}
                  >
                    {formatProfitLoss(item.profitLoss)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-400">
              No completed challenges yet.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
