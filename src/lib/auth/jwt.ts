import { JWTPayload, SignJWT, jwtVerify } from "jose";

const JWT_EXPIRY = "7d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return new TextEncoder().encode(secret);
}

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  return {
    userId: String(payload.userId),
    email: String(payload.email),
    username: String(payload.username),
  };
}
