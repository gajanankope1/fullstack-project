import { HistoryController } from "@/controllers/historyController";

const historyController = new HistoryController();

export async function GET() {
  return historyController.list();
}
