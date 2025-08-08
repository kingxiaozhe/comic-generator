import { buildMasterPrompt } from "./route";

// 测试用例
const testCases = [
  {
    name: "通用漫画-完整故事",
    params: {
      templateName: "comicMaster",
      content: "一个小女孩在公园里找到了一只受伤的小鸟",
      count: 4,
    },
  },
  {
    name: "日式漫画-单场景",
    params: {
      templateName: "mangaStyle",
      content: "主角在决斗场上使出必杀技",
      sceneNumber: 2,
    },
  },
  {
    name: "美式漫画-完整故事",
    params: {
      templateName: "americanComic",
      content: "超级英雄为了保护城市，不得不与自己最好的朋友对抗",
      count: 6,
    },
  },
];

// 运行测试并输出结果
testCases.forEach((test) => {
  console.log(`\n=== ${test.name} ===`);
  const prompt = buildMasterPrompt(test.params);
  console.log(prompt);
});

// 导出测试用例供其他模块使用
export { testCases };
