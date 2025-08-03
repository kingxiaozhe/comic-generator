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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* 导航栏 */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">漫画生成器</span>
            </div>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gray-800">用</span>
            <span className="text-blue-600">AI技术</span>
            <span className="text-gray-800">重新定义漫画创作</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            我们致力于将尖端人工智能技术与传统漫画艺术完美融合，为创作者提供无限可能
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
                  先进AI模型
                </h3>
                <p className="text-gray-600">
                  采用最新的深度学习技术，包括扩散模型和大规模语言模型，确保生成内容的高质量和创意性
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  强大技术架构
                </h3>
                <p className="text-gray-600">
                  基于Next.js和React打造的现代化Web应用，提供流畅的用户体验和快速的响应速度
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  安全可靠
                </h3>
                <p className="text-gray-600">
                  采用先进的安全措施和隐私保护技术，确保用户数据和创作内容的安全性
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心优势 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-gray-800">我们的</span>
            <span className="text-blue-600">核心优势</span>
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
                      强大的AI引擎
                    </h3>
                    <p className="text-gray-600">
                      自主研发的AI模型能够理解复杂的叙事结构，生成高质量的漫画内容，支持多种艺术风格
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
                      全球化视野
                    </h3>
                    <p className="text-gray-600">
                      支持多语言创作，融合东西方艺术风格，让创作不受地域限制
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
                      精准的内容生成
                    </h3>
                    <p className="text-gray-600">
                      独特的提示词优化系统，确保生成内容准确符合创作者的意图
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
                      持续创新
                    </h3>
                    <p className="text-gray-600">
                      定期更新AI模型，不断优化生成质量，始终保持技术领先优势
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
            <span className="text-gray-800">专业的</span>
            <span className="text-blue-600">技术团队</span>
          </h2>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-6">
                  我们的团队由AI研究员、软件工程师和漫画艺术家组成，拥有丰富的行业经验和专业知识。团队成员来自知名科技公司和研究机构，致力于将最新的AI技术应用于创意领域。
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700">AI研究</Badge>
                  <Badge className="bg-purple-100 text-purple-700">
                    深度学习
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    计算机视觉
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700">
                    漫画创作
                  </Badge>
                  <Badge className="bg-pink-100 text-pink-700">用户体验</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 联系我们 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gray-800">联系</span>
            <span className="text-blue-600">我们</span>
          </h2>

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-blue-200 text-blue-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              在线咨询
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-600">
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
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
              <span className="font-bold text-xl">漫画生成器</span>
            </div>

            <p className="text-indigo-200 text-sm">
              © {new Date().getFullYear()} 漫画生成器. 保留所有权利.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
