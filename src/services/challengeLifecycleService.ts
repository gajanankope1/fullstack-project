import { PREDEFINED_COINS } from "@/lib/constants/cryptoCoins";
import { getMarketDataService } from "@/lib/market/marketDataService";
import {
  calculatePercentageChange,
  comparePercentageChange,
} from "@/lib/utils/precision";
import { getDocumentId, getRefIdString, WithObjectId } from "@/lib/utils/document";
import { calculateNetProfitLoss } from "@/lib/utils/profitLoss";
import { IChallengeDocument } from "@/models/Challenge";
import { IParticipant } from "@/models/Participant";
import { ChallengeRepository } from "@/repositories/challengeRepository";
import { ParticipantRepository } from "@/repositories/participantRepository";
import { WalletService } from "@/services/walletService";
import { ChallengeStatus } from "@/types/enums";

export class ChallengeLifecycleService {
  private readonly challengeRepository = new ChallengeRepository();
  private readonly participantRepository = new ParticipantRepository();
  private readonly walletService = new WalletService();
  private readonly marketDataService = getMarketDataService();

  async processPendingChallenges(): Promise<void> {
    const challenges = await this.challengeRepository.findByStatuses([
      ChallengeStatus.OPEN,
      ChallengeStatus.ACTIVE,
    ]);

    for (const challenge of challenges) {
      await this.processChallenge(challenge);
    }
  }

  async processChallenge(challenge: IChallengeDocument): Promise<void> {
    const now = new Date();

    if (
      challenge.status === ChallengeStatus.OPEN &&
      now >= challenge.startTime
    ) {
      await this.activateChallenge(challenge);
      return;
    }

    if (
      challenge.status === ChallengeStatus.ACTIVE &&
      now >= challenge.endTime
    ) {
      await this.completeChallenge(challenge);
    }
  }

  private async activateChallenge(challenge: IChallengeDocument): Promise<void> {
    const participants = await this.participantRepository.findByChallengeId(
      challenge._id.toString(),
    );

    if (participants.length === 0) {
      await this.challengeRepository.updateById(challenge._id.toString(), {
        status: ChallengeStatus.COMPLETED,
      });
      return;
    }

    for (const participant of participants as WithObjectId<IParticipant>[]) {
      if (!participant.selectedCoinId) {
        const randomCoin =
          PREDEFINED_COINS[
            Math.floor(Math.random() * PREDEFINED_COINS.length)
          ];
        await this.participantRepository.updateById(
          getDocumentId(participant),
          {
            selectedCoinId: randomCoin.id,
            selectedCoinSymbol: randomCoin.symbol,
          },
        );
        participant.selectedCoinId = randomCoin.id;
        participant.selectedCoinSymbol = randomCoin.symbol;
      }
    }

    const coinIds = [
      ...new Set(
        participants
          .map((participant) => participant.selectedCoinId)
          .filter((coinId): coinId is string => Boolean(coinId)),
      ),
    ];

    const startingPrices =
      await this.marketDataService.getLockedPrices(coinIds);

    for (const participant of participants as WithObjectId<IParticipant>[]) {
      const coinId = participant.selectedCoinId;
      if (!coinId) {
        continue;
      }

      await this.participantRepository.updateById(
        getDocumentId(participant),
        {
          startingPrice: startingPrices[coinId],
        },
      );
    }

    await this.challengeRepository.updateById(challenge._id.toString(), {
      status: ChallengeStatus.ACTIVE,
    });
  }

  private async completeChallenge(
    challenge: IChallengeDocument,
  ): Promise<void> {
    const participants = await this.participantRepository.findByChallengeId(
      challenge._id.toString(),
    );

    const coinIds = [
      ...new Set(
        participants
          .map((participant) => participant.selectedCoinId)
          .filter((coinId): coinId is string => Boolean(coinId)),
      ),
    ];

    const endingPrices =
      await this.marketDataService.getLockedPrices(coinIds);

    const coinPerformance = new Map<
      string,
      { percentageChange: string; symbol: string }
    >();

    for (const coinId of coinIds) {
      const sampleParticipant = participants.find(
        (participant) => participant.selectedCoinId === coinId,
      );
      const startingPrice = sampleParticipant?.startingPrice;

      if (!startingPrice) {
        continue;
      }

      const endingPrice = endingPrices[coinId];

      if (!startingPrice || !endingPrice) {
        continue;
      }

      const percentageChange = calculatePercentageChange(
        startingPrice,
        endingPrice,
      );
      coinPerformance.set(coinId, {
        percentageChange,
        symbol: sampleParticipant?.selectedCoinSymbol ?? coinId,
      });
    }

    let winningCoinId: string | null = null;
    let winningPercentage = "-999";

    for (const [coinId, performance] of coinPerformance.entries()) {
      const comparison = comparePercentageChange(
        performance.percentageChange,
        winningPercentage,
      );

      if (comparison > 0) {
        winningCoinId = coinId;
        winningPercentage = performance.percentageChange;
        continue;
      }

      if (comparison === 0 && winningCoinId && coinId < winningCoinId) {
        winningCoinId = coinId;
        winningPercentage = performance.percentageChange;
      }
    }

    const winners = participants.filter(
      (participant) => participant.selectedCoinId === winningCoinId,
    );
    const totalPot = challenge.entryAmount * participants.length;
    const payoutPerWinner =
      winners.length > 0 ? Math.floor(totalPot / winners.length) : 0;

    for (const participant of participants as WithObjectId<IParticipant>[]) {
      const coinId = participant.selectedCoinId;
      const isWinner = participant.selectedCoinId === winningCoinId;
      const endingPrice = coinId ? endingPrices[coinId] : undefined;
      const percentageChange =
        coinId && participant.startingPrice && endingPrice
          ? calculatePercentageChange(
              participant.startingPrice,
              endingPrice,
            )
          : "0";

      const payout = isWinner ? payoutPerWinner : 0;
      const entryAmount =
        participant.entryAmount ?? challenge.entryAmount;
      const netProfitLoss = calculateNetProfitLoss(
        entryAmount,
        payout,
        isWinner,
      );

      await this.participantRepository.updateById(
        getDocumentId(participant),
        {
          endingPrice,
          percentageChange,
          isWinner,
          payout,
          netProfitLoss,
        },
      );

      if (isWinner && payoutPerWinner > 0) {
        await this.walletService.credit(
          getRefIdString(participant.userId),
          payoutPerWinner,
          `Winnings from challenge ${challenge._id.toString()}`,
          challenge._id.toString(),
        );
      }
    }

    const winningCoin = winningCoinId
      ? coinPerformance.get(winningCoinId)
      : undefined;

    await this.challengeRepository.updateById(challenge._id.toString(), {
      status: ChallengeStatus.COMPLETED,
      winningCoinId: winningCoinId ?? undefined,
      winningCoinSymbol: winningCoin?.symbol,
      winningPercentageChange: winningCoin?.percentageChange,
    });
  }
}
