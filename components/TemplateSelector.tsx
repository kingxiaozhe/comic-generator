import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const templates = [
  {
    id: "comicMaster",
    name: "通用漫画",
    description: "适合各类故事，注重叙事性和画面表现力",
    icon: "🎨",
  },
  {
    id: "mangaStyle",
    name: "日式漫画",
    description: "适合情感、动作题材，强调分镜和节奏感",
    icon: "🗾",
  },
  {
    id: "americanComic",
    name: "美式漫画",
    description: "适合英雄故事和冒险题材，突出视觉冲击力",
    icon: "🦸‍♂️",
  },
];

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      {/* <h3 className="text-lg font-medium">选择创作风格</h3> */}
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`relative p-4 cursor-pointer transition-all ${
              value === template.id
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
          >
            <RadioGroupItem
              value={template.id}
              id={template.id}
              className="sr-only"
            />
            <Label
              htmlFor={template.id}
              className="cursor-pointer space-y-2 block"
            >
              <div className="text-2xl">{template.icon}</div>
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground">
                {template.description}
              </div>
            </Label>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}
