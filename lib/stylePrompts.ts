export interface StylePrompt {
  id: string;
  basePrompt: string;
  characterStyle: string;
  background: string;
  colors: string;
  composition: string;
  dialogueBubbles: string;
  poses: string;
  overallFeel: string;
  negativePrompt?: string;
}

// 统一对白气泡中文规范（适用于所有风格与所有场景）
const zhDialogueRule =
  "every panel must include at least one white speech bubble with black outline, the speech bubble must be pure white filled with black border, place the speech bubble in a natural position above or next to the speaking character, ensure the speech bubble is clearly visible and stands out against the background";

const zhDialogueNegative =
  "missing speech bubbles, transparent speech bubbles, colored speech bubbles, gradient speech bubbles, speech bubbles without black outline, small or unreadable speech bubbles";

export const stylePrompts: Record<string, StylePrompt> = {
  // 轻量简笔幽默
  simple_humor: {
    id: "simple_humor",
    basePrompt:
      "simple line art comic style, humorous and fun, with white speech bubbles",
    characterStyle:
      "simple line art character design, exaggerated expressions, black outlines, white faces, minimalist style, clean lines",
    background:
      "solid color backgrounds (gray), minimal details, focus on characters and dialogue, clean composition",
    colors:
      "limited pure colors for clothing (pink, green, etc), mainly black white and gray palette, high contrast",
    composition:
      "large black bold title at top, comic content below, single panel layout, balanced composition, prominent white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, speech bubbles should be large and clear, taking up appropriate space for dialogue`,
    poses:
      "exaggerated body poses (like raising phone, sitting on bed edge), dynamic gestures, expressive movements, characters positioned naturally relative to their speech bubbles",
    overallFeel:
      "humorous and exaggerated single-panel comic, quick and simple style, funny mood, clear dialogue presentation",
    negativePrompt: `${zhDialogueNegative}, complex details, busy backgrounds, complicated color schemes`,
  },

  // 彩色Q版
  chibi_color: {
    id: "chibi_color",
    basePrompt:
      "colorful chibi style comic art, cute and vibrant, with white speech bubbles",
    characterStyle:
      "super deformed chibi characters, large heads (2-3 heads tall), round cute faces, big expressive eyes, soft rounded features, kawaii style",
    background:
      "pastel colored backgrounds, simple decorative elements, cute props and accessories, soft gradients",
    colors:
      "bright and cheerful color palette, pastel tones, soft shadows, candy-like colors, high saturation",
    composition:
      "balanced cute composition, focus on character expressions, decorative frame optional, prominent white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, round and cute white speech bubbles with smooth black outline`,
    poses:
      "cute chibi poses, playful actions, bouncy movements, adorable gestures, characters interacting with their speech bubbles",
    overallFeel:
      "extremely cute and cheerful atmosphere, kawaii aesthetic, playful and fun mood, clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}, realistic proportions, scary expressions, dark themes, overly complex details`,
  },

  // 手绘水彩
  hand_watercolor: {
    id: "hand_watercolor",
    basePrompt:
      "hand-painted watercolor comic style, artistic and flowing, with white speech bubbles",
    characterStyle:
      "loose watercolor brush strokes, flowing lines, soft edges, natural color bleeding, artistic style",
    background:
      "watercolor wash backgrounds, color gradients, texture overlays, artistic splatters",
    colors:
      "soft watercolor palette, color bleeding effects, transparent layers, natural color mixing",
    composition:
      "artistic layout, flowing composition, white space utilization, dynamic brush strokes, elegant white speech bubbles with clean black outline",
    dialogueBubbles: `${zhDialogueRule}, elegant white speech bubbles with graceful black outline, harmoniously integrated with watercolor style`,
    poses:
      "graceful poses, natural movements, flowing gestures, artistic expression, characters naturally framed by their speech bubbles",
    overallFeel:
      "artistic and elegant, traditional watercolor feel, gentle and flowing style, clear dialogue presentation",
    negativePrompt: `${zhDialogueNegative}, sharp edges, harsh colors, rigid lines, perfect symmetry`,
  },

  // 复古报纸连环画
  vintage_comic: {
    id: "vintage_comic",
    basePrompt:
      "vintage newspaper comic strip style, retro and classic, with white speech bubbles",
    characterStyle:
      "classic comic strip character design, cross-hatching shading, vintage line work, retro facial features",
    background:
      "detailed vintage backgrounds, classic architectural elements, period-appropriate props",
    colors:
      "muted vintage color palette, sepia tones, aged paper effect, classic comic colors",
    composition:
      "traditional comic strip layout, multiple panels, classic gutters, newspaper format, prominent white speech bubbles with bold black outline",
    dialogueBubbles: `${zhDialogueRule}, classic comic strip style white speech bubbles with strong black outline, traditional balloon shapes`,
    poses:
      "classic comic poses, theatrical gestures, dramatic expressions, period-appropriate actions, characters well-positioned with their speech bubbles",
    overallFeel:
      "nostalgic newspaper comic feel, classic storytelling style, retro aesthetic, clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}, modern elements, bright neon colors, contemporary style, digital effects`,
  },

  // 通用风格：为现有样式统一中文文本要求，避免乱码
  anime: {
    id: "anime",
    basePrompt: "japanese anime comic style with white speech bubbles",
    characterStyle:
      "clean linework, expressive anime faces, stylized hair and eyes",
    background: "simple scene backgrounds matching the setting",
    colors: "balanced palette, clear contrast",
    composition:
      "manga-like panel composition, focus on characters, prominent white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, manga-style white speech bubbles with clean black outline`,
    poses:
      "expressive body language, dynamic poses when needed, natural interaction with speech bubbles",
    overallFeel: "clean and modern anime look with clear dialogue presentation",
    negativePrompt: `${zhDialogueNegative}`,
  },

  comic_book: {
    id: "comic_book",
    basePrompt: "american comic book style with white speech bubbles",
    characterStyle: "bold outlines, dynamic anatomy, expressive faces",
    background: "scene-appropriate backgrounds, not too busy",
    colors: "vibrant but controlled palette",
    composition:
      "strong panel composition, clear focal points, prominent white speech bubbles with bold black outline",
    dialogueBubbles: `${zhDialogueRule}, classic comic book style white speech bubbles with strong black outline`,
    poses:
      "dynamic action poses and clear gestures, characters interacting with speech bubbles",
    overallFeel: "classic comic book energy with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },

  realistic: {
    id: "realistic",
    basePrompt: "semi-realistic comic illustration with white speech bubbles",
    characterStyle: "clean forms, readable expressions",
    background: "contextual backgrounds without clutter",
    colors: "natural colors with good readability",
    composition:
      "balanced composition emphasizing readability, clear white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, realistic yet clear white speech bubbles with defined black outline`,
    poses:
      "natural poses with clear gestures, well-placed relative to speech bubbles",
    overallFeel: "grounded and readable with clear dialogue presentation",
    negativePrompt: `${zhDialogueNegative}`,
  },

  watercolor: {
    id: "watercolor",
    basePrompt: "watercolor comic style with white speech bubbles",
    characterStyle: "soft edges and brush textures",
    background: "wash backgrounds and gentle textures",
    colors: "soft watercolor palette",
    composition:
      "ample white space and flow, elegant white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, artistic white speech bubbles with flowing black outline`,
    poses: "graceful natural gestures, harmonious with speech bubbles",
    overallFeel: "gentle and artistic with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },

  cartoon: {
    id: "cartoon",
    basePrompt: "modern cartoon style with white speech bubbles",
    characterStyle: "rounded shapes, clean outlines, expressive faces",
    background: "simple colorful backgrounds",
    colors: "bright and friendly colors",
    composition:
      "clear composition with strong readability, fun white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, cartoon-style white speech bubbles with playful black outline`,
    poses:
      "exaggerated cartoon gestures, dynamic interaction with speech bubbles",
    overallFeel: "fun and approachable with clear dialogue presentation",
    negativePrompt: `${zhDialogueNegative}`,
  },

  sketch: {
    id: "sketch",
    basePrompt: "black-and-white sketch comic style with white speech bubbles",
    characterStyle: "pencil or ink sketch lines, high contrast",
    background: "minimal line backgrounds",
    colors: "mostly monochrome",
    composition:
      "clear composition and readable faces, prominent white speech bubbles with sketch-style black outline",
    dialogueBubbles: `${zhDialogueRule}, sketchy white speech bubbles with expressive black outline`,
    poses: "expressive line poses, natural flow with speech bubbles",
    overallFeel: "minimal and elegant with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },

  chinese_painting: {
    id: "chinese_painting",
    basePrompt:
      "traditional ink painting comic style with white speech bubbles",
    characterStyle: "ink wash, calligraphic lines",
    background: "ink textures and poetic scenery",
    colors: "ink blacks with subtle washes",
    composition:
      "poetic composition with negative space, elegant white speech bubbles with ink-style black outline",
    dialogueBubbles: `${zhDialogueRule}, traditional style white speech bubbles with calligraphic black outline`,
    poses: "elegant gestures and posture, harmonious with speech bubbles",
    overallFeel: "traditional and refined with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },

  pixel_art: {
    id: "pixel_art",
    basePrompt: "pixel art comic style with white speech bubbles",
    characterStyle: "low-res pixel characters, clear silhouettes",
    background: "simple pixel backgrounds",
    colors: "limited palette with high readability",
    composition:
      "clean layout for pixel readability, pixelated white speech bubbles with black outline",
    dialogueBubbles: `${zhDialogueRule}, pixel-style white speech bubbles with clean black outline`,
    poses: "simple readable poses, clear connection to speech bubbles",
    overallFeel: "retro and charming with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },

  cyberpunk: {
    id: "cyberpunk",
    basePrompt: "cyberpunk comic style with white speech bubbles",
    characterStyle: "neon accents, tech details kept readable",
    background: "futuristic cityscapes with controlled complexity",
    colors: "neon palette but keep text areas clean",
    composition:
      "focus on readability despite visual complexity, high-tech white speech bubbles with bold black outline",
    dialogueBubbles: `${zhDialogueRule}, futuristic white speech bubbles with tech-styled black outline`,
    poses: "stylish dynamic poses, integrated with speech bubbles",
    overallFeel: "futuristic and stylish with clear dialogue focus",
    negativePrompt: `${zhDialogueNegative}`,
  },
};

export function buildStylePrompt(
  styleId: string,
  sceneContent: string
): string {
  const style = stylePrompts[styleId];
  if (!style) {
    // 未配置的风格也强制中文对白要求
    return [sceneContent, zhDialogueRule].join(", ");
  }

  const fullPrompt = `
${style.basePrompt},
Character Style: ${style.characterStyle},
Background: ${style.background},
Colors: ${style.colors},
Composition: ${style.composition},
Dialogue: ${style.dialogueBubbles},
Poses: ${style.poses},
Overall Feel: ${style.overallFeel},
Text Language: Simplified Chinese (zh-CN) only,
Scene Content: ${sceneContent}
`.trim();

  return fullPrompt;
}

export function getStyleNegativePrompt(styleId: string): string {
  const base = stylePrompts[styleId]?.negativePrompt || "";
  return [base, zhDialogueNegative].filter(Boolean).join(", ");
}
