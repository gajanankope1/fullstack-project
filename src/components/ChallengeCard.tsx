"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";

interface ChallengeCardProps {
  id: string;
  creatorUsername?: string;
  startTime: string;
  endTime: string;
  entryAmount: number;
  status: string;
  participantCount: number;
}

export function ChallengeCard({
  id,
  creatorUsername,
  startTime,
  endTime,
  entryAmount,
  status,
  participantCount,
}: ChallengeCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Challenge by {creatorUsername ?? "Unknown"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Entry: {entryAmount.toLocaleString()} coins
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-slate-300">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Start</dt>
          <dd>{new Date(startTime).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">End</dt>
          <dd>{new Date(endTime).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Participants</dt>
          <dd>{participantCount}</dd>
        </div>
      </dl>

      <Link
        href={`/challenges/${id}`}
        className="mt-5 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
      >
        View Challenge
      </Link>
    </article>
  );
}
