import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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

    const role = token.role;

    // Admin routes — accessible by SUPER_ADMIN, ADMIN, BUYER
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "BUYER") {
        if (role === "OPERATION") {
          return NextResponse.redirect(
            new URL("/operations/dashboard", req.url),
          );
        }
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Operations routes — accessible only by OPERATION
    if (path.startsWith("/operations")) {
      if (role !== "OPERATION") {
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "BUYER") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
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
