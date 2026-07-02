import { connectDB } from "@/lib/db/mongoose";
import Challenge, {
  IChallenge,
  IChallengeDocument,
} from "@/models/Challenge";
import { ChallengeStatus } from "@/types/enums";

export class ChallengeRepository {
  async create(data: {
    creatorId: string;
    startTime: Date;
    endTime: Date;
    entryAmount: number;
  }): Promise<IChallengeDocument> {
    await connectDB();
    return Challenge.create({
      ...data,
      status: ChallengeStatus.OPEN,
    });
  }

  async findById(id: string): Promise<IChallengeDocument | null> {
    await connectDB();
    return Challenge.findById(id).populate("creatorId", "username email");
  }

  async findOpenChallenges(): Promise<IChallenge[]> {
    await connectDB();
    return Challenge.find({ status: ChallengeStatus.OPEN })
      .sort({ startTime: 1 })
      .populate("creatorId", "username email")
      .lean<IChallenge[]>();
  }

  async findByStatuses(statuses: ChallengeStatus[]): Promise<IChallengeDocument[]> {
    await connectDB();
    return Challenge.find({ status: { $in: statuses } });
  }

  async findAll(): Promise<IChallenge[]> {
    await connectDB();
    return Challenge.find()
      .sort({ createdAt: -1 })
      .populate("creatorId", "username email")
      .lean<IChallenge[]>();
  }

  async updateById(
    id: string,
    data: Partial<IChallenge>,
  ): Promise<IChallengeDocument | null> {
    await connectDB();
    return Challenge.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }

  async findCompletedByCreatorId(creatorId: string): Promise<IChallenge[]> {
    await connectDB();
    return Challenge.find({
      creatorId,
      status: ChallengeStatus.COMPLETED,
    })
      .sort({ endTime: -1 })
      .populate("creatorId", "username email")
      .lean<IChallenge[]>();
  }

  async deleteById(id: string): Promise<void> {
    await connectDB();
    await Challenge.findByIdAndDelete(id);
  }
}
