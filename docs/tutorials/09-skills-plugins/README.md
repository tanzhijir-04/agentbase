 # 06 - Skills/Plugins系统
 
 > 扩展Agent的能力 ✅ 已完成 ![Status](https://img.shields.io/badge/status-completed-completed)
 
 ## 📚 文档列表
 
 | # | 文档 | 说明 |
 |---|------|------|
 | 01 | [plugins_skills_system.md](plugins_skills_system.md) | 完整学习笔记：概念、设计、实现 |
 
 ## 🎯 核心概念
 
 ### 为什么需要？
 
 1. **功能解耦** - 功能与核心代码分离
 2. **可扩展性** - 动态添加新功能
 3. **模块化** - 独立开发、测试、维护
 4. **热插拔** - 运行时启用/禁用功能
 5. **复用性** - 跨Agent共享能力
 
 ### Skill vs Plugin
 
 | 维度 | Skill | Plugin |
 |------|-------|--------|
 | 粒度 | 单个功能点 | 功能包（可含多个Skill） |
 | 生命周期 | 注册/取消注册 | 加载/启用/禁用/卸载 |
 | 依赖 | 依赖其他Skill | 依赖其他Plugin |
 | 发布 | 代码内注册 | 独立目录/包 |
![配图：Skill vs Plugin——左手拿工具，右手拎工具箱](/assets/09-skills-01-skill-vs-plugin.png)
 
 ## 📁 项目结构与相关代码
 
 | 文件 | 说明 | 状态 |
 |------|------|------|
 | [skill_discovery.js](../../minimal_agent/skill_discovery.js) | SKILL.md 发现与加载器 **[推荐]** | ✅ 已完成 |
 | [plugin_system.js](../../minimal_agent/plugin_system.js) | Plugin系统核心实现 | ✅ 已完成 |
 | [demos/demo_skills_plugins.js](../../minimal_agent/demos/demo_skills_plugins.js) | 综合演示（SKILL.md 模式） | ✅ 已完成 |
 | [tests/test_skill_discovery.js](../../minimal_agent/tests/test_skill_discovery.js) | SKILL.md 发现测试 | ✅ 27/27 |
| [tests/test_skill_system.js](../../minimal_agent/tests/test_skill_system.js) | Skill系统测试（旧，参考用） | 🗄️ 30/30 |
 | [tests/test_plugin_system.js](../../minimal_agent/tests/test_plugin_system.js) | Plugin 系统测试 | ✅ 31/31 |
 
 ### 预置技能
 
 | 技能 | 优先级 | 触发词 |
 |------|--------|--------|
 | translate | 7 | 翻译, translate, 译成 |
 | weather | 5 | 天气, weather, 气温 |
 | calculator | 8 | 计算, 算一下, 等于 |
 | file-ops | 6 | 文件, file, 读取 |
 | code-helper | 6 | 代码, code, debug |
 | search | 4 | 搜索, search, 查找 |
 | reminder | 5 | 提醒, remind, 定时 |
 | formatter | 3 | 格式化, format, 排版 |
 | summarizer | 6 | 摘要, 总结, summarize |
 | greeting | 1 | 你好, hello, hi |
 
 ### 预置插件
 
 | 插件 | 版本 | 提供技能 |
 |------|------|----------|
 | text-processing | 1.0.0 | 字符统计, 大小写转换 |
 | network-tools | 1.0.0 | http-request, url-parser |
 | dev-tools | 1.0.0 | json-format, base64-tool |
 
 ## 💡 学习要点
 
 - [x] 理解核心概念（Skill vs Plugin）
 - [x] 实现Skill系统（注册、匹配、执行、链式）
 - [x] 实现Plugin系统（生命周期、依赖、桥接）
![配图：插件生命周期——加载、启用、禁用、卸载](/assets/09-skills-02-plugin-lifecycle.png)
 - [x] 编写测试用例（58个通过：skill_discovery 27 + plugin_system 31）
 - [x] 编写综合演示
 - [ ] 集成自然语言处理（语义匹配）
 - [ ] 插件热更新和版本管理
 - [ ] 远程插件下载和安装
 
 ## 🚀 快速开始
 
 ```bash
 # 运行综合演示
 node minimal_agent/demos/demo_skills_plugins.js
 
 # 运行测试
 node minimal_agent/tests/test_skill_system.js
 node minimal_agent/tests/test_plugin_system.js
 ```
 
 ## 🎯 学习成果
 
 通过本章节的学习，我：
 
 ### 理论知识
 - 理解了Skill和Plugin的区别与联系
 - 掌握了Plugin生命周期管理
 - 了解了关键词匹配算法设计
 
 ### 实践技能
 - 实现了完整的Skill系统（10个技能、链式执行、依赖管理）
 - 实现了完整的Plugin系统（3个插件、生命周期、自动依赖解析）
 - 编写了66个测试用例，全部通过
 
 ---
 
 *更新时间：2026年7月12日*



