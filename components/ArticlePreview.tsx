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

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">公众号预览效果</h3>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={onDownloadAll}>
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
            {images.map((image, idx) => (
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
                  <button
                    onClick={() => onDownloadImage(image)}
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
