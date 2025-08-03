// 漫画面板类型定义
export interface ComicPanel {
  id: string;
  description: string;
  imageUrl: string;
}

// API响应类型定义
export interface ApiResponse {
  comicPanels?: ComicPanel[];
  error?: string;
}
