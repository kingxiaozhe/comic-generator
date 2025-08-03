// 激活码管理服务
export class ActivationService {
  // 编码工具方法
  private static encode(str: string): string {
    return btoa(encodeURIComponent(str));
  }

  private static decode(str: string): string {
    return decodeURIComponent(atob(str));
  }

  // 使用简单加密存储激活码
  private static readonly VALID_CODES = {
    [this.encode("DEMO-2024-FREE")]: {
      u: 5,
      d: this.encode("免费体验码 - 5次使用"),
    },
    [this.encode("VIP-2024-FULL")]: {
      u: 50,
      d: this.encode("VIP码 - 50次使用"),
    },
    [this.encode("TEST-CODE-123")]: {
      u: 10,
      d: this.encode("测试码 - 10次使用"),
    },
    [this.encode("TRY-ONCE-001")]: { u: 1, d: this.encode("体验码 - 1次尝试") },
    [this.encode("TRY-ONCE-002")]: { u: 1, d: this.encode("体验码 - 1次尝试") },
    [this.encode("TRY-ONCE-003")]: { u: 1, d: this.encode("体验码 - 1次尝试") },
    [this.encode("TRY-ONCE-004")]: { u: 1, d: this.encode("体验码 - 1次尝试") },
    [this.encode("TRY-ONCE-005")]: { u: 1, d: this.encode("体验码 - 1次尝试") },
    [this.encode("FRIEND-GIFT-1")]: {
      u: 1,
      d: this.encode("朋友分享码 - 1次使用"),
    },
    [this.encode("FRIEND-GIFT-2")]: {
      u: 1,
      d: this.encode("朋友分享码 - 1次使用"),
    },
    [this.encode("FRIEND-GIFT-3")]: {
      u: 1,
      d: this.encode("朋友分享码 - 1次使用"),
    },
    [this.encode("QUICK-TEST-A")]: { u: 1, d: this.encode("快速测试码 - 1次") },
    [this.encode("QUICK-TEST-B")]: { u: 1, d: this.encode("快速测试码 - 1次") },
  };

  private static readonly STORAGE_KEY = this.encode("activated_code_usage");
  private static readonly DEVICE_KEY = this.encode("device_identifier");
  private static readonly ACTIVATION_TIME_KEY = this.encode(
    "activation_timestamp"
  );
  private static readonly CHECKSUM_KEY = this.encode("usage_checksum");
  private static readonly SECRET_SALT = "c0m1c-g3n3r4t0r";

  // 生成简单的设备指纹
  private static generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ];
    return this.encode(components.join("|"));
  }

  // 生成校验和
  private static generateChecksum(data: any): string {
    const str = JSON.stringify(data) + this.SECRET_SALT;
    return this.encode(str.split("").reverse().join(""));
  }

  // 验证校验和
  private static verifyChecksum(data: any, storedChecksum: string): boolean {
    const currentChecksum = this.generateChecksum(data);
    return currentChecksum === storedChecksum;
  }

  // 验证设备指纹
  private static verifyDevice(): boolean {
    if (typeof window === "undefined") return false;
    const storedFingerprint = localStorage.getItem(this.DEVICE_KEY);
    const currentFingerprint = this.generateDeviceFingerprint();
    return storedFingerprint === currentFingerprint;
  }

  // 验证时间戳
  private static verifyTimestamp(): boolean {
    if (typeof window === "undefined") return false;
    const timestamp = localStorage.getItem(this.ACTIVATION_TIME_KEY);
    if (!timestamp) return false;

    const activationTime = parseInt(this.decode(timestamp));
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return now - activationTime < oneDay;
  }

  // 激活码验证
  static activateCode(code: string): {
    success: boolean;
    message: string;
    remainingUses?: number;
  } {
    const encodedCode = this.encode(code.toUpperCase().trim());

    // 检查是否是有效的激活码
    if (!this.VALID_CODES[encodedCode]) {
      return { success: false, message: "无效的激活码" };
    }

    if (typeof window !== "undefined") {
      // 保存设备指纹
      const deviceFingerprint = this.generateDeviceFingerprint();
      localStorage.setItem(this.DEVICE_KEY, deviceFingerprint);

      // 保存激活时间
      const timestamp = this.encode(Date.now().toString());
      localStorage.setItem(this.ACTIVATION_TIME_KEY, timestamp);

      // 保存使用信息
      const codeInfo = this.VALID_CODES[encodedCode];
      const usageData = {
        code: encodedCode,
        totalUses: codeInfo.u,
        usedCount: 0,
        activatedAt: new Date().toISOString(),
      };

      // 生成并保存校验和
      const checksum = this.generateChecksum(usageData);
      localStorage.setItem(this.CHECKSUM_KEY, checksum);
      localStorage.setItem(
        this.STORAGE_KEY,
        this.encode(JSON.stringify(usageData))
      );
    }

    return {
      success: true,
      message: `激活成功！${this.decode(this.VALID_CODES[encodedCode].d)}`,
      remainingUses: this.VALID_CODES[encodedCode].u,
    };
  }

  // 检查是否有激活的码
  static hasActivatedCode(): boolean {
    if (typeof window === "undefined") return false;

    // 验证设备指纹和时间戳
    if (!this.verifyDevice() || !this.verifyTimestamp()) {
      this.clearActivation();
      return false;
    }

    const usageData = localStorage.getItem(this.STORAGE_KEY);
    const checksum = localStorage.getItem(this.CHECKSUM_KEY);

    if (!usageData || !checksum) return false;

    try {
      const data = JSON.parse(this.decode(usageData));
      // 验证校验和
      if (!this.verifyChecksum(data, checksum)) {
        this.clearActivation();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // 获取剩余使用次数
  static getRemainingUses(): number {
    if (typeof window === "undefined") return 0;

    try {
      const usageData = localStorage.getItem(this.STORAGE_KEY);
      if (!usageData) return 0;

      const data = JSON.parse(this.decode(usageData));
      return Math.max(0, data.totalUses - data.usedCount);
    } catch {
      return 0;
    }
  }

  // 使用一次
  static useOnce(): boolean {
    if (typeof window === "undefined") return false;

    // 验证设备指纹和时间戳
    if (!this.verifyDevice() || !this.verifyTimestamp()) {
      this.clearActivation();
      return false;
    }

    try {
      const usageData = localStorage.getItem(this.STORAGE_KEY);
      const checksum = localStorage.getItem(this.CHECKSUM_KEY);

      if (!usageData || !checksum) return false;

      const data = JSON.parse(this.decode(usageData));

      // 验证校验和
      if (!this.verifyChecksum(data, checksum)) {
        this.clearActivation();
        return false;
      }

      if (data.usedCount >= data.totalUses) return false;

      data.usedCount += 1;
      const newChecksum = this.generateChecksum(data);

      localStorage.setItem(this.STORAGE_KEY, this.encode(JSON.stringify(data)));
      localStorage.setItem(this.CHECKSUM_KEY, newChecksum);

      return true;
    } catch {
      return false;
    }
  }

  // 获取当前激活码信息
  static getCurrentCodeInfo(): { code: string; remainingUses: number } | null {
    if (typeof window === "undefined") return null;

    try {
      const usageData = localStorage.getItem(this.STORAGE_KEY);
      if (!usageData) return null;

      const data = JSON.parse(this.decode(usageData));
      return {
        code: this.decode(data.code),
        remainingUses: Math.max(0, data.totalUses - data.usedCount),
      };
    } catch {
      return null;
    }
  }

  // 清除激活信息
  static clearActivation(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.DEVICE_KEY);
    localStorage.removeItem(this.ACTIVATION_TIME_KEY);
    localStorage.removeItem(this.CHECKSUM_KEY);
  }
}
