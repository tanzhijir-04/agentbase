# 02 - Memory系统（记忆系统）

> 让Agent记住重要信息 ✅ 已完成

## 📚 文档列表

| 文件 | 说明 |
|------|------|
| day2_memory_system.md | 完整实现指南 |

## 🎯 核心概念

### 两种记忆类型

| 类型 | 短期记忆 | 长期记忆 |
|------|----------|----------|
| 存储 | 内存数组 | JSON文件 |
| 生命周期 | 会话期间 | 永久保存 |
| 用途 | 对话历史 | 用户偏好 |

### 信息提取（正则表达式）

从对话中自动提取用户信息：
- 我叫张三 → name = 张三
- 我喜欢Python → preference = Python
- 我今年25岁 → age = 25

### 语言识别

- **编程语言**：基于文件扩展名（.js → JavaScript）
- **自然语言**：基于中文字符比例

## 📁 相关代码

- minimal_agent/memory.js - Memory系统
- minimal_agent/tests/test_memory.js - 测试
- minimal_agent/demos/demo_regex.js - 正则演示

## 💡 学习要点

- [ ] 实现ShortTermMemory类
- [ ] 实现LongTermMemory类
- [ ] 添加信息提取功能
- [ ] 集成到Agent中
