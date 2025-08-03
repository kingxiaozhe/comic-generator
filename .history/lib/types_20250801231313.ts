// 漫画面板类型定义
export interface ComicPanel {
  id: string;
  content: string; // 漫画场景内容，包括场景描述、角色描述、对话等
  imageUrl: string;
}

// API响应类型定义
export interface ApiResponse {
  comicPanels?: ComicPanel[];
  error?: string;
}
