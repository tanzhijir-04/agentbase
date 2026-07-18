# Token 机制、计费与核心生成参数

> 搞 Agent 开发，第一件事不是学框架，而是理解你每次调 LLM 接口时钱花在哪、参数怎么调。

---

## Token 是什么

Token 是 LLM 处理文本的最小单位。它不是按"字"算的，也不是按"字符"算的——它是模型分词器（Tokenizer）切出来的语义片段。

英文字符通常一个 token 约等于 1 个单词的 3/4：

- `Hello` → 1 token
- `Hello world` → 2 tokens
- `Hello, how are you?` → 5 tokens

中文一个字大约是 1-2 个 token：

- `你好` → 2 tokens
- `人工智能` → 3-4 tokens（取决于分词器）

### 为什么需要 Token 化

模型不理解文字，只理解数字。Tokenizer 就是一部"字典"：把自然语言映射到整数 ID，模型在 ID 空间里做概率计算。

```
输入文本 → Tokenizer → Token ID 序列 → 模型推理 → 输出 Token ID → Decoder → 文本
```

不同的模型用不同的 Tokenizer。GPT-4 用的是 `cl100k_base`，Claude 3 用的是自己的 SentencePiece 变体。所以**同一个句子在不同模型上的 token 数可能不一样**。

### 中文 Token 消耗的教训

刚接触 OpenAI 的开发者最容易踩的坑：英文 saying "I love you" 是 3 个 token，中文说"我爱你"可能是 4-5 个 token。Agent 系统里的大段中文文档消耗的 token 数会比想象中多一倍。

实践建议：**如果你面向中国市场做 Agent，永远按中文 1.5 倍于英文的 token 消耗来做预算。**

![配图：小黑拿剪刀把中文和英文纸条切成不同大小的碎片——中文碎片明显比英文大，形象表达 Token 分词的物理隐喻](/assets/01-token-basics-01-token-cutting.png)

---

## Token 计算方式

### 一次 LLM 调用的 Token 构成

一次 API 调用消耗的 token = **输入 token（Prompt）** + **输出 token（Completion）**。

不要以为只有你的"问题"算 token。整个对话历史、系统提示、工具定义、few-shot 示例——全都要算钱。

```javascript
// 请求体里的每一段都是 token
const request = {
  model: 'gpt-4',
  messages: [
    { role: 'system', content: '你是一个 AI Agent...' },  // 计入 input
    { role: 'user', content: '帮我查一下天气' },            // 计入 input
    { role: 'assistant', content: '好的，我来查' },         // 计入 input
    { role: 'user', content: '北京今天多少度' },            // 计入 input
  ],
  tools: [{ /* 工具定义 */ }],   // 也计入 input
  max_tokens: 1000  // 模型最多再生成 1000 个 output token
};
```

### 如何估算 Token

几个估算规则：

| 内容 | 估算方法 |
|------|----------|
| 英文文本 | 字符数 ÷ 4 ≈ token 数 |
| 中文文本 | 字数 × 1.5 ≈ token 数 |
| 代码 | 字符数 ÷ 3 ≈ token 数 |
| 工具定义（JSON） | 序列化后字符数 ÷ 3 |

### 工具函数：精确计算

不想估算？直接用 Tokenizer 库精确算：

```javascript
// OpenAI - 使用 tiktoken
import { encoding_for_model } from 'tiktoken';

function countTokens(text, model = 'gpt-4') {
  const enc = encoding_for_model(model);
  const tokens = enc.encode(text);
  enc.free();
  return tokens.length;
}
```

### 预留 Token 的黄金法则

一个 128K 上下文窗口的模型，**永远别按满算**。建议留出 20-30% 的余量：

- 系统提示：固定占用 500-2000 tokens
- 对话历史：每轮约 200-500 tokens
- 工具定义：每个工具 100-500 tokens
- 输出：预留 1000-4000 tokens

```javascript
// 一个 Agent 单次调用的典型 token 预算
const BUDGET = {
  systemPrompt: 2000,     // 系统指令
  conversation: 8000,     // 最近几轮对话
  tools: 3000,           // 工具定义
  output: 2000,          // 模型输出
  buffer_percent: 0.25,  // 安全余量

  get maxInput() {
    return this.systemPrompt + this.conversation + this.tools;
  }
};
```

![配图：小黑往天平上一个个放砝码——系统提示、对话历史、工具定义、输出预算，每个都要算钱](/assets/01-token-basics-02-token-budget.png)

---

## 不同模型的 Token 计价

价格一直在变，但计价模式相对稳定。截至 2026 年中，主流模型的大致价格区间：

| 模型系列 | 输入价格（/1M tokens） | 输出价格（/1M tokens） | 上下文窗口 |
|----------|----------------------|----------------------|-----------|
| GPT-4o | $2.50-$5.00 | $10.00-$15.00 | 128K |
| GPT-4o-mini | $0.15-$0.30 | $0.60-$1.20 | 128K |
| Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| Claude 3 Haiku | $0.25 | $1.25 | 200K |
| DeepSeek-V3 | $0.27 | $1.10 | 64K |

> 价格数据是简化示意，实际价格请参考各家官网

### 价格不等于成本

便宜模型不等于总成本低。因为：

- **推理质量**：便宜模型可能需要更多次重试才能给出正确答案
- **输出长度**：差模型可能产生更多无用输出 token
- **上下文效率**：更聪明的模型能用更少的 token 表达同样的意思

所以选模型要算的是**任务级别的总成本**，不是简单的"每 token 单价"。

### Agent 场景的特殊性

做 Agent 跟做 Chatbot 的成本结构完全不一样：

- Agent 反复调用 LLM，每轮决策都要重新计算
- 工具调用结果要塞回上下文，让上下文迅速膨胀
- 错误重试让成本翻倍

> 一个典型的 Agent 任务（比如"帮我写一个网页"）可能需要 5-15 次 LLM 调用，每次消耗 5K-20K tokens。一次任务的成本是 $0.1-$0.5，不是几毛钱一调用那么简单。

---

## 核心生成参数

### Temperature

控制模型输出的"随机性"——或者说创造性。

| temperature | 行为 | 适用场景 |
|-------------|------|----------|
| 0.0 - 0.2 | 确定性输出，每次都选概率最高的 token | 代码生成、数学计算、结构化输出 |
| 0.3 - 0.7 | 适度随机，兼顾准确与多样性 | 普通对话、客服回复 |
| 0.8 - 1.0 | 高随机性，更有创意 | 创意写作、头脑风暴 |
| > 1.0 | 高度随机，可能无意义 | 不建议使用 |

底层原理：模型最后一层输出每个 token 的概率分布，temperature 通过 softmax 中的温度参数缩放这个分布：

```text
temperature → 0：概率最高的 token 无限接近 100%
temperature → 1：保持原始概率分布
temperature → ∞：所有 token 等概率（完全随机）
```

### Top P（Nucleus Sampling）

Top P 控制"累计概率阈值"。模型只考虑概率加起来刚好超过 P 的那堆 token。

- top_p = 0.9：只选累计概率到 90% 的 token 候选集
- top_p = 0.1：只选概率最高的 10% token

**调参口诀**：

| 想达到的效果 | 推荐做法 |
|--------------|----------|
| 稳定输出 | temperature 0.1-0.3，top_p 0.9-1.0 |
| 靠谱但有点变化 | temperature 0.5，top_p 0.95 |
| 创意满满 | temperature 0.8，top_p 0.95 |

经验：**不要同时调两个**。要么固定 top_p 调 temperature，要么反过来。通常先调 temperature，如果还不够再动 top_p。

![配图：小黑转动一个带刻度的怪旋钮，左边是冰块右边是火焰——低温确定、高温随机](/assets/01-token-basics-03-temperature-dial.png)

### Max Tokens

限制模型一次输出最多生成多少个 token。

踩坑经验：

- max_tokens 设太小，输出被截断——大部分 SDK 不会告诉你"我还没说完"
- 设太大，浪费钱。模型真的会一直生成直到 max_tokens 才停——所以要**准确设置**

```javascript
// 典型场景的 max_tokens
const MAX_TOKENS = {
  quickReply: 500,       // 简短回复
  codeGen: 4000,         // 代码生成
  analysis: 2000,        // 分析结论
  toolResponse: 200,     // 工具调用的确认回复
};
```

### Stop Sequences

告诉模型"看到这个序列就停"。模型生成过程中逐 token 检查匹配 stop 序列，匹配后立即停止生成（stop 序列本身不包含在输出中）。

```javascript
// 常用 stop 序列
const stop = ['\n\n', 'Human:', 'User:'];

// 工具调用场景：等模型说出工具名就继续
// 或者：等模型停止输出代码块
```

常见应用：

- 多轮对话中防止模型"扮演用户"（stop: ['User:', 'Human:']）
- 代码生成中只输出单个代码块（stop: ['```\n']）
- 流式输出时切分片段

### Frequency Penalty & Presence Penalty

这两个参数是给文本生成场景用的，**Agent 场景几乎用不到**。

| 参数 | 作用 | 适用 |
|------|------|------|
| frequency_penalty | 惩罚已经出现过的 token，避免重复 | 故事写作 |
| presence_penalty | 鼓励引入新话题 | 长文本生成 |

Agent 场景建议：两个都保持 0。做 Agent 要的是精准，不需要鼓励模型发散。

---

## 参数调优经验总结

这是做 Agent 过程中最痛的参数配置经验：

### 1. 不同阶段用不同的 temperature

```javascript
const PARAMS = {
  // 规划阶段：需要稳定推理
  planning: { temperature: 0.1, top_p: 0.9 },
  // 执行阶段：执行工具调用，必须精确
  tool_call: { temperature: 0.0, top_p: 1.0 },
  // 回复阶段：稍微放松一点
  response: { temperature: 0.3, top_p: 0.95 },
  // 创意阶段：发散思维
  creative: { temperature: 0.8, top_p: 0.95 },
};
```

### 2. Tool Calling 永远用最低温度

如果模型在做 function calling 时 temperature > 0.3，你一定会看到：模型自己发明工具名、参数格式写错、调用语义偏差。**强制 temperature = 0**。

### 3. Stop 序列是效率神器

没有 stop 序列的 Agent 像话痨，模型会在一句话里反复确认、补充、道歉。用好 stop 让 Agent 更"机器化"：

```javascript
const agentStop = [
  '\n\nHuman:',
  '\n\nUser:',
  '\n\nAssistant:',
  '<|endoftext|>',
];
```

### 4. 别忘了 stream

流式输出在 Agent 场景下的作用：

- 用户体验上：不需要等全部生成完毕才看到输出
- 成本上：输出越快，Agent 整体延迟越低
- 可靠性上：可以边生成边检查 stop 条件

---

### 面试高频问法

**Q1: Temperature 和 Top P 有什么区别？分别控制什么？**

参考答案要点：Temperature 通过缩放 softmax 概率分布控制输出的随机性，低温趋近 argmax 完全确定，高温让分布更均匀。Top P 是核采样，只保留累积概率超过 P 的最小 token 集合，从中采样。两者不推荐同时调。一句话：temperature 控制分布的"陡峭程度"，top_p 控制采样"候选集大小"。

**Q2: Token 是怎么计算的？怎么估算一次请求的 token 消耗？**

参考答案要点：Token 是模型分词的最小单位，不同模型用不同的分词器。中文大约字数的 1.5 倍，英文约字符数/4。估算时考虑 system prompt + 对话历史 + 工具定义 + 输出 + 缓冲。精确计算用 tiktoken 等专用库。Agent 场景要特别注意工具定义和上下文膨胀带来的额外消耗。

**Q3: 在 Agent 场景下，temperature 应该怎么设置？为什么？**

参考答案要点：Agent 场景关键是"可靠"而非"创意"。工具调用阶段应设为 0（完全确定），规划阶段 0.1-0.2（适度稳定），回复阶段可适当提高至 0.3-0.5。核心原则是保证模型输出格式正确、意图稳定，避免模型"自由发挥"导致工具调用失败。

---

*配套代码：本项目中的 `llm_client.js` 演示了这些参数的实战用法*
*更新时间：2026年7月18日*
