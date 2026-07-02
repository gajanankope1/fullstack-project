import { INITIAL_WALLET_BALANCE } from "@/lib/constants/wallet";
import { AppError } from "@/lib/errors/AppError";
import { UserRepository } from "@/repositories/userRepository";
import { WalletTransactionRepository } from "@/repositories/walletTransactionRepository";
import { TransactionType } from "@/types/enums";

export class WalletService {
  private readonly userRepository = new UserRepository();
  private readonly walletTransactionRepository =
    new WalletTransactionRepository();

  async getBalance(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user.walletBalance;
  }

  async getTransactions(userId: string) {
    return this.walletTransactionRepository.findByUserId(userId);
  }

  async debit(
    userId: string,
    amount: number,
    description: string,
    challengeId?: string,
  ): Promise<number> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.walletBalance < amount) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const balanceAfter = user.walletBalance - amount;
    await this.userRepository.updateWalletBalance(userId, balanceAfter);
    await this.walletTransactionRepository.create({
      userId,
      type: TransactionType.DEBIT,
      amount,
      description,
      challengeId,
      balanceAfter,
    });

    return balanceAfter;
  }

  async credit(
    userId: string,
    amount: number,
    description: string,
    challengeId?: string,
  ): Promise<number> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const balanceAfter = user.walletBalance + amount;
    await this.userRepository.updateWalletBalance(userId, balanceAfter);
    await this.walletTransactionRepository.create({
      userId,
      type: TransactionType.CREDIT,
      amount,
      description,
      challengeId,
      balanceAfter,
    });

    return balanceAfter;
  }

  getInitialBalance(): number {
    return INITIAL_WALLET_BALANCE;
  }
}
