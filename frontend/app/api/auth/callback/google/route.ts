import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // Forward query parameters (code, state, error, credential) to /auth/callback
  const targetUrl = new URL("/auth/callback", url.origin);
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });
  return NextResponse.redirect(targetUrl);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = new URL("/auth/callback", url.origin);
  try {
    const formData = await request.formData();
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        targetUrl.searchParams.set(key, value);
      }
    });
  } catch {
    // If not form data, proceed
  }
  return NextResponse.redirect(targetUrl);
}
