import { connectDB } from "@/lib/db/mongoose";
import User, { IUser, IUserDocument } from "@/models/User";

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    await connectDB();
    return User.find().lean<IUser[]>();
  }

  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).lean<IUser | null>();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email }).lean<IUser | null>();
  }

  async create(data: Pick<IUser, "email" | "name">): Promise<IUserDocument> {
    await connectDB();
    return User.create(data);
  }
}
