import { NextRequest, NextResponse } from "next/server";
import { ComicPanel } from "@/lib/types";

const ARK_API_URL =
  "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const ARK_API_KEY = "7ef519e4-d564-4f90-8459-94b6ef973e25"; // 在实际生产环境中应使用环境变量
const BASE_IMAGE_URL =
  "https://ark-project.tos-cn-beijing.volces.com/doc_image/seededit_i2i.jpeg"; // 示例基础图像URL

export async function POST(request: NextRequest) {
  try {
    const { comicPanels } = await request.json();

    if (
      !comicPanels ||
      !Array.isArray(comicPanels) ||
      comicPanels.length === 0
    ) {
      return NextResponse.json(
        { error: "缺少有效的漫画剧本数据" },
        { status: 400 }
      );
    }

    // 处理每个场景，生成对应的图像
    const imageGenerationPromises = comicPanels.map(
      async (panel: ComicPanel, index: number) => {
        try {
          // 从剧本内容中提取关键信息，构建适合图像生成的提示词
          // 这里可以根据需要优化提示词的构建方式
          const prompt = `漫画风格的场景：${panel.content.substring(0, 200)}`;

          // 调用ARK图像生成API
          const response = await fetch(ARK_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ARK_API_KEY}`,
            },
            body: JSON.stringify({
              model: "doubao-seededit-3-0-i2i-250628",
              prompt: prompt,
              image: BASE_IMAGE_URL,
              response_format: "url",
              size: "adaptive",
              seed: Math.floor(Math.random() * 1000), // 随机种子以获得不同的结果
              guidance_scale: 5.5,
              watermark: true,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`ARK API 错误 (场景 ${index + 1}):`, errorData);
            throw new Error(`生成图像失败: ${response.statusText}`);
          }

          const data = await response.json();
          return {
            id: panel.id,
            content: panel.content,
            imageUrl: data.data?.[0]?.url || panel.imageUrl, // 如果有新图像URL则更新，否则保留原样
            sceneNumber: index + 1,
          };
        } catch (err) {
          console.error(`处理场景 ${index + 1} 时出错:`, err);
          // 出错时返回原始面板数据，但添加错误信息
          return {
            ...panel,
            imageUrl: panel.imageUrl,
            sceneNumber: index + 1,
            error: err instanceof Error ? err.message : "图像生成失败",
          };
        }
      }
    );

    // 等待所有图像生成完成
    const results = await Promise.allSettled(imageGenerationPromises);

    // 处理结果
    const generatedPanels = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        // 如果某个请求失败，返回原始面板但带有错误信息
        return {
          ...comicPanels[index],
          sceneNumber: index + 1,
          error: "图像生成请求失败",
        };
      }
    });

    return NextResponse.json({ comicPanels: generatedPanels });
  } catch (error) {
    console.error("图像生成API路由错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
