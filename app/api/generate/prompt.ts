import { getPromptTemplate } from "@/lib/prompts";

export function buildMasterPrompt(params: {
  content: string;
  count?: number;
  sceneNumber?: number;
  templateName?: string;
}): string {
  const { content, count, sceneNumber, templateName } = params;
  const template = getPromptTemplate(templateName);

  if (typeof sceneNumber === "number") {
    return `
${template.core}

【输入内容】
${content}

${template.outputRulesCommon}
仅输出第${sceneNumber}张的完整脚本块：
- 必须以"第${sceneNumber}张"起始行开头
- 仅包含该张应有的字段（场景/构图/人物/对话/氛围/转场逻辑）
- 不要输出[核心提炼]、[角色设定]、其他张、或任何额外解释文本

${template.qaChecklist}
开始创作：`;
  }

  const n = Number(count) || 4;
  return `
${template.core}

【输入内容】
${content}

${template.outputRulesCommon}
请创作共${n}张，采用适合${n}张结构的叙事节奏：
- 逐张依次输出"第1张"至"第${n}张"
- 每一张内容字数控制在50-120字，信息密度高、画面感强
- 不要输出除指定结构外的任何多余文本

${template.qaChecklist}
开始创作：`;
}
