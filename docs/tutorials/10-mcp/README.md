# 第 10 章: MCP 模型上下文协议

## 本章目标

理解 MCP 协议的设计思想和核心价值，掌握 MCP Server/Client 的对接方式。

## 章节内容

- [ ] MCP 解决了什么问题（vs 传统插件/工具系统）
- [ ] MCP 架构：Server、Client、Transport 层
- [ ] 工具发现（Tool Discovery）机制
- [ ] MCP 在实际项目中的集成方式
- [ ] 面试高频问法

![配图：MCP 统一接口 - 传统各不相同的连接方式 vs MCP 统一标准](/assets/10-mcp-01-unified-interface.png)


## 配套代码

- 10-mcp/mcp_client.js — MCP 客户端示例
- 10-mcp/mcp_server_demo.js — MCP Server 示例

## 面试高频问法

1. MCP 和普通的工具调用（Function Calling）有什么本质区别？
2. MCP 解决的核心痛点是什么？适用场景和边界是什么？
