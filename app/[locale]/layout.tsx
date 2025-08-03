import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const locale = params.locale;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
