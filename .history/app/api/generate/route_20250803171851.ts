import { NextResponse } from "next/server";
import { ComicPanel } from "@/lib/types";

// DeepSeek API配置
const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
// 优先使用环境变量中的API密钥，如果不存在则使用硬编码的密钥
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY ||
  "sk-xgpdmqrgikwkbaacvxbvtkwhxnwjncdvqzlshnzcyswxhsfn";

// 支持的模型列表
const SUPPORTED_MODELS: Record<string, string> = {
  "qwen-32b": "Qwen/QwQ-32B",
  "deepseek-7b": "deepseek-ai/deepseek-coder-7b-instruct", // 示例模型ID
  "gpt-3.5": "gpt-3.5-turbo", // 示例模型ID
};

export async function POST(request: Request) {
  try {
    const {
      content,
      count,
      sceneNumber,
      model = "qwen-32b",
    } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    // 验证模型是否支持
    const modelKey = model as string;
    if (!SUPPORTED_MODELS[modelKey]) {
      return NextResponse.json({ error: "不支持的模型" }, { status: 400 });
    }

    // 模型ID
    const modelId = SUPPORTED_MODELS[modelKey];

    // 构建提示词
    let prompt;

    // 如果指定了场景编号，则只生成该场景
    if (typeof sceneNumber === "number") {
      prompt = `请你根据以下内容生成一个漫画场景的描述，该场景是第${sceneNumber}个场景，生成的漫画描述应该简洁、具体且富有视觉感。
      
      内容: ${content}
      
      请直接给出第${sceneNumber}个场景的描述，不要有多余的解释。`;
    } else {
      // 否则生成多个场景
      prompt = `请你根据以下内容生成${count}个漫画场景的描述，每个场景的描述应该简洁、具体且富有视觉感。
      
      内容: ${content}
      
      请直接给出${count}个场景的描述，每个场景单独一段，格式如下：
      场景1：[场景1的描述]
      场景2：[场景2的描述]
      ...
      
      不要有多余的解释。`;
    }

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // 检查API响应状态
    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API错误:", errorData);

      // 提供更具体的错误信息
      let errorMessage = "调用AI服务失败，请稍后再试";
      if (errorData.error && errorData.error.message) {
        if (errorData.error.type === "authentication_error") {
          errorMessage = "API密钥验证失败，请联系管理员更新API密钥";
        } else {
          errorMessage = `AI服务错误: ${errorData.error.message}`;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const responseData = await response.json();
    const generatedText = responseData.choices[0].message.content;

    console.log("生成的内容:", generatedText);

    let comicPanels: ComicPanel[] = [];

    // 处理单个场景刷新的情况
    if (typeof sceneNumber === "number") {
      comicPanels = [
        {
          id: `scene-${sceneNumber}`,
          content: generatedText.trim(),
          imageUrl: `https://placehold.co/600x400?text=场景${sceneNumber}`,
          sceneNumber: sceneNumber,
        },
      ];
    } else {
      // 处理多个场景的情况
      const scenes = generatedText
        .split(/场景\d+[:：]/)
        .filter((scene: string) => scene.trim().length > 0);

      comicPanels = scenes.map((scene: string, index: number) => ({
        id: `scene-${index + 1}`,
        content: scene.trim(),
        imageUrl: `https://placehold.co/600x400?text=场景${index + 1}`,
        sceneNumber: index + 1,
      }));
    }

    return NextResponse.json({ comicPanels });
  } catch (error) {
    console.error("生成漫画脚本错误:", error);
    return NextResponse.json(
      { error: "生成漫画脚本时发生错误" },
      { status: 500 }
    );
  }
}
