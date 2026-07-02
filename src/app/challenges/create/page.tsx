"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppNavbar } from "@/components/AppNavbar";
import { apiRequest } from "@/lib/api/client";

interface Profile {
  username: string;
  email: string;
  walletBalance: number;
}

export default function CreateChallengePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [entryAmount, setEntryAmount] = useState(100);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<Profile>("/api/auth/me")
      .then((response) => setProfile(response.data))
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest<{ id: string }>("/api/challenges", {
        method: "POST",
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          entryAmount,
        }),
      });

      router.push(`/challenges/${response.data.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create challenge",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <AppNavbar
        username={profile?.username}
        email={profile?.email}
        walletBalance={profile?.walletBalance}
      />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-white">Create Challenge</h1>
        <p className="mt-2 text-slate-400">
          Set the schedule and entry amount. Users can join until the start time.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-slate-900/80 p-8"
        >
          <label className="block text-sm text-slate-300">
            Start Time
            <input
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            End Time
            <input
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            Entry Amount
            <input
              type="number"
              min={1}
              value={entryAmount}
              onChange={(event) => setEntryAmount(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              required
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-amber-500 px-6 py-3 font-medium text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Challenge"}
          </button>
        </form>
      </main>
    </div>
  );
}
