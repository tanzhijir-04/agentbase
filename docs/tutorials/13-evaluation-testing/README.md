# 第 13 章: Agent 评估与测试策略

## 本章目标

掌握客观衡量 Agent 效果的方法论，学会构建自动化测试体系。

## 章节内容

- [ ] Agent 的核心评估指标（完成率、准确率、幻觉率、轮次、耗时）
- [ ] 三种评估方法：自动化评测、人工评估、红蓝对抗
- [ ] 回归测试：模型升级后的行为对比
- [ ] 幻觉衡量与治理
- [ ] 面试高频问法

![配图：Agent 评估仪表盘 - 五大核心指标一目了然](/assets/13-eval-01-dashboard.png)


## 配套代码

- 13-evaluation-testing/agent_eval.js — 评估工具
- 13-evaluation-testing/tests/ ← 原 minimal_agent/tests/

## 面试高频问法

1. 怎么衡量一个 Agent 的效果好坏？
2. 怎么做 Agent 的回归测试？
3. 怎么降低 Agent 的幻觉？
