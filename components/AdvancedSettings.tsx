import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserSettingsService } from "@/lib/userSettings";
import {
  Settings2,
  Wand2,
  Image as ImageIcon,
  Palette,
  Layout,
  Copy,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface AdvancedSettingsProps {
  settings: {
    steps: number;
    samplingMethod: string;
    styleStrength: number;
    negativePrompt: string;
    clarity: number;
    saturation: number;
    composition: string;
    samplesPerScene: number;
    variationAmount: number;
  };
  onChange: (key: string, value: any) => void;
}

export function AdvancedSettings({
  settings,
  onChange,
}: AdvancedSettingsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-settings" className="border-none">
        <AccordionTrigger className="flex items-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:no-underline hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-medium text-gray-800">高级设置</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基础参数卡片 */}
            <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">基础参数</h3>
              </div>
              <div className="space-y-6">
                {/* 生成步数 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">
                      生成步数
                    </Label>
                    <span className="text-sm font-medium text-blue-600">
                      {settings.steps}
                    </span>
                  </div>
                  <Slider
                    value={[settings.steps]}
                    min={20}
                    max={150}
                    step={1}
                    onValueChange={([value]) => onChange("steps", value)}
                    className="[&_[role=slider]]:bg-blue-600"
                  />
                  <p className="text-xs text-gray-500">
                    更高的步数会产生更精细的细节，但会增加生成时间
                  </p>
                </div>

                {/* 采样方法 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    采样方法
                  </Label>
                  <Select
                    value={settings.samplingMethod}
                    onValueChange={(value) => onChange("samplingMethod", value)}
                  >
                    <SelectTrigger className="w-full bg-white/50 border-gray-200">
                      <SelectValue placeholder="选择采样方法" />
                    </SelectTrigger>
                    <SelectContent>
                      {UserSettingsService.getSamplingMethods().map(
                        (method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="py-1">
                              <div className="font-medium">{method.name}</div>
                              <div className="text-xs text-gray-500">
                                {method.description}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* 风格控制卡片 */}
            <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-800">风格控制</h3>
              </div>
              <div className="space-y-6">
                {/* 风格强度 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">
                      风格强度
                    </Label>
                    <span className="text-sm font-medium text-purple-600">
                      {Math.round(settings.styleStrength * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.styleStrength * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      onChange("styleStrength", value / 100)
                    }
                    className="[&_[role=slider]]:bg-purple-600"
                  />
                  <p className="text-xs text-gray-500">
                    控制选定风格的应用程度
                  </p>
                </div>

                {/* 负面提示词 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    负面提示词
                  </Label>
                  <Textarea
                    value={settings.negativePrompt}
                    onChange={(e) => onChange("negativePrompt", e.target.value)}
                    placeholder="输入要避免的元素，例如：模糊, 变形, 低质量"
                    className="h-20 bg-white/50 border-gray-200 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    指定你不希望在生成图片中出现的元素
                  </p>
                </div>
              </div>
            </Card>

            {/* 图片质量卡片 */}
            <Card className="p-6 bg-gradient-to-br from-green-50/50 to-teal-50/50 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-800">图片质量</h3>
              </div>
              <div className="space-y-6">
                {/* 图片清晰度 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">
                      图片清晰度
                    </Label>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(settings.clarity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.clarity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      onChange("clarity", value / 100)
                    }
                    className="[&_[role=slider]]:bg-green-600"
                  />
                </div>

                {/* 色彩饱和度 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">
                      色彩饱和度
                    </Label>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(settings.saturation * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.saturation * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      onChange("saturation", value / 100)
                    }
                    className="[&_[role=slider]]:bg-green-600"
                  />
                </div>
              </div>
            </Card>

            {/* 构图控制卡片 */}
            <Card className="p-6 bg-gradient-to-br from-orange-50/50 to-red-50/50 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Layout className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium text-gray-800">构图控制</h3>
              </div>
              <div className="space-y-6">
                {/* 构图偏好 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    构图偏好
                  </Label>
                  <Select
                    value={settings.composition}
                    onValueChange={(value) => onChange("composition", value)}
                  >
                    <SelectTrigger className="w-full bg-white/50 border-gray-200">
                      <SelectValue placeholder="选择构图风格" />
                    </SelectTrigger>
                    <SelectContent>
                      {UserSettingsService.getCompositionOptions().map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <div className="py-1">
                              <div className="font-medium">{option.name}</div>
                              <div className="text-xs text-gray-500">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 每个场景生成数量 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    每个场景生成数量
                  </Label>
                  <Select
                    value={settings.samplesPerScene.toString()}
                    onValueChange={(value) =>
                      onChange("samplesPerScene", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-full bg-white/50 border-gray-200">
                      <SelectValue placeholder="选择生成数量" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          生成 {num} 张图片
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    为每个场景生成多张图片供选择
                  </p>
                </div>

                {/* 变体程度 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">
                      变体程度
                    </Label>
                    <span className="text-sm font-medium text-orange-600">
                      {Math.round(settings.variationAmount * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.variationAmount * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      onChange("variationAmount", value / 100)
                    }
                    className="[&_[role=slider]]:bg-orange-600"
                  />
                  <p className="text-xs text-gray-500">
                    控制多个生成结果之间的差异程度
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
