import { handleControllerError } from "@/lib/api/handleError";
import { apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/AppError";
import {
  createChallengeSchema,
  selectCoinSchema,
} from "@/lib/validation/challengeSchemas";
import { ChallengeService } from "@/services/challengeService";

export class ChallengeController {
  private readonly challengeService = new ChallengeService();

  async list() {
    try {
      const challenges = await this.challengeService.listChallenges();
      return apiSuccess("Challenges fetched successfully", challenges);
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async create(request: Request) {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const body = await request.json();
      const input = createChallengeSchema.parse(body);
      const challenge = await this.challengeService.createChallenge(
        session.userId,
        input,
      );

      return apiSuccess("Challenge created successfully", challenge, 201);
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async getById(challengeId: string) {
    try {
      const session = await getSession();
      const challenge = await this.challengeService.getChallengeById(
        challengeId,
        session?.userId,
      );
      return apiSuccess("Challenge fetched successfully", challenge);
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async join(challengeId: string) {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const result = await this.challengeService.joinChallenge(
        challengeId,
        session.userId,
      );

      return apiSuccess("Joined challenge successfully", result, 201);
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async selectCoin(challengeId: string, request: Request) {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const body = await request.json();
      const input = selectCoinSchema.parse(body);
      const result = await this.challengeService.selectCoin(
        challengeId,
        session.userId,
        input.coinId,
      );

      return apiSuccess("Coin selected successfully", result);
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async delete(challengeId: string) {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const result = await this.challengeService.deleteChallenge(
        challengeId,
        session.userId,
      );

      return apiSuccess("Challenge deleted successfully", result);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}
