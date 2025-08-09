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

  // 组合提示词
  return `${basePrompt}, ${qualityBoost}, ${styleBoost}`;
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
