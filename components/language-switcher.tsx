"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/use-toast";

const LANGUAGE_NAMES = {
  en: "English",
  zh: "中文",
} as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { toast } = useToast();

  const switchLanguage = () => {
    const nextLocale = locale === "en" ? "zh" : "en";

    const currentPath = pathname;
    let newPath: string;

    if (currentPath === "/") {
      newPath = `/${nextLocale}`;
    } else if (currentPath.startsWith(`/${locale}`)) {
      newPath = currentPath.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${currentPath}`;
    }

    // 本地存储 + Cookie（与中间件一致）
    try {
      localStorage.setItem("preferred_locale", nextLocale);
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${
        60 * 60 * 24 * 365
      }`;
    } catch (_) {}

    router.push(newPath);

    // 轻提示：语言偏好已保存
    toast({
      description: t("common.languageSaved", {
        default: "Language preference saved",
      }),
      duration: 1600,
    });
  };

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors transition-all duration-200 hover:shadow-sm"
      title={`切换到${LANGUAGE_NAMES[locale === "en" ? "zh" : "en"]}`}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {LANGUAGE_NAMES[locale === "en" ? "zh" : "en"]}
      </span>
    </button>
  );
}
