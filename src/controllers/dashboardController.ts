import { handleControllerError } from "@/lib/api/handleError";
import { apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/AppError";
import { DashboardService } from "@/services/dashboardService";
import { WalletService } from "@/services/walletService";

export class DashboardController {
  private readonly dashboardService = new DashboardService();

  async getDashboard() {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const dashboard = await this.dashboardService.getDashboard(
        session.userId,
      );

      return apiSuccess("Dashboard fetched successfully", dashboard);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}

export class WalletController {
  private readonly walletService = new WalletService();

  async getWallet() {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const balance = await this.walletService.getBalance(session.userId);
      return apiSuccess("Wallet fetched successfully", { balance });
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async getTransactions() {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const transactions = await this.walletService.getTransactions(
        session.userId,
      );

      return apiSuccess("Transactions fetched successfully", transactions);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}
