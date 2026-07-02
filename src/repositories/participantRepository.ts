import { connectDB } from "@/lib/db/mongoose";
import Participant, {
  IParticipant,
  IParticipantDocument,
} from "@/models/Participant";

export class ParticipantRepository {
  async create(data: {
    challengeId: string;
    userId: string;
  }): Promise<IParticipantDocument> {
    await connectDB();
    return Participant.create(data);
  }

  async findByChallengeAndUser(
    challengeId: string,
    userId: string,
  ): Promise<IParticipantDocument | null> {
    await connectDB();
    return Participant.findOne({ challengeId, userId });
  }

  async findByChallengeId(challengeId: string): Promise<IParticipant[]> {
    await connectDB();
    return Participant.find({ challengeId })
      .populate("userId", "username email")
      .lean<IParticipant[]>();
  }

  async findByUserId(userId: string): Promise<IParticipant[]> {
    await connectDB();
    return Participant.find({ userId })
      .sort({ joinedAt: -1 })
      .populate({
        path: "challengeId",
        populate: { path: "creatorId", select: "username email" },
      })
      .lean<IParticipant[]>();
  }

  async findActiveByUserId(userId: string): Promise<IParticipantDocument | null> {
    await connectDB();
    return Participant.findOne({ userId })
      .sort({ joinedAt: -1 })
      .populate({
        path: "challengeId",
        match: { status: { $in: ["OPEN", "ACTIVE"] } },
      });
  }

  async updateById(
    id: string,
    data: Partial<IParticipant>,
  ): Promise<IParticipantDocument | null> {
    await connectDB();
    return Participant.findByIdAndUpdate(id, data, { new: true });
  }

  async countByChallengeId(challengeId: string): Promise<number> {
    await connectDB();
    return Participant.countDocuments({ challengeId });
  }
}
