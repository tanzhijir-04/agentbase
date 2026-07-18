# Skills/Plugins 系统学习笔记

## 1. 什么是Skills/Plugins系统？

Skills/Plugins 是扩展AI Agent能力的两种互补机制：

- **Skill（技能）** - 最小的功能单元，定义了Agent能做什么
- **Plugin（插件）** - 功能的封装包，可以包含多个Skill

### 核心目标
- **可扩展性** - 动态添加新功能，无需修改核心代码
- **模块化** - 功能独立开发、测试、维护
- **热插拔** - 运行时启用/禁用功能
- **复用性** - 不同Agent间共享技能和插件

### Skill vs Plugin 对比

| 维度 | Skill | Plugin |
|------|-------|--------|
| 粒度 | 单个功能点 | 功能包（可包含多个Skill） |
| 独立性 | 依赖SkillSystem | 自包含模块 |
| 生命周期 | 注册/取消注册 | 加载/启用/禁用/卸载 |
| 配置 | 无配置 | 支持manifest配置 |
| 依赖 | 可依赖其他Skill | 可依赖其他Plugin |
| 资源管理 | 无 | 有（文件、网络、内存） |
| 发布 | 代码内注册 | 独立目录/包，可分发 |

---

## 2. 为什么需要Skills/Plugins？

### 2.1 技术限制
- **功能耦合** - 所有功能写在一起难以维护
- **单点修改** - 新增功能需要改动主程序
- **代码膨胀** - Agent核心代码会越来越臃肿

### 2.2 实际场景需求
- **多样化任务** - 翻译、天气、计算、搜索等不同领域功能
- **按需加载** - 根据用户需求动态加载对应功能
- **第三方扩展** - 允许其他人开发功能扩展

### 2.3 设计思路
```
没有Skill/Plugin的Agent：

  Agent.js (5000行)
  ├── translate()        ← 硬编码
  ├── weather()          ← 硬编码
  ├── search()           ← 硬编码
  ├── calculate()        ← 硬编码
  └── ... (越来越臃肿)

有Skill/Plugin的Agent：

  Agent.js (核心，200行)
  ├── SkillSystem        ← 统一调度
  ├── PluginSystem       ← 插件管理
  │
  └── plugins/           ← 外部扩展
      ├── translate-skill/  ← 独立模块
      ├── weather-plugin/   ← 独立模块
      └── search-plugin/    ← 独立模块
```

---

## 3. 系统架构设计

### 3.1 整体架构

```
┌────────────────────────────────────────────────────┐
│                    Agent Core                       │
│  ┌──────────────────────────────────────────────┐  │
│  │            PluginSystem                       │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│  │  │Plugin A │  │Plugin B │  │Plugin C │      │  │
│  │  │ (文處理)│  │(網絡工具)│  │(開發工具)│      │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘      │  │
│  └───────┼────────────┼────────────┼───────────┘  │
│          ▼            ▼            ▼              │
│  ┌──────────────────────────────────────────────┐  │
│  │            SkillSystem                        │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │  │
│  │  │Translate│ │Weather │ │Calculate│ │Search │ │  │
│  │  │ (翻譯) │ │ (天氣) │ │ (計算)  │ │ (搜索)│ │  │
│  │  └────────┘ └────────┘ └────────┘ └───────┘ │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 3.2 Skill系统核心设计

```
SkillDefinition {
  name: string           // 唯一标识符
  description: string    // 功能描述
  triggers: string[]     // 触发关键词
  execute: Function      // 执行函数
  priority: number       // 优先级 (1-10)
  dependencies: string[] // 依赖的其他Skill
}
```

**Skill匹配算法流程：**

1. 用户输入文本
2. 遍历所有已注册的Skill
3. 检查输入是否包含任意trigger关键词
4. 计算匹配得分（触发词长度、位置、匹配度）
5. 按优先级和得分排序
6. 返回最佳匹配的Skill
7. 执行并返回结果

### 3.3 Plugin系统核心设计

```
PluginManifest {
  id: string         // 唯一标识
  name: string       // 显示名称
  version: string    // 版本号
  main: string       // 入口文件
  dependencies: []   // 依赖列表
  skills: []         // 提供的Skill列表
}
```

**Plugin生命周期：**

```
发现 → 加载 → 初始化 → 启用 → 执行 → 禁用 → 卸载
```

---

## 4. 代码实现解析

### 4.1 SkillSystem类

**核心位置**: `minimal_agent/skill_system.js`

#### 技能注册 (registerSkill)

```javascript
registerSkill(skillDefinition) {
  // 验证必填字段
  if (!name || !triggers || !execute) return false;

  // 检查重复注册
  if (this.skills.has(name)) return false;

  // 检查依赖
  for (const dep of dependencies) {
    if (!this.skills.has(dep)) {
      console.warn('依赖未满足');
    }
  }

  // 创建技能定义并注册
  this.skills.set(name, { ...skillDefinition });
  return true;
}
```

#### 技能匹配 (matchSkill)

匹配算法是Skill系统的核心。它实现了：

1. 关键词匹配 - 检查输入中是否包含触发词
2. 评分机制 - 根据触发词长度、位置、匹配度计算分数
3. 优先级加权 - 高优先级的Skill获得加分
4. 最佳选择 - 返回得分最高的Skill

```javascript
matchSkill(input) {
  const lowerInput = input.toLowerCase();

  for (const skill of this.skills) {
    for (const trigger of skill.triggers) {
      if (lowerInput.includes(trigger)) {
        // 计算匹配分数
        const score = (trigger.length * 2)
                    + (1 / (matchIndex + 1))
                    + (matchRatio * 10)
                    + (skill.priority * 2);
        matches.push({ skill: skill.name, score });
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score)[0];
}
```

#### 链式执行 (executeChain)

链式执行允许一个Skill的输出触发另一个Skill：

```
输入: "翻译" → [Translate] → "输出结果"
                                ↓ (检测到"天气")
                             [Weather] → "天气信息"
```

### 4.2 PluginSystem类

**核心位置**: `minimal_agent/plugin_system.js`

#### 插件注册

```javascript
// 从代码注册
pluginSystem.registerPlugin({
  id: 'my-plugin',
  name: '我的插件',
  version: '1.0.0',
  instance: {
    init: async (ps) => { /* 初始化 */ },
    start: async (ss) => { /* 注册技能到SkillSystem */ },
    stop: async () => { /* 清理 */ },
    destroy: async () => { /* 销毁 */ }
  }
});
```

#### 生命周期管理

| 方法 | 说明 | 触发条件 |
|------|------|----------|
| `loadPlugin(id)` | 加载 | 调用init()，检查依赖 |
| `enablePlugin(id)` | 启用 | 调用start()，注册Skill |
| `disablePlugin(id)` | 禁用 | 调用stop()，取消注册Skill |
| `unloadPlugin(id)` | 卸载 | 调用destroy()，释放资源 |
| `removePlugin(id)` | 移除 | 从系统中完全删除 |

#### 自动依赖解析

当启用一个插件时，PluginSystem会自动检查并加载其依赖：

```javascript
// 开发工具插件依赖文本处理插件
// 启用dev-tools时会自动先启用text-processing
await pluginSystem.enablePlugin('dev-tools');
// 1. 检查依赖 -> 发现需要text-processing
// 2. 如果text-processing未启用，自动启用
// 3. 启用dev-tools
```

---

## 5. 运行测试与演示

### 5.1 运行测试

```bash
# 测试Skill系统（30个测试用例）
node minimal_agent/tests/test_skill_system.js

# 测试Plugin系统（36个测试用例）
node minimal_agent/tests/test_plugin_system.js
```

**预期结果**:
```
Skill System 测试: 30 passed, 0 failed
Plugin System 测试: 36 passed, 0 failed
```

### 5.2 运行演示

```bash
node minimal_agent/demos/demo_skills_plugins.js
```

演示涵盖：
- 10个预置技能的注册和匹配
- 6个真实场景的输入匹配和执行
- 多匹配分析和最佳匹配选择
- 链式执行演示
- Plugin系统的完整生命周期管理
- 插件技能的执行测试
- 禁用/重新启用测试
- 系统状态总览

### 5.3 测试覆盖矩阵

| 测试模块 | 测试用例 | 说明 |
|----------|----------|------|
| skill注册 | 3 | 成功/重复/验证 |
| skill匹配 | 4 | 关键词/无匹配/边界 |
| skill执行 | 7 | 成功/失败/链式/输入处理 |
| 依赖管理 | 2 | 满足/不满足 |
| 取消注册 | 3 | 成功/重复/验证 |
| 统计 | 4 | 状态/历史/重置 |
| plugin注册 | 4 | 成功/重复/无ID/列表 |
| plugin生命周期 | 13 | 加载/启用/禁用/卸载/完整周期 |
| plugin-skill集成 | 4 | 技能注册/验证 |
| 批量操作+移除 | 4 | 批量禁用/移除/状态 |

---

## 6. 预置技能列表

| 技能名 | 优先级 | 触发词 | 描述 |
|--------|--------|--------|------|
| translate | 7 | 翻译, translate, 译成 | 文本翻译（模拟） |
| weather | 5 | 天气, weather, 气温 | 天气查询（模拟） |
| calculator | 8 | 计算, 算一下, 等于 | 数学计算 |
| file-ops | 6 | 文件, file, 读取 | 文件操作 |
| code-helper | 6 | 代码, code, debug | 代码辅助 |
| search | 4 | 搜索, search, 查找 | 信息搜索（模拟） |
| reminder | 5 | 提醒, remind, 定时 | 提醒和定时器 |
| formatter | 3 | 格式化, format, 排版 | 文本格式化 |
| summarizer | 6 | 摘要, 总结, summarize | 文本摘要（模拟） |
| greeting | 1 | 你好, hello, hi | 问候和基本对话 |

## 7. 预置插件列表

| 插件名 | 版本 | 描述 | 依赖 | 提供技能 |
|--------|------|------|------|----------|
| text-processing | 1.0.0 | 文本处理功能包 | 无 | 字符统计, 大小写转换 |
| network-tools | 1.0.0 | 网络工具包 | 无 | http-request, url-parser |
| dev-tools | 1.0.0 | 开发者工具包 | text-processing | json-format, base64-tool |

---

## 8. 实际应用场景

### 8.1 Agent集成示例

将Skill/Plugin系统集成到Agent中：

```javascript
const { SkillSystem } = require('./skill_system');
const { PluginSystem } = require('./plugin_system');

class EnhancedAgent {
  constructor() {
    this.skillSystem = new SkillSystem();
    this.pluginSystem = new PluginSystem(this.skillSystem);
  }

  async processUserInput(input) {
    // 尝试技能匹配
    const result = await this.skillSystem.processInput(input);

    if (result.success) {
      return result.result;
    }

    // 没有匹配的技能，回退到默认处理
    return this.defaultHandler(input);
  }

  async loadPlugin(pluginId) {
    await this.pluginSystem.enablePlugin(pluginId);
  }
}
```

### 8.2 插件发现机制

从文件系统发现插件：

```javascript
// 添加插件搜索目录
pluginSystem.addPluginDirectory('./plugins');

// 自动发现所有插件
const discovered = pluginSystem.discoverPlugins();
// 返回: ['my-plugin', 'another-plugin']

// 启用所有发现的插件
await pluginSystem.loadAllPlugins();
```

### 8.3 扩展场景

1. **翻译助手** - 集成翻译API作为Skill
2. **代码审查** - Plugin分析代码质量
3. **数据可视化** - Plugin生成图表
4. **文档生成** - Plugin自动生成文档
5. **第三方集成** - 其他开发者贡献Skill

---

## 9. 设计要点总结

### 9.1 Skill系统关键设计决策

1. **关键词触发** - 简单有效，不需要NLP支持
2. **优先级机制** - 解决多个Skill匹配时的冲突
3. **评分算法** - 综合触发词长度、位置、匹配度
4. **链式执行** - 支持复杂工作流

### 9.2 Plugin系统关键设计决策

1. **生命周期管理** - 确保资源正确分配和释放
2. **自动依赖解析** - 减少用户操作负担
3. **Skill桥接** - Plugin通过SkillSystem注册技能
4. **文件发现** - 支持从目录自动加载插件

### 9.3 改进方向

- [ ] 更智能的匹配算法（NLP语义匹配）
- [ ] 插件热更新（不重启Agent）
- [ ] Skill间通信机制
- [ ] Plugin沙箱（安全隔离）
- [ ] 分布式Plugin发现（远程加载）
- [ ] Plugin版本管理（兼容性检查）
- [ ] Skill执行超时控制
- [ ] Plugin配置持久化

---

## 10. 学习总结

通过Skills/Plugins系统的学习，我掌握了：

### 理论知识
- 理解Skill和Plugin的区别和联系
- 掌握Plugin生命周期管理的概念
- 了解关键词匹配和优先级算法

### 实践技能
- 实现了完整的SkillSystem（注册、匹配、执行、链式）
- 实现了完整的PluginSystem（生命周期、依赖、Skill桥接）
- 编写了10个预置技能和3个预置插件

### 代码统计

| 文件 | 行数 | 功能 |
|------|------|------|
| skill_system.js | ~350行 | Skill系统核心 |
| plugin_system.js | ~400行 | Plugin系统核心 |
| demo_skills_plugins.js | ~200行 | 综合演示 |
| test_skill_system.js | ~140行 | Skill系统测试 |
| test_plugin_system.js | ~160行 | Plugin系统测试 |

**测试结果**: 66个测试用例全部通过

---

*更新时间：2026年7月12日*
## 11. 两种实现方式的对比

本项目包含了 Skills/Plugins 系统的两种实现：

### v1（旧）：JavaScript 类方式（skill_system.js）

在第一版实现中，我将 Skill 设计为 JavaScript 类，通过关键词匹配触发 JS 函数执行：

```javascript
// OLD approach - not the real pattern
skillSystem.registerSkill({
  name: 'translate',
  triggers: ['翻译', 'translate'],
  execute: async (input) => { /* JS code */ }
});
```

这种方式的局限性：
- Skill 的行为被硬编码在 JS 函数中
- 扩展需要写代码，不够灵活
- 与真实 Agent 生态不符

### v2（新）：SKILL.md 文件方式（skill_discovery.js）✅

在真实 Codex Agent 生态中，Skill 是带有 YAML front matter 的 Markdown 文件：

```markdown
---
name: translation
description: 文本翻译。触发词包括：翻译、translate...
---

# Translation — 文本翻译

你是一位专业的翻译助手...
```

核心差异：

| 维度 | 旧（JS类） | 新（SKILL.md） |
|------|------------|----------------|
| 定义方式 | JavaScript 对象 | Markdown 文件 |
| 触发方式 | 关键词→JS函数 | 关键词→Agent读取指令 |
| 执行者 | JavaScript 引擎 | Agent（LLM） |
| 灵活性 | 需改代码 | 改 Markdown 即可 |
| 扩展性 | 需编程知识 | 会写 Markdown 即可 |

---

*更新时间：2026年7月12日*
