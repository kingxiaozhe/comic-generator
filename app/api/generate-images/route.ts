import { NextResponse } from "next/server";
import OpenAI from "openai";

// 打印环境变量信息
console.log("环境变量状态:", {
  NODE_ENV: process.env.NODE_ENV,
  HAS_ARK_API_KEY: !!process.env.ARK_API_KEY,
  ARK_API_KEY_LENGTH: process.env.ARK_API_KEY?.length || 0,
});

// 初始化方舟API客户端
const ark = new OpenAI({
  apiKey: process.env.ARK_API_KEY || "",
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
});

// 添加类型定义
interface GenerateResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
    status?: string;
  }>;
}

interface GenerateImageRequest {
  script: string;
  style: string;
  steps?: number;
  samplingMethod?: string;
  styleStrength?: number;
  negativePrompt?: string;
  clarity?: number;
  saturation?: number;
  composition?: string;
  samplesPerScene?: number;
  variationAmount?: number;
}

// 自动从剧本文字中提取人物标签与外观描述（尽量宽松，容错各类写法）
function extractCharacterHints(script: string): string[] {
  const hints: string[] = [];

  // 1) 行级模式：张三（husband）：黑发，红衣
  const lineMatches = script.match(
    /^[\t ]*([\u4e00-\u9fa5A-Za-z]{1,10})(?:（([^）]+)）)?[：:][\t ]*([^\n]+)$/gm
  );
  if (lineMatches) {
    for (const raw of lineMatches) {
      const m = raw.match(
        /^[\t ]*([\u4e00-\u9fa5A-Za-z]{1,10})(?:（([^）]+)）)?[：:][\t ]*([^\n]+)$/
      );
      if (m) {
        const name = m[1];
        const role = m[2] ? ` (${m[2]})` : "";
        const desc = m[3].trim();
        hints.push(`${name}${role}: ${desc}`);
      }
    }
  }

  // 2) 段落内“人物：”模式，按逗号/顿号切分，尽量抽取“姓名+描述”
  const peopleBlock = script.match(/人物[：:][\t ]*([^\n]+)/);
  if (peopleBlock) {
    const parts = peopleBlock[1]
      .split(/[，,、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      // 抽取可能的姓名（2-4个中文或英文名片段）
      const nameMatch = part.match(
        /^([\u4e00-\u9fa5]{2,4}|[A-Za-z]{2,20})(?:（([^）]+)）)?/
      );
      if (nameMatch) {
        const nm = nameMatch[1];
        const role = nameMatch[2] ? ` (${nameMatch[2]})` : "";
        const rest = part.replace(nameMatch[0], "").trim();
        if (rest) hints.push(`${nm}${role}: ${rest}`);
      }
    }
  }

  // 3) 行内对话说话者（不要求在行首），用于至少提取到"标签"（不强行带外观描述）
  const inlineSpeakerRegex =
    /([\u4e00-\u9fa5A-Za-z]{1,10})(?:（([^）]+)）)?[：:]/g;
  let m;
  while ((m = inlineSpeakerRegex.exec(script)) !== null) {
    const name = m[1];
    const role = m[2] ? ` (${m[2]})` : "";
    const tag = `${name}${role}`;
    // 若前两步已加入更详细的 name:desc，则无需再加入纯标签
    if (!hints.some((h) => h.startsWith(tag + ":") || h === tag)) {
      hints.push(tag);
    }
  }

  // 去重（按名字前缀去重，保留更长描述）
  const map = new Map<string, string>();
  for (const h of hints) {
    const key = h.split(":")[0].trim();
    if (!map.has(key) || map.get(key)!.length < h.length) {
      map.set(key, h);
    }
  }
  return Array.from(map.values());
}

// 构建优化后的提示词
function buildOptimizedPrompt(
  script: string,
  style: string,
  composition: string = "balanced",
  styleStrength: number = 0.8,
  clarity: number = 0.5,
  saturation: number = 0.5
): string {
  // 基础提示词
  const basePrompt = `${style} style comic art, ${script}`;

  // 构图提示词
  const compositionPrompt =
    {
      balanced: "balanced composition, harmonious layout",
      dynamic: "dynamic composition, dramatic angles, energetic layout",
      minimal: "minimal composition, clean layout, focus on subject",
    }[composition] || "balanced composition";

  // 质量提升关键词
  const qualityBoost = `high quality, ${
    clarity > 0.7 ? "ultra sharp focus" : "sharp focus"
  }, professional lighting`;

  // 风格增强
  const styleBoost = `${
    saturation > 0.7 ? "vibrant" : "natural"
  } colors, ${compositionPrompt}`;

  // 动态人物一致性提示（根据文本自动抽取）
  const extracted = extractCharacterHints(script);
  const characterConsistency = [
    "consistent characters",
    "人物在所有场景保持相同的服饰、发型、体型与脸型",
    "use same character faces across all panels",
    extracted.length > 0
      ? `Characters (use exact tags every panel): ${extracted.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  // 技术参数提示（生成稳定性与统一风格）
  const technicalHints = [
    "comic strip, storyboard, consistent characters",
    "each panel is an independent image",
    "8k detail, soft light, cinematic lighting",
    "use same art style, same character faces",
    "background keeps the same living-room layout, only time-of-day lighting changes",
  ].join(", ");

  // 组合提示词
  return [
    basePrompt,
    qualityBoost,
    styleBoost,
    characterConsistency,
    technicalHints,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function POST(request: Request) {
  try {
    // 验证API密钥
    if (!process.env.ARK_API_KEY) {
      console.error("未检测到有效的方舟 API Key");
      return NextResponse.json(
        {
          error: "请配置方舟 API Key",
          details:
            "在项目根目录创建 .env.local 文件，添加：ARK_API_KEY=your-api-key-here",
        },
        { status: 500 }
      );
    }

    const {
      script,
      style,
      composition,
      styleStrength,
      clarity,
      saturation,
      samplesPerScene = 1,
    } = (await request.json()) as GenerateImageRequest;

    // 输入验证
    if (!script) {
      return NextResponse.json(
        {
          error: "缺少必要参数",
          details: "剧本内容不能为空",
        },
        { status: 400 }
      );
    }

    // 构建优化后的提示词
    const prompt = buildOptimizedPrompt(
      script,
      style,
      composition,
      styleStrength,
      clarity,
      saturation
    );

    console.log("正在生成图片，使用以下参数：", {
      prompt,
      samples: samplesPerScene,
    });

    // 调用方舟 API 生成图片
    const response = (await ark.images.generate({
      model: "doubao-seedream-3-0-t2i-250415",
      prompt: prompt,
      size: "1024x1024",
      n: samplesPerScene,
      response_format: "url",
    })) as GenerateResponse;

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("API 返回格式错误");
    }

    // 处理生成结果
    const images = response.data.map((img, index) => ({
      url: img.url,
      index: index + 1,
      generation_time: new Date().toISOString(),
    }));

    console.log(`成功生成 ${images.length} 张图片`);

    return NextResponse.json({
      success: true,
      images,
      metadata: {
        prompt,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("图片生成过程出错:", error);
    return NextResponse.json(
      {
        error: "图片生成失败",
        details: error.message || "未知错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
