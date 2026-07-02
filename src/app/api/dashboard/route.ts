import { DashboardController } from "@/controllers/dashboardController";

const dashboardController = new DashboardController();

export async function GET() {
  return dashboardController.getDashboard();
}
