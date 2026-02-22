import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      if (path !== "/") {
        response.cookies.set("redirectAfterLogin", path, {
          path: "/",
          maxAge: 60 * 10, // 10 minutes
        });
      }
      return response;
    }

    const role = token.role;

    if (path === "/") {
      switch (role) {
        case "SUPER_ADMIN":
        case "ADMIN":
        case "BUYER":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        case "OPERATION":
          return NextResponse.redirect(
            new URL("/operations/dashboard", req.url),
          );
        default:
          return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Redirect authenticated users away from /login
    if (path === "/login") {
      switch (role) {
        case "SUPER_ADMIN":
        case "ADMIN":
        case "BUYER":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        case "OPERATION":
          return NextResponse.redirect(
            new URL("/operations/dashboard", req.url),
          );
      }
    }

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
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login") return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/operations/:path*"],
};
