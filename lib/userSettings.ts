// 用户设置管理服务
interface UserSettings {
  sceneCount: number; // 场景数量
  aspectRatio: string; // 图片比例
  imageStyle: string; // 图片风格
  advancedSettings: {
    seed: number; // 随机种子
    guidanceScale: number; // 引导比例
    steps: number; // 生成步数
    samplingMethod: string; // 采样方法
    styleStrength: number; // 风格强度
    negativePrompt: string; // 负面提示词
    clarity: number; // 图片清晰度
    saturation: number; // 色彩饱和度
    composition: string; // 构图偏好
    samplesPerScene: number; // 每个场景的生成数量
    variationAmount: number; // 变体程度
  };
}

// 默认设置
const DEFAULT_SETTINGS: UserSettings = {
  sceneCount: 3,
  aspectRatio: "1:1",
  imageStyle: "日系动漫",
  advancedSettings: {
    seed: -1,
    guidanceScale: 7.5,
    steps: 40,
    samplingMethod: "euler_a", // 默认采样方法
    styleStrength: 0.8, // 0-1 之间
    negativePrompt: "", // 默认为空
    clarity: 0.5, // 0-1 之间
    saturation: 0.5, // 0-1 之间
    composition: "balanced", // balanced, dynamic, minimal
    samplesPerScene: 1, // 默认每个场景生成1张
    variationAmount: 0.3, // 0-1 之间
  },
};

export class UserSettingsService {
  private static readonly SETTINGS_KEY = "user_comic_settings";

  // 保存设置
  static saveSettings(settings: Partial<UserSettings>): void {
    if (typeof window === "undefined") return;

    try {
      // 获取现有设置或使用默认值
      const currentSettings = this.getSettings();
      // 合并新设置
      const newSettings = {
        ...currentSettings,
        ...settings,
        // 如果更新了高级设置，确保正确合并
        advancedSettings: {
          ...currentSettings.advancedSettings,
          ...(settings.advancedSettings || {}),
        },
      };

      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("保存设置失败:", error);
    }
  }

  // 获取所有设置
  static getSettings(): UserSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    try {
      const savedSettings = localStorage.getItem(this.SETTINGS_KEY);
      if (!savedSettings) return DEFAULT_SETTINGS;

      const settings = JSON.parse(savedSettings);
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        // 确保高级设置被正确合并
        advancedSettings: {
          ...DEFAULT_SETTINGS.advancedSettings,
          ...(settings.advancedSettings || {}),
        },
      };
    } catch (error) {
      console.error("读取设置失败:", error);
      return DEFAULT_SETTINGS;
    }
  }

  // 更新单个设置项
  static updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    this.saveSettings({ [key]: value });
  }

  // 更新高级设置项
  static updateAdvancedSetting<
    K extends keyof UserSettings["advancedSettings"]
  >(key: K, value: UserSettings["advancedSettings"][K]): void {
    const currentSettings = this.getSettings();
    this.saveSettings({
      advancedSettings: {
        ...currentSettings.advancedSettings,
        [key]: value,
      },
    });
  }

  // 重置所有设置为默认值
  static resetSettings(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }

  // 清除所有设置
  static clearSettings(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.SETTINGS_KEY);
  }

  // 获取采样方法选项
  static getSamplingMethods() {
    return [
      { id: "euler_a", name: "Euler Ancestral", description: "平衡质量和速度" },
      { id: "euler", name: "Euler", description: "更快的生成速度" },
      { id: "ddim", name: "DDIM", description: "更稳定的结果" },
      { id: "dpmsolver", name: "DPM-Solver", description: "更高质量的细节" },
      {
        id: "dpmsolver++",
        name: "DPM-Solver++",
        description: "增强版DPM-Solver",
      },
    ];
  }

  // 获取构图选项
  static getCompositionOptions() {
    return [
      { id: "balanced", name: "平衡构图", description: "元素分布均匀" },
      { id: "dynamic", name: "动态构图", description: "强调动感和戏剧性" },
      { id: "minimal", name: "简约构图", description: "突出主体，简化背景" },
    ];
  }
}
