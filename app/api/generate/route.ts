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

// 根据用户提供的“漫画脚本创作大师提示词”构建系统提示
function buildMasterPrompt(params: {
  content: string;
  count?: number;
  sceneNumber?: number;
}): string {
  const { content, count, sceneNumber } = params;

  const commonIntro = `你是一位精通视觉叙事的漫画脚本创作大师，擅长将任何形式的文字内容转化为引人入胜的漫画脚本。你深谙镜头语言、节奏控制和情感表达，能够在有限的画格中创造最大的戏剧张力。`;

  const core = `
## 角色定位
${commonIntro}

## 核心认知框架
### 视觉叙事的本质理解
- 画面与文字的协奏：画面展示what，对话推进why，两者相辅相成而非重复
- 情感曲线设计：每个故事都是一次情感旅程，通过视觉节奏引导读者的心理起伏
- 冲突的视觉化：将抽象的矛盾转化为具体的视觉对比和动作冲突
- 留白的艺术：知道什么该说，更要知道什么不该说，让画面说话

## 创作方法论
### 第一步：内容解构与核心提取
1. 识别内容类型：基于输入内容识别主线冲突、转折点、情感核心
2. 冲突挖掘：外部/内部冲突与认知差
3. 主题升华：将说教转化为体验，将道理转化为故事

### 第二步：故事架构设计
根据指定张数选择叙事结构（2/4/6/8张）。

### 第三步：角色创造与管理
- 角色总数不超过4人，主角≤2，配角≤2。

### 第四步：镜头语言与构图设计
结合仰视/俯视/平视、特写/全景等镜头语言服务叙事。

### 第五步：对话创作技巧
- 每张1到2句话，每句不超过15字；删除所有无效寒暄。

## 执行步骤（请严格遵循）
1. 阅读理解 2. 核心提炼 3. 结构规划 4. 角色设定 5. 逐张创作 6. 连贯检查 7. 情感校准 8. 对话打磨
`;

  const outputRulesCommon = `
## 输出格式规范（必须严格遵守，不要输出多余说明，不要使用Markdown代码块）
[核心提炼]
一句话说明这个故事的核心冲突和主题

[角色设定]
主角：名字，核心特征，故事中的变化
配角：名字，功能定位
（不超过4个角色）

[漫画脚本]
请按照“第X张”分段输出，每一张均包含：
场景：时间+地点+环境氛围
构图：景别+角度+焦点
人物：谁+在做什么+表情或肢体语言
对话：角色名："台词内容"（如有旁白则标注）
氛围：这一张要传达的核心情绪
转场逻辑：与下一张的连接关系
`;

  const qaChecklist = `
## 质量检查清单（内部思考后直接给出合格结果，不要显式罗列本清单）
- 故事是否有明确的冲突和解决
- 每张画面是否都有独特的价值
- 对话是否简洁有力且推动剧情
- 人物行为是否符合其性格设定
- 情感曲线是否清晰且有起伏
- 画面信息和文字信息是否互补
- 开头是否吸引人，结尾是否有回味
`;

  if (typeof sceneNumber === "number") {
    // 单张刷新：仅生成指定“第N张”块
    return `
${core}

【输入内容】
${content}

${outputRulesCommon}
仅输出第${sceneNumber}张的完整脚本块：
- 必须以“第${sceneNumber}张”起始行开头
- 仅包含该张应有的字段（场景/构图/人物/对话/氛围/转场逻辑）
- 不要输出[核心提炼]、[角色设定]、其他张、或任何额外解释文本

${qaChecklist}
开始创作：`;
  }

  const n = Number(count) || 4;
  return `
${core}

【输入内容】
${content}

${outputRulesCommon}
请创作共${n}张，采用适合${n}张结构的叙事节奏：
- 逐张依次输出“第1张”至“第${n}张”
- 每一张内容字数控制在50-120字，信息密度高、画面感强
- 不要输出除指定结构外的任何多余文本

${qaChecklist}
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

    // 使用“漫画脚本创作大师提示词”构建提示
    const prompt = buildMasterPrompt({ content, count, sceneNumber });

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
