# 第 02 章: Agent 核心执行循环 — ReAct 模式

> 从零跑通你的第一个 Agent：一个能思考、能调用工具、能观察结果的最小执行循环。

## 本章目标

写出你的第一个 Agent——一个 30 行左右、支持多轮对话+工具调用的最小执行循环。

## 前置知识

- 第 01 章：LLM 基础与函数调用
- 熟悉 JavaScript 基本语法

## 章节内容

本章包含以下文档，建议按顺序阅读：

| 文件 | 内容 | 适合人群 |
|------|------|---------|
| [01-react-loop-basics.md](./01-react-loop-basics.md) | ReAct 循环从零入门：什么是 ReAct、最简实现（30 行）、Agent 定义、与传统模式对比、面试高频问法 | **所有人，从这里开始** |
| [loop_control_guide.md](./loop_control_guide.md) | 进阶：循环控制、断路器、状态机、工作流引擎 | 已掌握 ReAct 基础后阅读 |

## 配套代码

| 文件 | 说明 |
|------|------|
| `minimal_agent/agent.js` | 完整编码 Agent 实现（含 Plan Mode），展示了 ReAct 循环的实际运行 |
| `demos/demo_language_detection.js` | 语言检测应用示例 |

## 本章产出

✅ 理解 ReAct 循环的"思考→行动→观察"三步模型
✅ 能手写一个最简 ReAct 循环
✅ 能清晰回答"Agent 是什么"、"Agent 和传统脚本有什么区别"
✅ 为学习循环控制（loop_control_guide.md）做好准备
