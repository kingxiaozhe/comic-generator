import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextResponse, NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 根路径强制跳转到 /en，并设置 Cookie
  if (pathname === "/") {
    const res = NextResponse.redirect(new URL("/en", req.url));
    res.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  // 访问带前缀路径时同步刷新 Cookie，再交给 next-intl 处理
  if (pathname.startsWith("/en")) {
    const res = NextResponse.next();
    res.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    // 只调用一次中间件
    return intlMiddleware(req) as NextResponse;
  }
  if (pathname.startsWith("/zh")) {
    const res = NextResponse.next();
    res.cookies.set("NEXT_LOCALE", "zh", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return intlMiddleware(req) as NextResponse;
  }

  return intlMiddleware(req) as NextResponse;
}

export const config = {
  matcher: ["/((?!api|_next|images|flags|favicon.ico|sitemap.xml).*)"],
};
