import { handleControllerError } from "@/lib/api/handleError";
import { apiSuccess } from "@/lib/api/response";
import { MarketService } from "@/services/marketService";

export class MarketController {
  private readonly marketService = new MarketService();

  async getOverview() {
    try {
      const overview = await this.marketService.getOverview();
      return apiSuccess("Market overview fetched successfully", overview);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}
