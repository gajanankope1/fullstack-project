import { AuthController } from "@/controllers/authController";

const authController = new AuthController();

export async function POST() {
  return authController.logout();
}
