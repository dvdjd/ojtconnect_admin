import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ status: "success" });
  res.cookies.delete("token");
  return res;
}
