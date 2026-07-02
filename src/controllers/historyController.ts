import { handleControllerError } from "@/lib/api/handleError";
import { apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/AppError";
import { HistoryService } from "@/services/historyService";

export class HistoryController {
  private readonly historyService = new HistoryService();

  async list() {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const history = await this.historyService.getHistory(session.userId);
      return apiSuccess("History fetched successfully", history);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}
