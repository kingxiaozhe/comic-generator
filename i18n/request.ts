import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./index";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale: locale as string, // Type assertion since we've validated the locale
  };
});
