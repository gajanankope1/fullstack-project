import { ChallengeHistoryService } from "@/services/challengeHistoryService";

export class HistoryService {
  private readonly challengeHistoryService = new ChallengeHistoryService();

  async getHistory(userId: string) {
    return this.challengeHistoryService.getUserHistory(userId);
  }
}
