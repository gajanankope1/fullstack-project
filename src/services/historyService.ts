import { Types } from "mongoose";

import { ParticipantRepository } from "@/repositories/participantRepository";
import { ChallengeStatus } from "@/types/enums";

export class HistoryService {
  private readonly participantRepository = new ParticipantRepository();

  async getHistory(userId: string) {
    const participations =
      await this.participantRepository.findByUserId(userId);

    return participations
      .filter((participation) => {
        const challenge = participation.challengeId as { status?: ChallengeStatus };
        return challenge?.status === ChallengeStatus.COMPLETED;
      })
      .map((participation) => {
        const challenge = participation.challengeId as unknown as {
          _id: Types.ObjectId;
          creatorId: { username?: string } | Types.ObjectId;
          startTime: Date;
          endTime: Date;
          winningCoinId?: string;
          winningCoinSymbol?: string;
        };

        const durationMinutes = Math.round(
          (new Date(challenge.endTime).getTime() -
            new Date(challenge.startTime).getTime()) /
            60000,
        );

        return {
          challengeId: challenge._id.toString(),
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
          result: participation.isWinner ? "WIN" : "LOSS",
          durationMinutes,
          profitLoss: participation.isWinner ? (participation.payout ?? 0) : 0,
          participationDate: participation.joinedAt,
          percentageChange: participation.percentageChange,
          startingPrice: participation.startingPrice,
          endingPrice: participation.endingPrice,
        };
      });
  }
}
