"use client";

import { useState, useRef } from "react";
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
  Sliders,
  Dices, // 替换 Dice 为 Dices
  SlidersHorizontal,
  ChevronsUpDown,
  Check,
  ChevronUp,
  Home,
  HelpCircle,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { ComicPanel } from "@/lib/types";

// 图片比例选项
type AspectRatio = {
  id: string;
  label: string;
  value: string; // 实际的宽高比值，如 "1:1"
};

// 文本生成模型选项
type TextModel = {
  id: string;
  name: string;
  description: string;
  tag?: string; // 可选标签，如"推荐"、"快速"等
  category: string; // 模型分类
};

// 模型分类
type ModelCategory = {
  id: string;
  name: string;
  description?: string;
};

const modelCategories: ModelCategory[] = [
  { id: "recommended", name: "推荐模型", description: "我们精选的高质量模型" },
  {
    id: "specialized",
    name: "专业模型",
    description: "针对特定领域优化的模型",
  },
  { id: "fast", name: "快速模型", description: "响应速度快，成本较低" },
  { id: "experimental", name: "实验模型", description: "新技术，可能有惊喜" },
];

const textModels: TextModel[] = [
  // 推荐模型
  {
    id: "qwen-32b",
    name: "QwQ-32B",
    description: "高质量剧本生成，细节丰富，逻辑连贯",
    tag: "推荐",
    category: "recommended",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "功能强大，擅长复杂剧情创作",
    category: "recommended",
  },

  // 专业模型
  {
    id: "story-xl",
    name: "StoryXL",
    description: "专为故事叙事优化，情节发展自然",
    tag: "专业",
    category: "specialized",
  },
  {
    id: "comic-pro",
    name: "ComicPro",
    description: "针对漫画场景和对白优化",
    tag: "专业",
    category: "specialized",
  },
  {
    id: "fantasy-writer",
    name: "奇幻创作家",
    description: "擅长创作魔幻、奇幻类故事",
    category: "specialized",
  },

  // 快速模型
  {
    id: "deepseek-7b",
    name: "DeepSeek-7B",
    description: "生成速度快，质量适中",
    tag: "快速",
    category: "fast",
  },
  {
    id: "gpt-3.5",
    name: "GPT-3.5",
    description: "平衡的选择，适合大多数场景",
    category: "fast",
  },
  {
    id: "llama-13b",
    name: "Llama-13B",
    description: "开源模型，速度快，资源占用少",
    category: "fast",
  },

  // 实验模型
  {
    id: "mixtral-8x7b",
    name: "Mixtral-8x7B",
    description: "混合专家模型，创意表现出色",
    tag: "新品",
    category: "experimental",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    description: "擅长长篇创意写作，风格多样",
    tag: "新品",
    category: "experimental",
  },
];

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
  const [selectedModel, setSelectedModel] = useState<string>("qwen-32b"); // 默认使用QwQ-32B模型
  const [activeCategory, setActiveCategory] = useState<string>("recommended"); // 默认显示推荐模型
  const [isModelSectionExpanded, setIsModelSectionExpanded] = useState(false);
  const maxLength = 2000;
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);

  // 处理导航点击，滚动到指定区域
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // FAQ数据
  const faqs = [
    {
      question: "漫画生成器是如何工作的？",
      answer:
        "我们的漫画生成器基于先进的AI文本和图像生成技术。首先，系统通过文本AI（如QwQ-32B）将您输入的内容转化为详细的漫画剧本，然后使用图像生成AI将剧本转换为精美的漫画图像。整个过程完全自动化，只需几分钟即可完成。",
    },
    {
      question: "我可以自定义生成的漫画样式吗？",
      answer:
        "是的，您可以通过多种方式自定义漫画样式。您可以选择不同的图片比例（如1:1、16:9等），调整文本权重（影响图像与文本描述的匹配程度），以及设置种子数（控制生成的随机性）。我们还提供了多种文本生成模型供您选择，每种模型有其独特的创作风格。",
    },
    {
      question: "生成的漫画可以用于商业用途吗？",
      answer:
        "生成的漫画作品的版权归您所有，您可以将其用于个人或商业用途。但请注意，如果您使用了他人的文字作为输入，需要确保您有权使用这些内容。此外，我们建议您在商业使用前，仔细检查并可能编辑AI生成的内容，以确保其质量和适用性。",
    },
    {
      question: "有哪些适合生成漫画的内容类型？",
      answer:
        "几乎任何类型的故事或创意都可以用于生成漫画。包括但不限于：短篇故事、童话、科幻故事、冒险故事、生活日常、教育内容等。短小精悍、情节清晰的内容通常能获得更好的结果。建议每次提交的文本保持在300-1000字左右，确保故事有明确的开端、发展和结尾。",
    },
    {
      question: "如何获得最佳的漫画生成效果？",
      answer:
        "为获得最佳效果，建议：(1) 提供具有明确场景和人物的描述；(2) 确保故事情节连贯且有逻辑；(3) 尝试不同的模型和设置组合；(4) 对于不满意的场景，可以使用刷新功能重新生成；(5) 调整文本权重可以控制生成图像与文本描述的匹配程度，数值越大匹配度越高。",
    },
  ];

  // 切换FAQ手风琴状态
  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

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
          model: selectedModel, // 添加模型参数
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

  // 获取当前选中的模型信息
  const selectedModelInfo = textModels.find(
    (model) => model.id === selectedModel
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* 导航栏 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">漫画生成器</span>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                scrollToRef(homeRef as React.RefObject<HTMLDivElement>)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              首页
            </button>
            <button
              onClick={() =>
                scrollToRef(faqRef as React.RefObject<HTMLDivElement>)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              常见问题
            </button>
            <Badge variant="secondary" className="bg-pink-100 text-pink-700">
              Beta
            </Badge>
          </div>
        </div>
      </div>

      <div ref={homeRef} className="max-w-4xl mx-auto px-4 py-8">
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
              {/* 文本生成模型选择 - 折叠式设计 */}
              <div>
                {/* 模型选择器标题与折叠按钮 */}
                <div
                  className="flex items-center justify-between cursor-pointer rounded-xl p-4 transition-all duration-200 hover:bg-white/80"
                  onClick={() =>
                    setIsModelSectionExpanded(!isModelSectionExpanded)
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-1.5">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <label className="font-medium text-gray-800">
                        文本生成模型
                      </label>
                      {selectedModelInfo && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>当前：</span>
                          <span className="font-medium text-purple-600">
                            {selectedModelInfo.name}
                          </span>
                          {selectedModelInfo.tag && (
                            <Badge
                              className={`ml-1.5 text-[10px] h-4 px-1.5 ${
                                selectedModelInfo.tag === "推荐"
                                  ? "bg-green-100 text-green-800"
                                  : selectedModelInfo.tag === "专业"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : selectedModelInfo.tag === "新品"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {selectedModelInfo.tag}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-500">
                    {isModelSectionExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* 展开后的完整模型选择区域 */}
                {isModelSectionExpanded && (
                  <div className="mt-2 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                    {/* 模型分类选择器 */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {modelCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={(e) => {
                            e.stopPropagation(); // 防止冒泡触发折叠
                            setActiveCategory(category.id);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                            activeCategory === category.id
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {activeCategory === category.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                          {category.name}
                        </button>
                      ))}
                    </div>

                    {/* 当前分类描述 */}
                    {modelCategories.find((c) => c.id === activeCategory)
                      ?.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          modelCategories.find((c) => c.id === activeCategory)
                            ?.description
                        }
                      </p>
                    )}

                    {/* 模型列表 - 根据分类过滤 */}
                    <div className="space-y-4 mt-2">
                      <div className="h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {textModels
                            .filter(
                              (model) => model.category === activeCategory
                            )
                            .map((model) => (
                              <div
                                key={model.id}
                                onClick={(e) => {
                                  e.stopPropagation(); // 防止冒泡触发折叠
                                  setSelectedModel(model.id);
                                }}
                                className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                  selectedModel === model.id
                                    ? "border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm"
                                    : "border-gray-100 hover:border-purple-200 bg-white/80 hover:bg-white"
                                }`}
                              >
                                {model.tag && (
                                  <div className="absolute -top-2 -right-2">
                                    <Badge
                                      className={`text-xs ${
                                        model.tag === "推荐"
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : model.tag === "专业"
                                          ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                          : model.tag === "新品"
                                          ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      }`}
                                    >
                                      {model.tag}
                                    </Badge>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <div
                                    className={`rounded-full p-1 ${
                                      selectedModel === model.id
                                        ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <Sparkles
                                      className={`w-3.5 h-3.5 ${
                                        selectedModel === model.id
                                          ? "text-white"
                                          : "text-gray-500"
                                      }`}
                                    />
                                  </div>
                                  <span
                                    className={`font-medium ${
                                      selectedModel === model.id
                                        ? "text-purple-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {model.name}
                                  </span>

                                  {/* 显示选中标记 */}
                                  {selectedModel === model.id && (
                                    <div className="ml-auto">
                                      <Check className="w-4 h-4 text-purple-500" />
                                    </div>
                                  )}
                                </div>

                                <p className="text-xs text-gray-500 mt-2 pl-6">
                                  {model.description}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* 模型数量和选择提示 */}
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>
                          当前分类共{" "}
                          {
                            textModels.filter(
                              (model) => model.category === activeCategory
                            ).length
                          }{" "}
                          个模型
                        </span>
                        <span>点击卡片选择模型</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 场景数量选择 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
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
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-blue-500" />
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
              <div className="mt-2">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-all duration-200 ${
                    showAdvancedSettings
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full p-1.5 ${
                        showAdvancedSettings
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Sliders
                        className={`w-4 h-4 ${
                          showAdvancedSettings ? "text-white" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-medium ${
                        showAdvancedSettings
                          ? "text-indigo-700"
                          : "text-gray-700"
                      }`}
                    >
                      高级设置
                    </span>
                  </div>
                  {showAdvancedSettings ? (
                    <ChevronDown className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showAdvancedSettings && (
                  <div className="mt-4 pt-2 pb-1 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm space-y-6 transition-all duration-300 ease-in-out">
                    {/* 文本权重设置 */}
                    <div className="space-y-3 py-3 border-b border-indigo-50">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                        </div>
                        <Label className="text-sm font-medium text-indigo-800">
                          文本权重
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 pl-7">
                        显示文字（创意描述）对结果图像的影响程度，数值越大图像越接近文字描述，数值越小图像可能更具创造性
                      </p>

                      <div className="flex flex-col space-y-2 pl-7 pr-2">
                        <div className="flex justify-between text-xs text-indigo-400 px-1">
                          <span>更具创造性</span>
                          <span>更贴近描述</span>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-full p-1">
                          <Slider
                            value={[guidanceScale]}
                            min={1}
                            max={10}
                            step={0.1}
                            onValueChange={(value) =>
                              setGuidanceScale(value[0])
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 px-1">
                          <span>1.0</span>
                          <span>10.0</span>
                        </div>
                        <div className="text-right text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                          {guidanceScale.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* 种子数设置 */}
                    <div className="space-y-3 py-1 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1.5">
                          <Dices className="w-3.5 h-3.5 text-white" />
                        </div>
                        <Label className="text-sm font-medium text-indigo-800">
                          种子数
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 pl-7">
                        用于物理定扩初始状态的基值，若随机种子相同并且其他参数相同，则生成图片大概率一致
                      </p>

                      <RadioGroup
                        value={seedMode}
                        onValueChange={(value) =>
                          setSeedMode(value as "random" | "fixed")
                        }
                        className="flex gap-4 pl-7 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="random"
                            id="random-seed"
                            className="text-indigo-600 border-indigo-400"
                          />
                          <Label
                            htmlFor="random-seed"
                            className="cursor-pointer text-sm text-indigo-700"
                          >
                            随机
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="fixed"
                            id="fixed-seed"
                            className="text-indigo-600 border-indigo-400"
                          />
                          <Label
                            htmlFor="fixed-seed"
                            className="cursor-pointer text-sm text-indigo-700"
                          >
                            固定
                          </Label>
                        </div>
                      </RadioGroup>

                      {seedMode === "fixed" && (
                        <div className="pl-7 mt-2">
                          <Input
                            type="number"
                            value={seedValue}
                            onChange={handleSeedValueChange}
                            min={-1}
                            max={2147483647}
                            className="max-w-[200px] border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300/20"
                          />
                        </div>
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
                  <div className="mb-4 bg-white/90 rounded-xl px-4 py-2 shadow-sm border border-pink-100">
                    <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          模型:{" "}
                          <span className="font-medium text-purple-600">
                            {
                              textModels.find((m) => m.id === selectedModel)
                                ?.name
                            }
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          图片比例:{" "}
                          <span className="font-medium text-blue-600">
                            {selectedAspectRatio}
                          </span>
                        </span>
                      </div>
                      {showAdvancedSettings && (
                        <>
                          <div className="flex items-center gap-1">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              文本权重:{" "}
                              <span className="font-medium text-indigo-600">
                                {guidanceScale.toFixed(1)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dices className="w-3.5 h-3.5 text-purple-500" />
                            <span>
                              种子数:{" "}
                              <span className="font-medium text-purple-600">
                                {seedMode === "random" ? "随机" : seedValue}
                              </span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
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

      {/* FAQ Section */}
      <div ref={faqRef} className="mt-16 pt-8 border-t border-pink-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            常见问题
          </h2>
          <p className="text-gray-600">关于漫画生成器的一些常见疑问解答</p>
        </div>

        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-pink-100 rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm"
            >
              <button
                className="w-full p-4 text-left flex justify-between items-center"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <span className="text-pink-500">
                  {activeAccordion === index ? (
                    <MinusCircle className="w-5 h-5" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                </span>
              </button>

              {activeAccordion === index && (
                <div className="p-4 pt-0 border-t border-pink-50 bg-gradient-to-br from-pink-50/30 to-orange-50/30">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>让每个人都能轻松将文字转化为视觉故事 💫</p>
        <div className="flex justify-center gap-4 mt-2">
          <button className="hover:text-pink-500 transition-colors">
            隐私政策
          </button>
          <button className="hover:text-pink-500 transition-colors">
            使用条款
          </button>
          <button className="hover:text-pink-500 transition-colors">
            联系我们
          </button>
        </div>
      </div>
    </div>
  );
}
