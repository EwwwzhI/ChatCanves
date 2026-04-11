# ChatCanves

[English](./README.md) | [简体中文](./README.zh-CN.md)

ChatCanves 是一个专注于 [Gemini](https://gemini.google.com) 和 [DeepSeek](https://chat.deepseek.com) 网页端主题与背景美化的浏览器扩展，只保留界面视觉定制相关能力。

当前版本：`0.2.2`

## 功能特性

- 同时支持 Gemini 和 DeepSeek 网页聊天
- 通过页面右侧悬浮入口打开
- 使用右侧滑出主题面板，不依赖浏览器工具栏 popup
- 支持跟随系统、浅色、深色三种外观模式
- 支持自定义界面强调色、聊天框颜色和聊天文字颜色
- 支持自定义壁纸上传、模糊、侧栏可读性遮罩和消息玻璃效果
- 所有主题设置保存在本地浏览器中，并按站点分别存储

## 通过 Release 安装

如果你只是想直接使用扩展，推荐使用打包好的 Release：

1. 打开仓库的 `Releases` 页面
2. 下载对应版本的 zip 压缩包
3. 在本地解压
4. 打开 `chrome://extensions`
5. 开启 `开发者模式`
6. 点击 `加载已解压的扩展程序`
7. 选择解压后的扩展目录

## 本地开发

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm compile
pnpm check:i18n
pnpm test:run
pnpm build
```

## 在 Chrome 中加载

1. 运行 `pnpm build`
2. 打开 `chrome://extensions`
3. 开启 `开发者模式`
4. 点击 `加载已解压的扩展程序`
5. 选择 `.output/chrome-mv3`

## 说明

- 当前支持的站点为 `gemini.google.com` 和 `chat.deepseek.com`
- 主题设置按站点隔离，Gemini 上的修改不会覆盖 DeepSeek
- 壁纸资源保存在浏览器本地

## 仓库信息

- 仓库地址：[github.com/EwwwzhI/ChatCanves](https://github.com/EwwwzhI/ChatCanves)
- 问题反馈：[github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
