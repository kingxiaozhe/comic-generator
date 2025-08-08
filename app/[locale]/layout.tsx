import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

function LocaleSync({ locale }: { locale: string }) {
  // 客户端同步 preferred_locale -> Cookie，并按需跳转
  if (typeof window !== "undefined") {
    try {
      const preferred = localStorage.getItem("preferred_locale");
      if (preferred && preferred !== locale) {
        document.cookie = `NEXT_LOCALE=${preferred}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`;
        const target = `/${preferred}${window.location.pathname.replace(
          /^\/(en|zh)/,
          ""
        )}`;
        if (window.location.pathname !== target) {
          window.location.replace(target);
        }
      }
    } catch (_) {}
  }
  return null;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 同步本地偏好语言 */}
            <LocaleSync locale={locale} />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
