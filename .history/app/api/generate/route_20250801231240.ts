import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const DEEPSEEK_API_KEY = "sk-xgpdmqrgikwkbaacvxbvtkwhxnwjncdvqzlshnzcyswxhsfn"; // 在实际生产环境中应使用环境变量

export async function POST(request: NextRequest) {
  try {
    const { content, count = 4 } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "文章内容不能为空" }, { status: 400 });
    }

    // 构建提示词，要求创作完整的漫画故事
    const prompt = `
你是一位专业的漫画脚本创作者。请根据以下内容，创作一个完整的漫画故事，分为${count}个场景。

每个场景需要包含以下元素：
1. 场景描述：包括地点、时间、环境等
2. 角色描述：包括外貌、表情、动作、姿态等
3. 对话内容：角色之间的对话或内心独白
4. 情感氛围：该场景的主要情感基调

请确保故事具有连贯性和完整的情节发展，包括开始、发展、高潮和结局。
每个场景以"【场景1】"、"【场景2】"等格式开头，并用明显的分隔符分开。

用户提供的内容或创意：
${content}

请基于以上内容进行创作，不要有任何与创作无关的解释性文字。直接输出创作内容。
`;

    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B", // 使用清华的Qwen模型生成漫画故事
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8, // 略微提高创意性
        max_tokens: 2000, // 确保有足够的输出长度
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API错误:", errorData);
      return NextResponse.json(
        { error: "生成漫画故事失败" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const storyContent = data.choices[0].message.content.trim();

    // 解析故事内容，提取各个场景
    const scenes = storyContent
      .split(/【场景\d+】/g)
      .filter(Boolean)
      .map((scene) => scene.trim())
      .slice(0, count);

    // 为每个场景生成假的图片URL (实际项目中可以接入图像生成API)
    const comicPanels = scenes.map((content, index) => ({
      id: `panel-${index + 1}`,
      content: content,
      // 在实际项目中，这里应该调用图像生成API，目前用占位图
      imageUrl: `https://placehold.co/600x400/pink/white?text=Comic+${
        index + 1
      }`,
    }));

    return NextResponse.json({ comicPanels });
  } catch (error) {
    console.error("API路由错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
