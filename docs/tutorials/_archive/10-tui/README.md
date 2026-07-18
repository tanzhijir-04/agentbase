# 10 - TUI 终端界面优化指南

> 让 AI Agent 在终端中的交互像 GUI 一样友好

---

## 为什么需要 TUI

| 问题 | 表现 | 后果 |
|------|------|------|
| 无进度反馈 | 长时间任务时屏幕不动 | 用户以为卡死了 |
| 输出混乱 | 多行文本堆叠 | 信息难以阅读 |
| 无交互 | 不能键盘控制 | 无法中断或操作 |

## 快速上手 blessed

```javascript
const blessed = require("blessed");
const screen = blessed.screen({ smartCSR: true });

// 日志面板
const log = blessed.log({
  top: 0, left: 0,
  width: "100%", height: "80%",
  tags: true, scrollable: true
});

// 输入框
const input = blessed.textbox({
  bottom: 0, left: 0,
  width: "100%", height: 3,
  inputOnFocus: true
});

screen.append(log);
screen.append(input);
screen.key(["escape", "C-c"], () => process.exit(0));
screen.render();
```

## Agent TUI 核心组件

### 1. 状态栏
显示 Agent 当前状态：思考中、执行工具、等待输入。

### 2. 消息日志
分色显示 Agent 的操作：
- 🤔 思考过程
- 🔧 工具调用
- ✅ 执行成功
- ❌ 执行失败

### 3. 分割面板
同时查看 Agent 思考过程和执行结果。

## 最佳实践

1. 快捷键一致性：Ctrl+C 中断、Tab 切换
2. 颜色 3-4 种够用：信息/警告/错误/成功
3. 频繁更新用局部刷新提升性能
4. 退出前清理资源、保存状态

---

*更新时间：2026年7月15日*
