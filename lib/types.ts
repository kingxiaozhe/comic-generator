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
