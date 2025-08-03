// 漫画面板类型定义
export interface ComicPanel {
  id: string;
  content: string; // 漫画场景内容，包括场景描述、角色描述、对话等
  imageUrl: string;
  sceneNumber?: number; // 场景编号
  error?: string; // 图像生成错误信息
}

// API响应类型定义
export interface ApiResponse {
  comicPanels?: ComicPanel[];
  error?: string;
}
