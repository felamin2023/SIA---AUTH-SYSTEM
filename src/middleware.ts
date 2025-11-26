import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for the auth cookie
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value;

  // If not authenticated, redirect to the sign-in page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/user/signin", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: "/user/dashboard/:path*",
};
