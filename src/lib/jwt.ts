import { jwtVerify, SignJWT, JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface MyJWT extends JWTPayload {
  id: number;
  username: string;
  role?: string | null;
}

export async function createJWT(payload: MyJWT) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}
