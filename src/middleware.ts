import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for the auth cookie
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value;
  const pathname = request.nextUrl.pathname;

  // Auth pages that logged-in users should not access
  const authPages = [
    "/user/signin",
    "/user/signup",
    "/frontend/pages/user/signin",
    "/frontend/pages/user/signup",
  ];
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(
      new URL("/frontend/pages/user/dashboard", request.url)
    );
  }

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/user/dashboard") ||
    pathname.startsWith("/frontend/pages/user/dashboard");

  // If not authenticated and trying to access protected routes, redirect to sign-in
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/user/signin", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    "/user/dashboard/:path*",
    "/user/signin",
    "/user/signup",
    "/frontend/pages/user/signin",
    "/frontend/pages/user/signup",
    "/frontend/pages/user/dashboard/:path*",
  ],
};
