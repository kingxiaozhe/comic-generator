"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ImageIcon,
  RefreshCw,
  PlayIcon,
  Heart,
  MessageCircle,
  Share,
  Wand2,
} from "lucide-react";
import { ComicPanel } from "@/lib/types";

export default function ComicGenerator() {
  const [content, setContent] = useState("");
  const [selectedCount, setSelectedCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingScene, setIsRefreshingScene] = useState<number | null>(
    null
  );
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 2000;

  const sampleArticle = `春天来了，小明走在回家的路上。突然，他发现路边有一只受伤的小猫。小明毫不犹豫地将小猫抱起，送到了附近的宠物医院。医生说小猫只是轻微擦伤，很快就能康复。从那天起，小明每天都会去医院看望小猫，直到它完全康复。`;

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          count: selectedCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成漫画剧本失败，请稍后再试");
      }

      setComicPanels(data.comicPanels);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "生成漫画剧本时发生未知错误"
      );
      console.error("生成漫画剧本错误:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshScene = async (sceneIndex: number) => {
    if (!content.trim()) return;

    setIsRefreshingScene(sceneIndex);

    try {
      // 为单个场景生成新内容
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          count: 1, // 只生成一个场景
          sceneNumber: sceneIndex + 1, // 指定场景编号
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "刷新场景失败，请稍后再试");
      }

      // 更新指定场景的内容
      if (data.comicPanels && data.comicPanels.length > 0) {
        const updatedPanels = [...comicPanels];
        updatedPanels[sceneIndex] = {
          ...updatedPanels[sceneIndex],
          content: data.comicPanels[0].content,
        };
        setComicPanels(updatedPanels);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "刷新场景时发生未知错误");
    } finally {
      setIsRefreshingScene(null);
    }
  };

  const handleGenerateAllImages = () => {
    // 这里将来会实现生成所有场景图片的功能
    alert("此功能尚未实现：将根据所有场景提示词生成漫画图片");
  };

  const fillSample = () => {
    setContent(sampleArticle);
  };

  const getGridLayout = (count: number) => {
    switch (count) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 4:
        return "grid-cols-2";
      case 6:
        return "grid-cols-2 md:grid-cols-3";
      case 8:
        return "grid-cols-2 md:grid-cols-4";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            文章转漫画生成器
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            将你的文字变成精彩的漫画故事 ✨
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Input & Controls */}
          <div className="md:col-span-1 space-y-6">
            {/* Input Section */}
            <Card className="border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      输入你的文章内容或创意
                    </label>
                    <span
                      className={`text-sm ${
                        content.length > maxLength
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      还可以输入 {maxLength - content.length} 字
                    </span>
                  </div>

                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在这里输入你的故事内容或创意，我们会将其转化为精美的漫画剧本..."
                    className="min-h-[200px] resize-none border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
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
            <Card className="border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    选择场景数量
                  </label>

                  <div className="flex gap-3 flex-wrap">
                    {[2, 4, 6, 8].map((count) => (
                      <Button
                        key={count}
                        variant={
                          selectedCount === count ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCount(count)}
                        className={`rounded-full px-6 ${
                          selectedCount === count
                            ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                            : "border-pink-200 text-pink-600 hover:bg-pink-50"
                        }`}
                      >
                        {count}个场景
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                onClick={handleGenerate}
                disabled={!content.trim() || isGenerating}
                size="lg"
                className="w-full px-6 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 shadow-lg shadow-pink-200"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    生成漫画剧本
                  </>
                )}
              </Button>
            </div>

            {/* Generate All Images Button */}
            {comicPanels.length > 0 && (
              <Button
                onClick={handleGenerateAllImages}
                variant="outline"
                size="lg"
                className="w-full mt-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                根据剧本生成全部漫画
              </Button>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="md:col-span-2">
            {/* Error Display */}
            {error && (
              <Card className="mb-6 border-red-200 shadow-lg shadow-red-100/50 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <p className="text-red-500 text-center">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isGenerating && (
              <Card className="mb-6 border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white animate-spin" />
                      </div>
                    </div>
                    <p className="text-gray-600">正在创作漫画剧本...</p>
                    <p className="text-sm text-gray-500">预计需要30秒</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {comicPanels.length > 0 && !isGenerating && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  生成结果
                </h3>

                <div className="space-y-6">
                  {comicPanels.map((panel, i) => (
                    <Card
                      key={panel.id}
                      className="border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-pink-500 to-orange-500 py-3 px-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-white font-medium mr-2">
                              {i + 1}
                            </span>
                            <h4 className="text-white font-medium">
                              场景 {i + 1}
                            </h4>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => handleRefreshScene(i)}
                            disabled={isRefreshingScene !== null}
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                isRefreshingScene === i ? "animate-spin" : ""
                              }`}
                            />
                            <span className="ml-1">刷新</span>
                          </Button>
                        </div>

                        <div className="p-5">
                          <div className="prose prose-pink max-w-none">
                            <p className="whitespace-pre-wrap text-gray-700">
                              {panel.content}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-pink-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              生成此场景图片
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>让每个人都能轻松将文字转化为视觉故事 💫</p>
      </div>
    </div>
  );
}
