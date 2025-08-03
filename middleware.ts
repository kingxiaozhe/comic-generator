import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  // 如果用户的语言环境不受支持，则重定向到默认语言环境
  localePrefix: "as-needed",
});

export const config = {
  // 匹配所有路径，但排除以下路径：
  // - /api/ (API routes)
  // - /_next/ (Next.js internals)
  // - /images/, /flags/ (static files)
  // - /favicon.ico, /sitemap.xml (static files)
  matcher: ["/((?!api|_next|images|flags|favicon.ico|sitemap.xml).*)"],
};
