# 第 15 章: 性能与成本优化

## 本章目标

掌握 Agent 在生产环境中的性能优化和成本控制方法。

## 章节内容

- [ ] Token 优化：上下文裁剪、摘要压缩
- [ ] 模型分层选型（大模型 vs 小模型的分工）
- [ ] 结果缓存与避免重复计算
- [ ] 并发控制与请求合并
- [ ] 延迟优化策略
- [ ] 面试高频问法

![配图：模型分层选型 - 小模型处理简单任务, 大模型处理复杂任务](/assets/15-cost-01-model-tiering.png)


## 配套代码

- 15-cost-optimization/token_optimizer.js — Token 优化示例
- 15-cost-optimization/cache_manager.js — 缓存管理器

## 面试高频问法

1. 怎么降低 Agent 的单次任务 Token 成本？
2. 模型分层是什么？在什么场景下应该用大小模型搭配？
3. Agent 的延迟瓶颈通常在哪里？怎么优化？
