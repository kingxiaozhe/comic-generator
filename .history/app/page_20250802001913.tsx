"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sparkles,
  ImageIcon,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Wand2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ComicPanel } from "@/lib/types";

// 图片比例选项
type AspectRatio = {
  id: string;
  label: string;
  value: string; // 实际的宽高比值，如 "1:1"
};

const aspectRatios: AspectRatio[] = [
  { id: "1:1", label: "1:1", value: "1:1" },
  { id: "3:4", label: "3:4", value: "3:4" },
  { id: "4:3", label: "4:3", value: "4:3" },
  { id: "16:9", label: "16:9", value: "16:9" },
  { id: "9:16", label: "9:16", value: "9:16" },
  { id: "2:3", label: "2:3", value: "2:3" },
  { id: "3:2", label: "3:2", value: "3:2" },
  { id: "21:9", label: "21:9", value: "21:9" },
  { id: "custom", label: "自定义", value: "custom" },
];

export default function ComicGenerator() {
  const [content, setContent] = useState("");
  const [selectedCount, setSelectedCount] = useState(4);
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState<string>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageGenerationError, setImageGenerationError] = useState<
    string | null
  >(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(2.5); // 默认值为2.5
  const [seedMode, setSeedMode] = useState<"random" | "fixed">("random"); // 默认为随机
  const [seedValue, setSeedValue] = useState<number>(1234);
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
        throw new Error(data.error || "生成漫画失败，请稍后再试");
      }

      setComicPanels(data.comicPanels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成漫画时发生未知错误");
      console.error("生成漫画错误:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImages = async () => {
    if (comicPanels.length === 0) return;

    setIsGeneratingImages(true);
    setImageGenerationError(null);

    // 确定要使用的种子值
    const seed = seedMode === "random" ? -1 : seedValue;

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comicPanels,
          aspectRatio: selectedAspectRatio,
          seed: seed,
          guidance_scale: guidanceScale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成漫画图片失败，请稍后再试");
      }

      // 更新面板，包含新的图像URL
      setComicPanels(data.comicPanels);
    } catch (err) {
      setImageGenerationError(
        err instanceof Error ? err.message : "生成漫画图片时发生未知错误"
      );
      console.error("生成漫画图片错误:", err);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, sceneName: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `漫画场景_${sceneName}.jpg`;
    a.click();
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

  const handleSeedValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // 确保值在合法范围内 [-1, 2147483647]
    if (!isNaN(value) && value >= -1 && value <= 2147483647) {
      setSeedValue(value);
    }
  };

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
          <p className="text-gray-600 text-lg mb-8">
            将你的文字变成精彩的漫画故事 ✨
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
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
            <div className="space-y-6">
              {/* 场景数量选择 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  选择场景数量
                </label>

                <div className="flex gap-3 flex-wrap">
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
                      {count}个场景
                    </Button>
                  ))}
                </div>
              </div>

              {/* 图片比例选择 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  图片比例
                </label>

                <div className="flex gap-3 flex-wrap">
                  {aspectRatios.map((ratio) => (
                    <Button
                      key={ratio.id}
                      variant={
                        selectedAspectRatio === ratio.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedAspectRatio(ratio.value)}
                      className={`rounded-full px-4 ${
                        selectedAspectRatio === ratio.value
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 高级设置部分 */}
              <div className="border-t border-gray-100 pt-4">
                <div
                  className="flex items-center cursor-pointer text-gray-700 hover:text-gray-900"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? (
                    <ChevronDown className="w-5 h-5 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-2" />
                  )}
                  <span className="font-medium">高级设置</span>
                </div>

                {showAdvancedSettings && (
                  <div className="mt-4 space-y-6 pl-2">
                    {/* 文本权重设置 */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          文本权重
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          显示文字（创意描述）对结果图像的影响程度，数值越大图像越接近文字描述，数值越小图像可能更具创造性
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="grid grid-cols-11 text-xs text-gray-500 px-2">
                          <div>1</div>
                          <div>2</div>
                          <div>3</div>
                          <div>4</div>
                          <div>5</div>
                          <div>6</div>
                          <div>7</div>
                          <div>8</div>
                          <div>9</div>
                          <div>10</div>
                        </div>
                        <Slider
                          value={[guidanceScale]}
                          min={1}
                          max={10}
                          step={0.1}
                          onValueChange={(value) => setGuidanceScale(value[0])}
                          className="w-full"
                        />
                        <div className="text-right text-sm text-blue-600 font-medium">
                          {guidanceScale.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* 种子数设置 */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          种子数
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          用于物理定扩初始状态的基值，若随机种子相同并且其他参数相同，则生成图片大概率一致
                        </p>
                      </div>

                      <RadioGroup
                        value={seedMode}
                        onValueChange={(value) =>
                          setSeedMode(value as "random" | "fixed")
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="random" id="random-seed" />
                          <Label
                            htmlFor="random-seed"
                            className="cursor-pointer"
                          >
                            随机
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed-seed" />
                          <Label
                            htmlFor="fixed-seed"
                            className="cursor-pointer"
                          >
                            固定
                          </Label>
                        </div>
                      </RadioGroup>

                      {seedMode === "fixed" && (
                        <Input
                          type="number"
                          value={seedValue}
                          onChange={handleSeedValueChange}
                          min={-1}
                          max={2147483647}
                          className="max-w-[200px]"
                        />
                      )}
                    </div>
                  </div>
                )}
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
                <Wand2 className="w-5 h-5 mr-2" />
                生成漫画剧本
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 shadow-lg shadow-red-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-red-500 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Image Generation Error Display */}
        {imageGenerationError && (
          <Card className="mb-8 border-red-200 shadow-lg shadow-red-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <p>{imageGenerationError}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="text-gray-600">正在创作漫画剧本...</p>
                <p className="text-sm text-gray-500">预计需要30秒</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {comicPanels.length > 0 && !isGenerating && (
          <Card className="border-0 shadow-lg shadow-pink-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  生成结果
                </h3>
                <p className="text-gray-600 text-sm">
                  以下是根据您的内容创作的漫画剧本
                </p>
              </div>

              <div className="space-y-8">
                {comicPanels.map((panel, i) => (
                  <div
                    key={panel.id}
                    className="bg-white rounded-xl shadow-md p-5 border border-pink-100"
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                        {i + 1}
                      </div>
                      <h4 className="font-medium text-gray-800">
                        场景 {i + 1}
                      </h4>
                    </div>

                    {/* 当有生成图片时显示图片 */}
                    {panel.imageUrl &&
                      panel.imageUrl.includes("http") &&
                      !panel.imageUrl.includes("placehold.co") && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={panel.imageUrl}
                            alt={`场景 ${i + 1}`}
                            className="w-full h-auto object-contain"
                          />
                          {panel.error && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {panel.error}
                            </p>
                          )}
                        </div>
                      )}

                    <div className="prose prose-pink max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {panel.content}
                      </p>
                    </div>

                    {/* 如果已生成图片，显示下载按钮 */}
                    {panel.imageUrl &&
                      panel.imageUrl.includes("http") &&
                      !panel.imageUrl.includes("placehold.co") && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-pink-200 text-pink-600"
                            onClick={() =>
                              handleDownloadImage(
                                panel.imageUrl,
                                `场景${i + 1}`
                              )
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            下载图片
                          </Button>
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* 统一的生成漫画按钮 */}
              <div className="mt-8 pt-6 border-t border-pink-100 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-600 mb-4 flex flex-wrap justify-center gap-2">
                    <span>
                      已选择图片比例:{" "}
                      <span className="font-medium text-blue-600">
                        {selectedAspectRatio}
                      </span>
                    </span>
                    {showAdvancedSettings && (
                      <>
                        <span>
                          · 文本权重:{" "}
                          <span className="font-medium text-blue-600">
                            {guidanceScale.toFixed(1)}
                          </span>
                        </span>
                        <span>
                          · 种子数:{" "}
                          <span className="font-medium text-blue-600">
                            {seedMode === "random" ? "随机" : seedValue}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={handleGenerateImages}
                    disabled={isGeneratingImages || comicPanels.length === 0}
                    size="lg"
                    className="px-12 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 disabled:opacity-70 shadow-lg shadow-orange-200"
                  >
                    {isGeneratingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 mr-2" />
                        根据剧本生成漫画
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {isGeneratingImages
                      ? "正在生成漫画图像，请稍候..."
                      : "将基于上述剧本内容生成完整的漫画图像"}
                  </p>
                </div>
              </div>

              {/* Social Actions */}
              <div className="mt-8 pt-6 border-t border-pink-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      喜欢
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      评论
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Share className="w-4 h-4 mr-1" />
                      分享
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
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
  );
}
