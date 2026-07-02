import { handleControllerError } from "@/lib/api/handleError";
import { apiSuccess } from "@/lib/api/response";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/AppError";
import { getSession } from "@/lib/auth/session";
import {
  loginSchema,
  registerSchema,
} from "@/lib/validation/authSchemas";
import { AuthService } from "@/services/authService";

export class AuthController {
  private readonly authService = new AuthService();

  async register(request: Request) {
    try {
      const body = await request.json();
      const input = registerSchema.parse(body);
      const result = await this.authService.register(input);
      const response = apiSuccess("Registration successful", result.user, 201);
      response.cookies.set(AUTH_COOKIE_NAME, result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async login(request: Request) {
    try {
      const body = await request.json();
      const input = loginSchema.parse(body);
      const result = await this.authService.login(input);
      const response = apiSuccess("Login successful", result.user);
      response.cookies.set(AUTH_COOKIE_NAME, result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch (error) {
      return handleControllerError(error);
    }
  }

  async logout() {
    const response = apiSuccess("Logout successful", null);
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  async me() {
    try {
      const session = await getSession();

      if (!session) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await this.authService.getProfile(session.userId);
      return apiSuccess("Profile fetched successfully", user);
    } catch (error) {
      return handleControllerError(error);
    }
  }
}
