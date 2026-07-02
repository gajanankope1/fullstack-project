import { connectDB } from "@/lib/db/mongoose";
import WalletTransaction, {
  IWalletTransaction,
  IWalletTransactionDocument,
} from "@/models/WalletTransaction";
import { TransactionType } from "@/types/enums";

export class WalletTransactionRepository {
  async create(data: {
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    challengeId?: string;
    balanceAfter: number;
  }): Promise<IWalletTransactionDocument> {
    await connectDB();
    return WalletTransaction.create(data);
  }

  async findByUserId(userId: string): Promise<IWalletTransaction[]> {
    await connectDB();
    return WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean<IWalletTransaction[]>();
  }
}
