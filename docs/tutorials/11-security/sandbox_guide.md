# Sandbox 环境控制 — 完整学习指南

> 学习日期：2026年7月14日 | 更新日期：2026年7月14日

---

## 什么是 Sandbox？

Sandbox（沙箱/沙盒）是一种安全隔离机制，**在一个受限环境中运行不可信或不可靠的代码**，防止其对宿主系统造成危害。在 AI Agent 领域，Sandbox 是安全体系的核心——Agent 执行工具调用、运行外部代码、访问文件系统时，都必须经过沙箱的权限检查。

---

## 四大隔离维度

### 1. 进程隔离

将代码运行在独立的进程中，即使崩溃也不会影响主进程。

| 方案 | 原理 | 适用场景 |
|------|------|----------|
| Worker Threads | Node.js 子线程 | 计算密集型 JS 任务 |
| Child Process | 独立 OS 进程 | 执行外部命令 |
| Docker 容器 | 容器级隔离 | 完整运行环境 |
| VM 虚拟机 | 硬件级虚拟化 | 最高安全需求 |

### 2. 文件系统隔离

限制代码能读写的文件和目录。

**策略模型：**

- **白名单** — 只允许访问指定的路径（推荐）
- **黑名单** — 禁止访问敏感路径（容易遗漏）
- **虚拟文件系统** — 在内存中模拟文件系统，不触碰真实磁盘

### 3. 网络访问限制

控制代码能否发出网络请求以及请求的目标。

| 模式 | 允许范围 | 适用场景 |
|------|----------|----------|
| 禁止全部 | 无 | 纯计算任务 |
| 白名单域名 | 仅特定 API | 需要调用外部 API 的工具 |
| 仅限 HTTP(S) | Web 协议 | 大部分工具场景 |
| 完全开放 | 无限制 | 需要下载资源的任务（高风险） |

### 4. 权限控制

按功能维度进行细粒度授权。

**权限模型对比：**

| 模型 | 代表 | 特点 |
|------|------|------|
| 能力安全 (Capability) | Deno | 显式获取权限，用完即回收 |
| 访问控制列表 (ACL) | 传统文件系统 | 预设用户/组权限 |
| 基于角色的控制 (RBAC) | 企业系统 | 按角色分配权限集 |

---

## AI Agent 中的沙箱模式

### 模式一：控制台审批（Codex 模式）

Agent 执行高风险操作时，暂停并请求用户确认：

```javascript
// 伪代码示例
class PermissionController {
  constructor() {
    this.permissions = new Map()
    this.allowedCommands = ['ls', 'cat', 'git status']
    this.blockedCommands = ['rm -rf', 'sudo']
  }

  async checkCommand(command) {
    for (const blocked of this.blockedCommands) {
      if (command.startsWith(blocked)) {
        return await this.requestApproval(command)
      }
    }
    return true
  }
}
```

### 模式二：Docker 沙箱

每个 Agent 运行在独立的 Docker 容器中，通过挂载卷共享数据。

### 模式三：Node.js vm 模块

在同一个 Node.js 进程中创建隔离的 V8 上下文：

```javascript
const vm = require('vm')

function runInSandbox(code, context = {}, timeout = 1000) {
  const sandbox = {
    console: { log: (msg) => safeLog(msg) },
    Math, JSON,
    // 不暴露 require、process、fs 等
    ...context
  }
  vm.createContext(sandbox)
  return vm.runInContext(code, sandbox, { timeout })
}
```

### 模式四：Deno 权限标志

```bash
# Deno 的细粒度权限控制
deno run --allow-read=/data --allow-write=/tmp --allow-net=api.example.com script.ts
```

---

## 常见安全风险

1. **原型链污染** — 攻击者修改 Object.prototype 影响全局
2. **定时器逃逸** — 通过 setTimeout 在主线程执行代码
3. **共享引用逃逸** — 通过传入的对象引用突破沙箱
4. **资源耗尽** — 无限循环 / 内存泄漏导致 DoS
5. **侧信道攻击** — 通过执行时间推断敏感信息

### 防护建议

- 总是设置执行超时（timeout）
- 限制最大内存使用
- 使用 `vm.runInNewContext()` 而非 `vm.runInThisContext()`
- 避免暴露原生对象引用
- 对输出结果做无害化处理

---

## 与项目中其他章节的关系

| 章节 | 关联 | 说明 |
|------|------|------|
| 06-Plugins | 🔗 插件内代码需在沙箱执行 | Plugin 加载器可集成权限检查 |
| 07-Loop Control | 🔗 沙箱内循环需 LoopController 限制 | 防止沙箱内死循环耗尽资源 |
| 04-Multi-agent | 🔗 不同 Agent 可分配不同沙箱级别 | 根据 Agent 信任级别控制权限 |

---

## 后续实践

- [ ] 实现 `sandbox.js` — 基于 vm 模块的 JS 沙箱
- [ ] 实现文件系统权限控制器
- [ ] 实现网络请求白名单
- [ ] 集成 LoopController 防止沙箱内死循环
- [ ] 集成到 Plugin 系统

---

*更新时间：2026年7月14日*
