import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname

  const protectedRoutes = ["/dashboard", "/profile"]

  const authRoutes = ["/login", "/register", "/forgot-password"]

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  const isAuthRoute = authRoutes.some((route) => path === route)

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/register", "/forgot-password"],
}

