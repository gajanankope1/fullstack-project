import { AuthController } from "@/controllers/authController";

const authController = new AuthController();

export async function POST(request: Request) {
  return authController.register(request);
}
