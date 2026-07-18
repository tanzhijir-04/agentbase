# 完整实践：用 LangGraph 构建问答 Agent

> 适合读者：看完前面概念，想动手运行真正的代码

---

## 实践目标

我们要建一个简单的 AI Agent，它能：

1. **回答问题** — 用 LLM 理解自然语言
2. **执行计算** — 使用工具做数学运算
3. **查天气** — 使用工具查询天气（模拟）
4. **记忆对话** — 通过 Memory 记住上下文
5. **人工审批** — 关键操作前暂停等待确认
6. **流式输出** — 实时看到 LLM 的思考过程

![配图：六个能力环绕Agent—回答/工具/记忆/审批/流式/持久化](/assets/17-practice-02-six-capabilities.png)

---

## 先决条件

```bash
# 创建虚拟环境（项目根目录下）
cd minimal_agent
python -m venv .venv
.venv\Scripts\Activate.ps1

# 安装依赖
pip install langchain langchain-openai langgraph
```

> 请确保你有一个 OpenAI API Key（或换成其他模型的 API Key）
> 设置环境变量：`$env:OPENAI_API_KEY="sk-xxx"`

---

## 代码文件一览

本教程包含三个可以运行的 Python 文件，放在 `minimal_agent/langchain/` 目录下：

| 文件名 | 内容 | 难度 |
|--------|------|------|
| `basic_chain.py` | 最简单的 LangChain Chain | 入门 |
| `rag_agent.py` | 带 RAG 和 Memory 的 Agent | 进阶 |
| `langgraph_agent.py` | 完整的 LangGraph Agent 带 Human-in-loop | 高阶 |

下面逐一讲解。

---

## 示例 1：basic_chain.py — 最简单的 Chain

```python
"""
最简单的 LangChain 应用：中英翻译
展示三个核心组件：ChatModel + PromptTemplate + StrOutputParser
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 1. 创建 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 2. 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的{source_lang}到{target_lang}的翻译。"
               "只返回翻译结果，不要解释。"),
    ("user", "{text}")
])

# 3. 输出解析器
parser = StrOutputParser()

# 4. 组装 Chain（LCEL：用 | 连接）
chain = prompt | llm | parser

# 5. 运行
result = chain.invoke({
    "source_lang": "中文",
    "target_lang": "英语",
    "text": "人工智能正在改变世界"
})
print(f"翻译结果：{result}")
```

## 示例 2：rag_agent.py — RAG + Memory Agent

```python
"""
带 RAG 和 Memory 的 Agent 示例
展示 Tool 定义、Agent Executor、对话记忆
"""
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.memory import ConversationBufferMemory

# 1. 定义工具
@tool
def calculate(expression: str) -> str:
    """计算数学表达式。输入应为数学公式，如 '2 + 3 * 4'"""
    try:
        allowed = set("0123456789+-*/.() ")
        if not all(c in allowed for c in expression):
            return "错误：只支持数字和基本运算符"
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{e}"

@tool
def get_weather(city: str) -> str:
    """查询某个城市的当前天气"""
    weather_data = {
        "北京": "晴天，25°C，轻度污染",
        "上海": "多云转阴，28°C，湿度 75%",
        "广州": "雷阵雨，30°C，注意带伞",
        "深圳": "晴，29°C，适合出门",
    }
    return weather_data.get(city, f"{city}：暂无天气数据")

tools = [calculate, get_weather]

# 2. 创建 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 3. 创建 Prompt（带历史占位）
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个智能助手。你可以使用工具来回答问题。"
               "在回答中，请引用你使用的工具结果。"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# 4. 创建 Agent
agent = create_tool_calling_agent(llm, tools, prompt)

# 5. 创建 Memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 6. 创建 Agent Executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    max_iterations=5,
)

# 7. 运行对话
print("=== 第一轮对话 ===")
resp1 = agent_executor.invoke({"input": "你好！我叫小明"})
print(f"Agent：{resp1['output']}")

print("\n=== 第二轮对话（测试记忆） ===")
resp2 = agent_executor.invoke({"input": "我叫什么名字？"})
print(f"Agent：{resp2['output']}")

print("\n=== 第三轮对话（测试工具调用） ===")
resp3 = agent_executor.invoke({"input": "计算 (25 + 17) * 3 的结果"})
print(f"Agent：{resp3['output']}")
```

**运行方式**：`python minimal_agent/langchain/rag_agent.py`

## 示例 3：langgraph_agent.py — LangGraph Agent + Human-in-loop

```python
"""
完整的 LangGraph Agent，带 Human-in-loop 审批
展示：StateGraph、条件边、interrupt、Checkpoint、Streaming
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool

# 1. 定义工具
@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return "错误：只支持数字和基本运算符"
    try:
        return f"{expression} = {eval(expression)}"
    except Exception as e:
        return f"计算错误：{e}"

@tool
def get_weather(city: str) -> str:
    """查询城市天气"""
    data = {
        "北京": "晴天 25°C", "上海": "多云 28°C",
        "广州": "雷阵雨 30°C", "深圳": "晴 29°C",
    }
    return data.get(city, f"{city}：暂无数据")

tools = [calculate, get_weather]
tools_by_name = {t.name: t for t in tools}

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# 2. 定义状态
class AgentState(TypedDict):
    messages: Annotated[List, add_messages]
    needs_approval: bool
    approved: bool

# 3. 定义节点
def call_llm(state: AgentState) -> dict:
    """Agent 节点：调用 LLM"""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def execute_tools(state: AgentState) -> dict:
    """工具执行节点"""
    last_msg = state["messages"][-1]
    tool_messages = []
    for tool_call in last_msg.tool_calls:
        tool_fn = tools_by_name[tool_call["name"]]
        result = tool_fn.invoke(tool_call["args"])
        tool_messages.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        ))
    return {"messages": tool_messages}

def human_approval(state: AgentState) -> dict:
    """人工审批节点"""
    last_action = state["messages"][-1]
    action_info = []
    if hasattr(last_action, "tool_calls") and last_action.tool_calls:
        for tc in last_action.tool_calls:
            action_info.append({"tool": tc["name"], "args": tc["args"]})
    decision = interrupt({
        "action": action_info,
        "prompt": "是否批准这些工具调用？"
    })
    return {"approved": decision == "approve"}

def should_continue(state) -> Literal["tools", "approval", "end"]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        if state.get("needs_approval", False):
            return "approval"
        return "tools"
    return "end"

def check_approval(state) -> Literal["tools", "end"]:
    if state.get("approved", False):
        return "tools"
    return "end"

# 4. 构建图
graph = StateGraph(AgentState)
graph.add_node("agent", call_llm)
graph.add_node("tools", execute_tools)
graph.add_node("approval", human_approval)
graph.set_entry_point("agent")

graph.add_conditional_edges("agent", should_continue, {
    "tools": "tools", "approval": "approval", "end": END
})
graph.add_conditional_edges("approval", check_approval, {
    "tools": "tools", "end": END
})
graph.add_edge("tools", "agent")

# 5. 编译
app = graph.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["approval"]
)

# 6. 运行
config = {"configurable": {"thread_id": "demo-1"}}
result = app.invoke({
    "messages": [HumanMessage(content="北京的天气如何？")],
    "needs_approval": True,
    "approved": False
}, config)
```

**运行方式**：`python minimal_agent/langchain/langgraph_agent.py`

---

## 对比：你之前写的 vs LangChain/LangGraph

这个表格帮你把**已经学到的知识**和**新学的框架**串起来：

| 你的项目代码 | 对应 LangChain/LangGraph 概念 | 说明 |
|---|---|---|
| `agent.js` 的主循环 | LangChain Agent | 都是 Think-Act-Observe 循环 |
| `plan_mode.js` 的步骤序列 | LangChain Chain / LCEL | 用管道组织多个步骤 |
| `memory.js` + `memory.json` | LangChain Memory + LangGraph Checkpoint | 持久化对话历史 |
| `multi_agent_system.js` 的 Master-Slave | LangGraph 子图 | 一个图嵌入另一个图 |
| `workflow_engine.js` 的流程控制 | LangGraph StateGraph + 条件边 | 用状态机管理流程 |
| `message_queue.js` 的消息通信 | LangGraph 的 State（共享消息列表） | Agent 间通过状态通信 |
| 你在 multi_agent 中的 yes/no 确认 | LangGraph Human-in-loop + interrupt | 人工审批机制 |

**关键理解**：你之前手写的实现是**理解原理**，而 LangChain/LangGraph 提供的是**生产级的标准实现**。这两种知识是互补的——懂原理才能用好框架，懂框架才知道怎么把原理落地。

![配图：左侧代码文件（agent.js/memory.js）箭头指向右侧框架概念（Agent/Memory/Chain），小黑在中间连接](/assets/17-practice-01-code-to-framework.png)

---

## 下一步怎么走

1. **运行示例代码** — 先跑起来，看看输出
2. **改参数体验** — 换模型、改 prompt、调整循环次数
3. **加自己的工具** — 定义一个搜索或文件操作工具
4. **连真实数据** — RAG 里换自己的文档
5. **深入官方文档**：
   - [LangChain 官方](https://python.langchain.com/docs)
   - [LangGraph 官方](https://langchain-ai.github.io/langgraph/)

---

*文档更新时间：2026年7月14日*
