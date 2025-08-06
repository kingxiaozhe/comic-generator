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
  Dices,
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
  Key,
} from "lucide-react";
import { ComicPanel } from "@/lib/types";
import { ActivationModal } from "@/components/ActivationModal";
import { ActivationService } from "@/lib/activation";
import { UserSettingsService } from "@/lib/userSettings";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { useTranslations } from "next-intl";

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

// 模型分类将通过翻译函数动态获取
const getModelCategories = (t: any): ModelCategory[] => [
  { 
    id: "recommended", 
    name: t("models.categories.recommended.name"), 
    description: t("models.categories.recommended.description") 
  },
  {
    id: "specialized",
    name: t("models.categories.specialized.name"),
    description: t("models.categories.specialized.description"),
  },
  { 
    id: "fast", 
    name: t("models.categories.fast.name"), 
    description: t("models.categories.fast.description") 
  },
  { 
    id: "experimental", 
    name: t("models.categories.experimental.name"), 
    description: t("models.categories.experimental.description") 
  },
];

// 文本模型将通过翻译函数动态获取
const getTextModels = (t: any): TextModel[] => [
  // 推荐模型
  {
    id: "qwen_32b",
    name: t("models.list.qwen_32b.name"),
    description: t("models.list.qwen_32b.description"),
    tag: t("models.tags.recommended"),
    category: "recommended",
  },
  {
    id: "gpt_4",
    name: t("models.list.gpt_4.name"),
    description: t("models.list.gpt_4.description"),
    category: "recommended",
  },

  // 专业模型
  {
    id: "story_xl",
    name: t("models.list.story_xl.name"),
    description: t("models.list.story_xl.description"),
    tag: t("models.tags.professional"),
    category: "specialized",
  },
  {
    id: "comic_pro",
    name: t("models.list.comic_pro.name"),
    description: t("models.list.comic_pro.description"),
    tag: t("models.tags.professional"),
    category: "specialized",
  },
  {
    id: "fantasy_writer",
    name: t("models.list.fantasy_writer.name"),
    description: t("models.list.fantasy_writer.description"),
    category: "specialized",
  },

  // 快速模型
  {
    id: "deepseek_7b",
    name: t("models.list.deepseek_7b.name"),
    description: t("models.list.deepseek_7b.description"),
    tag: t("models.tags.fast"),
    category: "fast",
  },
  {
    id: "gpt_3_5",
    name: t("models.list.gpt_3_5.name"),
    description: t("models.list.gpt_3_5.description"),
    category: "fast",
  },
  {
    id: "llama_13b",
    name: t("models.list.llama_13b.name"),
    description: t("models.list.llama_13b.description"),
    category: "fast",
  },

  // 实验模型
  {
    id: "mixtral_8x7b",
    name: t("models.list.mixtral_8x7b.name"),
    description: t("models.list.mixtral_8x7b.description"),
    tag: t("models.tags.new"),
    category: "experimental",
  },
  {
    id: "claude_3",
    name: t("models.list.claude_3.name"),
    description: t("models.list.claude_3.description"),
    tag: t("models.tags.new"),
    category: "experimental",
  },
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

// 图片风格数据将在函数内部定义

export default function ComicGenerator() {
  const t = useTranslations();
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

  const getFaqData = (): FAQItem[] => [
    {
      question: t('faq.questions.principle'),
      answer: [
        {
          title: t('faq.answers.principle.title'),
          content: t('faq.answers.principle.content'),
          items: [
            {
              subtitle: t('faq.answers.principle.stage1.subtitle'),
              details: [
                t('faq.answers.principle.stage1.detail1'),
                t('faq.answers.principle.stage1.detail2'),
                t('faq.answers.principle.stage1.detail3'),
                t('faq.answers.principle.stage1.detail4'),
              ],
            },
            {
              subtitle: t('faq.answers.principle.stage2.subtitle'),
              details: [
                t('faq.answers.principle.stage2.detail1'),
                t('faq.answers.principle.stage2.detail2'),
                t('faq.answers.principle.stage2.detail3'),
                t('faq.answers.principle.stage2.detail4'),
              ],
            },
          ],
        },
      ],
    },
    {
      question: t('faq.questions.models'),
      answer: [
        {
          title: t('faq.answers.models.qwq32b.title'),
          content: t('faq.answers.models.qwq32b.content'),
          items: [
            t('faq.answers.models.qwq32b.detail1'),
            t('faq.answers.models.qwq32b.detail2'),
            t('faq.answers.models.qwq32b.detail3'),
            t('faq.answers.models.qwq32b.detail4'),
          ],
        },
        {
          title: t('faq.answers.models.deepseek7b.title'),
          content: t('faq.answers.models.deepseek7b.content'),
          items: [
            t('faq.answers.models.deepseek7b.detail1'),
            t('faq.answers.models.deepseek7b.detail2'),
            t('faq.answers.models.deepseek7b.detail3'),
            t('faq.answers.models.deepseek7b.detail4'),
          ],
        },
        {
          title: t('faq.answers.models.specialized.title'),
          content: t('faq.answers.models.specialized.content'),
          items: [
            t('faq.answers.models.specialized.detail1'),
            t('faq.answers.models.specialized.detail2'),
            t('faq.answers.models.specialized.detail3'),
            t('faq.answers.models.specialized.detail4'),
          ],
        },
      ],
    },
    {
      question: t('faq.questions.parameters'),
      answer: [
        {
          title: t('faq.answers.parameters.guidance_scale.title'),
          content: t('faq.answers.parameters.guidance_scale.content'),
          items: [
            {
              subtitle: t('faq.answers.parameters.guidance_scale.subtitle'),
              details: [
                t('faq.answers.parameters.guidance_scale.detail1'),
                t('faq.answers.parameters.guidance_scale.detail2'),
                t('faq.answers.parameters.guidance_scale.detail3'),
                t('faq.answers.parameters.guidance_scale.detail4'),
              ],
            },
          ],
        },
        {
          title: t('faq.answers.parameters.seed.title'),
          content: t('faq.answers.parameters.seed.content'),
          items: [
            {
              subtitle: t('faq.answers.parameters.seed.subtitle'),
              details: [
                t('faq.answers.parameters.seed.detail1'),
                t('faq.answers.parameters.seed.detail2'),
                t('faq.answers.parameters.seed.detail3'),
                t('faq.answers.parameters.seed.detail4'),
              ],
            },
          ],
        },
      ],
    },
    {
      question: t('faq.questions.optimization'),
      answer: [
        {
          title: t('faq.answers.optimization.hand.title'),
          content: t('faq.answers.optimization.hand.content'),
          items: [
            t('faq.answers.optimization.hand.detail1'),
            t('faq.answers.optimization.hand.detail2'),
            t('faq.answers.optimization.hand.detail3'),
            t('faq.answers.optimization.hand.detail4'),
          ],
        },
        {
          title: t('faq.answers.optimization.text.title'),
          content: t('faq.answers.optimization.text.content'),
          items: [
            t('faq.answers.optimization.text.detail1'),
            t('faq.answers.optimization.text.detail2'),
            t('faq.answers.optimization.text.detail3'),
            t('faq.answers.optimization.text.detail4'),
          ],
        },
        {
          title: t('faq.answers.optimization.character.title'),
          content: t('faq.answers.optimization.character.content'),
          items: [
            t('faq.answers.optimization.character.detail1'),
            t('faq.answers.optimization.character.detail2'),
            t('faq.answers.optimization.character.detail3'),
            t('faq.answers.optimization.character.detail4'),
          ],
        },
      ],
    },
    {
      question: t('faq.questions.structure'),
      answer: [
        {
          title: t('faq.answers.structure.composition.title'),
          content: t('faq.answers.structure.composition.content'),
          items: [
            t('faq.answers.structure.composition.item1'),
            t('faq.answers.structure.composition.item2'),
            t('faq.answers.structure.composition.item3'),
            t('faq.answers.structure.composition.item4'),
          ],
        },
        {
          title: t('faq.answers.structure.scene.title'),
          content: t('faq.answers.structure.scene.content'),
          items: [
            t('faq.answers.structure.scene.item1'),
            t('faq.answers.structure.scene.item2'),
            t('faq.answers.structure.scene.item3'),
            t('faq.answers.structure.scene.item4'),
          ],
        },
        {
          title: t('faq.answers.structure.transition.title'),
          content: t('faq.answers.structure.transition.content'),
          items: [
            t('faq.answers.structure.transition.item1'),
            t('faq.answers.structure.transition.item2'),
            t('faq.answers.structure.transition.item3'),
            t('faq.answers.structure.transition.item4'),
          ],
        },
      ],
    },
    {
      question: t('faq.questions.limitations'),
      answer: [
        {
          title: t('faq.answers.limitations.technical.title'),
          content: t('faq.answers.limitations.technical.content'),
          items: [
            t('faq.answers.limitations.technical.item1'),
            t('faq.answers.limitations.technical.item2'),
            t('faq.answers.limitations.technical.item3'),
            t('faq.answers.limitations.technical.item4'),
          ],
        },
        {
          title: t('faq.answers.limitations.performance.title'),
          content: t('faq.answers.limitations.performance.content'),
          items: [
            t('faq.answers.limitations.performance.item1'),
            t('faq.answers.limitations.performance.item2'),
            t('faq.answers.limitations.performance.item3'),
            t('faq.answers.limitations.performance.item4'),
          ],
        },
        {
          title: t('faq.answers.limitations.practices.title'),
          content: t('faq.answers.limitations.practices.content'),
          items: [
            t('faq.answers.limitations.practices.item1'),
            t('faq.answers.limitations.practices.item2'),
            t('faq.answers.limitations.practices.item3'),
            t('faq.answers.limitations.practices.item4'),
          ],
        },
      ],
    },
    {
      question: t('faq.questions.api_integration'),
      answer: [
        {
          title: t('faq.answers.api_integration.basics.title'),
          content: t('faq.answers.api_integration.basics.content'),
          items: [
            t('faq.answers.api_integration.basics.item1'),
            t('faq.answers.api_integration.basics.item2'),
            t('faq.answers.api_integration.basics.item3'),
            t('faq.answers.api_integration.basics.item4'),
          ],
        },
        {
          title: t('faq.answers.api_integration.endpoints.title'),
          content: t('faq.answers.api_integration.endpoints.content'),
          items: [
            t('faq.answers.api_integration.endpoints.item1'),
            t('faq.answers.api_integration.endpoints.item1'),
            t('faq.answers.api_integration.endpoints.item3'),
            t('faq.answers.api_integration.endpoints.item4'),
          ],
        },
        {
          title: t('faq.answers.api_integration.practices.title'),
          content: t('faq.answers.api_integration.practices.content'),
          items: [
            t('faq.answers.api_integration.practices.item1'),
            t('faq.answers.api_integration.practices.item2'),
            t('faq.answers.api_integration.practices.item3'),
            t('faq.answers.api_integration.practices.item4'),
          ],
        },
      ],
    },
  ];

  const faqData = getFaqData();

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
  const selectedModelInfo = getTextModels(t).find(
    (model) => model.id === selectedModel
  );

  // 图片风格选项
  const imageStyles = [
    { id: "anime", name: t('styles.anime.name'), description: t('styles.anime.description'), icon: "🎌", tag: "热门" },
    { id: "comic_book", name: t('styles.comic_book.name'), description: t('styles.comic_book.description'), icon: "💥", tag: "经典" },
    { id: "realistic", name: t('styles.realistic.name'), description: t('styles.realistic.description'), icon: "📸", tag: "写实" },
    { id: "cartoon", name: t('styles.cartoon.name'), description: t('styles.cartoon.description'), icon: "🎨", tag: "可爱" },
    { id: "sketch", name: t('styles.sketch.name'), description: t('styles.sketch.description'), icon: "✏️", tag: "艺术" },
    { id: "watercolor", name: t('styles.watercolor.name'), description: t('styles.watercolor.description'), icon: "🖌️", tag: "清新" },
  ];

  // 图片比例选项
  const aspectRatios = [
    { id: "1:1", label: t('ratios.1:1.name'), value: "1:1" },
    { id: "3:4", label: t('ratios.3:4.name'), value: "3:4" },
    { id: "4:3", label: t('ratios.4:3.name'), value: "4:3" },
    { id: "16:9", label: t('ratios.16:9.name'), value: "16:9" },
    { id: "9:16", label: t('ratios.9:16.name'), value: "9:16" },
  ];

  // 激活成功回调
  const handleActivationSuccess = () => {
    const info = ActivationService.getCurrentCodeInfo();
    if (info) {
      setActivationInfo(info);
    }
  };

  const handleFaqClick = () => {
    faqRef.current?.scrollIntoView({ behavior: "smooth" });
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
            <span className="font-bold text-gray-800">{t("nav.title")}</span>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                homeRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t("nav.home")}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
              <Tag className="w-4 h-4" />
              {t("nav.pricing")}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
              <BookOpen className="w-4 h-4" />
              {t("nav.guide")}
            </button>
            <Link href="/about">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                <Users className="w-4 h-4" />
                {t("nav.about")}
              </button>
            </Link>
            <button
              onClick={() =>
                faqRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              {t("nav.faq")}
            </button>
            <LanguageSwitcher />
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
            <span className="text-gray-800">{t("hero.title.prefix")}</span>
            <span className="text-blue-600">{t("hero.title.highlight")}</span>
            <span className="text-gray-800">{t("hero.title.suffix")}</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-6">
            {t("hero.description")}
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
                        {t("activation.title")}：{activationInfo.code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("activation.status.remaining", { count: activationInfo.remainingUses })}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {t("activation.status.empty")}
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
                  {activationInfo ? t('activation.button.change') : t('activation.button.activate')}
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
                  {t('input.label')}
                </label>
                <span
                  className={`text-sm ${
                    content.length > maxLength
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {t('input.remaining', { count: maxLength - content.length })}
                </span>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('input.placeholder')}
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
                  {t('input.sample')}
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
                        {t('models.title')}
                      </label>
                      {selectedModelInfo && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>{t('models.selected')}:</span>
                          <span className="font-medium text-blue-600">
                            {selectedModelInfo.name}
                          </span>
                          {selectedModelInfo.tag && (
                            <Badge
                              className={`ml-1.5 text-[10px] h-4 px-1.5 ${
                                selectedModelInfo.tag === t('models.tags.recommended')
                                  ? "bg-green-100 text-green-800"
                                  : selectedModelInfo.tag === t('models.tags.professional')
                                  ? "bg-indigo-100 text-indigo-800"
                                  : selectedModelInfo.tag === t('models.tags.new')
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
                      {getModelCategories(t).map((category) => (
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
                    {getModelCategories(t).find((c) => c.id === activeCategory)
                      ?.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          getModelCategories(t).find((c) => c.id === activeCategory)
                            ?.description
                        }
                      </p>
                    )}

                    {/* 模型列表 - 根据分类过滤 */}
                    <div className="space-y-4 mt-2">
                      <div className="h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {getTextModels(t)
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
                            getTextModels(t).filter(
                              (model) => model.category === activeCategory
                            ).length
                          }{" "}
                          {t('models.count', { count: getTextModels(t).filter(
                            (model) => model.category === activeCategory
                          ).length })}
                        </span>
                        <span>{t('models.selectHint')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 场景数量选择 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  {t('generation.result.sceneCount')}
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
                      {count}{t('generation.sceneUnit')}
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
                  {t('generation.imageStyle')}
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
                  {t('generation.selectedStyle')}
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
                      {t('generation.advancedSettings')}
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
                        {t('generation.guidanceScaleDescription')}
                      </p>

                      <div className="flex flex-col space-y-2 pl-7 pr-2">
                        <div className="flex justify-between text-xs text-indigo-400 px-1">
                          <span>{t('generation.creative')}</span>
                          <span>{t('generation.accurate')}</span>
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
                        {t('generation.seedDescription')}
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
                            {t('generation.random')}
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
                            {t('generation.fixed')}
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
                {t('generation.generateScript')}
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
                  {t('generation.scriptResult')}
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
                        {t('generation.scene')} {i + 1}
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
                                `${t('generation.scene')}${i + 1}`
                              )
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {t('generation.downloadImage')}
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
                              getTextModels(t).find((m) => m.id === selectedModel)
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
                        {t('generation.renderingImages')}...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 mr-2" />
                        {t('generation.renderHDComic')}
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {isGeneratingImages
                      ? t('generation.renderingComic')
                      : t('generation.willGenerateComic')}
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
                      {t('common.like')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t('common.comment')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Share className="w-4 h-4 mr-1" />
                      {t('common.share')}
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {t('common.success')}
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
            {t('faq.title')}
          </h2>
          <p className="text-gray-600">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4 mb-8 max-w-3xl mx-auto">
          {faqData.map((faq: FAQItem, index: number) => (
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
                  {faq.answer.map((section: FAQItem['answer'][0], sectionIndex: number) => (
                    <div key={sectionIndex} className="mb-6 last:mb-0">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {section.title}
                      </h4>
                      <p className="text-gray-600 mb-3">{section.content}</p>

                      {Array.isArray(section.items) &&
                      section.items.some((item) => typeof item === "object") ? (
                        // 处理包含子标题的项目
                         <div className="space-y-4">
                           {section.items.map((item: string | { subtitle: string; details: string[] }, itemIndex: number) => {
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
                                     {item.details.map((detail: string, detailIndex: number) => (
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
                           {section.items.map((item: string | { subtitle: string; details: string[] }, itemIndex: number) => (
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
              <span className="font-bold text-xl">{t('common.appName')}</span>
            </div>

            <p className="text-indigo-200 text-sm">
              © {new Date().getFullYear()} {t('common.copyright')}
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
