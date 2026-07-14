# 09 - MCP 配置

> Model Context Protocol ![Status](https://img.shields.io/badge/status-learning-yellow)

## 📚 文档列表

| 文件 | 说明 |
|------|------|
| [README.md](README.md) | 本文件（快速概览） |

## 🎯 核心概念

### 什么是 MCP？

MCP（Model Context Protocol）是由 Anthropic 提出的开放协议，**标准化 AI 应用与外部工具/数据源的交互方式**。可以把它理解为"AI 世界的 USB-C 接口"——统一了各种工具、数据源和服务的接入方式。

### MCP 架构

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  AI 应用     │◄───►│  MCP 客户端   │◄───►│  MCP 服务器   │
│ (Agent/LLM)  │     │  (Host)      │     │  (工具/数据)  │
└─────────────┘     └──────────────┘     └──────────────┘
```

| 组件 | 角色 |
|------|------|
| **Host** | AI 应用（如 Codex、Claude Desktop），负责连接 LLM 和 MCP 服务器 |
| **Client** | Host 内部的 1:1 连接，与 MCP 服务器建立会话 |
| **Server** | 提供工具（Tools）、资源（Resources）、提示词（Prompts）的轻量服务 |

### MCP 核心能力

| 能力 | 说明 | 对应 Plugin 概念 |
|------|------|-----------------|
| **Tools** | 可被 LLM 调用的函数 | Skill |
| **Resources** | 暴露给 LLM 的数据（文件、DB、API） | Data Source |
| **Prompts** | 预定义的提示词模板 | Template |

### MCP vs Plugin（本项目 06 章）

| 维度 | MCP | Plugin |
|------|-----|--------|
| 协议 | 标准化开放协议 | 自定义实现 |
| 语言 | 语言无关（JSON-RPC） | JavaScript 原生 |
| 部署 | 独立的 Server 进程 | 代码内注册 |
| 发现 | 动态发现能力列表 | 静态注册 |
| 通信 | stdio / HTTP + SSE | 函数调用 |

## 💡 学习要点

- [x] 理解 MCP 协议的基本架构和设计理念
- [x] 掌握 Host / Client / Server 三层模型
- [x] 理解 Tools / Resources / Prompts 三大能力
- [x] MCP vs Plugin 的对比分析
- [ ] 配置和运行一个 MCP 服务器
- [ ] 在本项目的 Agent 中集成 MCP 客户端

---

*更新时间：2026年7月14日*
