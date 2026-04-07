# ChatCanves

[English](./README.md) | [简体中文](./README.zh-CN.md)

ChatCanves 是一个专注于 Gemini 主题与背景美化的浏览器扩展，只保留界面视觉定制相关功能。

## 功能说明

- 在 Gemini 页面右侧提供悬浮入口
- 点击后以右侧滑出面板的方式打开主题设置
- 支持跟随系统、浅色、深色三种外观模式
- 支持自定义界面强调色、聊天框颜色和聊天文字颜色
- 支持自定义壁纸、模糊、侧栏可读性遮罩和消息玻璃效果
- 所有主题设置都会保存在本地浏览器中

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
3. 开启开发者模式
4. 点击“加载已解压的扩展程序”
5. 选择 `.output/chrome-mv3`

## Release 使用方式

如果你只是想使用扩展，不需要先执行 `pnpm install`。

可以直接使用 GitHub Release：

1. 打开仓库的 `Releases` 页面
2. 下载对应版本附带的 zip 压缩包
3. 在本地解压
4. 打开 `chrome://extensions`
5. 开启开发者模式
6. 点击“加载已解压的扩展程序”
7. 选择解压后的扩展目录

## 仓库信息

- 仓库地址：[github.com/EwwwzhI/ChatCanves](https://github.com/EwwwzhI/ChatCanves)
- 问题反馈：[github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
