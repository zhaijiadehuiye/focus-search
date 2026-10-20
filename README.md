# Focus Search · 独立搜索

一个简洁、接近 Google 搜索页风格的独立搜索入口。没有推荐流、热搜和内容卡片。

## 功能

- 直接搜索小红书、知乎、Google、百度、B站、YouTube、Reddit、GitHub。
- 一次输入，选择多个平台搜索；自动打开被浏览器拦截时，可逐个点击备用链接。
- 管理最多 24 个网站：新增、编辑、删除（包括内置网站）、排序、撤销删除和恢复内置网站；兼容旧版设置。
- 去掉大号 Focus 标志，首页以搜索框为中心。
- 8 张 Unsplash 风景背景，每次访问轮换、每日轮换或固定一张；支持本地上传和 HTTPS 图片网址。
- 本地图片压缩后仅保存在当前浏览器 IndexedDB，不上传服务器。
- 浅色、深色、跟随系统；可选新标签页或当前页打开。
- 默认不保留搜索记录，可主动开启仅存于当前浏览器的最近 8 条搜索。
- `/` 聚焦、Enter 搜索、Cmd/Ctrl + Enter 多站搜索。
- 支持 `?q=关键词&site=zhihu` 预填搜索，页面不会自动提交。
- 无依赖、无外部字体、无第三方图标、无分析统计脚本。

## 部署 GitHub Pages

将本目录推送到 GitHub，在 **Settings → Pages** 选择 **Deploy from a branch → main → /(root)**。
不需要安装或构建。`.nojekyll` 让 GitHub 直接发布静态文件。

## 本地运行

在本目录运行 `python3 -m http.server 8000` 后打开 `http://localhost:8000`。

## 隐私与边界

输入时不发送关键词，提交搜索时将关键词传给选定平台。主题、网站、背景偏好使用 localStorage，本地图片使用 IndexedDB。若填写外部背景网址，图片提供方会收到常规图片请求，不包含搜索词。
GitHub Pages 可能保留常规访问日志，目标平台按各自政策处理搜索请求。
本页直接跳转搜索结果，不聚合抓取数据、不绕过登录，无法隐藏目标平台结果页中的推荐。
与 Google 及上述平台无隶属或合作关系。

## 字体

Arial、Helvetica Neue；中文回退到 PingFang SC、Microsoft YaHei 和系统 sans-serif。所有字体本机加载。

## Background credits

Bundled nature photos are from Unsplash. See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for sources. Automatic rotation uses this curated set; it does not call a live photo recommendation API.
