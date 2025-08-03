// 用户设置管理服务
interface UserSettings {
  sceneCount: number; // 场景数量
  aspectRatio: string; // 图片比例
  imageStyle: string; // 图片风格
  advancedSettings: {
    seed: number; // 随机种子
    guidanceScale: number; // 引导比例
    // 可以根据需要添加更多高级设置
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
}
