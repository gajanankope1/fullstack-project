import { Types } from "mongoose";

import { getDocumentId, getRefIdString, WithObjectId } from "@/lib/utils/document";
import { calculateNetProfitLoss } from "@/lib/utils/profitLoss";
import { IChallenge } from "@/models/Challenge";
import { IParticipant } from "@/models/Participant";
import { ChallengeRepository } from "@/repositories/challengeRepository";
import { ParticipantRepository } from "@/repositories/participantRepository";
import { ChallengeStatus } from "@/types/enums";

export interface ChallengeHistoryItem {
  challengeId: string;
  role: "PARTICIPANT" | "CREATOR";
  creator?: string;
  selectedCoinId?: string;
  selectedCoinSymbol?: string;
  winningCoinId?: string;
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

export class ChallengeHistoryService {
  private readonly participantRepository = new ParticipantRepository();
  private readonly challengeRepository = new ChallengeRepository();

  async getUserHistory(userId: string): Promise<ChallengeHistoryItem[]> {
    const [participations, createdChallenges] = await Promise.all([
      this.participantRepository.findByUserId(userId),
      this.challengeRepository.findCompletedByCreatorId(userId),
    ]);

    const participationHistory = participations
      .filter((participation) => {
        const challenge = participation.challengeId as { status?: ChallengeStatus };
        return challenge?.status === ChallengeStatus.COMPLETED;
      })
      .map((participation) =>
        this.serializeParticipation(participation as WithObjectId<IParticipant>),
      );

    const participatedChallengeIds = new Set(
      participationHistory.map((item) => item.challengeId),
    );

    const creatorHistory = await Promise.all(
      createdChallenges
        .filter(
          (challenge) =>
            !participatedChallengeIds.has(
              getDocumentId(challenge as WithObjectId<IChallenge>),
            ),
        )
        .map(async (challenge) =>
          this.serializeCreatedChallenge(
            challenge as WithObjectId<IChallenge>,
          ),
        ),
    );

    return [...participationHistory, ...creatorHistory].sort(
      (left, right) =>
        new Date(right.participationDate).getTime() -
        new Date(left.participationDate).getTime(),
    );
  }

  private serializeParticipation(
    participation: WithObjectId<IParticipant>,
  ): ChallengeHistoryItem {
    const challenge = participation.challengeId as unknown as {
      _id: Types.ObjectId;
      creatorId: { username?: string } | Types.ObjectId;
      startTime: Date;
      endTime: Date;
      entryAmount: number;
      winningCoinId?: string;
      winningCoinSymbol?: string;
    };

    const entryAmount =
      participation.entryAmount ?? challenge.entryAmount ?? 0;
    const payout = participation.payout ?? 0;
    const isWinner = Boolean(participation.isWinner);
    const profitLoss =
      participation.netProfitLoss ??
      calculateNetProfitLoss(entryAmount, payout, isWinner);

    return {
      challengeId: challenge._id.toString(),
      role: "PARTICIPANT",
      creator:
        typeof challenge.creatorId === "object" &&
        challenge.creatorId !== null &&
        "username" in challenge.creatorId
          ? challenge.creatorId.username
          : undefined,
      selectedCoinId: participation.selectedCoinId,
      selectedCoinSymbol: participation.selectedCoinSymbol,
      winningCoinId: challenge.winningCoinId,
      winningCoinSymbol: challenge.winningCoinSymbol,
      result: isWinner ? "WIN" : "LOSS",
      entryAmount,
      payout,
      profitLoss,
      durationMinutes: this.getDurationMinutes(
        challenge.startTime,
        challenge.endTime,
      ),
      participationDate: participation.joinedAt.toISOString(),
      percentageChange: participation.percentageChange,
      startingPrice: participation.startingPrice,
      endingPrice: participation.endingPrice,
    };
  }

  private async serializeCreatedChallenge(
    challenge: WithObjectId<IChallenge>,
  ): Promise<ChallengeHistoryItem> {
    const challengeId = getDocumentId(challenge);
    const participantCount =
      await this.participantRepository.countByChallengeId(challengeId);

    return {
      challengeId,
      role: "CREATOR",
      creator:
        typeof challenge.creatorId === "object" &&
        challenge.creatorId !== null &&
        "username" in challenge.creatorId
          ? (challenge.creatorId as { username: string }).username
          : getRefIdString(challenge.creatorId),
      winningCoinId: challenge.winningCoinId,
      winningCoinSymbol: challenge.winningCoinSymbol,
      result: "CREATED",
      entryAmount: 0,
      payout: 0,
      profitLoss: 0,
      durationMinutes: this.getDurationMinutes(
        challenge.startTime,
        challenge.endTime,
      ),
      participationDate: challenge.endTime.toISOString(),
      participantCount,
    };
  }

  private getDurationMinutes(startTime: Date, endTime: Date): number {
    return Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
    );
  }
}
