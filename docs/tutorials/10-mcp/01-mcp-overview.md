# MCP 模型上下文协议

> MCP（Model Context Protocol）是 Anthropic 提出的开放标准，在 2024 年底正式发布。它解决的是 Agent 生态里一个很要命的问题：工具和服务的集成方式太碎片化了。

---

## 传统工具调用的碎片化问题

### 当每个工具都自成一派

想象你是一个 Agent 开发者。你要让你的 Agent 能查数据库、发邮件、调 Jira API。在 MCP 出来之前，你需要：

```
对数据库：自己写 JDBC/SQL 客户端
对邮件：接 SMTP/IMAP 协议
对 Jira：研究它的 REST API 文档
对 Slack：看它的 Webhook 格式
对 飞书：再看另一套 API

每一种集成都是手写代码，每一种的错误处理都是你自家发明的。
```

每个工具集成都是"点对点"的：

```
Agent（LLM）
  │
  ├──▶ 手写代码 → MySQL（每个查询都要手写 SQL）
  ├──▶ 手写代码 → GitHub API（研究 OAuth、REST 端点）
  ├──▶ 手写代码 → 内部 API（自己造一个 format）
  └──▶ 手写代码 → 搜索 API（参数名叫 q 还是 query？）
```

**痛点总结**：

- **每接一个工具，学一个协议**：REST、WebSocket、gRPC、GraphQL——开发者全都要会
- **认证方式各不同**：API Key、OAuth、JWT、Basic Auth——每次集成都要单独处理
- **参数格式随缘**：同一个意思，有的用 `cityName`，有的用 `location`
- **错误处理散漫**：有的返回 `{error: "..."}`，有的返回 HTTP 状态码，有的直接超时不返回
- **工具发现靠文档**：Agent 不会"发现"一个新的 API，开发者必须事先编码

---

## MCP 是什么

### 定义

MCP（Model Context Protocol）是一个**开放的、统一的协议**，定义了 AI 模型如何与外部工具和数据源交互。

它不是一个新的框架。它是一个**协议**——“我规定怎么描述工具、怎么发请求、怎么返回结果”。

```
MCP 之前：
  Agent（LLM）→ 手写胶水代码 → 每个工具单独集成

MCP 之后：
  Agent（MCP Client）→ MCP 协议 → MCP Server（封装工具）
```

### MCP 的承诺

- 开发者写一次 MCP Server，**所有支持 MCP 的 Agent 都能用**
- 工具描述、参数格式、认证方式、错误处理——全用同一套契约
- 工具可以**动态发现**，不需要预编码

---

## MCP 三层架构

MCP 由三个角色组成：

### 1. MCP Host

Host 是用户直接面对的程序——可以是 IDE（如 Zed）、Agent 框架（如 Codex CLI）、或者聊天界面。

职责：
- 加载 MCP Client
- 管理用户会话
- 把 MCP 工具集成到用户体验中

### 2. MCP Client

Client 是 Host 和 Server 之间的中间层，通常伴随着 LLM 调用一起运行。

职责：
- 建立与 MCP Server 的连接
- 发送协议消息（请求工具列表、调用工具）
- 管理传输层

### 3. MCP Server

Server 是**工具的实际提供者**。每个 Server 可以暴露多个工具。

职责：
- 声明自己提供的工具（name、description、参数 schema）
- 接收并执行工具调用请求
- 返回标准化的结果

### 架构图

```
┌──────────────────────────────────────────────┐
│                  MCP Host                     │
│   （Codex CLI / Zed / 自定义 Agent）          │
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │            MCP Client                │   │
│   │  ┌─ 连接管理 ────────────────────────┐│   │
│   │  │  ┌──────────────────────┐        ││   │
│   │  │  │  Transport 层        │        ││   │
│   │  │  │  stdin/stdout 或     │        ││   │
│   │  │  │  WebSocket/SSE       │        ││   │
│   │  │  └──────────────────────┘        ││   │
│   │  └───────────────────────────────────┘│   │
│   └──────────────────────────────────────┘   │
└──────────────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ MCP     │ │ MCP     │ │ MCP     │
│ Server  │ │ Server  │ │ Server  │
│ (搜索)  │ │ (数据库)│ │ (文件)  │
└─────────┘ └─────────┘ └─────────┘
```

### Transport 层

MCP 定义了两种传输方式：

**标准输入/输出（stdio）**

Client 启动 Server 作为一个子进程，通过 stdin/stdout 通信。

```javascript
// Client 启动 Server 进程
const serverProcess = spawn('node', ['mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// 通过 stdin 发消息
serverProcess.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}));

// 从 stdout 收回复
serverProcess.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  // { jsonrpc: '2.0', id: 1, result: { tools: [...] } }
});
```

优缺点：
- 简单，无需网络配置
- 部署在同一台机器上
- 生命周期跟随 Host 进程

**WebSocket / SSE（Streamable HTTP）**

Server 作为一个独立的 HTTP 服务运行，Client 通过 HTTP 请求与之通信。

```javascript
// Client 通过 HTTP 请求调用 MCP Server
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'search',
      arguments: { query: '今天的新闻' }
    }
  })
});
```

优缺点：
- Server 可以远程部署
- 支持多个 Client 连接同一个 Server
- 适合微服务架构

---

## 协议消息格式

MCP 基于 JSON-RPC 2.0 协议。所有消息都是标准化的 JSON 格式：

```json
// 请求
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "city": "北京"
    }
  }
}

// 成功回复
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "北京明天 25°C，天气晴"
      }
    ]
  }
}

// 错误回复
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "工具调用失败",
    "data": { "reason": "城市不存在" }
  }
}
```

### 核心方法

| 方法 | 方向 | 说明 |
|------|------|------|
| `initialize` | Client → Server | 建立连接时的握手 |
| `tools/list` | Client → Server | 获取 Server 支持的所有工具列表 |
| `tools/call` | Client → Server | 调用特定工具 |
| `resources/list` | Client → Server | 获取可访问的资源列表 |
| `resources/read` | Client → Server | 读取指定资源 |
| `prompts/list` | Client → Server | 获取可用提示词列表 |
| `notifications/...` | Server → Client | 工具状态变化通知 |

---

## 工具发现（Tool Discovery）

### 动态发现机制

MCP 最有价值的设计之一：**Agent 可以在运行时发现可用的工具**。

```javascript
// Server 端：声明工具
const server = new MCPServer({
  name: 'weather-server',
  version: '1.0.0',
  tools: [
    {
      name: 'get_weather',
      description: '获取城市的天气信息',
      inputSchema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，如北京、上海'
          },
          date: {
            type: 'string',
            description: '日期，YYYY-MM-DD 格式'
          }
        },
        required: ['city']
      }
    },
    {
      name: 'get_air_quality',
      description: '获取城市的空气质量',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' }
        },
        required: ['city']
      }
    }
  ]
});
```

```javascript
// Client 端：在运行时发现工具
async function discoverTools(serverUrl) {
  const response = await fetch(serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    })
  });

  const data = await response.json();
  return data.result.tools;
}

// 然后动态转换成 LLM 的 tools 格式
const mcpTools = await discoverTools('http://localhost:3000/mcp');
const llmTools = mcpTools.map(tool => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema
  }
}));
```

### 为什么动态发现很重要

没有动态发现时，工具列表是写死在代码里的：

```javascript
// ❌ 传统方式：硬编码
const TOOLS = [
  { name: 'get_weather', ... },
  { name: 'search', ... },
];
// 添加新工具 → 改代码 → 重新部署
```

有 MCP 后，工具发现变成运行时行为：

```javascript
// ✅ MCP 方式：动态发现
const mcpServers = ['weather-server', 'search-server', 'db-server'];
const allTools = await Promise.all(
  mcpServers.map(url => discoverTools(url))
);
// flat 后传给 LLM
await llm.chat(messages, { tools: allTools.flat() });
// 添加新工具 → 启动新 MCP Server → Agent 自动发现
```

这意味着：**你可以随时启停一个 MCP Server，Agent 不需要重启，不需要改代码**。

---

## MCP vs 传统插件系统

### 本质区别

| 维度 | 传统插件/工具系统 | MCP |
|------|------------------|-----|
| 集成方式 | 手写胶水代码 | 标准化协议 |
| 工具发现 | 编译时/部署时硬编码 | 运行时动态发现 |
| 协议 | 每个工具自己一套 | 统一的 JSON-RPC 2.0 |
| 传输层 | 随意的 HTTP 调用 | stdio / SSE 二选一 |
| 认证 | 各自实现 | 统一的初始化协商 |
| 错误格式 | 五花八门 | 标准 JSON-RPC error |
| 跨平台 | 绑定特定语言/框架 | 语言无关 |
| 生态 | 孤立的点对点集成 | 开放协议，可互通 |

### 一个具体的类比

传统方式像什么？每个电子设备都带自己的充电线——你有五六个设备，桌上有五六根线，每根线还不通用。

MCP 就像 USB-C。所有设备用同一套接口，一根线充所有东西。

```
传统工具集成：
  Agent ──线A──→ MySQL
  Agent ──线B──→ GitHub
  Agent ──线C──→ 搜索API
  
MCP：
  Agent ──USB-C──→ MCP Hub ──→ MySQL Server
                           ├──→ GitHub Server
                           └──→ Search Server
```

### MCP 能做到而传统方式做不到的

1. **零配置工具发现**：启动一个新服务 → 注册为 MCP Server → Agent 立刻能用
2. **切换实现不影响调用方**：今天用 Pinecone 搜索，明天换 Weaviate——换 Server 就行，Agent 代码不用改
3. **可观测性内置**：MCP 标准化的错误和通知机制，让监控变得简单
4. **独立部署与自治**：每个 MCP Server 可以用不同的技术栈（Node、Python、Go），互不干扰

### MCP 不能做什么

- **不是 RPC 框架**：不是为了替代 gRPC 或 tRPC。它面向的是 AI-工具交互场景
- **不是 API 网关**：不负责路由、限流、服务发现（那是基础设施的事）
- **不是 Agent 框架**：不定义 Agent 的执行循环、内存管理、工具链式编排
- **不能解决语义问题**：MCP 确保"格式"统一，但不确保"含义"正确——工具描述写得烂，模型照样用错

---

## 适用场景与边界

### 最适用

| 场景 | 理由 |
|------|------|
| 需要动态发现工具 | 工具列表频繁变化，或由第三方提供 |
| 多 Agent 共享工具 | 写一个 Server，所有 Agent 共用 |
| 企业数据接入 | 标准化方式暴露内部 API/数据库 |
| 工具集持续扩展 | 快速添加新工具，不需要改 Agent 代码 |
| 异构技术栈环境 | Server 可以各自用最合适的语言 |

### 不太适合

| 场景 | 理由 |
|------|------|
| 简单、固定的工具集 | 硬编码就够了，引入 MCP 增加复杂度 |
| 实时性要求极高（<5ms） | 协议序列化和传输层有开销 |
| 资源受限环境 | Server 进程增加了资源占用 |
| 工具在同一个代码库内 | 函数直接调用比 IPC 快得多 |

### 决策指南

要不要用 MCP？问自己三个问题：

1. 你的 Agent 需要接 1-2 个固定工具？→ **不用 MCP，手写更直接**
2. 你的 Agent 要接 5+ 个工具，且可能继续增加？→ **可以考虑 MCP**
3. 你的工具由不同团队维护、要用不同的技术栈？→ **MCP 会省很多事**

---

## 实际集成示例

### 写一个简单的 MCP Server

```javascript
// mcp-weather-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'weather-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_weather',
    description: '获取城市天气',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' }
      },
      required: ['city']
    }
  }]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_weather') {
    // 实际调用天气 API
    const weather = await fetchWeather(args.city);
    return {
      content: [{ type: 'text', text: JSON.stringify(weather) }]
    };
  }

  throw new Error(`未知工具: ${name}`);
});

// 通过 stdio 传输
const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP Client 集成到 Agent

```javascript
// Agent 中集成 MCP Client
class MCPAgent {
  constructor(mcpServerUrls) {
    this.mcpServerUrls = mcpServerUrls;
    this.tools = [];
  }

  async initialize() {
    // 从所有 MCP Server 发现工具
    const allTools = await Promise.all(
      this.mcpServerUrls.map(url => this._discoverTools(url))
    );
    this.tools = allTools.flat();
  }

  async _discoverTools(serverUrl) {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/list', params: {}
      })
    });
    const data = await response.json();
    return (data.result.tools || []).map(t => ({ ...t, serverUrl }));
  }

  async _callTool(serverUrl, toolName, args) {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: toolName, arguments: args }
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }

  async process(userInput) {
    // 1. 把 MCP 工具转成 LLM 工具格式
    const llmTools = this.tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema
      }
    }));

    // 2. 调用 LLM（省略消息组装细节）
    const response = await llm.chat(userInput, { tools: llmTools });

    // 3. 如果 LLM 要求调用工具
    if (response.finish_reason === 'tool_calls') {
      for (const call of response.tool_calls) {
        const tool = this.tools.find(t => t.name === call.function.name);
        if (tool) {
          const result = await this._callTool(
            tool.serverUrl,
            call.function.name,
            JSON.parse(call.function.arguments)
          );
          // 把结果放回上下文...
        }
      }
    }
  }
}
```

---

## MCP 生态现状（2026 年中）

| 类型 | 代表项目 | 说明 |
|------|---------|------|
| 官方 SDK | @modelcontextprotocol/sdk | TypeScript/Python SDK，收编在 MCP 官方仓库 |
| 预置 Server | 官方 hub 中的 50+ 个 | 文件系统、GitHub、SQLite、Puppeteer 等 |
| Agent 框架 | Codex CLI、LangChain、Claude Desktop | 原生支持 MCP Client |
| IDE 集成 | Zed、VS Code（插件） | 编辑器内直接调用 MCP 工具 |
| 社区 | GitHub / npm / PyPI | 大量第三方 MCP Server 发布 |

---

### 面试高频问法

**Q1: MCP 和普通的工具调用（Function Calling）有什么本质区别？**

参考答案要点：Function Calling 是模型侧的能力——定义怎么解析工具输出。MCP 是工具侧的协议——定义怎么描述和调用工具。前者解决"LLM 如何连接工具"，后者解决"工具如何被 LLM 连接"。MCP 在 Function Calling 的基础上加了一层标准化：统一的工具描述格式（JSON-RPC 2.0）、统一的传输方式（stdio/SSE）、动态工具发现。你可以理解为：Function Calling 是"接口"，MCP 是"协议"。

**Q2: MCP 解决的核心痛点是什么？适用场景和边界是什么？**

参考答案要点：核心痛点是工具集成的碎片化——每个工具都有自己的接入方式、认证方式、错误处理方式，Agent 系统被"点对点集成"锁死。MCP 通过标准化协议和动态发现解决了这个问题。适用场景：多种工具需集成、工具频繁变化、不同团队/不同技术栈开发工具的场景。边界：不适合 1-2 个固定工具的简单场景、极低延迟需求、资源受限环境。MCP 不解决语义理解问题——工具描述写得不好，模型照样用不对。

**Q3: 请说明 MCP 的三层架构及其各自职责。**

参考答案要点：Host（用户交互层）是用户直接面对的程序，管理会话和工具路由；Client（协议衔接层）建立与 Server 的连接，管理传输层，将工具集成到 LLM 调用流程；Server（工具提供层）声明工具列表、执行工具调用、返回标准化结果。Transport 层支持 stdio（本地子进程通信）和 SSE（远程 HTTP 通信）两种模式。

**Q4: MCP 的动态工具发现机制是怎么工作的？**

参考答案要点：Client 向 Server 发送 `tools/list` 请求，Server 返回标准化的工具列表（name、description、inputSchema）。Client 可以将这些工具动态转换为 LLM 的 tools 格式。新的 Server 启动后，Client 重新请求即可发现新工具，无需重启 Agent 或改代码。这就是"热插拔"的关键——动态发现让工具集可以随时扩展。

---

*配套代码：本项目中的 `mcp_client.js` 和 `mcp_server_demo.js` 演示了完整的 MCP 实现*
*更新时间：2026年7月18日*
