import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  Heart,
  MessageCircle,
} from "lucide-react";

interface GeneratedImage {
  url: string;
  index: number;
  variant?: number;
}

interface ArticlePreviewProps {
  images: GeneratedImage[];
  title?: string;
  scriptContent: string;
  onDownloadAll: () => void;
  onDownloadImage: (image: GeneratedImage) => void;
}

export function ArticlePreview({
  images,
  title = "我的漫画故事",
  scriptContent,
  onDownloadAll,
  onDownloadImage,
}: ArticlePreviewProps) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [overlayBubbles, setOverlayBubbles] = useState<boolean>(true);
  const [showBubblesOnPage, setShowBubblesOnPage] = useState<boolean>(true);

  // 将剧本文字拆分为按场景索引的文本块
  function splitScenesByIndex(script: string): Record<number, string> {
    const map: Record<number, string> = {};
    if (!script) return map;

    const pattern = /(场景\s*([0-9]+)|第\s*([0-9]+)\s*张)/g;
    const matches: Array<{ idx: number; pos: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(script)) !== null) {
      const idx = Number(m[2] || m[3]);
      matches.push({ idx, pos: m.index });
    }
    if (matches.length === 0) {
      // 没有显式场景标记，全部当作场景1
      map[1] = script.trim();
      return map;
    }
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].pos;
      const end = i < matches.length - 1 ? matches[i + 1].pos : script.length;
      const idx = matches[i].idx;
      const block = script.slice(start, end).trim();
      map[idx] = block;
    }
    return map;
  }

  // 从场景块中提取对白文本（优先“角色：内容”，否则取首句）
  function extractDialogueFromBlock(
    block: string,
    maxLen: number = 80
  ): string {
    if (!block) return "";
    const lines: string[] = [];
    const regex = /(^|\n)[\t ]*([^\n：:]{1,12})[：:][\t ]*([^\n]+)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(block)) !== null) {
      const speaker = (m[2] || "").trim();
      const content = (m[3] || "").trim();
      if (content) lines.push(`${speaker}：${content}`);
    }
    const text = lines.join("  ");
    const result = (text || block.replace(/^[^\n]*?(：|:)/, ""))
      .replace(/\s+/g, " ")
      .trim();
    return result.slice(0, maxLen);
  }

  async function fetchImageBitmap(url: string): Promise<ImageBitmap> {
    const resp = await fetch(url, { cache: "no-store" });
    const blob = await resp.blob();
    return await createImageBitmap(blob);
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(""); // 中文按字符拆分
    const lines: string[] = [];
    let current = "";
    for (const ch of words) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth) {
        if (current.length > 0) lines.push(current);
        current = ch;
      } else {
        current = test;
      }
    }
    if (current.length > 0) lines.push(current);
    return lines;
  }

  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  async function renderWithBubble(
    imageUrl: string,
    text: string
  ): Promise<Blob> {
    const img = await fetchImageBitmap(imageUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // 背景图
    ctx.drawImage(img, 0, 0);

    // 文本与气泡参数
    const padding = Math.round(canvas.width * 0.03);
    const bubbleWidth = Math.round(canvas.width * 0.84);
    const fontSize = Math.max(16, Math.round(canvas.width * 0.032));
    const lineHeight = Math.round(fontSize * 1.5);

    ctx.font = `${fontSize}px \"PingFang SC\", \"Noto Sans SC\", \"Microsoft YaHei\", Arial`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";

    const lines = wrapText(ctx, text, bubbleWidth - padding * 2);
    const bubbleHeight = Math.min(
      Math.round(canvas.height * 0.35),
      padding * 2 + lines.length * lineHeight
    );

    const bx = Math.round((canvas.width - bubbleWidth) / 2);
    const by = Math.round(canvas.height - bubbleHeight - padding * 2);

    // 绘制白底黑边圆角气泡
    ctx.save();
    drawRoundedRect(
      ctx,
      bx,
      by,
      bubbleWidth,
      bubbleHeight,
      Math.round(padding * 0.6)
    );
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.004));
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // 气泡尾巴（三角形）
    const tailW = Math.round(padding * 1.2);
    const tailH = Math.round(padding * 1.0);
    const tailX = bx + Math.round(bubbleWidth * 0.2);
    const tailY = by + bubbleHeight;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX + tailW, tailY);
    ctx.lineTo(tailX + Math.round(tailW / 2), tailY + tailH);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.restore();

    // 绘制文字
    ctx.fillStyle = "#000";
    let ty = by + padding;
    for (const line of lines) {
      ctx.fillText(line, bx + padding, ty);
      ty += lineHeight;
      if (ty > by + bubbleHeight - padding - lineHeight / 2) break;
    }

    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob as Blob), "image/png")
    );
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDownload(image: GeneratedImage) {
    if (!overlayBubbles) {
      // 使用父级的默认下载逻辑
      onDownloadImage(image);
      return;
    }
    const sceneMap = splitScenesByIndex(scriptContent);
    const block = sceneMap[image.index] || scriptContent;
    const text = extractDialogueFromBlock(block);
    const blob = await renderWithBubble(image.url, text || "（对白预留）");
    downloadBlob(blob, `scene-${image.index}.png`);
  }

  async function handleDownloadAll() {
    if (!overlayBubbles) {
      onDownloadAll();
      return;
    }
    for (const img of images) {
      // 顺序下载，避免并发造成浏览器阻塞
      // eslint-disable-next-line no-await-in-loop
      await handleDownload(img);
    }
  }

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">公众号预览效果</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 mr-2">
            <input
              type="checkbox"
              checked={overlayBubbles}
              onChange={(e) => setOverlayBubbles(e.target.checked)}
            />
            叠加中文对白气泡下载
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 mr-2">
            <input
              type="checkbox"
              checked={showBubblesOnPage}
              onChange={(e) => setShowBubblesOnPage(e.target.checked)}
            />
            页面显示对白气泡
          </label>
          <Button
            variant="outline"
            size="sm"
            className={viewMode === "mobile" ? "bg-gray-100" : ""}
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            移动端
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={viewMode === "desktop" ? "bg-gray-100" : ""}
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="w-4 h-4 mr-2" />
            PC端
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="w-4 h-4 mr-2" />
            下载全部
          </Button>
        </div>
      </div>

      <div
        className={`
        bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300
        ${
          viewMode === "mobile"
            ? "max-w-[414px] mx-auto"
            : "max-w-[780px] mx-auto"
        }
      `}
      >
        {/* 公众号头部 */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              <img
                src="/placeholder-logo.svg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-gray-900">AI漫画生成器</div>
              <div className="text-xs text-gray-500">3天前</div>
            </div>
          </div>
        </div>

        {/* 文章内容 */}
        <div
          className={`p-5 ${viewMode === "mobile" ? "text-base" : "text-lg"}`}
        >
          {/* 文章标题 */}
          <h1
            className={`font-bold text-center mb-6 ${
              viewMode === "mobile" ? "text-xl" : "text-2xl"
            }`}
          >
            {title}
          </h1>

          {/* 图文内容 */}
          <div className="space-y-8">
            {images.map((image) => (
              <div
                key={`${image.index}-${image.variant || 0}`}
                className="space-y-4"
              >
                {/* 图片 */}
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`场景 ${image.index}`}
                    className="w-full rounded-sm"
                  />
                  {/* 页面展示的对白气泡（白底黑边黑字） */}
                  {showBubblesOnPage &&
                    (() => {
                      const sceneMap = splitScenesByIndex(scriptContent);
                      const block = sceneMap[image.index] || scriptContent;
                      const text =
                        extractDialogueFromBlock(block, 60) || "（对白预留）";
                      return (
                        <div className="absolute z-10 bottom-4 left-1/2 -translate-x-1/2 max-w-[84%]">
                          <div className="relative">
                            {/* 边框三角 */}
                            <div className="absolute -bottom-2 left-1/4 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black" />
                            {/* 白色三角 */}
                            <div className="absolute -bottom-[7px] left-[calc(25%+1px)] w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-white" />
                            <div className="bg-white border border-black rounded-2xl px-4 py-3 text-black leading-snug shadow-sm">
                              <span className="whitespace-pre-wrap break-words">
                                {text}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  <button
                    onClick={() => handleDownload(image)}
                    className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>

                  {/* 场景编号标签 */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-800 rounded-full shadow-sm">
                    场景 {image.index}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 公众号底部 - 修改为居中布局 */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center gap-4">
              {/* 互动按钮 */}
              <div className="flex items-center justify-center gap-8 w-full">
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">88</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">36</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">分享</span>
                </div>
              </div>

              {/* 阅读量 */}
              <div className="text-xs text-gray-500 mt-2">阅读 1024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
