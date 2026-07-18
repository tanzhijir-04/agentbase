# Claude Code 架构深度解析

> 一个专题系列，拆解"世界上最好的 AI Agent"——Claude Code 的内部设计，看顶级工业级 Agent 如何实现每一个核心特性。

---

## 这个系列是给谁看的？

- Agent 开发者：想知道别人的 Agent 怎么写的
- AI 产品经理：想理解 Agent 的能力边界和设计取舍
- 学习者：想从代码层面理解"Agent"到底是什么

## 目录

| # | 标题 | 状态 | 篇幅 |
|---|------|------|------|
| 01 | [源码架构深度复盘](./01-overview.md) | ✅ 完成 | 14K / 717 行 |
| 02 | [Tool 系统：Agent 的"双手"](./02-tool-system.md) | 📅 规划 | — |
| 03 | [QueryEngine：Agent 的"大脑循环"](./03-query-engine.md) | 📅 规划 | — |
| 04 | [Plan Mode 深度解析](./04-plan-mode.md) | 📅 规划 | — |
| 05 | [Memory 系统实现](./05-memory.md) | 📅 规划 | — |
| 06 | [上下文压缩策略](./06-context-compression.md) | 📅 规划 | — |
| 07 | [Multi-Agent 协作机制](./07-multi-agent.md) | 📅 规划 | — |
| 08 | [Skills / Plugins 架构](./08-skills-plugins.md) | 📅 规划 | — |
| 09 | [MCP 协议集成](./09-mcp.md) | 📅 规划 | — |
| 10 | [后台任务系统](./10-background-tasks.md) | 📅 规划 | — |
| 11 | [Sandbox 环境控制](./11-sandbox.md) | 📅 规划 | — |
| 12 | [TUI 终端渲染引擎](./12-tui.md) | 📅 规划 | — |
| 13 | [可观测性与遥测](./13-observability.md) | 📅 规划 | — |
| 14 | [设计哲学与学习清单](./14-philosophy.md) | 📅 规划 | — |

## 学习路径

先读 **01 概览**（已完稿，717 行干货），了解整体架构后，按兴趣深入各个专题。

## 关于源码分析

本系列基于 Claude Code 泄露源码（npm sourcemap）分析整理。
所有代码示例均为真实源码的精简版本，保留核心逻辑去除无关细节。

---

*系列创建时间：2026年7月15日*

