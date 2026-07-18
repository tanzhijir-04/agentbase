# LangGraph 入门：图状态与循环

> 适合读者：已掌握 LangChain 基本概念，想知道怎么把 Agent 做得更灵活

---

## 1. LangGraph 解决什么问题

先回想一下上节课的 Agent 循环：

```
思考 → 行动 → 观察 → 再思考 → 再行动 → ... → 回答
```

这个循环在 LangChain 里是 `AgentExecutor` 帮你做的。它的逻辑是**写死**的：

```python
# AgentExecutor 内部（简化）
while True:
    action = agent.plan(state)     # LLM 决定下一步
    if action == "回答":
        break
    result = execute_tool(action)  # 执行工具
    state = update_state(state, result)
```

你想要自定义流程呢？比如：
- 某个步骤前需要**人工审核**才能继续
- 根据中间结果走**不同分支**
- 在循环中维护**复杂的状态**（不仅仅是消息列表）
- 需要**嵌套**子流程

用 LangChain 自带的 `AgentExecutor` 很难做到。

**LangGraph 就是来解决这个的**。它让你用**图**的方式来定义 Agent 的行为：
- 每个步骤是一个 **Node（节点）**
- 步骤之间的跳转是 **Edge（边）**
- 所有共享数据存在 **State（状态）** 里

---

## 2. 核心概念：StateGraph

### 2.1 什么是 StateGraph？

```StateGraph` 是一个有向图，图中的每个节点**读写同一个状态对象**。

```python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

# 1. 定义状态类型
class AgentState(TypedDict):
    messages: List[dict]   # 消息历史
    next_step: str         # 下一步要做啥

# 2. 创建一个图
graph = StateGraph(AgentState)

# 3. 定义节点（节点 = 函数）
def step_one(state: AgentState) -> AgentState:
    # 读取当前状态，做一些处理，返回更新后的状态
    state["messages"].append({"role": "assistant", "content": "第一步完成"})
    return state

def step_two(state: AgentState) -> AgentState:
    state["messages"].append({"role": "assistant", "content": "第二步完成"})
    return state

# 4. 注册节点
graph.add_node("step1", step_one)
graph.add_node("step2", step_two)

# 5. 定义边（谁连到谁）
graph.add_edge("step1", "step2")
graph.add_edge("step2", END)     # END 是内置终止点

# 6. 设置入口
graph.set_entry_point("step1")
```

### 2.2 执行图

```python
# 编译图（编译后可以执行）
app = graph.compile()

# 初始状态
initial_state = {"messages": [], "next_step": ""}

# 运行
result = app.invoke(initial_state)
print(result["messages"])
# [{"role": "assistant", "content": "第一步完成"},
#  {"role": "assistant", "content": "第二步完成"}]
```

**注意**：每个节点函数都收到完整的 `AgentState`，返回修改后的状态。
LangGraph 会自动把返回值**合并**到当前状态中。

---

## 3. 关键概念详解

### 3.1 State（状态）

状态是**贯穿整个图的共享数据**。它是 `TypedDict` 或 `dataclass`。

```python
class AgentState(TypedDict):
    messages: List[dict]       # 增加的消息会被追加
    user_info: dict            # 用户信息（可覆盖）
    tools_result: List[str]    # 工具执行结果
    steps_completed: int       # 已完成的步骤数
```

LangGraph 的 State 是**Reducer（归约器）**驱动的：
- 默认行为是**覆盖**旧值
- 对于列表，可以用 `operator.add` 来实现**追加**

```python
from typing import Annotated, TypedDict
import operator
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # append 行为
    result: str                              # 覆盖行为
```

这种设计很重要：每个节点返回新状态时，框架会按 Reducer 规则**合并**，
而不是简单替换。这样你可以让不同节点修改状态的不同部分，不影响别人。

### 3.2 Node（节点）

节点就是**一个函数**，输入当前 State，输出新的 State（或部分更新）。

```python
def my_node(state: AgentState) -> dict:
    # 读
    messages = state["messages"]
    # 处理（可以调用 LLM、执行工具、做计算）
    result = some_llm.invoke(messages)
    # 写（返回需要更新的字段）
    return {"messages": [result]}
```

节点可以：
- 调用 LLM（最常见的节点）
- 执行工具函数
- 调用其他图（子图）
- 请求人工输入
- 做任何 Python 能做的事

### 3.3 Edge（边）

边有两种：

**普通边**：固定跳转
```python
graph.add_edge("node_a", "node_b")
# node_a 执行完 → 自动到 node_b
```

**条件边**：根据状态动态跳转
```python
def router(state: AgentState) -> str:
    # 根据状态决定下一个节点名称
    if state["steps_completed"] >= 5:
        return "summarize"
    elif state.get("need_human"):
        return "human_approval"
    else:
        return "continue_work"

graph.add_conditional_edges(
    "decide_step",         # 起点节点
    router,                # 路由函数（返回节点名）
    {
        "summarize": "summarize_node",
        "human_approval": "human_node",
        "continue_work": "work_node"
    }
)
```

条件边让你可以实现**分支、循环、有条件终止**。

---

## 4. 一个完整的例子：带循环的 Agent

我们用 LangGraph 实现一个简单的**问答 Agent**，它可以：
1. 用 LLM 回答用户问题
2. 如果需要工具就循环调用
3. 最多循环 3 次

```python
from typing import TypedDict, Annotated, List
import operator
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

# ── 1. 定义状态 ──
class AgentState(TypedDict):
    messages: Annotated[List, add_messages]
    iteration: int

# ── 2. 定义节点 ──
llm = ChatOpenAI(model="gpt-4")

def call_llm(state: AgentState) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response], "iteration": state["iteration"] + 1}

def should_continue(state: AgentState) -> str:
    # 如果已完成或超过 3 次迭代，结束
    if state["iteration"] >= 3:
        return "end"
    # 如果 LLM 想调用工具，循环
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "continue"
    return "end"

# ── 3. 构建图 ──
graph = StateGraph(AgentState)

graph.add_node("agent", call_llm)
graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "agent",   # 回到 agent 节点（循环！）
        "end": END
    }
)

# ── 4. 编译和运行 ──
app = graph.compile()

result = app.invoke({
    "messages": [HumanMessage(content="你好，先算 1+1，再算 2+2")],
    "iteration": 0
})

print(result["messages"][-1].content)
```

这个图看起来像：

```
agent ──→ should_continue ──→ agent（循环）
  │                              │
  │                              │
  └──→ should_continue ──→ END（结束）
```

**这就是 Agent 的循环**，但这次完全由你控制。

---

## 5. 对比：LangChain Agent vs LangGraph Agent

| 特性 | LangChain AgentExecutor | LangGraph |
|------|------------------------|-----------|
| 循环逻辑 | 内置，不可定制 | 自己写条件边，完全控制 |
| 状态管理 | 只有消息列表 | 可自定义任意状态 |
| 分支 | 不支持 | 条件边任意分支 |
| 人工介入 | 困难 | 内置 Human-in-loop |
| 持久化 | 无 | Checkpoint 支持 |
| 复杂度 | 简单场景一把梭 | 灵活但需要更多代码 |

---

## 6. 从 LangChain 思维转换到 LangGraph 思维

如果你已经习惯写 `chain = prompt | llm | parser`，切换到 LangGraph
需要适应这些变化：

1. **不再用 `|` 管道**，而是把每个步骤拆成独立的节点函数
2. **显式管理状态**，每个节点读写同一个 State 对象
3. **自己控制流程**，通过条件边决定下一步
4. **把"循环"当作正常流程**，不再是隐式的 Agent 内部机制

```
LangChain 思维：     A → B → C → D
LangGraph 思维：     A → B ─→ C ─→ D
                     │     │     │
                     └→ B ┘ └→ C ┘  （可以循环）
```

---

## 7. 下集预告

你已经理解了 StateGraph 的基本工作原理。但真正的 Agent 需要更多：
- **Human-in-loop** — 关键步骤前等人工确认
- **Checkpoint** — 保存和恢复执行状态
- **Streaming** — 实时观察 Agent 在想什么
- **子图** — 嵌套复用

这些都放在下一课 [04-langgraph-core.md](04-langgraph-core.md)。

---

*文档更新时间：2026年7月14日*
