import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const file = searchParams.get("file");
  const name = searchParams.get("name");

  if (!file) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  const mainAppUrl = process.env.MAIN_APP_INTERNAL_URL;
  if (!mainAppUrl) {
    return NextResponse.json({ error: "Download service not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({ file });
  if (name) params.set("name", name);

  const upstream = `${mainAppUrl}/download?${params.toString()}`;

  try {
    const response = await fetch(upstream);

    if (!response.ok) {
      return new NextResponse("File not found", { status: 404 });
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");

    if (contentType) headers.set("content-type", contentType);
    if (contentDisposition) headers.set("content-disposition", contentDisposition);

    return new NextResponse(response.body, { status: 200, headers });
  } catch {
    return new NextResponse("Failed to reach download service", { status: 502 });
  }
}
