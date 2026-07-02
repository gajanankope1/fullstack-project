"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppNavbar } from "@/components/AppNavbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusBadge } from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api/client";

interface Profile {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
}

interface ChallengeDetail {
  id: string;
  creator: { id?: string; username?: string };
  startTime: string;
  endTime: string;
  entryAmount: number;
  status: string;
  participantCount: number;
  winningCoinSymbol?: string;
  winningPercentageChange?: string;
  predefinedCoins: Array<{ id: string; symbol: string; name: string }>;
  currentUserParticipant: {
    userId: string;
    selectedCoinId?: string;
    selectedCoinSymbol?: string;
    startingPrice?: string;
    endingPrice?: string;
    currentPrice?: string;
    percentageChange?: string;
    isWinner?: boolean;
    payout?: number;
    entryAmount?: number;
    netProfitLoss?: number;
  } | null;
  participants: Array<{
    id: string;
    username?: string;
    selectedCoinSymbol?: string;
    percentageChange?: string;
    isWinner?: boolean;
  }>;
}

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadChallenge = useCallback(async () => {
    try {
      const [profileResponse, challengeResponse] = await Promise.all([
        apiRequest<Profile>("/api/auth/me"),
        apiRequest<ChallengeDetail>(`/api/challenges/${params.id}`),
      ]);

      setProfile(profileResponse.data);
      setChallenge(challengeResponse.data);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load challenge",
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadChallenge();
    const interval = setInterval(loadChallenge, 5000);
    return () => clearInterval(interval);
  }, [loadChallenge]);

  async function handleJoin() {
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest(`/api/challenges/${params.id}/join`, { method: "POST" });
      setMessage("Joined challenge successfully.");
      await loadChallenge();
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Join failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectCoin() {
    if (!selectedCoinId) {
      setError("Select a coin first.");
      return;
    }

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest(`/api/challenges/${params.id}/select-coin`, {
        method: "POST",
        body: JSON.stringify({ coinId: selectedCoinId }),
      });
      setMessage("Coin selected successfully.");
      await loadChallenge();
    } catch (selectError) {
      setError(
        selectError instanceof Error ? selectError.message : "Selection failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest(`/api/challenges/${params.id}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Delete failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="px-4 py-10 text-center text-slate-400">Loading challenge...</p>;
  }

  if (!challenge) {
    return <p className="px-4 py-10 text-center text-rose-400">{error}</p>;
  }

  const isParticipant = Boolean(challenge.currentUserParticipant);
  const canJoin =
    challenge.status === "OPEN" &&
    !isParticipant &&
    new Date() < new Date(challenge.startTime);
  const canSelectCoin =
    challenge.status === "OPEN" &&
    isParticipant &&
    !challenge.currentUserParticipant?.selectedCoinId &&
    new Date() < new Date(challenge.startTime);
  const countdownTarget =
    challenge.status === "OPEN" ? challenge.startTime : challenge.endTime;

  return (
    <div>
      <AppNavbar
        username={profile?.username}
        email={profile?.email}
        walletBalance={profile?.walletBalance}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Challenge Details</h1>
            <p className="mt-2 text-slate-400">
              Created by {challenge.creator.username ?? "Unknown"}
            </p>
          </div>
          <StatusBadge status={challenge.status} />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Configuration</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt>Entry Amount</dt>
                <dd>{challenge.entryAmount.toLocaleString()} coins</dd>
              </div>
              <div className="flex justify-between">
                <dt>Start</dt>
                <dd>{new Date(challenge.startTime).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>End</dt>
                <dd>{new Date(challenge.endTime).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Participants</dt>
                <dd>{challenge.participantCount}</dd>
              </div>
            </dl>

            {challenge.status !== "COMPLETED" ? (
              <div className="mt-6">
                <CountdownTimer
                  targetDate={countdownTarget}
                  label={challenge.status === "OPEN" ? "Starts in" : "Ends in"}
                  onComplete={loadChallenge}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Your Participation</h2>

            {canJoin ? (
              <button
                type="button"
                onClick={handleJoin}
                disabled={isSubmitting}
                className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
              >
                Join Challenge
              </button>
            ) : null}

            {canSelectCoin ? (
              <div className="mt-4 space-y-3">
                <select
                  value={selectedCoinId}
                  onChange={(event) => setSelectedCoinId(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                >
                  <option value="">Select a coin</option>
                  {challenge.predefinedCoins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSelectCoin}
                  disabled={isSubmitting}
                  className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
                >
                  Confirm Selection
                </button>
              </div>
            ) : null}

            {challenge.currentUserParticipant ? (
              <dl className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt>Selected Coin</dt>
                  <dd>{challenge.currentUserParticipant.selectedCoinSymbol ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Starting Price</dt>
                  <dd>{challenge.currentUserParticipant.startingPrice ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Current Price</dt>
                  <dd>{challenge.currentUserParticipant.currentPrice ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Ending Price</dt>
                  <dd>{challenge.currentUserParticipant.endingPrice ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Movement</dt>
                  <dd>{challenge.currentUserParticipant.percentageChange ?? "—"}%</dd>
                </div>
                {challenge.status === "COMPLETED" ? (
                  <>
                    <div className="flex justify-between">
                      <dt>Entry Amount</dt>
                      <dd>{challenge.currentUserParticipant.entryAmount ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Result</dt>
                      <dd>
                        {challenge.currentUserParticipant.isWinner ? "WIN" : "LOSS"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Payout</dt>
                      <dd>{challenge.currentUserParticipant.payout ?? 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Net Profit/Loss</dt>
                      <dd>{challenge.currentUserParticipant.netProfitLoss ?? 0}</dd>
                    </div>
                  </>
                ) : null}
              </dl>
            ) : (
              <p className="mt-4 text-slate-400">You have not joined this challenge.</p>
            )}

            {challenge.status === "OPEN" &&
            challenge.participantCount === 0 &&
            profile?.id === challenge.creator.id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="mt-6 rounded-full border border-rose-500/40 px-5 py-2 text-sm text-rose-300"
              >
                Delete Challenge
              </button>
            ) : null}
          </div>
        </section>

        {challenge.status === "COMPLETED" ? (
          <section className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <h2 className="text-lg font-semibold text-emerald-300">Result</h2>
            <p className="mt-2 text-slate-200">
              Winning coin: {challenge.winningCoinSymbol ?? "—"} (
              {challenge.winningPercentageChange ?? "0"}%)
            </p>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Participants</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Coin</th>
                  <th className="px-4 py-3">Movement</th>
                  <th className="px-4 py-3">Winner</th>
                </tr>
              </thead>
              <tbody>
                {challenge.participants.map((participant) => (
                  <tr key={participant.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-slate-300">
                      {participant.username ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {participant.selectedCoinSymbol ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {participant.percentageChange ?? "—"}%
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {participant.isWinner ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {message ? <p className="mt-6 text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-6 text-rose-400">{error}</p> : null}
      </main>
    </div>
  );
}
