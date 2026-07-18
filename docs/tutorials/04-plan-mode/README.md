# 第 04 章: Plan Mode — 规划与推理

> 让 Agent 在行动之前"停下来想一想"——这是 ReAct 循环的增强策略，不是替代。

## 本章目标

掌握 Plan Mode 的设计原理和实现方式，理解它和基础 ReAct 循环的关系。

## 前置知识

- 第 02 章：ReAct 核心执行循环（Plan Mode 是挂在 ReAct 循环上的增强）
- 第 03 章：Memory 记忆系统

## Plan Mode 和 ReAct 的关系

Plan Mode **不是**替换 ReAct，而是在 ReAct 循环上增加了一个"前置规划阶段"：

`
普通 ReAct 循环：  思考 → 行动 → 观察 → 思考 → 行动 → 观察 → ...
                          ↑
Plan Mode 增强：  规划 → 执行计划 → 思考 → 行动 → 观察 → ...
                   ↑___ 先停一下，做个计划 ___↑
`

**什么时候叠加 Plan Mode？**

- 任务复杂度高（>5 步）
- 步骤间有严格依赖关系
- 安全敏感场景（需要先审批计划再执行）

**什么时候不需要？**

- 简单任务（1-3 步）
- 实时交互场景（用户等不及先规划）
- 固定流程场景（已经有工作流编排）

## 章节内容

（以下为原 01-plan-mode 的完整内容，调整为 Plan Mode 作为 ReAct 增强策略的定位）

- analysis.md — Codex Plan Mode 实现分析
- complete.md — 完整实现指南
- faq.md — 常见问题
- implementation_guide.md — 实现指南
- practice.md — 练习实践

## 面试高频问法

1. Plan Mode 和 ReAct 模式的核心区别是什么？什么时候用哪个？
2. Plan Mode 的实现中，计划怎么生成？怎么验证？
3. 计划执行到一半发现不准确，怎么动态调整？

## 配套代码

| 文件 | 说明 |
|------|------|
| plan_mode.js | Plan Mode 基础版 |
| plan_mode_enhanced.js | Plan Mode 增强版 |
