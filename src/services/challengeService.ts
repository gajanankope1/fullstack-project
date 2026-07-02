import { Types } from "mongoose";

import {
  COIN_IDS,
  getCoinById,
  PREDEFINED_COINS,
} from "@/lib/constants/cryptoCoins";
import { AppError } from "@/lib/errors/AppError";
import { getMarketDataService } from "@/lib/market/marketDataService";
import { calculatePercentageChange } from "@/lib/utils/precision";
import { getDocumentId, getRefIdString, WithObjectId } from "@/lib/utils/document";
import { calculateNetProfitLoss } from "@/lib/utils/profitLoss";
import { CreateChallengeInput } from "@/lib/validation/challengeSchemas";
import { IChallenge, IChallengeDocument } from "@/models/Challenge";
import { IParticipant } from "@/models/Participant";
import { ChallengeRepository } from "@/repositories/challengeRepository";
import { ParticipantRepository } from "@/repositories/participantRepository";
import { ChallengeLifecycleService } from "@/services/challengeLifecycleService";
import { WalletService } from "@/services/walletService";
import { ChallengeStatus } from "@/types/enums";

export class ChallengeService {
  private readonly challengeRepository = new ChallengeRepository();
  private readonly participantRepository = new ParticipantRepository();
  private readonly walletService = new WalletService();
  private readonly lifecycleService = new ChallengeLifecycleService();
  private readonly marketDataService = getMarketDataService();

  async createChallenge(userId: string, input: CreateChallengeInput) {
    const challenge = await this.challengeRepository.create({
      creatorId: userId,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      entryAmount: input.entryAmount,
    });

    return this.formatChallenge(challenge);
  }

  async listChallenges() {
    await this.lifecycleService.processPendingChallenges();
    const challenges = await this.challengeRepository.findAll();

    return Promise.all(
      challenges.map(async (challenge) => {
        const challengeId = getDocumentId(challenge as WithObjectId<IChallenge>);
        const participantCount =
          await this.participantRepository.countByChallengeId(challengeId);

        return {
          ...this.serializeChallenge(challenge),
          participantCount,
        };
      }),
    );
  }

  async getChallengeById(challengeId: string, userId?: string) {
    await this.lifecycleService.processPendingChallenges();
    const challenge = await this.challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new AppError("Challenge not found", 404);
    }

    const participants = await this.participantRepository.findByChallengeId(
      challengeId,
    );
    const currentUserParticipant = userId
      ? participants.find(
          (participant) => getRefIdString(participant.userId) === userId,
        )
      : undefined;

    const livePrices =
      challenge.status === ChallengeStatus.ACTIVE
        ? await this.marketDataService.getCurrentPrices(COIN_IDS)
        : {};

    const enrichedParticipants = (participants as WithObjectId<IParticipant>[]).map(
      (participant) => {
      const coinId = participant.selectedCoinId;
      const currentPrice = coinId ? livePrices[coinId] : undefined;
      const percentageChange =
        challenge.status === ChallengeStatus.ACTIVE &&
        participant.startingPrice &&
        currentPrice
          ? calculatePercentageChange(
              participant.startingPrice,
              currentPrice,
            )
          : participant.percentageChange;

      const entryAmount =
        participant.entryAmount ?? challenge.entryAmount;
      const payout = participant.payout ?? 0;
      const netProfitLoss =
        participant.netProfitLoss ??
        (challenge.status === ChallengeStatus.COMPLETED
          ? calculateNetProfitLoss(
              entryAmount,
              payout,
              Boolean(participant.isWinner),
            )
          : undefined);

      return {
        id: getDocumentId(participant),
        userId: getRefIdString(participant.userId),
        username:
          typeof participant.userId === "object" &&
          participant.userId !== null &&
          "username" in participant.userId
            ? (participant.userId as { username: string }).username
            : undefined,
        selectedCoinId: participant.selectedCoinId,
        selectedCoinSymbol: participant.selectedCoinSymbol,
        startingPrice: participant.startingPrice,
        endingPrice: participant.endingPrice,
        currentPrice,
        percentageChange,
        isWinner: participant.isWinner,
        entryAmount,
        payout,
        netProfitLoss,
        joinedAt: participant.joinedAt,
      };
    },
    );

    return {
      ...this.formatChallenge(challenge),
      participantCount: participants.length,
      predefinedCoins: PREDEFINED_COINS,
      currentUserParticipant: currentUserParticipant
        ? enrichedParticipants.find(
            (participant) => participant.userId === userId,
          )
        : null,
      participants: enrichedParticipants,
      livePrices,
    };
  }

  async joinChallenge(challengeId: string, userId: string) {
    await this.lifecycleService.processPendingChallenges();
    const challenge = await this.challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new AppError("Challenge not found", 404);
    }

    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new AppError("Challenge is not open for participation", 400);
    }

    if (new Date() >= challenge.startTime) {
      throw new AppError("Participation freeze time has passed", 400);
    }

    const activeParticipation = await this.getActiveParticipation(userId);

    if (activeParticipation) {
      throw new AppError(
        "You can participate in only one active challenge at a time",
        400,
      );
    }

    const existingParticipant =
      await this.participantRepository.findByChallengeAndUser(
        challengeId,
        userId,
      );

    if (existingParticipant) {
      throw new AppError("You have already joined this challenge", 409);
    }

    await this.walletService.debit(
      userId,
      challenge.entryAmount,
      `Entry fee for challenge ${challengeId}`,
      challengeId,
    );

    const participant = await this.participantRepository.create({
      challengeId,
      userId,
      entryAmount: challenge.entryAmount,
    });

    return {
      participantId: participant._id.toString(),
      challengeId,
      joinedAt: participant.joinedAt,
    };
  }

  async selectCoin(challengeId: string, userId: string, coinId: string) {
    await this.lifecycleService.processPendingChallenges();
    const challenge = await this.challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new AppError("Challenge not found", 404);
    }

    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new AppError("Coin selection is only allowed before challenge starts", 400);
    }

    if (new Date() >= challenge.startTime) {
      throw new AppError("Coin selection freeze time has passed", 400);
    }

    const coin = getCoinById(coinId);

    if (!coin) {
      throw new AppError("Invalid cryptocurrency selection", 422);
    }

    const participant =
      await this.participantRepository.findByChallengeAndUser(
        challengeId,
        userId,
      );

    if (!participant) {
      throw new AppError("You must join the challenge before selecting a coin", 400);
    }

    if (participant.selectedCoinId) {
      throw new AppError("Coin selection cannot be changed", 400);
    }

    const updatedParticipant = await this.participantRepository.updateById(
      participant._id.toString(),
      {
        selectedCoinId: coin.id,
        selectedCoinSymbol: coin.symbol,
      },
    );

    return {
      participantId: updatedParticipant?._id.toString(),
      selectedCoinId: coin.id,
      selectedCoinSymbol: coin.symbol,
    };
  }

  async deleteChallenge(challengeId: string, userId: string) {
    const challenge = await this.challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new AppError("Challenge not found", 404);
    }

    if (challenge.creatorId.toString() !== userId) {
      throw new AppError("Only the challenge creator can delete it", 403);
    }

    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new AppError("Only open challenges can be deleted", 400);
    }

    const participantCount =
      await this.participantRepository.countByChallengeId(challengeId);

    if (participantCount > 0) {
      throw new AppError(
        "Cannot delete a challenge that already has participants",
        400,
      );
    }

    await this.challengeRepository.deleteById(challengeId);

    return { challengeId };
  }

  private async getActiveParticipation(userId: string) {
    const participations =
      await this.participantRepository.findByUserId(userId);

    for (const participation of participations) {
      const challenge = participation.challengeId as {
        status?: ChallengeStatus;
      };

      if (
        challenge &&
        (challenge.status === ChallengeStatus.OPEN ||
          challenge.status === ChallengeStatus.ACTIVE)
      ) {
        return participation;
      }
    }

    return null;
  }

  private formatChallenge(challenge: {
    _id: Types.ObjectId;
    creatorId: Types.ObjectId | { username?: string; email?: string };
    startTime: Date;
    endTime: Date;
    entryAmount: number;
    status: ChallengeStatus;
    winningCoinId?: string;
    winningCoinSymbol?: string;
    winningPercentageChange?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return this.serializeChallenge(challenge);
  }

  private serializeChallenge(challenge: {
    _id?: Types.ObjectId;
    creatorId: Types.ObjectId | { _id?: Types.ObjectId; username?: string; email?: string };
    startTime: Date;
    endTime: Date;
    entryAmount: number;
    status: ChallengeStatus;
    winningCoinId?: string;
    winningCoinSymbol?: string;
    winningPercentageChange?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const creator =
      typeof challenge.creatorId === "object" &&
      challenge.creatorId !== null &&
      "username" in challenge.creatorId
        ? {
            id: challenge.creatorId._id?.toString(),
            username: challenge.creatorId.username,
            email: challenge.creatorId.email,
          }
        : { id: getRefIdString(challenge.creatorId) };

    return {
      id: challenge._id?.toString(),
      creator,
      startTime: challenge.startTime,
      endTime: challenge.endTime,
      entryAmount: challenge.entryAmount,
      status: challenge.status,
      winningCoinId: challenge.winningCoinId,
      winningCoinSymbol: challenge.winningCoinSymbol,
      winningPercentageChange: challenge.winningPercentageChange,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }
}
