# 漫画生成器

AI 驱动的文本到漫画转换应用，基于 Next.js 构建。

## 功能特点

- 将文本内容转换为漫画剧本
- 根据剧本生成漫画图像
- 多种文本生成模型选择
- 可定制的图片比例和生成参数
- 响应式界面设计

## 技术栈

- Next.js (React 框架)
- TypeScript
- Tailwind CSS
- DeepSeek API (文本生成)
- Volces ARK API (图像生成)

## 本地开发

1. 克隆仓库

```bash
git clone <your-repo-url>
cd comic-generator
```

2. 安装依赖

```bash
pnpm install
```

3. 创建环境变量文件

```bash
cp .env.example .env.local
```

然后编辑`.env.local`文件，添加你的 API 密钥

4. 启动开发服务器

```bash
pnpm dev
```

5. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## Vercel 部署

### 自动部署设置

本项目已配置为通过 Vercel 自动部署。每次推送代码到主分支时，Vercel 都会自动构建并部署新版本。

设置步骤：

1. Fork 或克隆此仓库到你的 GitHub 账号

2. 在[Vercel](https://vercel.com)创建账号并连接你的 GitHub 账号

3. 导入项目

   - 点击"New Project"
   - 选择你的仓库
   - 在"Environment Variables"部分添加必要的环境变量(如`DEEPSEEK_API_KEY`)
   - 点击"Deploy"开始部署

4. 完成后，Vercel 会提供一个部署 URL，你可以在项目设置中自定义域名

### 注意事项

- 确保你的 API 密钥在 Vercel 项目设置中正确配置
- 更改环境变量后需要重新部署应用
- 使用 Vercel CLI 可以进行本地测试

## 贡献指南

欢迎贡献代码、提出问题或建议。请通过 GitHub Issues 提交问题或通过 Pull Request 贡献代码。

## 许可证

[MIT](LICENSE)
