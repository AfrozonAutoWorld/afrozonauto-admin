import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role;

    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
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
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/operations/:path*"],
};
