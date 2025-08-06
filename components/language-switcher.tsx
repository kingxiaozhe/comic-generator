"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const LANGUAGE_NAMES = {
  en: "English",
  zh: "中文",
} as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const nextLocale = locale === "en" ? "zh" : "en";
    
    // 获取当前路径
    const currentPath = pathname;
    
    // 构建新的路径
    let newPath: string;
    
    if (currentPath === '/') {
      // 如果是根路径，直接跳转到对应语言
      newPath = `/${nextLocale}`;
    } else if (currentPath.startsWith(`/${locale}`)) {
      // 如果路径以当前locale开头，替换它
      newPath = currentPath.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      // 如果路径没有locale前缀，添加它
      newPath = `/${nextLocale}${currentPath}`;
    }
    
    // 确保路径有效
    if (newPath === '') {
      newPath = `/${nextLocale}`;
    }
    
    // 使用replace而不是push，避免历史记录问题
    router.push(newPath);
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
