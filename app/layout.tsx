import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智绘漫AI - AI驱动的智能漫画创作引擎",
  description: "智绘漫AI，用AI技术重新定义漫画创作，让创意无限可能",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
