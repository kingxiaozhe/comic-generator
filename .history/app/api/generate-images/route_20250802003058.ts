import { NextRequest, NextResponse } from "next/server";
import { ComicPanel } from "@/lib/types";

const ARK_API_URL =
  "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const ARK_API_KEY = "7ef519e4-d564-4f90-8459-94b6ef973e25"; // 在实际生产环境中应使用环境变量
const BASE_IMAGE_URL =
  "https://ark-project.tos-cn-beijing.volces.com/doc_image/seededit_i2i.jpeg"; // 示例基础图像URL

// 定义比例类型
type AspectRatioKey =
  | "1:1"
  | "3:4"
  | "4:3"
  | "16:9"
  | "9:16"
  | "2:3"
  | "3:2"
  | "21:9"
  | "custom";

// 将比例转换为图像尺寸的映射（使用API手册推荐的官方尺寸）
const aspectRatioToSize: Record<
  AspectRatioKey,
  { width: number; height: number }
> = {
  "1:1": { width: 1024, height: 1024 }, // （1:1）
  "3:4": { width: 864, height: 1152 }, // （3:4）
  "4:3": { width: 1152, height: 864 }, // （4:3）
  "16:9": { width: 1280, height: 720 }, // （16:9）
  "9:16": { width: 720, height: 1280 }, // （9:16）
  "2:3": { width: 832, height: 1248 }, // （2:3）
  "3:2": { width: 1248, height: 832 }, // （3:2）
  "21:9": { width: 1512, height: 648 }, // （21:9）
  custom: { width: 1024, height: 1024 }, // 默认为1:1
};

export async function POST(request: NextRequest) {
  try {
    const {
      comicPanels,
      aspectRatio = "16:9",
      seed = -1,
      guidance_scale = 2.5,
    } = await request.json();

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
          const prompt = `漫画风格的场景：${panel.content.substring(0, 200)}`;

          // 获取对应比例的尺寸
          const dimensions = aspectRatioToSize[
            aspectRatio as AspectRatioKey
          ] || { width: 1024, height: 1024 };

          // 为每个面板生成不同的种子，如果用户选择了固定种子，则所有面板使用相同的种子
          const panelSeed =
            seed === -1 ? Math.floor(Math.random() * 2147483647) : seed;

          console.log(
            `生成场景 ${index + 1}, 使用尺寸: ${dimensions.width}x${
              dimensions.height
            }, 比例: ${aspectRatio}, 种子: ${panelSeed}, 文本权重: ${guidance_scale}`
          );

          // 准备API请求体，注意确保完全按照API文档的要求
          const requestBody = {
            model: "doubao-seededit-3-0-i2i-250628",
            prompt: prompt,
            image: BASE_IMAGE_URL,
            response_format: "url",
            width: dimensions.width, // 使用width和height分别指定宽高
            height: dimensions.height,
            seed: panelSeed, // 使用计算得到的种子值
            guidance_scale: guidance_scale, // 使用传入的文本权重值
            watermark: false, // 移除水印
          };

          console.log(`请求体: ${JSON.stringify(requestBody)}`);

          // 调用ARK图像生成API
          const response = await fetch(ARK_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ARK_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
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
