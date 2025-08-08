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
  ClipboardCopy,
  Loader2,
  Copy,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { ComicPanel } from "@/lib/types";
import { ActivationModal } from "@/components/ActivationModal";
import { ActivationService } from "@/lib/activation";
import { UserSettingsService } from "@/lib/userSettings";
import Link from "next/link";
import { useLocale } from "next-intl";
import LanguageSwitcher from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { TemplateSelector } from "@/components/TemplateSelector";
import { getPromptTemplate } from "@/lib/prompts";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedSettings } from "@/components/AdvancedSettings";

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
    description: t("models.categories.recommended.description"),
  },
  {
    id: "specialized",
    name: t("models.categories.specialized.name"),
    description: t("models.categories.specialized.description"),
  },
  {
    id: "fast",
    name: t("models.categories.fast.name"),
    description: t("models.categories.fast.description"),
  },
  {
    id: "experimental",
    name: t("models.categories.experimental.name"),
    description: t("models.categories.experimental.description"),
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

// 自定义提示词配置
const buildCustomPrompt = (
  templateName: string,
  sceneCount: number,
  imageStyle: string
) => {
  const template = getPromptTemplate(templateName);
  return `
[创作设定]
- 总场景数：${sceneCount}张
- 图片风格：${imageStyle}
- 创作模板：${template.name}

[角色定位]
${template.commonIntro}

[创作理念]
${template.core}

[创作规范]
${template.outputRulesCommon}

[图片风格要求]
请在创作时特别注意以下风格要求：
1. 画面整体风格：${imageStyle}
2. 每个场景都要体现选定的风格特点
3. 构图和光影要符合${imageStyle}的特点
4. 人物表现要符合${imageStyle}的风格

[质量要求]
${template.qaChecklist}

[用户内容开始]
`;
};

interface GeneratedImage {
  url: string;
  index: number;
  variant?: number;
  generation_time?: string;
}

interface APISuccessResponse {
  success: boolean;
  images: Array<{
    url: string;
    index: number;
    generation_time: string;
  }>;
  metadata?: {
    prompt: string;
    timestamp: string;
  };
}

interface APIErrorResponse {
  error: string;
  details?: string;
  timestamp?: string;
}

type APIResponse = APISuccessResponse | APIErrorResponse;

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
  const [templateName, setTemplateName] = useState("comicMaster");
  const [imageStyle, setImageStyle] = useState("写实风格"); // 添加图片风格状态
  const [scriptContent, setScriptContent] = useState(""); // 添加整体剧本内容状态
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // 高级设置状态
  const [steps, setSteps] = useState(40);
  const [samplingMethod, setSamplingMethod] = useState("euler_a");
  const [styleStrength, setStyleStrength] = useState(0.8);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [clarity, setClarity] = useState(0.5);
  const [saturation, setSaturation] = useState(0.5);
  const [composition, setComposition] = useState("balanced");
  const [samplesPerScene, setSamplesPerScene] = useState(1);
  const [variationAmount, setVariationAmount] = useState(0.3);

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
      question: t("faq.questions.principle"),
      answer: [
        {
          title: t("faq.answers.principle.title"),
          content: t("faq.answers.principle.content"),
          items: [
            {
              subtitle: t("faq.answers.principle.stage1.subtitle"),
              details: [
                t("faq.answers.principle.stage1.detail1"),
                t("faq.answers.principle.stage1.detail2"),
                t("faq.answers.principle.stage1.detail3"),
                t("faq.answers.principle.stage1.detail4"),
              ],
            },
            {
              subtitle: t("faq.answers.principle.stage2.subtitle"),
              details: [
                t("faq.answers.principle.stage2.detail1"),
                t("faq.answers.principle.stage2.detail2"),
                t("faq.answers.principle.stage2.detail3"),
                t("faq.answers.principle.stage2.detail4"),
              ],
            },
          ],
        },
      ],
    },
    {
      question: t("faq.questions.models"),
      answer: [
        {
          title: t("faq.answers.models.qwq32b.title"),
          content: t("faq.answers.models.qwq32b.content"),
          items: [
            t("faq.answers.models.qwq32b.detail1"),
            t("faq.answers.models.qwq32b.detail2"),
            t("faq.answers.models.qwq32b.detail3"),
            t("faq.answers.models.qwq32b.detail4"),
          ],
        },
        {
          title: t("faq.answers.models.deepseek7b.title"),
          content: t("faq.answers.models.deepseek7b.content"),
          items: [
            t("faq.answers.models.deepseek7b.detail1"),
            t("faq.answers.models.deepseek7b.detail2"),
            t("faq.answers.models.deepseek7b.detail3"),
            t("faq.answers.models.deepseek7b.detail4"),
          ],
        },
        {
          title: t("faq.answers.models.specialized.title"),
          content: t("faq.answers.models.specialized.content"),
          items: [
            t("faq.answers.models.specialized.detail1"),
            t("faq.answers.models.specialized.detail2"),
            t("faq.answers.models.specialized.detail3"),
            t("faq.answers.models.specialized.detail4"),
          ],
        },
      ],
    },
    {
      question: t("faq.questions.parameters"),
      answer: [
        {
          title: t("faq.answers.parameters.guidance_scale.title"),
          content: t("faq.answers.parameters.guidance_scale.content"),
          items: [
            {
              subtitle: t("faq.answers.parameters.guidance_scale.subtitle"),
              details: [
                t("faq.answers.parameters.guidance_scale.detail1"),
                t("faq.answers.parameters.guidance_scale.detail2"),
                t("faq.answers.parameters.guidance_scale.detail3"),
                t("faq.answers.parameters.guidance_scale.detail4"),
              ],
            },
          ],
        },
        {
          title: t("faq.answers.parameters.seed.title"),
          content: t("faq.answers.parameters.seed.content"),
          items: [
            {
              subtitle: t("faq.answers.parameters.seed.subtitle"),
              details: [
                t("faq.answers.parameters.seed.detail1"),
                t("faq.answers.parameters.seed.detail2"),
                t("faq.answers.parameters.seed.detail3"),
                t("faq.answers.parameters.seed.detail4"),
              ],
            },
          ],
        },
      ],
    },
    {
      question: t("faq.questions.optimization"),
      answer: [
        {
          title: t("faq.answers.optimization.hand.title"),
          content: t("faq.answers.optimization.hand.content"),
          items: [
            t("faq.answers.optimization.hand.detail1"),
            t("faq.answers.optimization.hand.detail2"),
            t("faq.answers.optimization.hand.detail3"),
            t("faq.answers.optimization.hand.detail4"),
          ],
        },
        {
          title: t("faq.answers.optimization.text.title"),
          content: t("faq.answers.optimization.text.content"),
          items: [
            t("faq.answers.optimization.text.detail1"),
            t("faq.answers.optimization.text.detail2"),
            t("faq.answers.optimization.text.detail3"),
            t("faq.answers.optimization.text.detail4"),
          ],
        },
        {
          title: t("faq.answers.optimization.character.title"),
          content: t("faq.answers.optimization.character.content"),
          items: [
            t("faq.answers.optimization.character.detail1"),
            t("faq.answers.optimization.character.detail2"),
            t("faq.answers.optimization.character.detail3"),
            t("faq.answers.optimization.character.detail4"),
          ],
        },
      ],
    },
    {
      question: t("faq.questions.structure"),
      answer: [
        {
          title: t("faq.answers.structure.composition.title"),
          content: t("faq.answers.structure.composition.content"),
          items: [
            t("faq.answers.structure.composition.item1"),
            t("faq.answers.structure.composition.item2"),
            t("faq.answers.structure.composition.item3"),
            t("faq.answers.structure.composition.item4"),
          ],
        },
        {
          title: t("faq.answers.structure.scene.title"),
          content: t("faq.answers.structure.scene.content"),
          items: [
            t("faq.answers.structure.scene.item1"),
            t("faq.answers.structure.scene.item2"),
            t("faq.answers.structure.scene.item3"),
            t("faq.answers.structure.scene.item4"),
          ],
        },
        {
          title: t("faq.answers.structure.transition.title"),
          content: t("faq.answers.structure.transition.content"),
          items: [
            t("faq.answers.structure.transition.item1"),
            t("faq.answers.structure.transition.item2"),
            t("faq.answers.structure.transition.item3"),
            t("faq.answers.structure.transition.item4"),
          ],
        },
      ],
    },
    {
      question: t("faq.questions.limitations"),
      answer: [
        {
          title: t("faq.answers.limitations.technical.title"),
          content: t("faq.answers.limitations.technical.content"),
          items: [
            t("faq.answers.limitations.technical.item1"),
            t("faq.answers.limitations.technical.item2"),
            t("faq.answers.limitations.technical.item3"),
            t("faq.answers.limitations.technical.item4"),
          ],
        },
        {
          title: t("faq.answers.limitations.performance.title"),
          content: t("faq.answers.limitations.performance.content"),
          items: [
            t("faq.answers.limitations.performance.item1"),
            t("faq.answers.limitations.performance.item2"),
            t("faq.answers.limitations.performance.item3"),
            t("faq.answers.limitations.performance.item4"),
          ],
        },
        {
          title: t("faq.answers.limitations.practices.title"),
          content: t("faq.answers.limitations.practices.content"),
          items: [
            t("faq.answers.limitations.practices.item1"),
            t("faq.answers.limitations.practices.item2"),
            t("faq.answers.limitations.practices.item3"),
            t("faq.answers.limitations.practices.item4"),
          ],
        },
      ],
    },
    {
      question: t("faq.questions.api_integration"),
      answer: [
        {
          title: t("faq.answers.api_integration.basics.title"),
          content: t("faq.answers.api_integration.basics.content"),
          items: [
            t("faq.answers.api_integration.basics.item1"),
            t("faq.answers.api_integration.basics.item2"),
            t("faq.answers.api_integration.basics.item3"),
            t("faq.answers.api_integration.basics.item4"),
          ],
        },
        {
          title: t("faq.answers.api_integration.endpoints.title"),
          content: t("faq.answers.api_integration.endpoints.content"),
          items: [
            t("faq.answers.api_integration.endpoints.item1"),
            t("faq.answers.api_integration.endpoints.item1"),
            t("faq.answers.api_integration.endpoints.item3"),
            t("faq.answers.api_integration.endpoints.item4"),
          ],
        },
        {
          title: t("faq.answers.api_integration.practices.title"),
          content: t("faq.answers.api_integration.practices.content"),
          items: [
            t("faq.answers.api_integration.practices.item1"),
            t("faq.answers.api_integration.practices.item2"),
            t("faq.answers.api_integration.practices.item3"),
            t("faq.answers.api_integration.practices.item4"),
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

  // 组装完整内容
  const buildFullContent = (userContent: string) => {
    const prompt = buildCustomPrompt(templateName, selectedCount, imageStyle);
    return `
        ${prompt}
        ${userContent}
        [用户内容结束]
    `;
  };

  // 修改handleGenerate函数，添加激活码检查
  const handleGenerate = async () => {
    // 检查激活码
    if (!ActivationService.hasActivatedCode()) {
      setShowActivationModal(true);
      return;
    }

    if (ActivationService.getRemainingUses() <= 0) {
      setError(t("activation.status.remaining", { count: 0 }));
      return;
    }

    if (!content.trim()) {
      setError(t("input.label"));
      return;
    }

    setIsGenerating(true);
    setError(null);

    console.log(`content=>${buildFullContent(content)}`);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: buildFullContent(content),
          count: selectedCount,
          model: selectedModel, // 添加模型参数
          templateName, // 添加模板名称
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("generation.error"));
      }

      // 将所有场景内容合并成一个整体
      if (Array.isArray(data.comicPanels)) {
        const fullScript = data.comicPanels
          .sort(
            (a: ComicPanel, b: ComicPanel) =>
              (a.sceneNumber || 0) - (b.sceneNumber || 0)
          )
          .map((panel: ComicPanel) => panel.content)
          .join("\n\n");

        setScriptContent(fullScript);
      }

      // 使用一次激活码
      if (ActivationService.useOnce()) {
        const updatedInfo = ActivationService.getCurrentCodeInfo();
        if (updatedInfo) {
          setActivationInfo(updatedInfo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generation.error"));
      console.error("生成漫画错误:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理生成图片
  const handleGenerateImages = async () => {
    if (!scriptContent) {
      setImageGenerationError("请先生成剧本内容");
      return;
    }

    setIsGeneratingImages(true);
    setImageGenerationError(null);

    try {
      // 从剧本中提取场景
      const sceneRegex = /场景：([\s\S]*?)(?=场景：|$)/g;
      let match;
      const scenes = [];
      let sceneNumber = 1;

      // 提取所有"场景："开头的部分
      while ((match = sceneRegex.exec(scriptContent)) !== null) {
        const fullSceneContent = match[0].trim();
        if (fullSceneContent) {
          scenes.push({
            number: sceneNumber++,
            content: fullSceneContent,
          });
        }
      }

      // 如果没有找到场景，尝试按段落分割
      if (scenes.length === 0) {
        const paragraphs = scriptContent
          .split(/\n\s*\n/)
          .filter((p) => p.trim())
          .map((p, idx) => ({
            number: idx + 1,
            content: p.trim(),
          }));

        if (paragraphs.length > 0) {
          scenes.push(...paragraphs);
        }
      }

      console.log(`从剧本中提取了 ${scenes.length} 个场景:`, scenes);

      if (scenes.length === 0) {
        throw new Error("无法从剧本中提取场景，请检查剧本格式");
      }

      const allImages: GeneratedImage[] = [];

      // 为每个场景生成图片
      for (const scene of scenes) {
        const sceneNumber = scene.number;
        const sceneContent = scene.content;

        console.log(`处理场景 ${sceneNumber}:`, {
          content: sceneContent.substring(0, 100) + "...",
          style: imageStyle,
        });

        const response = await fetch("/api/generate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: sceneContent,
            style: imageStyle,
            steps,
            samplingMethod,
            styleStrength,
            negativePrompt,
            clarity,
            saturation,
            composition,
            samplesPerScene: 2,
            variationAmount,
          }),
        });

        const data = (await response.json()) as APIResponse;

        if (!response.ok) {
          console.error(`场景 ${sceneNumber} 生成失败:`, data);
          const errorData = data as APIErrorResponse;
          throw new Error(
            errorData.error ||
              errorData.details ||
              `场景 ${sceneNumber} 生成失败`
          );
        }

        const successData = data as APISuccessResponse;
        if (!successData.images || !Array.isArray(successData.images)) {
          throw new Error(`场景 ${sceneNumber} 返回数据格式错误`);
        }

        // 为每个图片添加场景编号
        const sceneImages = successData.images.map(
          (img: GeneratedImage, idx: number) => ({
            ...img,
            index: sceneNumber,
            variant: idx + 1,
          })
        );

        allImages.push(...sceneImages);
        console.log(
          `场景 ${sceneNumber} 生成完成，获得 ${sceneImages.length} 张图片`
        );
      }

      // 按场景编号排序
      allImages.sort((a, b) => a.index - b.index);

      console.log(`所有场景生成完成，共 ${allImages.length} 张图片`);
      setGeneratedImages(allImages);
    } catch (error: any) {
      console.error("图片生成错误:", error);
      setImageGenerationError(
        error.message || "生成图片时发生错误，请检查网络连接或稍后重试"
      );
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // 格式化文件名
  const formatFileName = (index: number, style: string) => {
    const date = new Date().toISOString().split("T")[0];
    return `AI漫画_${style}_场景${index}_${date}.png`;
  };

  // 下载单张图片
  const handleDownloadImage = async (image: GeneratedImage) => {
    try {
      const link = document.createElement("a");
      link.href = image.url;
      link.download = formatFileName(image.index, imageStyle);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`场景 ${image.index} 下载成功`);
    } catch (error) {
      toast.error(`下载失败: ${error}`);
    }
  };

  // 下载所有图片
  const handleDownloadAll = async () => {
    toast.info(`开始下载 ${generatedImages.length} 张图片...`);

    generatedImages.forEach((image, idx) => {
      setTimeout(() => {
        handleDownloadImage(image);
      }, idx * 800); // 增加延迟时间，避免浏览器阻止
    });
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
    {
      id: "anime",
      name: t("styles.anime.name"),
      description: t("styles.anime.description"),
      icon: "🎌",
      tag: "hot",
    },
    {
      id: "comic_book",
      name: t("styles.comic_book.name"),
      description: t("styles.comic_book.description"),
      icon: "💥",
      tag: "classic",
    },
    {
      id: "realistic",
      name: t("styles.realistic.name"),
      description: t("styles.realistic.description"),
      icon: "📸",
      tag: "realistic",
    },
    {
      id: "cartoon",
      name: t("styles.cartoon.name"),
      description: t("styles.cartoon.description"),
      icon: "🎨",
      tag: "cute",
    },
    {
      id: "sketch",
      name: t("styles.sketch.name"),
      description: t("styles.sketch.description"),
      icon: "✏️",
      tag: "art",
    },
    {
      id: "watercolor",
      name: t("styles.watercolor.name"),
      description: t("styles.watercolor.description"),
      icon: "🖌️",
      tag: "fresh",
    },
  ];

  // 图片比例选项
  const aspectRatios = [
    { id: "1:1", label: t("ratios.1:1.name"), value: "1:1" },
    { id: "3:4", label: t("ratios.3:4.name"), value: "3:4" },
    { id: "4:3", label: t("ratios.4:3.name"), value: "4:3" },
    { id: "16:9", label: t("ratios.16:9.name"), value: "16:9" },
    { id: "9:16", label: t("ratios.9:16.name"), value: "9:16" },
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

  const locale = useLocale();
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
            <Link href={`/${locale}/about`}>
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
                        {t("activation.status.remaining", {
                          count: activationInfo.remainingUses,
                        })}
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
                  {activationInfo
                    ? t("activation.button.change")
                    : t("activation.button.activate")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card className="mb-8 border border-blue-100 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* 添加引导说明 */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                先选择合适的创作风格和图片风格，然后在下方输入你的创意内容，AI将为你生成精彩的漫画剧本。
              </p>
            </div>

            <div className="space-y-8">
              {/* 创作设置区域 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    1
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    创作设置
                  </h3>
                </div>

                {/* 模板选择 */}
                <div className="space-y-4">
                  <Label>选择创作风格</Label>
                  <TemplateSelector
                    value={templateName}
                    onChange={setTemplateName}
                  />
                </div>

                {/* 图片风格选择 */}
                <div className="space-y-4">
                  <Label>选择图片风格</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择图片风格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="写实风格">写实风格</SelectItem>
                      <SelectItem value="水彩风格">水彩风格</SelectItem>
                      <SelectItem value="油画风格">油画风格</SelectItem>
                      <SelectItem value="素描风格">素描风格</SelectItem>
                      <SelectItem value="动漫风格">动漫风格</SelectItem>
                      <SelectItem value="赛博朋克">赛博朋克</SelectItem>
                      <SelectItem value="未来主义">未来主义</SelectItem>
                      <SelectItem value="极简主义">极简主义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 高级设置 */}
                <AdvancedSettings
                  settings={{
                    steps: steps,
                    samplingMethod: samplingMethod,
                    styleStrength: styleStrength,
                    negativePrompt: negativePrompt,
                    clarity: clarity,
                    saturation: saturation,
                    composition: composition,
                    samplesPerScene: samplesPerScene,
                    variationAmount: variationAmount,
                  }}
                  onChange={(key, value) => {
                    switch (key) {
                      case "steps":
                        setSteps(value);
                        break;
                      case "samplingMethod":
                        setSamplingMethod(value);
                        break;
                      case "styleStrength":
                        setStyleStrength(value);
                        break;
                      case "negativePrompt":
                        setNegativePrompt(value);
                        break;
                      case "clarity":
                        setClarity(value);
                        break;
                      case "saturation":
                        setSaturation(value);
                        break;
                      case "composition":
                        setComposition(value);
                        break;
                      case "samplesPerScene":
                        setSamplesPerScene(value);
                        break;
                      case "variationAmount":
                        setVariationAmount(value);
                        break;
                    }
                  }}
                />
              </div>

              {/* 内容创作区域 */}
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    2
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    内容创作
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      输入你的创意内容
                    </label>
                    <span
                      className={`text-sm ${
                        content.length > maxLength
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {t("input.remaining", {
                        count: maxLength - content.length,
                      })}
                    </span>
                  </div>

                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="请在这里输入你想要转换成漫画的故事或创意..."
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
                      查看示例
                    </Button>
                  </div>

                  {/* 开始创作按钮 */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !content}
                      className={`
                        w-full md:w-auto px-6 py-3 
                        bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
                        hover:from-blue-600 hover:via-blue-700 hover:to-blue-800
                        disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400
                        text-white font-medium rounded-xl
                        transform hover:scale-[1.02] active:scale-[0.98]
                        transition-all duration-200
                        shadow-[0_0_20px_rgba(37,99,235,0.3)]
                        hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]
                        disabled:shadow-none
                        flex items-center justify-center gap-2
                        ${
                          isGenerating || !content
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }
                      `}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>创作中...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          <span>开始创作</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 复制剧本和生成图片按钮组 */}
                  {scriptContent && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(scriptContent);
                            toast.success("剧本内容已复制到剪贴板");
                          }}
                          className={`
                            px-5 py-2.5
                            bg-gradient-to-r from-emerald-500 to-teal-600
                            hover:from-emerald-600 hover:to-teal-700
                            text-white font-medium rounded-xl
                            transform hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-200
                            shadow-[0_0_15px_rgba(16,185,129,0.3)]
                            hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]
                            flex items-center gap-2
                          `}
                        >
                          <Copy className="w-4 h-4" />
                          复制剧本内容
                        </button>
                        <button
                          onClick={handleGenerateImages}
                          disabled={isGeneratingImages}
                          className={`
                            px-5 py-2.5
                            bg-gradient-to-r from-violet-500 to-purple-600
                            hover:from-violet-600 hover:to-purple-700
                            disabled:from-gray-400 disabled:to-gray-500
                            text-white font-medium rounded-xl
                            transform hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-200
                            shadow-[0_0_15px_rgba(139,92,246,0.3)]
                            hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]
                            disabled:shadow-none
                            flex items-center gap-2
                            ${
                              isGeneratingImages
                                ? "cursor-not-allowed opacity-60"
                                : ""
                            }
                          `}
                        >
                          {isGeneratingImages ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>生成中...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4" />
                              <span>生成漫画图片</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {scriptContent}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-gray-600">{t("generation.scriptResult")}</p>
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
                        {t("generation.scene")} {i + 1}
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
                                `${t("generation.scene")}${i + 1}`
                              )
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {t("generation.downloadImage")}
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
                              getTextModels(t).find(
                                (m) => m.id === selectedModel
                              )?.name
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
                                {seedMode === "random"
                                  ? t("settings.advanced.seed.random")
                                  : seedValue}
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
                        {t("generation.renderingImages")}...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 mr-2" />
                        {t("generation.renderHDComic")}
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {isGeneratingImages
                      ? t("generation.renderingComic")
                      : t("generation.willGenerateComic")}
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
                      {t("common.like")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t("common.comment")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Share className="w-4 h-4 mr-1" />
                      {t("common.share")}
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {t("common.success")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 生成的图片显示区域 */}
      {scriptContent && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">
              生成的漫画图片
            </h3>
            <button
              onClick={handleGenerateImages}
              disabled={isGeneratingImages}
              className={`
                px-6 py-2.5
                bg-gradient-to-r from-purple-500 to-pink-500
                hover:from-purple-600 hover:to-pink-600
                disabled:from-gray-400 disabled:to-gray-500
                text-white font-medium rounded-xl
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                shadow-[0_0_15px_rgba(168,85,247,0.3)]
                hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]
                disabled:shadow-none
                flex items-center gap-2
                ${isGeneratingImages ? "cursor-not-allowed opacity-60" : ""}
              `}
            >
              {isGeneratingImages ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>生成漫画图片</span>
                </>
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {imageGenerationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-900">
                    图片生成失败
                  </h4>
                  <p className="mt-1 text-sm text-red-700">
                    {imageGenerationError}
                  </p>
                  <button
                    onClick={handleGenerateImages}
                    disabled={isGeneratingImages}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重试
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 生成的图片网格 */}
          {generatedImages.length > 0 && !imageGenerationError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image) => (
                <div
                  key={image.index}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow"
                >
                  <img
                    src={image.url}
                    alt={`生成的漫画图片 ${image.index}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleDownloadImage(image)}
                      className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      下载图片
                    </button>
                    <button
                      onClick={() => window.open(image.url, "_blank")}
                      className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      查看大图
                    </button>
                  </div>
                  {/* 场景编号 */}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg shadow-md flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">场景 {image.index}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Section */}
      <div ref={faqRef} className="mt-16 pt-8 border-t border-blue-100">
        {/* FAQ标题优化 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{t("faq.title")}</h2>
          <p className="text-gray-600">{t("faq.subtitle")}</p>
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
                  {faq.answer.map(
                    (section: FAQItem["answer"][0], sectionIndex: number) => (
                      <div key={sectionIndex} className="mb-6 last:mb-0">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          {section.title}
                        </h4>
                        <p className="text-gray-600 mb-3">{section.content}</p>

                        {Array.isArray(section.items) &&
                        section.items.some(
                          (item) => typeof item === "object"
                        ) ? (
                          // 处理包含子标题的项目
                          <div className="space-y-4">
                            {section.items.map(
                              (
                                item:
                                  | string
                                  | { subtitle: string; details: string[] },
                                itemIndex: number
                              ) => {
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
                                        {item.details.map(
                                          (
                                            detail: string,
                                            detailIndex: number
                                          ) => (
                                            <li
                                              key={detailIndex}
                                              className="text-gray-600 text-sm"
                                            >
                                              {detail}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                          </div>
                        ) : (
                          // 处理普通列表项
                          <ul className="list-disc list-inside space-y-1 pl-4">
                            {section.items.map(
                              (
                                item:
                                  | string
                                  | { subtitle: string; details: string[] },
                                itemIndex: number
                              ) => (
                                <li
                                  key={itemIndex}
                                  className="text-gray-600 text-sm"
                                >
                                  {typeof item === "string" ? item : null}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                    )
                  )}
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
              <span className="font-bold text-xl">{t("common.appName")}</span>
            </div>

            <p className="text-indigo-200 text-sm">
              © {new Date().getFullYear()} {t("common.copyright")}
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
