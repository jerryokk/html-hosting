# HTML 托管服务

一个现代化的 HTML 文件托管服务，支持透明 CORS 代理、版本管理和直观的文件管理界面。

## ✨ 核心特性

- 🌐 **透明 CORS 代理**: 自动绕过跨域限制，HTML 文件可直接调用外部 API
- 📤 **拖拽上传**: 支持拖拽上传和文件替换，操作简单直观
- 📋 **可视化管理**: 专业的管理界面，一键打开、复制、删除服务
- 🔄 **版本管理**: 自动备份历史版本，支持一键还原
- ✏️ **在线重命名**: 点击编辑按钮即可重命名服务
- 🎯 **智能交互**: 整个卡片可点击打开，操作更高效

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
npm start
# 或者开发模式
npm run dev
```

### 访问应用
打开浏览器访问: http://localhost:3000

## 📖 使用指南

### 上传 HTML 文件
1. **拖拽上传**: 将 HTML 文件拖拽到上传区域
2. **点击上传**: 点击上传区域选择文件
3. **批量上传**: 支持同时上传多个 HTML 文件

### 管理已上传的服务
- **打开服务**: 点击服务卡片任意位置
- **复制链接**: 点击 Copy 按钮
- **重命名**: 点击编辑图标（✎）进行重命名
- **版本管理**: 如有历史版本，点击 Restore 按钮选择版本
- **删除服务**: 点击 Delete 按钮（会删除所有版本）

### 更新服务
将新的 HTML 文件拖拽到对应的服务卡片上，系统会自动：
- 备份当前版本
- 更新到新版本
- 保留最近 5 个历史版本

## 🔧 CORS 代理功能

上传的 HTML 文件会自动注入 CORS 代理脚本，使得页面可以直接调用任何外部 API，无需修改代码：

```javascript
// 在你的 HTML 中，可以直接这样调用外部 API
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data));
```

系统会自动拦截外部请求并通过代理服务器转发，完全透明，无需额外配置。

## 📁 项目结构

```
html-hosting/
├── server.js          # 核心服务器文件
├── package.json       # 项目配置
├── data.json         # 文件数据（自动生成）
├── uploads/          # 文件存储目录（自动生成）
├── .gitignore        # Git 忽略配置
└── README.md         # 说明文档
```

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **文件处理**: Multer + fs-extra
- **前端**: 原生 HTML/CSS/JavaScript
- **版本管理**: 自实现的文件版本系统
- **CORS 代理**: 动态 JavaScript 注入

## ⚙️ 配置说明

### 默认配置
- 端口: 3000
- 最大版本数: 5个
- 支持文件类型: HTML
- 上传目录: ./uploads/

### 自定义配置
可以通过修改 `server.js` 中的相关常量来自定义配置：

```javascript
const port = 3000;                    // 服务端口
const maxBackups = 5;                 // 最大备份数量
const uploadsDir = 'uploads/';        // 上传目录
```

## 🔒 安全特性

- UUID 文件命名避免冲突
- 严格的文件类型验证
- 自动清理过期备份
- 请求头过滤和清理
- 路径遍历攻击防护

## 📝 开发说明

### 启动开发服务器
```bash
npm run dev
```
使用 nodemon 自动重载，方便开发调试。

### 代码规范
- 使用 ES6+ 语法
- 遵循 RESTful API 设计
- 前端采用现代 CSS 和原生 JavaScript
- 注重用户体验和界面交互

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

## 📄 许可证

MIT License