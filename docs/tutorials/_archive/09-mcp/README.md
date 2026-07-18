# 09 - MCP 配置与实践指南

> 从零开始配置 MCP 服务器，让 Agent 能调用外部工具

---

## 什么是 MCP？

MCP（Model Context Protocol）是 Anthropic 提出的开放协议，统一了 AI 应用与外部工具/数据源的交互方式。

## MCP 架构

三部分组成：
- **Host**：AI 应用本体（Codex、Claude Desktop）
- **Client**：Host 与 Server 间的 1:1 连接
- **Server**：提供工具和数据的服务进程

## 快速上手

### 运行一个简单 Server

```python
from mcp.server import Server
app = Server("weather")

@app.tool()
async def get_weather(city: str) -> str:
    # 查询指定城市的天气
    return f"{city}的天气：晴天，25°C"

@app.run()
def main():
    app.run()
```

## 实战：文件搜索 Server

```python
import os
from mcp.server import Server
app = Server("file-search")

@app.tool()
async def search_files(directory: str, pattern: str) -> list:
    results = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            if pattern in f:
                results.append(os.path.join(root, f))
    return results[:20]

@app.run()
def main():
    app.run()
```

## MCP vs Plugin/Skill

| 维度 | MCP | Plugin |
|------|-----|--------|
| 协议 | 标准化开放协议 | 自定义实现 |
| 通信 | stdio / HTTP+SSE | 函数调用 |
| 部署 | 独立进程 | 代码内注册 |

---

*更新时间：2026年7月15日*
