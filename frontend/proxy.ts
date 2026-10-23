import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that strictly require user to be authenticated
const PROTECTED_ROUTES = ["/checker", "/medicines"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get("medbangla_token")?.value;

    // If no token cookie present, redirect immediately to landing page with auth trigger
    if (!token) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("auth", "login");
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checker/:path*", "/medicines/:path*"],
};
