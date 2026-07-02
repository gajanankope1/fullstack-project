import { Types } from "mongoose";

import { PREDEFINED_COINS } from "@/lib/constants/cryptoCoins";
import { getMarketDataService } from "@/lib/market/marketDataService";
import { getDocumentId, WithObjectId } from "@/lib/utils/document";
import { IChallenge } from "@/models/Challenge";
import { ChallengeRepository } from "@/repositories/challengeRepository";
import { ParticipantRepository } from "@/repositories/participantRepository";
import { UserRepository } from "@/repositories/userRepository";
import { ChallengeHistoryService } from "@/services/challengeHistoryService";
import { ChallengeLifecycleService } from "@/services/challengeLifecycleService";
import { ChallengeStatus } from "@/types/enums";

export class DashboardService {
  private readonly challengeRepository = new ChallengeRepository();
  private readonly participantRepository = new ParticipantRepository();
  private readonly userRepository = new UserRepository();
  private readonly lifecycleService = new ChallengeLifecycleService();
  private readonly marketDataService = getMarketDataService();
  private readonly challengeHistoryService = new ChallengeHistoryService();

  async getDashboard(userId: string) {
    await this.lifecycleService.processPendingChallenges();

    const user = await this.userRepository.findById(userId);
    const availableChallenges =
      await this.challengeRepository.findOpenChallenges();
    const participations =
      await this.participantRepository.findByUserId(userId);
    const history = await this.challengeHistoryService.getUserHistory(userId);
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
      previousChallenges: history.slice(0, 5),
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
    entryAmount?: number;
    netProfitLoss?: number;
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
      netProfitLoss: participation.netProfitLoss,
    };
  }
}
