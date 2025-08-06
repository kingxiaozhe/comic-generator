import { RefObject } from "react";

// 漫画面板类型
export interface ComicPanel {
  id: string;
  content: string;
  imageUrl?: string;
  sceneNumber?: number;
  error?: string;
}

// API响应类型
export interface ApiResponse {
  panels: ComicPanel[];
  error?: string;
}

// 文本生成模型类型
export interface TextModel {
  id: string;
  name: string;
  description: string;
  tag?: string;
  category: string;
}

// 模型分类类型
export interface ModelCategory {
  id: string;
  name: string;
  description?: string;
}

// 激活码类型
export interface ActivationCode {
  id: string;
  code: string;
  totalUses: number;
  usedCount: number;
  remainingUses: number;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  description?: string;
}

// 激活码验证结果
export interface ActivationResult {
  success: boolean;
  message: string;
  remainingUses?: number;
  code?: ActivationCode;
}

// 使用记录
export interface UsageRecord {
  id: string;
  codeId: string;
  timestamp: Date;
  type: "text" | "image";
  scenesGenerated?: number;
}

export interface ScrollableRef {
  ref: RefObject<HTMLDivElement>;
}

export interface NavbarProps {
  onFaqClick: () => void;
}

export const aspectRatioOptions = [
  { value: "1:1", label: "1:1 方形" },
  { value: "3:4", label: "3:4 竖版" },
  { value: "4:3", label: "4:3 横版" },
  { value: "16:9", label: "16:9 宽屏" },
  { value: "9:16", label: "9:16 竖屏" },
] as const;

export const styleOptions = [
  { value: "realistic", label: "写实风格" },
  { value: "anime", label: "动漫风格" },
  { value: "cartoon", label: "卡通风格" },
  { value: "watercolor", label: "水彩风格" },
] as const;

export type AspectRatio = (typeof aspectRatioOptions)[number]["value"];
export type ImageStyle = (typeof styleOptions)[number]["value"];
