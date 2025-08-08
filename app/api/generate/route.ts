import { NextResponse } from "next/server";
import { ComicPanel } from "@/lib/types";
import { getPromptTemplate } from "@/lib/prompts";

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

// 根据用户提供的"漫画脚本创作大师提示词"构建系统提示
export function buildMasterPrompt(params: {
  content: string;
  count?: number;
  sceneNumber?: number;
  templateName?: string;
}): string {
  const { content, count, sceneNumber, templateName } = params;
  const template = getPromptTemplate(templateName);

  if (typeof sceneNumber === "number") {
    // 单张刷新：仅生成指定"第N张"块
    return `
${template.core}

【输入内容】
${content}

${template.outputRulesCommon}
仅输出第${sceneNumber}张的完整脚本块：
- 必须以"第${sceneNumber}张"起始行开头
- 仅包含该张应有的字段（场景/构图/人物/对话/氛围/转场逻辑）
- 不要输出[核心提炼]、[角色设定]、其他张、或任何额外解释文本

${template.qaChecklist}
开始创作：`;
  }

  const n = Number(count) || 4;
  return `
${template.core}

【输入内容】
${content}

${template.outputRulesCommon}
请创作共${n}张，采用适合${n}张结构的叙事节奏：
- 逐张依次输出"第1张"至"第${n}张"
- 每一张内容字数控制在50-120字，信息密度高、画面感强
- 不要输出除指定结构外的任何多余文本

${template.qaChecklist}
开始创作：`;
}

// 解析“第X张”结构为多张内容
function parsePanelsFromMasterOutput(
  text: string
): { index: number; content: string }[] {
  const results: { index: number; content: string }[] = [];
  const regex =
    /(?:^|\n)第\s*(\d+)\s*张\s*[\r\n]+([\s\S]*?)(?=(?:^|\n)第\s*\d+\s*张\s*[\r\n]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const idx = parseInt(match[1], 10);
    const block = match[2].trim();
    if (!Number.isNaN(idx) && block) {
      results.push({ index: idx, content: block });
    }
  }
  // 按编号排序
  results.sort((a, b) => a.index - b.index);
  return results;
}

export async function POST(request: Request) {
  try {
    const {
      content,
      count,
      sceneNumber,
      model = "qwen-32b",
      templateName = "comicMaster",
      debug = false, // 添加调试模式参数
    } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    // 验证模型是否支持
    const modelKey = model as string;
    if (!SUPPORTED_MODELS[modelKey]) {
      return NextResponse.json({ error: "不支持的模型" }, { status: 400 });
    }

    // 使用模板构建提示词
    const prompt = buildMasterPrompt({
      content,
      count,
      sceneNumber,
      templateName,
    });

    // 如果是调试模式，直接返回提示词
    if (debug) {
      return NextResponse.json({
        debug: true,
        prompt,
        templateName,
        content,
        count,
        sceneNumber,
      });
    }

    // 模型ID
    const modelId = SUPPORTED_MODELS[modelKey];

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
        max_tokens: 1200,
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
    const generatedText: string =
      responseData.choices?.[0]?.message?.content || "";

    let comicPanels: ComicPanel[] = [];

    // 单场景刷新：尝试仅解析“第N张”
    if (typeof sceneNumber === "number") {
      // 优先解析“第N张”块
      const singleRegex = new RegExp(
        `(?:^|\\n)第\\s*${sceneNumber}\\s*张\\s*[\\r\\n]+([\\s\\S]*?)(?=(?:^|\\n)第\\s*\\d+\\s*张\\s*[\\r\\n]|$)`
      );
      const m = singleRegex.exec(generatedText);
      const singleContent = (m?.[1] || generatedText).trim();
      comicPanels = [
        {
          id: `scene-${sceneNumber}`,
          content: singleContent,
          imageUrl: `https://placehold.co/600x400?text=场景${sceneNumber}`,
          sceneNumber: sceneNumber,
        },
      ];
    } else {
      // 多场景：优先解析“第X张”结构
      const parsed = parsePanelsFromMasterOutput(generatedText);

      if (parsed.length > 0) {
        comicPanels = parsed.map(({ index, content }) => ({
          id: `scene-${index}`,
          content: content,
          imageUrl: `https://placehold.co/600x400?text=场景${index}`,
          sceneNumber: index,
        }));
      } else {
        // 兼容旧格式：按“场景X：”分割
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
