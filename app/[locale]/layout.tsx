import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

// 生成静态路由参数
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

// 元数据配置
export const metadata = {
  title: "AI漫画生成器",
  description: "使用AI技术，将你的创意转化为精彩的漫画剧本",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// 添加LocaleSync组件
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
  const { locale } = params;
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleSync locale={locale} />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
