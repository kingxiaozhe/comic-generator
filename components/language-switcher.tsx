"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const nextLocale = locale === "zh" ? "en" : "zh";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLanguage}
      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
    >
      <Globe className="w-4 h-4" />
      {locale === "zh" ? "English" : "中文"}
    </Button>
  );
}
