# 第 08 章: Multi-agent 多智能体系统

## 本章目标

理解多 Agent 的三种主流架构模式和选型依据，知道什么时候需要多 Agent、会引入什么新问题。

## 前置知识

- 第 04 章：Plan Mode
- 第 07 章：Harness 执行框架

## 章节内容

### 现有内容

- multi_agent_management_guide.md — 多 Agent 管理完整指南（原内容，已迁移）

### 新增内容

#### 三种主流多 Agent 架构

1. **层级式（Hierarchical）**：主管 Agent 分配任务，员工 Agent 执行
   - 典型：Claude Code 的 Plan Mode + 子任务分发
   - 优点：职责清晰、可扩展
   - 缺点：主管成为瓶颈

2. **协作式（Collaborative）**：多个平级 Agent 通过消息传递协作
   - 典型：消息队列 + 任务调度
   - 优点：去中心化、高弹性
   - 缺点：协调成本高

3. **对抗式（Adversarial）**：生成 Agent + 校验 Agent
   - 典型：生成→检查→反馈循环（类似红蓝对抗）
   - 优点：输出质量高
   - 缺点：效率低、成本翻倍
![配图：三种多 Agent 架构对比——层级式、协作式、对抗式](/assets/08-multi-agent-01-three-architectures.png)

#### 多 Agent 的选型依据

| 场景 | 推荐架构 | 理由 |
|------|---------|------|
| 明确上下级关系 | 层级式 | 分工清晰 |
| 任务可并行拆解 | 协作式 | 吞吐量高 |
| 质量要求极高 | 对抗式 | 层层校验 |
| 探索性任务 | 混合式 | 灵活 |
![配图：红蓝对抗——生成 Agent 与校验 Agent 层层把关](/assets/08-multi-agent-02-adversarial.png)

#### 多 Agent 带来的新问题

- 通信开销与死锁
- 上下文泄露与隐私
- 部分 Agent 失败的整体影响
- 调试难度指数级上升

## 面试高频问法

1. 单 Agent 和多 Agent 怎么选型？
2. 多 Agent 系统会引入什么新问题？
3. 说说你了解的三种多 Agent 架构，分别适用什么场景？
4. 多个 Agent 之间怎么通信？消息丢失怎么办？

## 配套代码

| 文件 | 说明 |
|------|------|
| multi_agent_system.js | 多 Agent 系统实现 |
| multi_agent_collaboration.js | 协作示例 |
| demos/demo_multi_agent.js | 多 Agent 演示 |

