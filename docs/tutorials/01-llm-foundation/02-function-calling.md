# 结构化输出与函数调用（Function Calling）

> 这是 Agent 开发的核心技能：让"只会说话"的 LLM 输出机器能直接用的数据，甚至直接去调用工具。

---

## 为什么需要结构化输出

LLM 原生输出的是自然语言——一段无序的文字。但代码需要的是结构化的数据：

```text
用户问：北京明天多少度？
LLM 输出：北京明天 25°C，天气晴
代码得到：？？？（还要靠正则去猜）
```

Agent 场景更严重：Agent 需要让 LLM 决定"调用哪个工具、传什么参数"。如果不结构化，LLM 说"我建议你调用 weather 工具，参数是北京"——代码怎么解析这句话？靠 NLP 再套一层？

所以结构化的关键价值是：

- **机器可解析**：输出直接 JSON.parse，不用正则硬猜
- **可靠性**：约束输出格式，避免模型自由发挥
- **可组合**：多个输出的结构一致，方便下游处理

![配图：小黑从一团乱麻般的自然语言文字中抽出一张整齐的表格——从混乱到结构化的关键一步](/assets/02-function-calling-01-structured-output.png)

---

## JSON Mode

### 什么是 JSON Mode

JSON Mode 是 OpenAI 率先推出的能力：通过系统提示告诉模型"你只输出 JSON"，模型内部会调整采样策略，保证输出是合法的 JSON。

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: '你是一个信息提取助手。请以JSON格式输出结果。'
    },
    {
      role: 'user',
      content: '从以下文本中提取姓名和年龄：我叫张三，今年25岁。'
    }
  ],
  response_format: { type: 'json_object' }  // 启用 JSON Mode
});
```

输出示例：

```json
{
  "name": "张三",
  "age": 25
}
```

### JSON Mode 的局限性

JSON Mode 只保证"输出是合法 JSON"，但不保证 JSON 的结构（字段名、嵌套层级）。如果你需要严格约束结构，需要用 Function Calling。

### JSON Mode 的调优

```javascript
// 试试这样：给样例约束结构
const messages = [
  {
    role: 'system',
    content: `你是一个信息提取器。输出JSON格式，字段如下：
{
  "name": "string",
  "age": "number",
  "city": "string"
}`
  },
  // ...user message
];
```

但如果模型的输出 JSON 结构反复出错怎么办？——**上 Function Calling**。

---

## Function Calling：给模型一把钥匙

### 直觉

Function Calling 不是让模型真的去"调用"一个函数。它的本质是：

> 模型在输出中**声明**它想调用哪个工具，并**结构化地填写参数**。调用行为由开发者代码实际执行。

```
用户请求 → LLM 分析 → 决定调用 get_weather(city="北京")
                            ↓
                      输出 tool_call 对象（非文本）
                            ↓
                      代码解析 tool_call → 实际执行函数
                            ↓
                      结果返回给 LLM → 生成自然语言回复
```

### 底层原理

模型在训练阶段就被训练了"工具调用"的特殊 token 序列。当你在 API 中传递 tools 参数时：

1. 工具定义被序列化为一段特殊的 JSON，拼在系统提示后面
2. 模型内部有一个额外的"tool call 头"，指示模型切换到工具调用模式
3. 模型输出一个结构化的 JSON 对象，包含 `tool_name` 和 `arguments`
4. API 层把结构化 JSON 提取出来，返回给调用方

完整的工具定义：

```javascript
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，如北京、上海'
          },
          date: {
            type: 'string',
            description: '日期，格式 YYYY-MM-DD'
          }
        },
        required: ['city']
      }
    }
  }
];
```

### Function Calling 的工作流程

```
1. 发送消息 + tools 定义
          ↓
2. LLM 返回：
   - 要么：普通文本回复（finish_reason = "stop"）
   - 要么：tool_calls 对象（finish_reason = "tool_calls"）
          ↓
3. 代码判断 finish_reason：
   - stop：直接返回用户
   - tool_calls：提取参数 → 执行工具 → 把结果作为新消息传回
          ↓
4. 循环回到 1（直到 finish_reason 为 "stop"）
```

![配图：小黑把申请表递进一个怪机器的投递口，机器执行后把结果从另一个口递回来——声明意图、由代码执行](/assets/02-function-calling-02-tool-calling-flow.png)

### JavaScript 实现示例

```javascript
async function agentLoop(userInput) {
  const messages = [{ role: 'user', content: userInput }];

  while (true) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: tools,
      temperature: 0  // 强制精确
    });

    const choice = response.choices[0];

    // 没有工具调用 → 返回最终回复
    if (choice.finish_reason === 'stop') {
      return choice.message.content;
    }

    // 有工具调用 → 执行
    const toolCall = choice.message.tool_calls[0];
    const { name, arguments: args } = toolCall.function;

    // 实际的函数调用（开发者自己实现）
    const result = await executeTool(name, JSON.parse(args));

    // 把工具结果放回上下文
    messages.push(choice.message);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    });
    // 继续循环
  }
}
```

---

## 并行工具调用

现代模型（GPT-4o、Claude 3.5+）支持在一次回复中调用多个工具：

```json
{
  "tool_calls": [
    {
      "id": "call_1",
      "function": { "name": "get_weather", "arguments": "{\"city\":\"北京\"}" }
    },
    {
      "id": "call_2",
      "function": { "name": "get_weather", "arguments": "{\"city\":\"上海\"}" }
    }
  ]
}
```

**应用场景**：用户说"帮我查北京、上海、深圳三个城市的天气"。模型可以并行发起三次天气查询，而不是一个一个问。

```javascript
// 处理并行调用
for (const toolCall of choice.message.tool_calls) {
  const { name, arguments: args } = toolCall.function;
  // 发送给工具执行器
  promises.push(executeTool(name, JSON.parse(args)));
}

const results = await Promise.all(promises);

// 把所有结果放回上下文
results.forEach((result, i) => {
  messages.push({
    role: 'tool',
    tool_call_id: toolCalls[i].id,
    content: JSON.stringify(result)
  });
});
```

![配图：小黑同时伸出三只手接三根不同的管道——并行工具调用的隐喻](/assets/02-function-calling-03-parallel-calls.png)

---

## Function Calling 调优实战

### 1. 工具描述至关重要

```javascript
// ❌ 差的描述
{ name: 'search', description: '搜索' }

// ✅ 好的描述 - 告诉模型什么时候用、怎么用
{ name: 'search', description: '搜索引擎，用于查询最新的互联网信息。适合问天气、新闻、知识等需要实时数据的问题。参数 query 应包含完整的问题关键词。' }
```

工具描述的质量直接决定模型是否能正确选择工具。好的描述比好的参数名更重要。

### 2. 参数名要语义明确

```javascript
// ❌ 模糊的
{ name: 'q' }

// ✅ 清晰的
{ name: 'query', description: '搜索关键词，应该包含完整的查询语句' }
```

### 3. 不要把所有逻辑塞进一个工具

错误案例：一个 `do_everything(action, params)` 工具。模型搞不清该传什么 action。

正确做法：拆成多个语义明确的工具。

### 4. 处理工具调用失败

工具可能抛异常、超时、网络不通。安全做法：

```javascript
try {
  const result = await executeTool(toolName, args);
  messages.push({ role: 'tool', tool_call_id: id, content: JSON.stringify(result) });
} catch (error) {
  // 告诉模型工具调用失败了，让它决定怎么办
  messages.push({
    role: 'tool',
    tool_call_id: id,
    content: JSON.stringify({ error: error.message })
  });
}
```

让模型自己决定"重试"还是"告诉用户出错了"。不要替模型做决定。

---

## Function Calling 的局限

Function Calling 不是银弹：

- **模型幻觉**：模型可能自己编造不存在的工具名（temperature 太高时常见）
- **参数幻觉**：模型可能填入不存在的参数值（比如虚构一个城市名）
- **上下文膨胀**：每次 tools 定义都塞在请求里，几十个工具时 tokens 消耗很大
- **无状态**：每次调用都是独立的，模型不记得上一次用了什么工具

这些问题在后续章节（MCP 协议、Skills/Plugins 系统）中有更优雅的解法。

---

### 面试高频问法

**Q1: Function Calling（工具调用）的原理是什么？**

参考答案要点：Function Calling 不是 LLM 真的去调用函数。而是在模型输出的 token 序列中，有一组特殊 token 标记了"工具调用意图"。模型输出结构化 JSON 声明"我想调用哪个工具、传什么参数"，由开发者代码实际执行调用。API 通过 tools 参数传递工具定义，finish_reason 区分普通回复和工具调用。

**Q2: 怎么让大模型稳定输出 JSON 格式？**

参考答案要点：两种方式。(1) JSON Mode：API 层的 response_format = { type: 'json_object' }，保证输出是合法 JSON，但不保证结构。(2) Function Calling：通过工具定义严格约束参数结构，模型输出就是结构化的 JSON。推荐 Agent 场景用 Function Calling，更可控。辅助技巧：temperature=0、好的工具描述和参数名。

**Q3: 并行工具调用的使用场景和注意事项？**

参考答案要点：当用户请求涉及多个独立数据源时（如查三个城市的天气），模型可以一次返回多个 tool_calls。代码中应使用 Promise.all 并发执行。注意事项：工具之间不能有依赖关系（并行工具必须是独立的），避免超过 API 的并行限制（通常 10-20 个）。依赖关系时用顺序调用。

**Q4: 怎么处理工具调用失败？**

参考答案要点：用 try-catch 捕获异常，将错误信息以 tool 角色消息放回上下文，让模型自行决定是重试、换工具还是告知用户。不要终结 Agent 循环。超时问题用单独的 timeout 控制，长时间未返回也走失败路径。

---

*配套代码：本项目中的 `structured_output.js` 演示了完整的 Function Calling 实现*
*更新时间：2026年7月18日*
