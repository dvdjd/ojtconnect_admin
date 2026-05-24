import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<NextResponse | null> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (payload as { role?: string }).role;

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // access granted
}
