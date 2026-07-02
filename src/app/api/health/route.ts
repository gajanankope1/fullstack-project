import { HealthController } from "@/controllers/healthController";

const healthController = new HealthController();

export async function GET() {
  return healthController.getHealth();
}
