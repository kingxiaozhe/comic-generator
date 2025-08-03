"use client";

import { useState, useRef, useEffect } from "react";
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
  Tag,
  BookOpen,
  Users,
  Key, // 添加Key图标
} from "lucide-react";
import { ComicPanel } from "@/lib/types";
import { ActivationModal } from "@/components/ActivationModal";
import { ActivationService } from "@/lib/activation";
import { UserSettingsService } from "@/lib/userSettings";
import Link from "next/link";

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

// 在文件顶部添加图片风格相关的类型定义

// 图片风格选项
type ImageStyle = {
  id: string;
  name: string;
  description: string;
  icon: string; // 可以用emoji或者图标
  tag?: string;
};

const imageStyles: ImageStyle[] = [
  {
    id: "anime",
    name: "日系动漫",
    description: "清新明亮的日式动漫风格",
    icon: "🎌",
    tag: "推荐",
  },
  {
    id: "comic-book",
    name: "美式漫画",
    description: "经典美漫风格，鲜明轮廓线",
    icon: "🦸",
    tag: "推荐",
  },
  {
    id: "watercolor",
    name: "水彩画风",
    description: "柔和的水彩效果，艺术感",
    icon: "🎨",
  },
  {
    id: "pixel-art",
    name: "像素艺术",
    description: "复古游戏风格的像素艺术",
    icon: "🎮",
  },
  {
    id: "chinese-painting",
    name: "中国水墨",
    description: "传统水墨画风格，意境深远",
    icon: "🖋️",
  },
  {
    id: "cartoon",
    name: "卡通风格",
    description: "简洁明快的现代卡通风格",
    icon: "😊",
  },
  {
    id: "cyberpunk",
    name: "赛博朋克",
    description: "未来主义，霓虹灯效果",
    icon: "🌃",
    tag: "新品",
  },
  {
    id: "sketch",
    name: "素描风格",
    description: "黑白线稿，简洁大方",
    icon: "✏️",
  },
];

export default function ComicGenerator() {
  const [content, setContent] = useState("");
  const [selectedCount, setSelectedCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageGenerationError, setImageGenerationError] = useState<
    string | null
  >(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [seedMode, setSeedMode] = useState<"random" | "fixed">("random"); // 默认为随机
  const [seedValue, setSeedValue] = useState<number>(1234);
  const [selectedModel, setSelectedModel] = useState<string>("qwen-32b"); // 默认使用QwQ-32B模型
  const [activeCategory, setActiveCategory] = useState<string>("recommended"); // 默认显示推荐模型
  const [isModelSectionExpanded, setIsModelSectionExpanded] = useState(false);
  const maxLength = 2000;
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);

  // 添加激活码相关状态
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationInfo, setActivationInfo] = useState<{
    code: string;
    remainingUses: number;
  } | null>(null);

  // 从UserSettingsService获取初始值
  const [sceneCount, setSceneCount] = useState<number>(
    () => UserSettingsService.getSettings().sceneCount
  );

  const [aspectRatio, setAspectRatio] = useState<string>(
    () => UserSettingsService.getSettings().aspectRatio
  );

  const [selectedStyle, setSelectedStyle] = useState<string>(
    () => UserSettingsService.getSettings().imageStyle
  );

  const [seed, setSeed] = useState<number>(
    () => UserSettingsService.getSettings().advancedSettings.seed
  );

  const [guidanceScale, setGuidanceScale] = useState<number>(
    () => UserSettingsService.getSettings().advancedSettings.guidanceScale
  );

  // 更新场景数量
  const handleSceneCountChange = (count: number) => {
    setSceneCount(count);
    setSelectedCount(count); // 同时更新selectedCount
    UserSettingsService.updateSetting("sceneCount", count);
  };

  // 更新图片比例
  const handleAspectRatioChange = (ratio: string) => {
    setAspectRatio(ratio);
    UserSettingsService.updateSetting("aspectRatio", ratio);
  };

  // 更新图片风格
  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    UserSettingsService.updateSetting("imageStyle", style);
  };

  // 更新种子值
  const handleSeedChange = (value: number) => {
    setSeed(value);
    setSeedValue(value); // 同时更新seedValue
    UserSettingsService.updateAdvancedSetting("seed", value);
  };

  // 更新引导比例
  const handleGuidanceScaleChange = (value: number) => {
    setGuidanceScale(value);
    UserSettingsService.updateAdvancedSetting("guidanceScale", value);
  };

  // 在useEffect中检查激活码状态
  useEffect(() => {
    const checkActivation = () => {
      if (ActivationService.hasActivatedCode()) {
        const info = ActivationService.getCurrentCodeInfo();
        if (info) {
          setActivationInfo(info);
        }
      }
    };

    checkActivation();
  }, []);

  // 处理导航点击，滚动到指定区域
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // FAQ数据类型定义
  interface FAQItem {
    question: string;
    answer: {
      title: string;
      content: string;
      items: (
        | string
        | {
            subtitle: string;
            details: string[];
          }
      )[];
    }[];
  }

  // FAQ数据
  const faqs: FAQItem[] = [
    {
      question: "漫画生成的技术原理是什么？",
      answer: [
        {
          title: "双阶段AI生成架构",
          content: "我们采用创新的双阶段生成架构，确保每个环节的输出质量：",
          items: [
            {
              subtitle: "第一阶段：文本理解与剧本生成",
              details: [
                "使用大型语言模型（QwQ-32B, GPT-4等）",
                "通过精心设计的Prompt Engineering",
                "将输入文本结构化为专业剧本格式",
                "包含场景描述、人物动作和对白",
              ],
            },
            {
              subtitle: "第二阶段：视觉内容生成",
              details: [
                "采用Volces ARK的doubao-seededit-3-0-i2i-250628扩散模型",
                "将剧本转换为高质量视觉呈现",
                "确保画面风格统一",
                "支持多种艺术风格",
              ],
            },
          ],
        },
        {
          title: "无缝集成式API调用",
          content: "系统采用先进的API调用流程，确保：",
          items: [
            "两个阶段之间的数据传递高效准确",
            "支持批量处理多个场景",
            "实时状态反馈",
            "错误自动重试机制",
          ],
        },
      ],
    },
    {
      question: "不同文本生成模型之间有什么具体区别？",
      answer: [
        {
          title: "QwQ-32B（旗舰模型）",
          content: "我们的主力模型，具有以下特点：",
          items: [
            "32B参数规模，理解能力强",
            "擅长复杂叙事和细节描写",
            "支持上下文关联理解",
            "生成质量最高，但推理速度较慢",
          ],
        },
        {
          title: "DeepSeek-7B（平衡型）",
          content: "性能与速度的最佳平衡：",
          items: [
            "7B参数规模，推理速度是QwQ-32B的约3倍",
            "适合快速原型生成",
            "质量适中，性价比高",
            "特别适合批量生成场景",
          ],
        },
        {
          title: "专业领域模型",
          content: "针对特定场景优化：",
          items: [
            "StoryXL：专注故事结构和情节发展",
            "ComicPro：优化漫画表现力和分镜设计",
            "支持风格迁移和场景重构",
            "可根据具体需求选择",
          ],
        },
      ],
    },
    {
      question: "文本权重和种子数参数如何影响图像生成效果？",
      answer: [
        {
          title: "文本权重（guidance_scale）",
          content:
            "控制生成图像与文本描述匹配程度的关键参数。技术上，它决定了扩散模型在采样过程中对条件（文本）的依赖程度。数值范围1.0-10.0，其中：1.0-2.0时模型更注重创造性但可能偏离文本；2.5-5.0是平衡区间；5.0-10.0时严格遵循文本但可能牺牲图像质量。种子数（seed）则是决定初始噪声模式的整数，范围为-1至2147483647，固定种子可在保持其他参数不变的情况下生成相似图像，这对于风格一致性和迭代修改特别有用。随机种子(-1)则每次生成完全不同的结果，适合探索多样创意。",
          items: [
            {
              subtitle: "数值范围：1.0-10.0",
              details: [
                "1.0-2.0：更注重创造性，可能偏离文本描述",
                "2.5-5.0：推荐区间，平衡创意与准确性",
                "5.0-10.0：严格遵循文本，可能影响画面自然度",
              ],
            },
          ],
        },
        {
          title: "种子数（seed）",
          content: "决定初始噪声模式：",
          items: [
            {
              subtitle: "取值范围：-1至2147483647",
              details: [
                "固定种子：相同参数下生成相似图像",
                "随机种子（-1）：每次生成全新结果",
                "适用于风格探索和迭代优化",
              ],
            },
          ],
        },
      ],
    },
    {
      question: "如何解决生成图像中的常见问题（手部变形、文字呈现等）？",
      answer: [
        {
          title: "手部细节优化",
          content: "针对手部变形问题的解决方案：",
          items: [
            '在描述中明确指出"手部自然放置"',
            "适当提高文本权重至4.0-5.0",
            "使用手部姿势关键词库",
            "必要时使用局部重绘功能",
          ],
        },
        {
          title: "文字呈现增强",
          content: "改善文字清晰度的技巧：",
          items: [
            '将对话框描述为"包含文字的对话框"',
            "避免在图像中直接生成复杂文字",
            "使用后期文字叠加功能",
            "保持文字区域留白",
          ],
        },
        {
          title: "角色一致性",
          content: "保持角色特征稳定的方法：",
          items: [
            "使用固定的种子值",
            "维护角色特征关键词列表",
            "在每个场景中复用角色描述",
            "使用角色模板功能",
          ],
        },
      ],
    },
    {
      question: "如何优化输入内容以获得最佳漫画生成效果？",
      answer: [
        {
          title: "结构化叙事",
          content: "优化故事结构的关键点：",
          items: [
            "使用清晰的起承转合结构",
            "每个转折点对应一个场景",
            "控制场景密度（250-300字/场景）",
            "保持叙事节奏的变化",
          ],
        },
        {
          title: "描述性语言增强",
          content: "提升描述质量的技巧：",
          items: [
            "使用具象而非抽象描述",
            "添加环境氛围细节",
            "包含人物情感表现",
            "注意光影和构图描述",
          ],
        },
        {
          title: "场景优化策略",
          content: "提高场景生成质量：",
          items: [
            "在描述角色行动前建立环境",
            "使用明确的情感关键词",
            "注意人物之间的互动",
            "考虑画面的景深层次",
          ],
        },
      ],
    },
    {
      question: "图像生成的技术限制与最佳实践是什么？",
      answer: [
        {
          title: "技术限制",
          content: "当前系统的主要限制：",
          items: [
            "最大分辨率：2048x2048像素",
            "单次最多支持8个场景同时生成",
            "复杂场景描述字数限制200字",
            "需要GPU资源支持",
          ],
        },
        {
          title: "性能优化",
          content: "提升生成效率的方法：",
          items: [
            "使用批量生成模式",
            "合理设置生成参数",
            "优化场景描述长度",
            "选择适合的模型",
          ],
        },
        {
          title: "最佳实践",
          content: "提高生成质量的建议：",
          items: [
            "保持风格一致性（使用相同种子）",
            "合理控制文本权重",
            "定期更新模型版本",
            "使用推荐的参数配置",
          ],
        },
      ],
    },
    {
      question: "如何利用API集成漫画生成功能到自己的应用中？",
      answer: [
        {
          title: "API集成基础",
          content: "基本集成步骤：",
          items: [
            "申请API密钥（开发者门户）",
            "了解API限制和配额",
            "选择合适的集成方式",
            "测试API连接",
          ],
        },
        {
          title: "核心API端点",
          content: "主要功能接口：",
          items: [
            "/api/generate：文本到剧本转换",
            "/api/generate-images：剧本到图像生成",
            "支持批量处理和异步调用",
            "提供详细的状态反馈",
          ],
        },
        {
          title: "最佳实践建议",
          content: "优化API使用：",
          items: [
            "实现请求重试机制",
            "使用结果缓存",
            "合理控制并发请求",
            "监控API使用情况",
          ],
        },
      ],
    },
  ];

  // 切换FAQ手风琴状态
  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const sampleArticle = `春天来了，小明走在回家的路上。突然，他发现路边有一只受伤的小猫。小明毫不犹豫地将小猫抱起，送到了附近的宠物医院。医生说小猫只是轻微擦伤，很快就能康复。从那天起，小明每天都会去医院看望小猫，直到它完全康复。`;

  // 修改handleGenerate函数，添加激活码检查
  const handleGenerate = async () => {
    // 检查激活码
    if (!ActivationService.hasActivatedCode()) {
      setShowActivationModal(true);
      return;
    }

    if (ActivationService.getRemainingUses() <= 0) {
      setError("激活码使用次数已用完，请使用新的激活码");
      return;
    }

    if (!content.trim()) {
      setError("请输入文章内容");
      return;
    }

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

      // 使用一次激活码
      if (ActivationService.useOnce()) {
        const updatedInfo = ActivationService.getCurrentCodeInfo();
        if (updatedInfo) {
          setActivationInfo(updatedInfo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成漫画时发生未知错误");
      console.error("生成漫画错误:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 在handleGenerateImages函数中使用aspectRatio
  const handleGenerateImages = async () => {
    if (comicPanels.length === 0) return;

    setIsGeneratingImages(true);
    setImageGenerationError(null);

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          panels: comicPanels,
          aspectRatio, // 使用aspectRatio替代selectedAspectRatio
          seed: seedMode === "random" ? -1 : seedValue,
          guidanceScale,
          style: selectedStyle, // 添加风格参数
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setComicPanels(data.panels);
    } catch (error: any) {
      console.error("Image generation error:", error);
      setImageGenerationError(error.message || "图像生成失败");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleDownloadImage = (
    imageUrl: string | undefined,
    sceneName: string
  ) => {
    if (!imageUrl) return;

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

  // 激活成功回调
  const handleActivationSuccess = () => {
    const info = ActivationService.getCurrentCodeInfo();
    if (info) {
      setActivationInfo(info);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* 导航栏 */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">智绘漫AI</span>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                scrollToRef(homeRef as React.RefObject<HTMLDivElement>)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              首页
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
              <Tag className="w-4 h-4" />
              定价
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
              <BookOpen className="w-4 h-4" />
              使用指南
            </button>
            <Link href="/about">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                <Users className="w-4 h-4" />
                关于我们
              </button>
            </Link>
            <button
              onClick={() =>
                scrollToRef(faqRef as React.RefObject<HTMLDivElement>)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              常见问题
            </button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              V20250803
            </Badge>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div ref={homeRef} className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gray-800">AI驱动的</span>
            <span className="text-blue-600">智能漫画</span>
            <span className="text-gray-800">创作引擎</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-6">
            智绘漫AI，用AI技术重新定义漫画创作，让创意无限可能
          </p>
        </div>

        {/* 激活码状态显示 */}
        <Card className="mb-8 border border-blue-100 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-blue-500" />
                <div>
                  {activationInfo ? (
                    <>
                      <p className="text-sm font-medium text-gray-800">
                        激活码：{activationInfo.code}
                      </p>
                      <p className="text-xs text-gray-500">
                        剩余使用次数：{activationInfo.remainingUses} 次
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      请输入激活码以开始使用
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activationInfo && (
                  <Badge
                    variant="secondary"
                    className={`${
                      activationInfo.remainingUses > 5
                        ? "bg-green-100 text-green-800"
                        : activationInfo.remainingUses > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {activationInfo.remainingUses} 次
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivationModal(true)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {activationInfo ? "更换激活码" : "输入激活码"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-8 border border-blue-100 shadow-md bg-white/90 backdrop-blur-sm">
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
                className="min-h-[120px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                maxLength={maxLength}
              />

              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillSample}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  试试示例文章
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card className="mb-8 border border-blue-100 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* 文本生成模型选择 - 折叠式设计 */}
              <div>
                {/* 模型选择器标题与折叠按钮 */}
                <button
                  type="button"
                  onClick={() =>
                    setIsModelSectionExpanded(!isModelSectionExpanded)
                  }
                  className="w-full flex items-center justify-between cursor-pointer rounded-xl p-4 transition-all duration-200 hover:bg-blue-50/50 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <label className="font-medium text-gray-800">
                        文本生成模型
                      </label>
                      {selectedModelInfo && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>已选择:</span>
                          <span className="font-medium text-blue-600">
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
                </button>

                {/* 展开后的完整模型选择区域 */}
                {isModelSectionExpanded && (
                  <div className="mt-2 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                    {/* 模型分类选择器 */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {modelCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // 防止冒泡触发折叠
                            setActiveCategory(category.id);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                            activeCategory === category.id
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-blue-50"
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
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  选择场景数量
                </label>

                <div className="flex gap-3 flex-wrap">
                  {[2, 4, 6, 8].map((count) => (
                    <Button
                      key={count}
                      type="button"
                      variant={selectedCount === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCount(count)}
                      className={`rounded-full px-6 ${
                        selectedCount === count
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
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
                      type="button"
                      variant={
                        aspectRatio === ratio.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleAspectRatioChange(ratio.value)}
                      className={`rounded-full px-4 ${
                        aspectRatio === ratio.value
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 图片风格选择 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  图片风格
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imageStyles.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        selectedStyle === style.id
                          ? "border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm"
                          : "border-gray-200 hover:border-purple-200 bg-white hover:bg-purple-50/30"
                      }`}
                    >
                      {style.tag && (
                        <div className="absolute -top-2 -right-2">
                          <Badge
                            className={`text-xs ${
                              style.tag === "推荐"
                                ? "bg-green-100 text-green-800"
                                : style.tag === "新品"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {style.tag}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              selectedStyle === style.id
                                ? "text-purple-700"
                                : "text-gray-700"
                            }`}
                          >
                            {style.name}
                          </span>
                          {selectedStyle === style.id && (
                            <Check className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 text-center">
                  选择的风格：
                  <span className="font-medium text-purple-600">
                    {imageStyles.find((s) => s.id === selectedStyle)?.name}
                  </span>
                </div>
              </div>

              {/* 高级设置部分 */}
              <div className="mt-2">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-all duration-200 ${
                    showAdvancedSettings
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                      : "bg-white/50 hover:bg-blue-50/80"
                  }`}
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full p-1.5 ${
                        showAdvancedSettings
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
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
        <div className="flex justify-center mt-8 mb-10">
          <Button
            onClick={handleGenerate}
            disabled={!content.trim() || isGenerating}
            size="lg"
            className="px-8 py-6 text-lg font-medium rounded-md bg-green-500 hover:bg-green-600 disabled:bg-gray-300 shadow-md flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                AI智能生成中...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                一键生成专业剧本
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="ml-4 px-8 py-6 text-lg font-medium rounded-md border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            探索高级功能
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
          <Card className="mb-8 border-0 shadow-md bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
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
              {/* 结果区域优化标题 */}
              <div className="mt-12 mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  AI智能创作成果
                </h2>
                <p className="text-gray-600">
                  以下是基于您的创意生成的专业级漫画剧本方案
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
                            {aspectRatio}
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
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          风格:{" "}
                          <span className="font-medium text-purple-600">
                            {
                              imageStyles.find((s) => s.id === selectedStyle)
                                ?.name
                            }
                          </span>
                        </span>
                      </div>
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
                        AI渲染图像中...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 mr-2" />
                        一键渲染高清漫画
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
      <div ref={faqRef} className="mt-16 pt-8 border-t border-blue-100">
        {/* FAQ标题优化 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-gray-800">专业</span>
            <span className="text-blue-600">技术解析</span>
          </h2>
          <p className="text-gray-600">
            深度了解我们的人工智能驱动引擎与前沿创作技术
          </p>
        </div>

        <div className="space-y-4 mb-8 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-blue-100 rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm"
            >
              <button
                className="w-full p-4 text-left flex justify-between items-center"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <span className="text-blue-500">
                  {activeAccordion === index ? (
                    <MinusCircle className="w-5 h-5" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                </span>
              </button>

              {activeAccordion === index && (
                <div className="p-4 pt-0 border-t border-blue-50 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                  {faq.answer.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6 last:mb-0">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {section.title}
                      </h4>
                      <p className="text-gray-600 mb-3">{section.content}</p>

                      {Array.isArray(section.items) &&
                      section.items.some((item) => typeof item === "object") ? (
                        // 处理包含子标题的项目
                        <div className="space-y-4">
                          {section.items.map((item, itemIndex) => {
                            if (
                              typeof item === "object" &&
                              "subtitle" in item
                            ) {
                              return (
                                <div key={itemIndex} className="pl-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    {item.subtitle}
                                  </h5>
                                  <ul className="list-disc list-inside space-y-1">
                                    {item.details.map((detail, detailIndex) => (
                                      <li
                                        key={detailIndex}
                                        className="text-gray-600 text-sm"
                                      >
                                        {detail}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        // 处理普通列表项
                        <ul className="list-disc list-inside space-y-1 pl-4">
                          {section.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-gray-600 text-sm"
                            >
                              {typeof item === "string" ? item : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">智绘漫AI</span>
            </div>

            <p className="text-indigo-200 text-sm">
              © {new Date().getFullYear()} 智绘漫AI. 保留所有权利.
            </p>
          </div>
        </div>
      </div>

      {/* 激活码模态框 */}
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSuccess={handleActivationSuccess}
      />
    </div>
  );
}
