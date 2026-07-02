import { apiError, apiSuccess } from "@/lib/api/response";
import { HealthService } from "@/services/healthService";

export class HealthController {
  private readonly healthService = new HealthService();

  async getHealth() {
    const health = await this.healthService.check();

    if (health.status === "ok") {
      return apiSuccess("Service is healthy", health);
    }

    return apiError("Service is unhealthy", 503, null, health);
  }
}
