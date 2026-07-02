import { WalletController } from "@/controllers/dashboardController";

const walletController = new WalletController();

export async function GET() {
  return walletController.getWallet();
}
