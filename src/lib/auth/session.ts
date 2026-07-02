import { cookies } from "next/headers";

import { JwtPayload, verifyToken } from "@/lib/auth/jwt";

export const AUTH_COOKIE_NAME = "crypto_derby_token";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
