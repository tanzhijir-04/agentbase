 # Harness：Agent 的执行框架
 
 从概念到源码，拆解 LLM Agent 的执行引擎。
 
 ## 章节列表
 
 | # | 文章 | 内容 |
 |---|------|------|
 | 01 | [什么是 Harness](01-what-is-harness.md) | 概念、术语辨析、为什么需要它 |
 | 02 | [Harness 的工作原理](02-how-harness-works.md) | think-act-observe 循环、上下文管理、工具调度 |
 | 03 | [Harness 的核心设计](03-core-design.md) | 状态管理、安全边界、错误恢复、可观测性 |
 | 04 | [Codex CLI 中的 Harness](04-harness-in-codex.md) | 以 CC 的 agent_v2.js 为样本，逐层解析 |
 | 05 | [手写一个迷你 Harness](05-build-your-own.md) | 30 行核心循环 → 100 行完整实现 |
 
 ## 前置知识
 
 - 了解 LLM 的基本调用方式（输入 prompt → 输出 text）
 - 理解"工具调用"或"function calling"的基本概念
 
 ## 相关章节
 
 - [Plan Mode](../01-plan-mode/) — Harness 是 Plan Mode 的执行层
 - [Loop/Workflow 控制](../07-loop-control/) — Harness 的核心循环与此高度重叠
 - [MCP 协议](../09-mcp/) — 现代 Harness 的工具获取标准
