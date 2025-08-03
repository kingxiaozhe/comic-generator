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
      question: "漫画生成器的技术原理是什么？",
      answer:
        "我们的漫画生成器采用双阶段AI生成架构。第一阶段使用大型语言模型（如QwQ-32B, GPT-4等）进行文本到漫画剧本的转换，通过精心设计的提示工程（Prompt Engineering）技术，将输入文本结构化为包含场景描述、人物动作和对白的剧本格式。第二阶段则采用扩散模型（Diffusion Model）技术，通过Volces ARK的doubao-seededit-3-0-i2i-250628模型将剧本转换为视觉呈现。系统采用无缝集成式API调用流程，确保两个阶段之间的数据传递高效准确。",
    },
    {
      question: "不同文本生成模型之间有什么具体区别？",
      answer:
        "我们提供的文本生成模型在推理速度、创意风格和专业领域上有显著差异：1）QwQ-32B是我们的旗舰模型，参数量达32B，擅长构建复杂叙事和细致刻画，但推理速度较慢；2）DeepSeek-7B参数量更小，推理速度是QwQ-32B的约3倍，但在细节描述上稍弱；3）GPT-3.5提供平衡的性能，特别适合对话场景；4）专业模型如StoryXL和ComicPro分别针对故事结构和漫画表现力进行了微调优化，在特定领域表现出色。选择模型时，建议根据您的具体需求（创作速度vs.质量）进行权衡。",
    },
    {
      question: "文本权重和种子数参数如何影响图像生成效果？",
      answer:
        "文本权重（guidance_scale）是控制生成图像与文本描述匹配程度的关键参数。技术上，它决定了扩散模型在采样过程中对条件（文本）的依赖程度。数值范围1.0-10.0，其中：1.0-2.0时模型更注重创造性但可能偏离文本；2.5-5.0是平衡区间；5.0-10.0时严格遵循文本但可能牺牲图像质量。种子数（seed）则是决定初始噪声模式的整数，范围为-1至2147483647，固定种子可在保持其他参数不变的情况下生成相似图像，这对于风格一致性和迭代修改特别有用。随机种子(-1)则每次生成完全不同的结果，适合探索多样创意。",
    },
    {
      question: "如何解决生成图像中的常见问题（手部变形、文字呈现等）？",
      answer:
        '生成图像中的常见技术问题及解决方案：1）手部变形问题 - 在剧本描述中明确指出"手部自然放置"或"手势清晰"，并适当提高文本权重至4.0-5.0；2）文字呈现 - 当前模型对于生成可读文字的能力有限，建议在剧本中将对话框描述为"包含文字的对话框"而非具体文字内容，后期可通过图像编辑添加；3）角色一致性 - 使用固定种子值并在每个场景描述中保持相同的角色描述关键词；4）背景细节不足 - 增加场景描述的具体细节，如"阳光透过窗帘的详细环境；5）风格不一致 - 在每个场景描述前统一添加风格标签如"漫画风格，线条清晰"。持续实验不同参数组合可以找到最适合您具体需求的配置。',
    },
    {
      question: "如何优化输入内容以获得最佳漫画生成效果？",
      answer:
        '输入优化技术指南：1）结构化叙事 - 使用清晰的起承转合结构，每个转折点应对应一个场景；2）场景密度控制 - 理想情况下每250-300字安排一个场景，确保内容既不过于密集也不过于稀疏；3）描述性语言 - 使用具象而非抽象描述，例如用"眉毛紧锁，双手颤抖"代替"感到紧张；4）角色一致性标记 - 为主要角色设置独特标识词并在全文保持一致；5）情感关键词强化 - 在情感转折处使用明确的情感关键词；6）环境元素前置 - 在描述角色行动前先建立环境背景；7）节奏变化指示 - 使用短句表示快节奏，长句表示慢节奏或情感深度；8）避免使用复杂隐喻或需要背景知识的引用。遵循这些技术规范可显著提升生成质量。',
    },
    {
      question: "图像生成的技术限制与最佳实践是什么？",
      answer:
        "当前图像生成的技术限制与应对策略：1）分辨率上限 - 系统支持的最大分辨率为2048x2048像素，超过此限制会导致细节损失；2）处理能力 - 复杂场景描述（超过200字）可能导致部分元素被忽略，建议拆分为多个简单场景；3）批量生成限制 - 单次最多支持8个场景同时生成，更多场景请分批处理；4）计算资源分配 - 生成过程利用GPU加速，系统会根据当前负载动态调整计算资源，高峰期可能导致等待时间延长；5）图像风格一致性 - 为保持连贯性，建议使用相同的种子值和文本权重；6）色彩控制 - 在场景描述中明确指定关键色彩元素；7）图像后处理 - 系统集成了自动后处理流程优化生成图像对比度和清晰度，如需原始输出可联系技术支持。理解这些技术限制并相应调整使用策略，可以显著提升输出质量。",
    },
    {
      question: "如何利用API集成漫画生成功能到自己的应用中？",
      answer:
        "我们提供完整的REST API以集成漫画生成功能：1）身份验证 - 使用基于JWT的身份验证系统，请通过开发者门户申请API密钥；2）端点结构 - 主要端点包括`/api/generate`（文本到剧本）和`/api/generate-images`（剧本到图像）；3）请求限制 - 免费账户每小时限制50次请求，付费账户根据套餐调整；4）批处理建议 - 使用批处理API而非多个单独请求以提高效率；5）错误处理 - 实现指数退避重试策略以处理临时性错误；6）缓存策略 - 实现结果缓存以避免重复生成相同内容；7）集成示例 - 可参考我们提供的Node.js、Python和Java实现示例；8）自定义扩展 - 高级用户可通过webhook在生成流程中注入自定义处理逻辑。完整API文档请访问开发者门户：https://api.comicgenerator.dev/docs",
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
            技术问答
          </h2>
          <p className="text-gray-600">
            深入了解漫画生成器的技术原理与高级功能
          </p>
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
                  <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                  {index === 6 && (
                    <div className="mt-3 text-xs text-indigo-600">
                      <a href="#" className="underline hover:text-indigo-800">
                        查看完整API文档 →
                      </a>
                    </div>
                  )}
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
