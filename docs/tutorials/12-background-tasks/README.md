# 第 12 章: 后台任务与异步执行

## 本章目标

掌握 Agent 中长耗时任务的处理模式：异步、排队、超时中断。

## 章节内容

- [ ] 为什么 Agent 需要后台任务
- [ ] 消息队列模式
- [ ] 任务调度与优先级
- [ ] 超时处理与断点续传
- [ ] 面试高频问法

![配图：同步阻塞 vs 异步非阻塞 - 长任务交给队列](/assets/12-background-01-sync-vs-async.png)


## 配套代码

- 12-background-tasks/message_queue.js ← 原 minimal_agent/message_queue.js
- 12-background-tasks/task_scheduler.js ← 原 minimal_agent/task_scheduler.js

## 面试高频问法

1. Agent 的长任务怎么在不阻塞主流程的情况下执行？
2. 后台任务的超时中断怎么设计？
