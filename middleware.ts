import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      if (path !== "/" && path !== "/login") {
        response.cookies.set("redirectAfterLogin", path, {
          path: "/",
          maxAge: 60 * 10,
        });
      }
      return response;
    }

    const role = token.role as UserRole | undefined;

    // Admin routes — accessible only by SUPER_ADMIN and OPERATIONS_ADMIN
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "OPERATIONS_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Operations routes are legacy; keep them mapped to the admin dashboard
    if (path.startsWith("/operations")) {
      if (role === "SUPER_ADMIN" || role === "OPERATIONS_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only protect /admin and /operations — let /login and / pass through freely
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login" || path === "/") return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/operations/:path*"],
};
