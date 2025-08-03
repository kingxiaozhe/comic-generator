import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const DEEPSEEK_API_KEY = "sk-xgpdmqrgikwkbaacvxbvtkwhxnwjncdvqzlshnzcyswxhsfn"; // 在实际生产环境中应使用环境变量

export async function POST(request: NextRequest) {
  try {
    const { content, count = 4 } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "文章内容不能为空" }, { status: 400 });
    }

    // 构建提示词，要求生成漫画面板的描述
    const prompt = `
请根据以下故事情节，创作${count}幅漫画场景的详细视觉描述。
每幅描述应包含场景、角色、动作、表情和背景等细节，以便用于生成漫画面板。
请确保描述具有连贯性，能够讲述完整的故事。
每幅描述以 "场景1:"、"场景2:" 等格式开头，并用换行分隔。
只输出场景描述，不要有其他解释性文字。

故事：${content}
`;

    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B", // 使用清华的Qwen模型生成文本描述
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API错误:", errorData);
      return NextResponse.json(
        { error: "生成漫画描述失败" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const descriptions = data.choices[0].message.content.trim();

    // 将文本描述转换为场景数组
    const scenes = descriptions
      .split(/场景\d+:/g)
      .filter(Boolean)
      .map((scene) => scene.trim())
      .slice(0, count);

    // 为每个场景生成假的图片URL (实际项目中可以接入图像生成API)
    const comicPanels = scenes.map((description, index) => ({
      id: `panel-${index + 1}`,
      description: description,
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
