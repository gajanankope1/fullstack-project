import { connectDB } from "@/lib/db/mongoose";
import User, { IUser, IUserDocument } from "@/models/User";

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    await connectDB();
    return User.find().select("-passwordHash").lean<IUser[]>();
  }

  async findById(id: string): Promise<IUserDocument | null> {
    await connectDB();
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    await connectDB();
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    await connectDB();
    return User.findOne({ username });
  }

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    walletBalance: number;
  }): Promise<IUserDocument> {
    await connectDB();
    return User.create(data);
  }

  async updateWalletBalance(
    userId: string,
    walletBalance: number,
  ): Promise<IUserDocument | null> {
    await connectDB();
    return User.findByIdAndUpdate(
      userId,
      { walletBalance },
      { returnDocument: "after" },
    );
  }
}
