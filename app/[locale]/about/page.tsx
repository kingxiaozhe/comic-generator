"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  Rocket,
  Users,
  Target,
  Code,
  Shield,
  Cpu,
  Globe,
  MessageSquare,
  Mail,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* 导航栏 */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">{t("nav.title")}</span>
            </div>
          </Link>

          <Link href={`/${locale}`}>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Home className="w-4 h-4 mr-2" />
              {t("navigation.return")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gray-800">{t("hero.title.prefix")}</span>
            <span className="text-blue-600">{t("hero.title.highlight")}</span>
            <span className="text-gray-800">{t("hero.title.suffix")}</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            {t("hero.description")}
          </p>
        </div>

        {/* 技术实力展示 */}
        <Card className="mb-12 border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {t("features.aiModels.title")}
                </h3>
                <p className="text-gray-600">
                  {t("features.aiModels.description")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {t("features.architecture.title")}
                </h3>
                <p className="text-gray-600">
                  {t("features.architecture.description")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {t("features.security.title")}
                </h3>
                <p className="text-gray-600">
                  {t("features.security.description")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心优势 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-gray-800">
              {t("advantages.title.prefix")}
            </span>
            <span className="text-blue-600">
              {t("advantages.title.highlight")}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {t("advantages.powerful.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("advantages.powerful.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {t("advantages.global.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("advantages.global.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {t("advantages.precise.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("advantages.precise.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {t("advantages.innovation.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("advantages.innovation.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 团队介绍 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-gray-800">{t("team.title.prefix")}</span>
            <span className="text-blue-600">{t("team.title.highlight")}</span>
          </h2>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-6">{t("team.description")}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    {t("team.tags.ai")}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700">
                    {t("team.tags.deep")}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    {t("team.tags.vision")}
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700">
                    {t("team.tags.comic")}
                  </Badge>
                  <Badge className="bg-pink-100 text-pink-700">
                    {t("team.tags.experience")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 联系我们 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gray-800">{t("contact.title.prefix")}</span>
            <span className="text-blue-600">
              {t("contact.title.highlight")}
            </span>
          </h2>

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-blue-200 text-blue-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t("contact.online")}
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-600">
              <Mail className="w-4 h-4 mr-2" />
              {t("contact.email")}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{t("nav.title")}</span>
            </div>

            <p className="text-indigo-200 text-sm">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
