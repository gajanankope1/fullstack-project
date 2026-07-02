import { Types } from "mongoose";

import { PREDEFINED_COINS } from "@/lib/constants/cryptoCoins";
import { getMarketDataService } from "@/lib/market/marketDataService";
import { getDocumentId, WithObjectId } from "@/lib/utils/document";
import { IChallenge } from "@/models/Challenge";
import { ChallengeRepository } from "@/repositories/challengeRepository";
import { ParticipantRepository } from "@/repositories/participantRepository";
import { UserRepository } from "@/repositories/userRepository";
import { ChallengeLifecycleService } from "@/services/challengeLifecycleService";
import { ChallengeStatus } from "@/types/enums";

export class DashboardService {
  private readonly challengeRepository = new ChallengeRepository();
  private readonly participantRepository = new ParticipantRepository();
  private readonly userRepository = new UserRepository();
  private readonly lifecycleService = new ChallengeLifecycleService();
  private readonly marketDataService = getMarketDataService();

  async getDashboard(userId: string) {
    await this.lifecycleService.processPendingChallenges();

    const user = await this.userRepository.findById(userId);
    const availableChallenges =
      await this.challengeRepository.findOpenChallenges();
    const participations =
      await this.participantRepository.findByUserId(userId);
    const marketOverview = await this.marketDataService.getCurrentPrices(
      PREDEFINED_COINS.map((coin) => coin.id),
    );

    const activeParticipation = participations.find((participation) => {
      const challenge = participation.challengeId as {
        status?: ChallengeStatus;
        _id?: Types.ObjectId;
        startTime?: Date;
        endTime?: Date;
        entryAmount?: number;
        winningCoinId?: string;
        winningCoinSymbol?: string;
      };

      return (
        challenge?.status === ChallengeStatus.OPEN ||
        challenge?.status === ChallengeStatus.ACTIVE
      );
    });

    const previousChallenges = participations
      .filter((participation) => {
        const challenge = participation.challengeId as { status?: ChallengeStatus };
        return challenge?.status === ChallengeStatus.COMPLETED;
      })
      .slice(0, 5);

    const enrichedAvailable = await Promise.all(
      availableChallenges.map(async (challenge) => ({
        id: getDocumentId(challenge as WithObjectId<IChallenge>),
        creator:
          typeof challenge.creatorId === "object" &&
          challenge.creatorId !== null &&
          "username" in challenge.creatorId
            ? {
                username: (challenge.creatorId as { username: string }).username,
              }
            : null,
        startTime: challenge.startTime,
        endTime: challenge.endTime,
        entryAmount: challenge.entryAmount,
        status: challenge.status,
        participantCount: await this.participantRepository.countByChallengeId(
          getDocumentId(challenge as WithObjectId<IChallenge>),
        ),
      })),
    );

    return {
      walletBalance: user?.walletBalance ?? 0,
      availableChallenges: enrichedAvailable,
      activeChallenge: activeParticipation
        ? this.serializeActiveChallenge(activeParticipation)
        : null,
      previousChallenges: previousChallenges.map((participation) =>
        this.serializeHistoryItem(participation),
      ),
      marketOverview: PREDEFINED_COINS.map((coin) => ({
        ...coin,
        currentPrice: marketOverview[coin.id],
      })),
      marketProvider: this.marketDataService.getProviderStatus(),
    };
  }

  private serializeActiveChallenge(participation: {
    challengeId: unknown;
    selectedCoinId?: string;
    selectedCoinSymbol?: string;
    startingPrice?: string;
    endingPrice?: string;
    percentageChange?: string;
    isWinner?: boolean;
    payout?: number;
  }) {
    const challenge = participation.challengeId as {
      _id: Types.ObjectId;
      startTime: Date;
      endTime: Date;
      entryAmount: number;
      status: ChallengeStatus;
    };

    return {
      challengeId: challenge._id.toString(),
      status: challenge.status,
      startTime: challenge.startTime,
      endTime: challenge.endTime,
      entryAmount: challenge.entryAmount,
      selectedCoinId: participation.selectedCoinId,
      selectedCoinSymbol: participation.selectedCoinSymbol,
      startingPrice: participation.startingPrice,
      endingPrice: participation.endingPrice,
      percentageChange: participation.percentageChange,
      isWinner: participation.isWinner,
      payout: participation.payout,
    };
  }

  private serializeHistoryItem(participation: {
    challengeId: unknown;
    selectedCoinId?: string;
    selectedCoinSymbol?: string;
    percentageChange?: string;
    isWinner?: boolean;
    payout?: number;
    joinedAt: Date;
  }) {
    const challenge = participation.challengeId as {
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
    };
  }
}
