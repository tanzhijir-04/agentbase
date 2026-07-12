# 上下文压缩（Context Compression）学习笔记

## 1. 什么是上下文压缩？

上下文压缩是一种在AI Agent系统中用于管理长对话的技术。当对话历史变得很长时，可能会超出模型的上下文窗口限制，导致性能下降或无法处理更多内容。上下文压缩通过各种技术减少上下文长度，同时保留重要信息。

### 核心目标
- **减少token使用**：降低API调用成本
- **提高响应速度**：减少处理时间
- **保持对话连贯性**：保留重要上下文信息
- **突破上下文限制**：处理更长的对话

## 2. 为什么需要上下文压缩？

### 2.1 技术限制
- **上下文窗口限制**：大多数LLM有固定的上下文窗口大小（如GPT-4的128K tokens）
- **性能下降**：上下文越长，模型响应越慢
- **成本增加**：token数量直接影响API调用成本

### 2.2 实际场景需求
- **长期对话**：用户与Agent的长时间交互
- **复杂任务**：需要多轮对话的复杂任务
- **多Agent协作**：多个Agent之间的对话历史

## 3. 主要压缩技术

### 3.1 滑动窗口（Sliding Window）
**原理**：只保留最近的N条对话历史
**优点**：实现简单，效果稳定
**缺点**：可能丢失早期重要信息

### 3.2 摘要压缩（Summary Compression）
**原理**：使用LLM对长对话进行摘要，保留关键信息
**优点**：能保留重要信息
**缺点**：需要额外的LLM调用，可能丢失细节

### 3.3 关键信息提取（Key Information Extraction）
**原理**：从对话中提取关键信息（实体、意图、决策等）
**优点**：高度结构化，易于后续处理
**缺点**：可能丢失上下文细节

### 3.4 重要性评分（Importance Scoring）
**原理**：根据重要性对对话内容进行评分，删除不重要的内容
**优点**：智能保留重要内容
**缺点**：需要设计评分算法

### 3.5 分层存储（Hierarchical Storage）
**原理**：将不同重要性的内容存储在不同层级
**优点**：平衡信息保留和压缩效率
**缺点**：实现复杂

## 4. 实际应用场景

### 4.1 代码助手场景
- **问题**：长时间编码对话会积累大量代码片段和讨论
- **解决方案**：保留最近代码，压缩早期讨论
- **实现**：滑动窗口 + 代码摘要

### 4.2 客服机器人场景
- **问题**：长时间客户支持会积累大量问题和解决方案
- **解决方案**：提取关键问题和解决方案
- **实现**：关键信息提取 + 重要性评分

### 4.3 项目管理场景
- **问题**：项目讨论会积累大量决策和待办事项
- **解决方案**：提取决策和行动项
- **实现**：关键信息提取 + 分层存储

## 5. 性能考虑

### 5.1 压缩策略选择
- **简单场景**：滑动窗口（实现简单，效果稳定）
- **复杂场景**：摘要压缩（保留更多信息）
- **实时场景**：重要性评分（平衡效率和效果）

### 5.2 压缩时机
- **定期压缩**：每N条消息后压缩
- **按需压缩**：当上下文接近限制时压缩
- **智能压缩**：根据对话复杂度动态调整

### 5.3 评估指标
- **信息保留率**：压缩后保留了多少重要信息
- **压缩率**：减少了多少token
- **响应质量**：压缩后模型响应质量是否下降
- **处理时间**：压缩操作的耗时

## 6. 与现有系统的集成

### 6.1 与Memory系统集成
- Memory系统存储长期信息
- 上下文压缩管理短期对话
- 两者结合实现完整的记忆管理

### 6.2 与Plan Mode集成
- Plan Mode需要保持任务上下文
- 上下文压缩确保关键任务信息不丢失
- 支持长时间任务执行

### 6.3 与多Agent系统集成
- 多个Agent之间的对话历史管理
- 重要决策和上下文的共享
- 减少跨Agent通信的token使用

## 7. 学习要点

### 核心概念理解
- [ ] 理解上下文压缩的必要性
- [ ] 掌握主要压缩技术的原理
- [ ] 了解不同技术的优缺点

### 实践能力培养
- [ ] 实现滑动窗口压缩器
- [ ] 实现摘要压缩器
- [ ] 设计重要性评分算法

### 系统集成能力
- [ ] 将压缩功能集成到现有Agent
- [ ] 与Memory系统协调工作
- [ ] 优化压缩策略和参数

### 性能优化能力
- [ ] 评估不同压缩策略的效果
- [ ] 优化压缩算法的性能
- [ ] 平衡压缩率和信息保留率

## 8. 下一步计划

### 短期目标（1-2天）
1. 实现基础的上下文压缩器
2. 集成到现有Agent系统
3. 测试不同压缩策略的效果

### 中期目标（3-5天）
1. 实现智能压缩算法
2. 与Memory系统深度集成
3. 优化性能和用户体验

### 长期目标（1周+）
1. 实现自适应压缩策略
2. 支持多模态内容压缩
3. 构建完整的上下文管理系统

## 9. 参考资料

### 学术论文
- Learning to Compress Contexts for Transformer-based Models
- Dynamic Context Compression for Efficient Large Language Models

### 开源项目
- LangChain的上下文压缩模块
- LlamaIndex的上下文管理

### 实践指南
- OpenAI的最佳实践文档
- HuggingFace的模型优化指南

---

**学习时间**：2026年7月12日
**学习状态**：进行中
**下一步**：创建代码示例并测试

---

*本笔记将随着学习进度持续更新*


---

## 10. Codex 上下文压缩实现分析

> 基于 OpenAI Codex 开源项目（Rust 实现）的源码分析

### 10.1 项目结构

Codex 的上下文压缩相关代码位于 `codex-rs/` 目录下：

```
codex-rs/
├── core/src/
│   ├── compact.rs              # 核心压缩逻辑
│   ├── compact_remote.rs       # 远程压缩实现
│   ├── compact_model_fallback.rs  # 模型降级处理
│   ├── compact_token_budget.rs # Token 预算管理
│   └── context_manager/        # 上下文管理器
├── prompts/
│   └── templates/compact/
│       ├── prompt.md           # 压缩提示词
│       └── summary_prefix.md   # 摘要前缀
└── rollout/src/
    └── compression.rs          # Rollout 文件压缩（zstd）
```

### 10.2 压缩触发机制

#### 自动压缩（Auto Compact）
当 token 使用达到限制时自动触发：

```rust
// 从 context_window.rs
pub(crate) struct ContextWindowTokenStatus {
    pub(crate) active_context_tokens: i64,
    pub(crate) auto_compact_scope_tokens: i64,
    pub(crate) auto_compact_scope_limit: Option<i64>,
    pub(crate) full_context_window_limit: Option<i64>,
    pub(crate) tokens_until_compaction: Option<i64>,
    pub(crate) token_limit_reached: bool,
}
```

触发条件：
- `auto_compact_scope_tokens >= auto_compact_scope_limit`
- 或 `active_context_tokens >= full_context_window_limit`

#### 手动压缩（Manual Compact）
用户可以手动触发压缩任务。

### 10.3 两种压缩模式

#### 本地压缩（Local Compact）
使用当前 LLM 在本地生成摘要：

```rust
pub(crate) async fn run_inline_auto_compact_task(
    sess: Arc<Session>,
    turn_context: Arc<TurnContext>,
    initial_context_injection: InitialContextInjection,
    reason: CompactionReason,
    phase: CompactionPhase,
) -> CodexResult<()>
```

#### 远程压缩（Remote Compact）
使用 OpenAI Responses API 进行压缩：

```rust
pub(crate) async fn run_inline_remote_auto_compact_task(
    sess: Arc<Session>,
    step_context: Arc<StepContext>,
    fallback_step_context: Option<Arc<StepContext>>,
    turn_state: Arc<OnceLock<String>>,
    initial_context_injection: InitialContextInjection,
    reason: CompactionReason,
    phase: CompactionPhase,
) -> CodexResult<()>
```

### 10.4 压缩提示词

Codex 使用专门的压缩提示词：

```markdown
You are performing a CONTEXT CHECKPOINT COMPACTION. 
Create a handoff summary for another LLM that will resume the task.

Include:
- Current progress and key decisions made
- Important context, constraints, or user preferences
- What remains to be done (clear next steps)
- Any critical data, examples, or references needed to continue

Be concise, structured, and focused on helping the next LLM 
seamlessly continue the work.
```

摘要前缀：

```markdown
Another language model started to solve this problem and produced 
a summary of its thinking process. You also have access to the 
state of the tools that were used by that language model. Use this 
to build on the work that has already been done and avoid duplicating work.
```

### 10.5 压缩流程

1. **Pre-compact hooks**：执行预压缩钩子
2. **构建初始上下文**：根据压缩类型决定是否注入初始上下文
3. **生成摘要**：使用 SUMMARIZATION_PROMPT 让 LLM 生成摘要
4. **构建压缩后历史**：
   - 保留最近的用户消息（最多 20,000 tokens）
   - 添加摘要消息
   - 在适当位置注入初始上下文
5. **Post-compact hooks**：执行后压缩钩子

### 10.6 关键参数

```rust
const COMPACT_USER_MESSAGE_MAX_TOKENS: usize = 20_000;
// 保留的最近用户消息 token 限制
```

### 10.7 压缩后历史构建

```rust
pub(crate) fn build_compacted_history(
    initial_context: Vec<ResponseItem>,
    user_messages: &[CompactedUserMessage],
    summary_text: &str,
) -> Vec<ResponseItem>
```

构建逻辑：
1. 从最新的用户消息开始，保留最多 20,000 tokens
2. 添加压缩摘要作为最后一条消息
3. 在适当位置注入初始上下文（系统提示、工具定义等）

### 10.8 函数输出截断

当上下文窗口超出限制时，Codex 会截断旧的函数调用输出：

```rust
const CONTEXT_WINDOW_TRUNCATED_OUTPUT_MESSAGE: &str =
    "Output exceeded the available model context and was truncated";

fn truncated_output_payload(output: &FunctionCallOutputPayload) -> FunctionCallOutputPayload {
    FunctionCallOutputPayload {
        body: FunctionCallOutputBody::Text(CONTEXT_WINDOW_TRUNCATED_OUTPUT_MESSAGE.to_string()),
        success: output.success,
    }
}
```

### 10.9 Rollout 文件压缩

Codex 还对 rollout 文件（对话历史记录）进行压缩：

- 使用 zstd 压缩算法
- 文件后缀：`.jsonl.zst`
- 后台异步压缩，不阻塞主流程

```rust
pub fn spawn_rollout_compression_worker(codex_home: PathBuf) {
    worker::spawn(codex_home)
}
```

### 10.10 设计亮点

1. **分层压缩策略**：
   - 本地压缩：快速，但消耗本地 token
   - 远程压缩：使用专门的压缩 API，更高效

2. **智能保留策略**：
   - 保留最近 20,000 tokens 的用户消息
   - 保留所有 assistant 消息
   - 保留压缩摘要

3. **渐进式降级**：
   - 首先尝试截断函数输出
   - 然后触发压缩
   - 支持模型降级（fallback）

4. **Hook 机制**：
   - Pre-compact hooks：压缩前执行
   - Post-compact hooks：压缩后执行
   - 支持自定义压缩行为

5. **上下文注入**：
   - 中轮压缩：在最后用户消息前注入
   - 预轮压缩：完全替换，下轮重新注入

### 10.11 与其他系统的对比

| 特性 | Codex | LangChain | LlamaIndex |
|------|-------|-----------|------------|
| 压缩触发 | 自动+手动 | 手动 | 手动 |
| 压缩方式 | LLM 摘要 | 多种 Extractor | 多种 |
| 保留策略 | 最近20K tokens | 可配置 | 可配置 |
| 远程压缩 | 支持 | 不支持 | 不支持 |
| Hook 机制 | 支持 | 不支持 | 不支持 |
| 文件压缩 | zstd | 不支持 | 不支持 |

---

**分析时间**：2026年7月12日
**数据来源**：OpenAI Codex 开源仓库（github.com/openai/codex）

