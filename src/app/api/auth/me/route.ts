import { AuthController } from "@/controllers/authController";

const authController = new AuthController();

export async function GET() {
  return authController.me();
}
