# LangChain 入门：从零理解核心概念

> 适合读者：已了解基本的 LLM API 调用，想知道 LangChain 到底在解决什么问题

---

## 1. LangChain 是什么

**LangChain** 是一个用于构建 LLM 应用的 Python/JS 框架。它的核心价值就是把开发 LLM
应用时**重复出现**的模式抽象成标准组件。

### 一个现实问题

假设你要写一个"智能客服"：

```python
# 没有 LangChain 的做法
prompt = f"""你是一个客服助手。用户的问题是：{user_input}
请根据以下知识库回答：{context}
历史对话：{history}
回答："""
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)
```

这段代码看起来很直接，但一旦你要加：
- 多轮对话记忆 → 要自己管理 messages 列表
- 知识库检索 → 要自己写向量搜索
- 工具调用 → 要自己解析 function calling
- 不同 LLM → 要重构 request 部分
- 可观测性 → 要手动加日志

**LangChain 就是把这些问题标准化了**。你用统一的方式组合组件，而不是每次都从零写胶水代码。

### 核心哲学

LangChain 的设计可以用三个字概括：**组合性**（Composability）。

```
LLM ──→ Prompt ──→ Chain ──→ Agent
                            │
                 Memory ────┤
                 Tools ─────┤
                 Retriever ─┘
```

每个组件都设计成**可插拔**的。你把小积木拼成大积木，大积木拼成完整应用。

---

## 2. 三个最基本的概念

在深入之前，先搞清三个最核心的抽象：

### 2.1 ChatModel（聊天模型）

这不是传统意义上的"模型"（你不需要下载权重），它是一个**调用 LLM 的统一接口**。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")
response = llm.invoke("你好，世界！")
print(response.content)
```

**关键**：不管底层是 OpenAI、Anthropic 还是本地 Ollama，调用方式完全一样。

```python
from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama

# 三个不同的模型，同一套 API
openai_llm = ChatOpenAI(model="gpt-4")
anthropic_llm = ChatAnthropic(model="claude-3-opus-20240229")
ollama_llm  = ChatOllama(model="llama3")

result = openai_llm.invoke("hello")  # 一样
result = anthropic_llm.invoke("hello")  # 一样
result = ollama_llm.invoke("hello")  # 一样
```

```invoke()` 返回的是一个 `AIMessage` 对象，包含 `content`（文本内容）和 `tool_calls`（工具调用）。

### 2.2 PromptTemplate（提示模板）

Prompt 是字符串，但有结构。`PromptTemplate` 让你用模板语法管理 prompt。

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，请用{style}的风格回答"),
    ("user", "{question}")
])

formatted = prompt.invoke({
    "role": "物理老师",
    "style": "用最简单的比喻",
    "question": "什么是相对论？"
})
# formatted 是一个 PromptValue，包含了完整的消息列表
```

**为什么要用模板而不是 f-string？**
- 自动处理消息角色（system/user/assistant）
- 可以和 Chain 组合（见下文）
- 内置输出解析器（OutputParser）的支持

### 2.3 Chain（链）

Chain 是把多个组件**串联**起来的管道。最常用的是 `LCEL`（LangChain Expression Language），
用 `|` 运算符连接组件，像 Unix 管道一样优雅。

```python
from langchain_core.output_parsers import StrOutputParser

# 构建一个完整的 Chain
chain = prompt | llm | StrOutputParser()

# 像函数一样调用
result = chain.invoke({
    "role": "物理老师",
    "style": "用最简单的比喻",
    "question": "什么是相对论？"
})
print(result)  # 纯字符串，不需要 .content
```

**LCEL 的核心机制**：
```
输入字典 → PromptTemplate.invoke() → 消息列表
         → ChatModel.invoke()       → AIMessage
         → StrOutputParser.invoke()  → 字符串
```

每个环节都实现了 `Runnable` 接口，所以可以用 `|` 连接。

**为什么用 `|` 很聪明？**
- 每个 Runnable 都知道自己的输入输出类型
- 自动类型检查和转换
- 整个 chain 本身也是一个 Runnable（可以嵌套组合）
- 支持并行、批处理、流式输出

---

## 3. 让 Chain 运行的几种方式

### invoke — 单次调用
```python
chain.invoke({"question": "1+1=?"})
```

### batch — 批量调用
```python
chain.batch([
    {"question": "1+1=?"},
    {"question": "2+2=?"},
    {"question": "3+3=?"},
])
# 返回列表，可以配置并发数
```

### stream — 流式调用（实时输出）
```python
for chunk in chain.stream({"question": "讲个长故事"}):
    print(chunk, end="")
# 一个字一个字地输出，类似 ChatGPT 的打字效果
```

### ainvoke / abatch / astream — 异步版本
```python
result = await chain.ainvoke({"question": "1+1=?"})
```

---

## 4. 一个完整的例子（从零到懂）

我们用 LangChain 做一个"中英翻译助手"，一步步看它怎么工作：

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 1. 创建 LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 2. 创建 Prompt 模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的翻译。把{source_lang}翻译成{target_lang}。"
               "只返回翻译结果，不要解释。"),
    ("user", "{text}")
])

# 3. 创建输出解析器（去掉额外信息，只拿纯文本）
parser = StrOutputParser()

# 4. 组装 Chain
translation_chain = prompt | llm | parser

# 5. 运行
result = translation_chain.invoke({
    "source_lang": "中文",
    "target_lang": "英语",
    "text": "人工智能正在改变世界"
})
print(result)
# 输出: "Artificial intelligence is changing the world"
```

如果你现在想换成 Claude：
```python
# 只改一行！
llm = ChatAnthropic(model="claude-3-haiku-20240307")
# 其他代码完全不变
```

这就是 LangChain 的核心价值：**组件可替换，逻辑不修改**。

---

## 5. 常见问题（小白区）

### Q: LangChain 是开源的吗？要付费吗？
A: LangChain 本身是 MIT 开源的，免费。收费的是底层的 LLM API（GPT-4、Claude 等）。

### Q: 必须用 LangChain 吗？直接用 OpenAI SDK 不就行了？
A: 简单的调用确实不需要。LangChain 的价值体现在：
   - 需要多步推理时（Chain）
   - 需要记忆时（Memory）
   - 需要工具/函数调用时（Tool/Agent）
   - 需要切换模型时（统一接口）
   - 需要复杂流程编排时（LangGraph）

### Q: LangChain 和咱们学过的 Plan Mode / Memory 有关系吗？
A: 有！**LangChain 的 Chain 约等于 Plan Mode 的步骤序列**，
   **LangChain 的 Memory 就是你之前实现的 memory.js**。
   区别是 LangChain 把这些问题标准化了，开箱即用。

### Q: 我该学 Python 版还是 JS 版？
A: Python 版更成熟、资料更多、社区更大。如果你主要是用 Node.js，JS 版也可以。
   本教程以 Python 为主。

---

## 6. 下集预告

现在你已经理解了 LangChain 的三个核心概念：ChatModel、PromptTemplate、Chain。

下一课 [02-langchain-core.md](02-langchain-core.md) 会讲：
- **Memory** — 让 Agent 记住对话上下文
- **RAG** — 连接你自己的知识库
- **Tool** — 让 LLM 调用外部函数
- **Agent** — 自动决定调用什么工具、什么时候调用

---

*文档更新时间：2026年7月14日*

```