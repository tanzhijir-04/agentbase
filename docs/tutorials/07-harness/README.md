# 第 07 章: Harness 执行框架与范式选型

> Agent 的"引擎层"——把 LLM 从聊天接口变成干活接口的那层胶水。

## 本章目标

理解 Harness 的核心职责——驱动循环、管理上下文、调度工具、处理错误——以及四种主流执行范式的选型判断。

## 前置知识

- 第 02 章：ReAct 循环（Harness 是 ReAct 循环的工程化封装）
- 第 05 章：上下文生命周期管理

## 四个概念的分层

学到这里你可能会有"循环控制"和"Harness"分不清的困惑。做一个清晰的对应：

| 概念 | 对应章节 | 本质 |
|------|---------|------|
| ReAct 循环 | 第 02 章 | 最简 while-true（不考虑扩展性） |
| Harness 执行框架 | 第 07 章 | 模块化执行器（封装上下文/工具/错误处理，是单 Agent 的运行时容器） |
| 循环控制（断路器/限速） | 第 07 章 | Harness 内部的安全机制 |
| 工作流引擎（DAG/状态机） | 第 07 章 | 复杂任务的编排方式 |

**Harness 就是「把 ReAct 循环做成可扩展、可控、可观测的工程组件」。**

## 章节内容

### 核心文件（原 14-harness）

1. [什么是 Harness](01-what-is-harness.md)
2. [Harness 的工作原理](02-how-harness-works.md)
3. [核心设计](03-core-design.md)
4. [Codex CLI 中的 Harness 实现](04-harness-in-codex.md)
5. [手写一个迷你 Harness](05-build-your-own.md)

### 执行范式全对比

6. **ReAct**：最基础的思考→行动→观察循环
7. **Plan-and-Execute**：先计划再执行（见第 04 章）
8. **Reflexion（反思）**：Agent 对自己过去的行动进行反思，修正后续策略
9. **Self-Correction（自我修正）**：Agent 发现错误后自动回滚重试

| 范式 | 适用场景 | 不适用场景 |
|------|---------|-----------|
| ReAct | 简单任务、实时交互 | 复杂多步任务 |
| Plan-and-Execute | 复杂任务、安全敏感 | 实时性要求高的场景 |
| Reflexion | 效果优化、多轮推理 | 单轮快速回答 |
| Self-Correction | 代码生成、数据处理 | 幂等性差的场景 |

### 进阶循环控制（原 07-loop-control）

- 断路器：防止重复无效调用
- 速率限制：控制工具调用频率
- 状态机：管理 Agent 生命周期
- DAG 工作流引擎：复杂任务的有向无环图编排

## 面试高频问法

1. 四种执行范式（ReAct / Plan / Reflexion / Self-Correction）分别适合什么场景？
2. Harness 的核心职责是什么？和 LLM 调用封装有什么区别？
3. 怎么防止 Agent 死循环？断路器怎么设计？
4. 什么时候需要从 Harness 升级到工作流引擎？

## 配套代码

| 文件 | 说明 |
|------|------|
| harness.js | 核心 Harness 实现（重命名自 gent_v2.js） |
| loop_control.js | 循环控制（断路器/限速/状态机） |
| workflow_engine.js | DAG 工作流引擎 |
| demos/demo_loop_control.js | 循环控制演示 |
