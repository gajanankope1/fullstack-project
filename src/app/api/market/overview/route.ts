import { MarketController } from "@/controllers/marketController";

const marketController = new MarketController();

export async function GET() {
  return marketController.getOverview();
}
