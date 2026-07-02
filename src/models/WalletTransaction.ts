import mongoose, { Document, Model, Schema, Types } from "mongoose";

import { TransactionType } from "@/types/enums";

export interface IWalletTransaction {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  challengeId?: Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransactionDocument extends IWalletTransaction, Document {}

const walletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const WalletTransaction: Model<IWalletTransactionDocument> =
  mongoose.models.WalletTransaction ??
  mongoose.model<IWalletTransactionDocument>(
    "WalletTransaction",
    walletTransactionSchema,
  );

export default WalletTransaction;
