import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IParticipant {
  challengeId: Types.ObjectId;
  userId: Types.ObjectId;
  selectedCoinId?: string;
  selectedCoinSymbol?: string;
  startingPrice?: string;
  endingPrice?: string;
  percentageChange?: string;
  isWinner?: boolean;
  payout?: number;
  entryAmount: number;
  netProfitLoss?: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipantDocument extends IParticipant, Document {}

const participantSchema = new Schema<IParticipantDocument>(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    selectedCoinId: {
      type: String,
      trim: true,
    },
    selectedCoinSymbol: {
      type: String,
      trim: true,
    },
    startingPrice: {
      type: String,
      trim: true,
    },
    endingPrice: {
      type: String,
      trim: true,
    },
    percentageChange: {
      type: String,
      trim: true,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    payout: {
      type: Number,
      default: 0,
      min: 0,
    },
    entryAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    netProfitLoss: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

participantSchema.index({ challengeId: 1, userId: 1 }, { unique: true });

const Participant: Model<IParticipantDocument> =
  mongoose.models.Participant ??
  mongoose.model<IParticipantDocument>("Participant", participantSchema);

export default Participant;
