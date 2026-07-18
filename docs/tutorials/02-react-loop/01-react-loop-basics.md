---
sidebar_position: 1
---

# 01. ReAct 循环入门：思考 → 行动 → 观察

> 这是整个 Agent 体系里最重要的一个概念：**ReAct 循环**。读完这篇，你应该能亲手写一个最简 Agent。

---

## 1. 什么是 ReAct

ReAct 是 **Rea**soning（推理）和 **Act**ion（行动）的合成词。它不是某个框架的专利，而是一种通用的"思考-行动-观察"循环模式。

想想人类是怎么解决复杂问题的：

1. 你看到一个问题，**思考**这个问题的性质
2. 你决定**做**点什么，比如查资料、算个数、问个人
3. 你**观察**结果，判断有没有解决问题
4. 如果没有，回到步骤 1，换个思路再来一次

ReAct 的 Agent 做了完全一样的事：

```
① 思考（Think）：LLM 分析当前上下文，决定下一步做什么
② 行动（Act）：调用工具（搜索、计算、读文件……）
③ 观察（Observe）：将工具结果放回上下文，LLM 看到后继续思考

   重复 ①→②→③，直到模型给出最终答案
```

### 一个具体例子

用户问："北京现在多少度？"

| 步骤 | 内容 |
|------|------|
| 思考 | 用户想知道北京的当前温度，我需要查天气 API |
| 行动 | 调用 `get_weather("北京")` |
| 观察 | 工具返回 `"晴天，25°C"` |
| 思考 | 工具已经返回了数据，我直接回答用户 |
| 行动 | 输出最终答案 |

看起来很简单，对吧？但这个简单的循环恰恰是所有 Agent 的骨架。不管是写代码的 Cursor、做客服的 Chatbot，还是复杂的 AutoGPT，底层都是这个模式。

![配图：小黑在一个旋转的三角形传送带上走——思考、行动、观察，循环往复](/assets/01-react-loop-01-think-act-observe.png)

---

## 2. 最简 ReAct 实现（~30 行）

理论够了，直接看代码。下面这个是最简 ReAct 循环的核心，去掉了一切装饰：

```javascript
/**
 * 最简 ReAct Agent 循环
 * 核心：while 循环 + LLM 调用 + 工具路由
 */
async function reactLoop(userInput, tools) {
  const messages = [
    { role: "system", content: "你是一个智能助手。你有以下工具可用：" +
      tools.map(t => `${t.name}: ${t.description}`).join("\n") +
      "当你需要调用工具时，输出 JSON 格式：{ \"tool\": \"工具名\", \"args\": { ... } }" +
      "当你准备好回答时，输出 JSON 格式：{ \"answer\": \"你的回答\" }" },
    { role: "user", content: userInput }
  ];

  let maxIterations = 10;

  while (maxIterations-- > 0) {
    // 1. 思考：调用 LLM
    const response = await callLLM(messages);
    const parsed = JSON.parse(response);

    // 2. 如果模型给出最终答案，结束循环
    if (parsed.answer) {
      return parsed.answer;
    }

    // 3. 行动：解析工具调用并执行
    if (parsed.tool && tools[parsed.tool]) {
      const result = await tools[parsed.tool](parsed.args);
      // 4. 观察：把工具结果放回上下文
      messages.push(
        { role: "assistant", content: response },
        { role: "tool", content: JSON.stringify(result), tool_call_id: parsed.tool }
      );
    }
  }

  return "已达最大迭代次数，无法完成请求。";
}
```

这就是一个 Agent 的全部骨架。30 行代码，你做完了：

- 一个 **while 循环** — 让 Agent 可以自主多轮交互
- 一次 **LLM 调用** — 模型根据上下文做决策
- 一个 **工具路由** — 把模型的决定翻译成实际函数调用
- 一个 **观察回填** — 让模型看到工具执行的结果

> 完整可运行的代码在：`minimal_agent/agent.js`。不过那个版本更完整一些（加了 Plan Mode），但核心逻辑和上面完全一致。

---

## 3. Agent 的开发者定义

聊 Agent 的人很多，大家对"Agent"的定义总在打架。这里给一个务实、可落地的定义：

> **Agent = LLM 大模型 + 工具调用能力 + 状态记忆 + 自主执行循环**

拆开看：

| 组件 | 作用 | 类比 |
|------|------|------|
| **LLM** | 大脑，负责推理和决策 | 人的大脑 |
| **工具调用** | 手和脚，让 Agent 能对外部世界产生影响 | 人的手/工具 |
| **状态记忆** | 短期和长期记忆，让 Agent 知道"刚才发生了什么" | 人的短期记忆 |
| **自主循环** | 持续运行，让 Agent 能主动完成任务 | 人的"意识流" |

缺少任何一个，你得到的都不是完整的 Agent，而是一个更弱的变体：

- **只有 LLM + 工具** = 增强版 API 调用（没有持久化的循环，一问一答就结束了）
- **只有 LLM + 循环** = 自言自语机器人（什么也做不了）
- **只有 LLM** = OpenAI Playground

![配图：小黑在组装一个机器人——四个零件分别标着大脑、手脚、记忆、循环——Agent 四组件](/assets/01-react-loop-02-agent-components.png)

---

## 4. Agent vs 传统编程范式

这个问题面试几乎必问。一句话概括：

> **传统编程：开发者预设所有路径。Agent：模型自主选择路径。**

### vs 自动化脚本

```python
# 传统自动化脚本：路径是写死的
def daily_report():
    data = fetch_data()       # 固定的
    clean_data(data)          # 固定的
    generate_chart(data)      # 固定的
    send_email(report)        # 固定的

# Agent：每一步自己决定下一步做什么
def agent_loop():
    while True:
        thought = llm.think(context)  # 模型分析上下文
        action = thought.decide()      # 模型自主决定
        result = execute(action)       # 执行
        context += result              # 观察并更新上下文
```

自动化脚本的路径是铁轨，Agent 的路径是地图。铁轨上你只能朝一个方向走，地图上模型自己选路。

![配图：左边小黑在铁轨上只能直走，右边小黑拿着地图在岔路口自己选路——路径选择权的对比](/assets/01-react-loop-03-rail-vs-map.png)

### vs 规则引擎

规则引擎的长项是确定性逻辑：**"如果 A 且 B，则执行 C"**。但现实世界的问题很少有明确的"如果-那么"路径。Agent 的优势在于处理模糊的、不确定的、需要推理的任务。

| 场景 | 规则引擎 | Agent |
|------|---------|-------|
| 检查用户输入是否包含敏感词 | ✅ 完美 | ❌ 大材小用 |
| 用户说"帮我写个爬虫，但我不确定网站结构" | ❌ 规则写不完 | ✅ LLM 推理擅长 |
| 计算员工工资 | ✅ 确定逻辑 | ❌ 没必要 |
| 分析用户反馈，提取改进建议 | ❌ 语义理解弱 | ✅ 自然语言优势 |

### vs 聊天机器人

早期的聊天机器人本质是"检索 + 回复"：用户问什么，它从知识库找一段话返回。它不调用工具，不做推理，不维护状态。

Agent 的聊天只是一个"接口形态"。同一套 ReAct 循环，可以跑在聊天界面里，也可以跑在后台定时任务里，也可以跑在 CI/CD pipeline 里。Agent 的核心不是"聊天"，是"自主执行"。

---

## 5. 配套代码

本章配套的完整可运行代码：

| 文件 | 说明 |
|------|------|
| `minimal_agent/agent.js` | 完整编码 Agent 实现（含 Plan Mode），展示了 ReAct 循环的实际运行 |
| `loop_control_guide.md` | 进阶内容：循环控制、断路器、状态机、工作流引擎 |

建议学习顺序：

1. 先读本文，理解 ReAct 的概念
2. 去跑一下 `agent.js`，看看一个 Agent 实际是怎么工作的
3. 如果有兴趣，再看 `loop_control_guide.md`，学习怎么让循环更健壮

---

## 6. 面试高频问法

**Q1：手写一个最简 ReAct 循环的伪代码或 JavaScript 实现**

考察核心：能不能把 while 循环 + LLM 调用 + 工具路由 + 观察回填这四个要素写清楚。参考上面的 30 行实现。

**Q2：ReAct 模式的核心步骤是什么？**

回答要点：① 思考（LLM 推理当前状态）→ ② 行动（调用工具）→ ③ 观察（把工具结果放回上下文）→ 重复直到有答案。强调这是"循环"而不是"线性流程"。

**Q3：Agent 和传统自动化脚本的本质区别是什么？**

本质区别：**路径的选择权**。自动化脚本的路径是开发者编译时写死的，Agent 的路径是模型运行时自主选择的。Agent 可以处理模糊、不确定、需要推理的任务，自动化脚本适合确定性的重复劳动。

**Q4：Agent 需要工具调用吗？不调用工具、直接让模型输出最终结果不行吗？**

不行。原因：

- 模型的知识有截止日期，无法获取实时信息（股价、天气、最新新闻）
- 模型无法操作外部系统（发邮件、改数据库、执行代码）
- 模型会"幻觉"，工具调用可以提供真实的观测数据来纠正幻觉

没有工具调用的 Agent 就是一个"高级聊天机器人"，它不是 Agent。

**Q5：ReAct 中的 "Act" 和普通 API 调用的 "Function Calling" 有什么区别？**

Function calling 是一个 API 特性：模型输出一个结构化的工具调用请求，开发者拿到后自己调用函数，然后把结果传回。ReAct 的 "Act" 是把这个过程放在一个**自主循环**里：模型不仅决定调用哪个工具，还决定**什么时候调用、调用几次、调完以后下一步做什么**。Function calling 是 ReAct 的"一句话"，ReAct 是"整篇文章"。

---

*编写于 2026-07-18 | 对应代码目录：`minimal_agent/`*
