"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppNavbar } from "@/components/AppNavbar";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { apiRequest } from "@/lib/api/client";

interface DashboardData {
  walletBalance: number;
  availableChallenges: Array<{
    id: string;
    creator: { username?: string } | null;
    startTime: string;
    endTime: string;
    entryAmount: number;
    status: string;
    participantCount: number;
  }>;
  activeChallenge: {
    challengeId: string;
    status: string;
    startTime: string;
    endTime: string;
    entryAmount: number;
    selectedCoinId?: string;
    selectedCoinSymbol?: string;
    startingPrice?: string;
    percentageChange?: string;
  } | null;
  previousChallenges: Array<{
    challengeId: string;
    creator?: string;
    selectedCoinSymbol?: string;
    winningCoinSymbol?: string;
    result: string;
    profitLoss: number;
    participationDate: string;
  }>;
  marketOverview: Array<{
    id: string;
    symbol: string;
    name: string;
    currentPrice?: string;
  }>;
  marketProvider: {
    provider: "coingecko" | "mock";
    configured: boolean;
    usingFallback: boolean;
  };
}

interface Profile {
  username: string;
  email: string;
  walletBalance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const [profileResponse, dashboardResponse] = await Promise.all([
        apiRequest<Profile>("/api/auth/me"),
        apiRequest<DashboardData>("/api/dashboard"),
      ]);

      setProfile(profileResponse.data);
      setDashboard(dashboardResponse.data);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load dashboard",
      );
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (isLoading) {
    return <p className="px-4 py-10 text-center text-slate-400">Loading dashboard...</p>;
  }

  if (!dashboard || !profile) {
    return <p className="px-4 py-10 text-center text-rose-400">{error}</p>;
  }

  const activeTarget =
    dashboard.activeChallenge?.status === "OPEN"
      ? dashboard.activeChallenge.startTime
      : dashboard.activeChallenge?.endTime;

  return (
    <div>
      <AppNavbar
        username={profile.username}
        email={profile.email}
        walletBalance={dashboard.walletBalance}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Track challenges, wallet balance, and market overview.
          </p>
        </div>

        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 lg:col-span-1">
            <p className="text-sm text-emerald-200/80">Virtual Wallet</p>
            <p className="mt-2 text-4xl font-bold text-emerald-300">
              {dashboard.walletBalance.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">My Active Challenge</h2>
            {dashboard.activeChallenge ? (
              <div className="mt-4 space-y-4">
                <p className="text-slate-300">
                  Status: {dashboard.activeChallenge.status}
                  {dashboard.activeChallenge.selectedCoinSymbol
                    ? ` • Selected: ${dashboard.activeChallenge.selectedCoinSymbol}`
                    : " • Coin not selected yet"}
                </p>
                {activeTarget ? (
                  <CountdownTimer
                    targetDate={activeTarget}
                    label={
                      dashboard.activeChallenge.status === "OPEN"
                        ? "Starts in"
                        : "Ends in"
                    }
                    onComplete={loadDashboard}
                  />
                ) : null}
                <a
                  href={`/challenges/${dashboard.activeChallenge.challengeId}`}
                  className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950"
                >
                  Open Challenge
                </a>
              </div>
            ) : (
              <p className="mt-4 text-slate-400">No active challenge right now.</p>
            )}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Market Overview</h2>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              Source:{" "}
              {dashboard.marketProvider.usingFallback
                ? "Fallback (mock)"
                : dashboard.marketProvider.configured
                  ? "CoinGecko"
                  : "Mock (add COINGECKO_API_KEY)"}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.marketOverview.map((coin) => (
              <div
                key={coin.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
              >
                <p className="font-medium text-white">{coin.name}</p>
                <p className="text-sm text-slate-400">{coin.symbol}</p>
                <p className="mt-3 text-lg text-amber-300">
                  ${coin.currentPrice ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Available Challenges</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.availableChallenges.length > 0 ? (
              dashboard.availableChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  creatorUsername={challenge.creator?.username}
                  startTime={challenge.startTime}
                  endTime={challenge.endTime}
                  entryAmount={challenge.entryAmount}
                  status={challenge.status}
                  participantCount={challenge.participantCount}
                />
              ))
            ) : (
              <p className="text-slate-400">No open challenges available.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Previous Challenges</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Selected</th>
                  <th className="px-4 py-3">Winner</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.previousChallenges.map((item) => (
                  <tr key={item.challengeId} className="border-t border-white/5">
                    <td className="px-4 py-3 text-slate-300">{item.creator ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.selectedCoinSymbol ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.winningCoinSymbol ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.result}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.profitLoss.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
