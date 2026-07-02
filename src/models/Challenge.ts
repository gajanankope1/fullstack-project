import mongoose, { Document, Model, Schema, Types } from "mongoose";

import { ChallengeStatus } from "@/types/enums";

export interface IChallenge {
  creatorId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  entryAmount: number;
  status: ChallengeStatus;
  winningCoinId?: string;
  winningCoinSymbol?: string;
  winningPercentageChange?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallengeDocument extends IChallenge, Document {}

const challengeSchema = new Schema<IChallengeDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    entryAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(ChallengeStatus),
      default: ChallengeStatus.OPEN,
      index: true,
    },
    winningCoinId: {
      type: String,
      trim: true,
    },
    winningCoinSymbol: {
      type: String,
      trim: true,
    },
    winningPercentageChange: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const Challenge: Model<IChallengeDocument> =
  mongoose.models.Challenge ??
  mongoose.model<IChallengeDocument>("Challenge", challengeSchema);

export default Challenge;
