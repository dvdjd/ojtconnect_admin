import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export const config = {
  matcher: ["/dashboard/:path*"], // protect all routes under /dashboard
};

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/", req.url));

  const user = await verifyJWT(token);
  if (!user) return NextResponse.redirect(new URL("/", req.url));

  // Optionally attach user info to request headers
  const res = NextResponse.next();
  res.headers.set("x-user", JSON.stringify(user));

  return res;
}