"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ImageIcon, Download, Eye, Heart, MessageCircle, Share } from "lucide-react"

export default function ComicGenerator() {
  const [content, setContent] = useState("")
  const [selectedCount, setSelectedCount] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const maxLength = 2000

  const sampleArticle = `春天来了，小明走在回家的路上。突然，他发现路边有一只受伤的小猫。小明毫不犹豫地将小猫抱起，送到了附近的宠物医院。医生说小猫只是轻微擦伤，很快就能康复。从那天起，小明每天都会去医院看望小猫，直到它完全康复。`

  const handleGenerate = async () => {
    if (!content.trim()) return

    setIsGenerating(true)
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false)
      setShowResults(true)
    }, 3000)
  }

  const fillSample = () => {
    setContent(sampleArticle)
  }

  const getGridLayout = (count: number) => {
    switch (count) {
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 4:
        return "grid-cols-2"
      case 6:
        return "grid-cols-2 md:grid-cols-3"
      case 8:
        return "grid-cols-2 md:grid-cols-4"
      default:
        return "grid-cols-2"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">漫画生成器</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-pink-100 text-pink-700">
              Beta
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            文章转漫画生成器
          </h1>
          <p className="text-gray-600 text-lg mb-8">将你的文字变成精彩的漫画故事 ✨</p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">输入你的文章内容</label>
                <span className={`text-sm ${content.length > maxLength ? "text-red-500" : "text-gray-500"}`}>
                  还可以输入 {maxLength - content.length} 字
                </span>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里输入你的文章内容，我们会将其转化为精美的漫画..."
                className="min-h-[120px] resize-none border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                maxLength={maxLength}
              />

              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillSample}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                >
                  试试示例文章
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card className="mb-8 border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">选择生成数量</label>

              <div className="flex gap-3">
                {[2, 4, 6, 8].map((count) => (
                  <Button
                    key={count}
                    variant={selectedCount === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCount(count)}
                    className={`rounded-full px-6 ${
                      selectedCount === count
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                        : "border-pink-200 text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    {count}张
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleGenerate}
            disabled={!content.trim() || isGenerating}
            size="lg"
            className="px-12 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 shadow-lg shadow-pink-200"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                生成中...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                生成漫画
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <Card className="mb-8 border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                <p className="text-gray-600">正在分析文章内容...</p>
                <p className="text-sm text-gray-500">预计需要30秒</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && (
          <Card className="border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">生成结果</h3>
                <p className="text-gray-600 text-sm">点击图片可查看大图，右键保存图片</p>
              </div>

              <div className={`grid ${getGridLayout(selectedCount)} gap-4`}>
                {Array.from({ length: selectedCount }, (_, i) => (
                  <div key={i} className="group relative aspect-square">
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-pink-300 mx-auto mb-2" />
                        <p className="text-sm text-pink-400">漫画 {i + 1}</p>
                      </div>
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="rounded-full">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-full">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Actions */}
              <div className="mt-8 pt-6 border-t border-pink-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600">
                      <Heart className="w-4 h-4 mr-1" />
                      喜欢
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      评论
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600">
                      <Share className="w-4 h-4 mr-1" />
                      分享
                    </Button>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    生成成功
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>让每个人都能轻松将文字转化为视觉故事 💫</p>
      </div>
    </div>
  )
}
