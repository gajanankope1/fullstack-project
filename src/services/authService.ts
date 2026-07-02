import { AppError } from "@/lib/errors/AppError";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { RegisterInput, LoginInput } from "@/lib/validation/authSchemas";
import { UserRepository } from "@/repositories/userRepository";
import { WalletService } from "@/services/walletService";
import { TransactionType } from "@/types/enums";
import { WalletTransactionRepository } from "@/repositories/walletTransactionRepository";

export class AuthService {
  private readonly userRepository = new UserRepository();
  private readonly walletService = new WalletService();
  private readonly walletTransactionRepository =
    new WalletTransactionRepository();

  async register(input: RegisterInput) {
    const existingEmail = await this.userRepository.findByEmail(input.email);

    if (existingEmail) {
      throw new AppError("Email is already registered", 409);
    }

    const existingUsername = await this.userRepository.findByUsername(
      input.username,
    );

    if (existingUsername) {
      throw new AppError("Username is already taken", 409);
    }

    const initialBalance = this.walletService.getInitialBalance();
    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      username: input.username,
      email: input.email.toLowerCase(),
      passwordHash,
      walletBalance: initialBalance,
    });

    await this.walletTransactionRepository.create({
      userId: user._id.toString(),
      type: TransactionType.CREDIT,
      amount: initialBalance,
      description: "Initial wallet balance",
      balanceAfter: initialBalance,
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        walletBalance: user.walletBalance,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValidPassword = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        walletBalance: user.walletBalance,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      walletBalance: user.walletBalance,
    };
  }
}
