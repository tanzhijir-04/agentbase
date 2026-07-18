#!/usr/bin/env node

/**
 * Skill System - AI Agent技能系统
 *
 * 功能：
 * 1. 技能注册和管理
 * 2. 关键词触发机制
 * 3. 技能执行和结果处理
 * 4. 技能依赖管理
 * 5. 技能优先级和冲突解决
 *
 * ================ 原理讲解 ================
 *
 * 【为什么需要Skill系统？】
 *
 * 没有Skill系统的Agent：
 *   用户：帮我翻译这段话
 *   Agent：翻译功能未实现 ❌ （需要硬编码所有功能）
 *
 * 有Skill系统的Agent：
 *   用户：帮我翻译这段话
 *   Agent：检测到"翻译"关键词，触发TranslateSkill ✅
 *
 *
 * 【Skill系统的核心概念】
 *
 * 1. Skill定义
 *    - name: 技能名称（唯一标识符）
 *    - description: 技能描述
 *    - triggers: 触发关键词列表
 *    - execute: 执行函数
 *    - priority: 优先级（处理冲突）
 *    - dependencies: 依赖的其他技能
 *
 * 2. Skill注册
 *    - 将Skill添加到系统中
 *    - 注册时检查依赖是否满足
 *    - 支持动态注册和取消注册
 *
 * 3. Skill触发
 *    - 关键词匹配：根据输入内容和触发词匹配
 *    - 优先级排序：多个匹配时按优先级决定
 *    - 链式调用：一个Skill的执行结果可以触发另一个
 *
 * 4. Skill执行
 *    - 接收输入参数
 *    - 执行业务逻辑
 *    - 返回结果
 *    - 错误处理
 *
 *
 * 【数据结构设计】
 *
 * Skill注册表：
 * Map<skillName, SkillDefinition> {
 *   "translate": {
 *     name: "translate",
 *     description: "文本翻译",
 *     triggers: ["翻译", "translate", "译成"],
 *     execute: async (input) => { ... },
 *     priority: 5,
 *     dependencies: []
 *   },
 *   "weather": {
 *     name: "weather",
 *     description: "天气查询",
 *     triggers: ["天气", "weather", "气温"],
 *     execute: async (input) => { ... },
 *     priority: 3,
 *     dependencies: ["http-client"]
 *   }
 * }
 *
 *
 * 【核心算法】
 *
 * 1. 匹配算法：
 *    - 遍历所有已注册的Skill
 *    - 检查输入中是否包含任意trigger
 *    - 按优先级排序匹配结果
 *    - 最高优先级的Skill被选中执行
 *
 * 2. 链式执行：
 *    - Skill A执行后，检查结果
 *    - 如果结果匹配另一个Skill的trigger
 *    - 自动触发下一个Skill
 *    - 形成执行链路
 *
 * 3. 依赖解析：
 *    - 注册时检查所有依赖是否已注册
 *    - 未满足的依赖阻止注册
 *    - 依赖形成有向无环图（DAG）
 */

class SkillSystem {
  constructor() {
    this.skills = new Map();      // skillName -> SkillDefinition
    this.executionHistory = [];    // 执行历史记录
    this.maxHistorySize = 100;     // 最大历史记录数
    this.skillContexts = new Map(); // skillName -> execution context
    this.logger = console;         // 日志输出
  }

  // ==================== 技能注册 ====================

  registerSkill(skillDefinition) {
    const { name, description, triggers, execute, priority = 5, dependencies = [] } = skillDefinition;

    if (!name || typeof name !== 'string') {
      this.logger.error('Skill registration failed: name is required');
      return false;
    }
    if (!triggers || !Array.isArray(triggers) || triggers.length === 0) {
      this.logger.error('Skill registration failed for "' + name + '": triggers must be a non-empty array');
      return false;
    }
    if (typeof execute !== 'function') {
      this.logger.error('Skill registration failed for "' + name + '": execute must be a function');
      return false;
    }

    if (this.skills.has(name)) {
      this.logger.warn('Skill "' + name + '" already registered, use unregisterSkill first to replace');
      return false;
    }

    for (const dep of dependencies) {
      if (!this.skills.has(dep)) {
        this.logger.warn('Skill "' + name + '" depends on "' + dep + '" which is not registered yet');
      }
    }

    const skill = {
      name,
      description: description || '',
      triggers: triggers.map(t => t.toLowerCase()),
      execute,
      priority: Math.max(1, Math.min(10, priority)),
      dependencies,
      registeredAt: Date.now(),
      executionCount: 0,
      lastExecuted: null
    };

    this.skills.set(name, skill);
    this.logger.log('Skill registered: "' + name + '" (priority: ' + skill.priority + ', triggers: [' + triggers.join(', ') + '])');
    return true;
  }

  unregisterSkill(skillName) {
    if (!this.skills.has(skillName)) {
      this.logger.warn('Skill "' + skillName + '" not found');
      return false;
    }

    const dependents = [];
    for (const [name, skill] of this.skills) {
      if (skill.dependencies.includes(skillName)) {
        dependents.push(name);
      }
    }
    if (dependents.length > 0) {
      this.logger.warn('Skill "' + skillName + '" is depended on by: ' + dependents.join(', '));
    }

    this.skills.delete(skillName);
    this.skillContexts.delete(skillName);
    this.logger.log('Skill unregistered: "' + skillName + '"');
    return true;
  }

  // ==================== 技能匹配 ====================

  matchSkill(input) {
    if (!input || typeof input !== 'string') return null;

    const lowerInput = input.toLowerCase();
    const matches = [];

    for (const [name, skill] of this.skills) {
      let bestMatch = null;
      let bestScore = 0;

      for (const trigger of skill.triggers) {
        const triggerLower = trigger.toLowerCase();

        if (lowerInput.includes(triggerLower)) {
          const matchIndex = lowerInput.indexOf(triggerLower);
          const matchRatio = triggerLower.length / lowerInput.length;
          const score = (triggerLower.length * 2) + (1 / (matchIndex + 1)) + (matchRatio * 10);

          if (score > bestScore) {
            bestScore = score;
            bestMatch = {
              skill: name,
              trigger: trigger,
              score: Math.round(score * 100) / 100
            };
          }
        }

        const words = lowerInput.split(/\s+/);
        for (const word of words) {
          if (word === triggerLower) {
            if (bestMatch) {
              bestMatch.score += 5;
            }
          }
        }
      }

      if (bestMatch) {
        bestMatch.score += skill.priority * 2;
        matches.push(bestMatch);
      }
    }

    if (matches.length === 0) return null;

    matches.sort((a, b) => b.score - a.score);
    return matches[0];
  }

  matchAllSkills(input) {
    if (!input || typeof input !== 'string') return [];

    const lowerInput = input.toLowerCase();
    const matches = [];

    for (const [name, skill] of this.skills) {
      let found = false;
      for (const trigger of skill.triggers) {
        if (lowerInput.includes(trigger.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (found) {
        matches.push({
          skill: name,
          priority: skill.priority,
          description: skill.description
        });
      }
    }

    return matches.sort((a, b) => b.priority - a.priority);
  }

  // ==================== 技能执行 ====================

  async executeSkill(skillName, input, context = {}) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      return { success: false, error: 'Skill "' + skillName + '" not found' };
    }

    for (const dep of skill.dependencies) {
      if (!this.skills.has(dep)) {
        return { success: false, error: 'Dependency "' + dep + '" not satisfied for skill "' + skillName + '"' };
      }
    }

    const execContext = {
      ...context,
      skillName: skill.name,
      skillSystem: this,
      timestamp: Date.now()
    };

    this.skillContexts.set(skillName, execContext);

    try {
      this.logger.log('Executing skill: "' + skillName + '"');
      const result = await skill.execute(input, execContext);

      skill.executionCount++;
      skill.lastExecuted = Date.now();

      this.addToHistory({
        skill: skillName,
        input: typeof input === 'string' ? input.substring(0, 200) : input,
        output: result,
        timestamp: Date.now(),
        success: true
      });

      return { success: true, result };
    } catch (error) {
      const errorResult = { success: false, error: error.message };

      this.addToHistory({
        skill: skillName,
        input: typeof input === 'string' ? input.substring(0, 200) : input,
        output: errorResult,
        timestamp: Date.now(),
        success: false
      });

      this.logger.error('Skill "' + skillName + '" execution failed: ' + error.message);
      return errorResult;
    }
  }

  async processInput(input, context = {}) {
    const match = this.matchSkill(input);
    if (!match) {
      return { success: false, matched: false, error: 'No matching skill found' };
    }

    this.logger.log('Matched skill: "' + match.skill + '" (score: ' + match.score + ')');
    return await this.executeSkill(match.skill, input, context);
  }

  // ==================== 链式执行 ====================

  async executeChain(initialSkill, input, context = {}) {
    const results = [];
    let currentResult = await this.executeSkill(initialSkill, input, context);
    results.push({ skill: initialSkill, result: currentResult });

    if (!currentResult.success) return results;

    let chainInput = typeof currentResult.result === 'string'
      ? currentResult.result
      : JSON.stringify(currentResult.result);

    const maxChainLength = 5;
    let chainCount = 0;

    while (chainCount < maxChainLength) {
      const nextMatch = this.matchSkill(chainInput);
      if (!nextMatch) break;

      if (results.some(r => r.skill === nextMatch.skill)) break;

      currentResult = await this.executeSkill(nextMatch.skill, chainInput, context);
      results.push({ skill: nextMatch.skill, result: currentResult });
      chainCount++;

      if (!currentResult.success) break;

      chainInput = typeof currentResult.result === 'string'
        ? currentResult.result
        : JSON.stringify(currentResult.result);
    }

    return results;
  }

  // ==================== 辅助功能 ====================

  listSkills() {
    return Array.from(this.skills.values()).map(skill => ({
      name: skill.name,
      description: skill.description,
      triggers: skill.triggers,
      priority: skill.priority,
      dependencies: skill.dependencies,
      executionCount: skill.executionCount,
      lastExecuted: skill.lastExecuted
        ? new Date(skill.lastExecuted).toISOString()
        : null
    }));
  }

  getSkill(skillName) {
    const skill = this.skills.get(skillName);
    if (!skill) return null;

    return {
      name: skill.name,
      description: skill.description,
      triggers: [...skill.triggers],
      priority: skill.priority,
      dependencies: [...skill.dependencies],
      executionCount: skill.executionCount,
      lastExecuted: skill.lastExecuted
        ? new Date(skill.lastExecuted).toISOString()
        : null
    };
  }

  getHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }

  addToHistory(record) {
    this.executionHistory.push(record);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  resetStats() {
    for (const skill of this.skills.values()) {
      skill.executionCount = 0;
      skill.lastExecuted = null;
    }
    this.executionHistory = [];
    this.logger.log('Skill stats reset');
  }

  checkDependencies(skillName) {
    const skill = this.skills.get(skillName);
    if (!skill) return { satisfied: false, missing: [skillName], message: 'Skill not found' };

    const missing = skill.dependencies.filter(dep => !this.skills.has(dep));
    return {
      satisfied: missing.length === 0,
      missing,
      message: missing.length === 0
        ? 'All dependencies satisfied'
        : 'Missing dependencies: ' + missing.join(', ')
    };
  }

  setLogger(logger) {
    if (logger && typeof logger.log === 'function') {
      this.logger = logger;
    }
  }

  getStatus() {
    const skills = this.listSkills();
    const totalExecutions = skills.reduce((sum, s) => sum + s.executionCount, 0);

    return {
      totalSkills: skills.length,
      totalExecutions,
      historySize: this.executionHistory.length,
      maxHistorySize: this.maxHistorySize,
      skills,
      recentHistory: this.getHistory(5)
    };
  }
}

// ==================== 预置技能工厂 ====================

function registerExampleSkills(skillSystem) {
  skillSystem.registerSkill({
    name: 'translate',
    description: '文本翻译（模拟）',
    triggers: ['翻译', 'translate', '译成', '翻译成', '怎么翻译'],
    priority: 7,
    execute: async (input) => {
      const match = input.match(/翻译(?:成)?\\s*([\\u4e00-\\u9fff]+|[a-zA-Z]+)/);
      if (match) {
        return '[模拟翻译] 将"' + match[1] + '"翻译为用户需要的语言';
      }
      return '[模拟翻译] 检测到翻译请求，源文本：' + input.substring(0, 50);
    }
  });

  skillSystem.registerSkill({
    name: 'weather',
    description: '城市天气查询（模拟）',
    triggers: ['天气', 'weather', '气温', '温度', '下雨', '下雪', '天怎么样'],
    priority: 5,
    execute: async (input) => {
      const cityMatch = input.match(/(?:在|的)?(\w{2,}(?:市|区|县)?)/);
      const city = cityMatch ? cityMatch[1] : '当前城市';
      const conditions = ['晴', '多云', '阴', '小雨'];
      const temp = Math.round(20 + Math.random() * 15);
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      return '[模拟天气] ' + city + '：' + condition + '，' + temp + '°C，湿度' + Math.round(50 + Math.random() * 30) + '%';
    }
  });

  skillSystem.registerSkill({
    name: 'calculator',
    description: '数学计算',
    triggers: ['计算', '算一下', '等于', '多少', '公式', 'calculator', 'math'],
    priority: 8,
    execute: async (input) => {
      const exprMatch = input.match(/(\d+\\s*[\\+\\-\\*\\/]\\s*\d+)/);
      if (exprMatch) {
        try {
          const result = eval(exprMatch[1]);
          return exprMatch[1] + ' = ' + result;
        } catch {
          return '无法计算表达式: ' + exprMatch[1];
        }
      }
      return '[模拟计算] 表达式未识别';
    }
  });

  skillSystem.registerSkill({
    name: 'file-ops',
    description: '文件读写操作',
    triggers: ['文件', 'file', '读取', '写入', '保存', '创建文件', '读文件'],
    priority: 6,
    execute: async (input) => {
      if (input.includes('读取') || input.includes('读文件')) {
        return '[模拟文件操作] 读取文件内容（需集成真实文件系统）';
      }
      if (input.includes('写入') || input.includes('保存') || input.includes('创建文件')) {
        return '[模拟文件操作] 文件写入成功（需集成真实文件系统）';
      }
      return '[模拟文件操作] 文件操作请求';
    }
  });

  skillSystem.registerSkill({
    name: 'code-helper',
    description: '代码辅助：格式化、解释、调试',
    triggers: ['代码', 'code', '编程', '写代码', 'debug', '调试', '格式化', '解释代码'],
    priority: 6,
    execute: async (input) => {
      if (input.includes('解释')) return '[代码辅助] 代码解释功能（需集成代码解析器）';
      if (input.includes('格式化')) return '[代码辅助] 代码格式化完成（需集成格式化工具）';
      if (input.includes('调试') || input.includes('debug')) return '[代码辅助] 调试建议：检查变量类型和边界条件';
      return '[代码辅助] 代码帮助：请具体描述需要什么帮助';
    }
  });

  skillSystem.registerSkill({
    name: 'search',
    description: '信息搜索（模拟）',
    triggers: ['搜索', '找一下', '查找', '查询', 'search', '搜一下', '找找'],
    priority: 4,
    execute: async (input) => {
      const termMatch = input.match(/(?:搜索|找一下|查找|查询|搜一下|找找)\s*(.+)/);
      const term = termMatch ? termMatch[1] : '未知关键词';
      return '[模拟搜索] 搜索"' + term + '"的结果：找到0条相关结果（需集成搜索API）';
    }
  });

  skillSystem.registerSkill({
    name: 'reminder',
    description: '设置提醒和定时器',
    triggers: ['提醒', 'remind', '定时', '闹钟', '记住', '别忘'],
    priority: 5,
    execute: async (input) => {
      const timeMatch = input.match(/(\d+)\s*(秒|分钟|小时|分钟后)/);
      if (timeMatch) {
        return '[模拟提醒] 已设置' + timeMatch[1] + timeMatch[2] + '后的提醒（需集成定时器）';
      }
      return '[模拟提醒] 提醒设置成功（需集成通知系统）';
    }
  });

  skillSystem.registerSkill({
    name: 'formatter',
    description: '文本格式化：代码、表格、列表',
    triggers: ['格式化', '排版', '美化', '整理', 'format', 'pretty'],
    priority: 3,
    execute: async (input) => {
      return '[格式化] 文本格式化完成（输入长度：' + input.length + '字符）';
    }
  });

  skillSystem.registerSkill({
    name: 'summarizer',
    description: '文本摘要生成（模拟）',
    triggers: ['摘要', '总结', '概括', '总结一下', 'summarize', '简述'],
    priority: 6,
    execute: async (input) => {
      const textMatch = input.match(/(?:摘要|总结|概括|简述)\s*(.+)/);
      const text = textMatch ? textMatch[1] : input;
      const summary = text.length > 30 ? text.substring(0, 30) + '...' : text;
      return '[模拟摘要] ' + summary + '（共含' + text.length + '字符）';
    }
  });

  skillSystem.registerSkill({
    name: 'greeting',
    description: '问候和基本对话',
    triggers: ['你好', '您好', 'hello', 'hi', '嗨', '早上好', '晚上好', 'hey'],
    priority: 1,
    execute: async () => {
      const greetings = [
        '你好！有什么我可以帮你的吗？',
        '你好！请问有什么可以帮助你的？',
        'Hi！有什么技能需要调用吗？'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  });

  console.log('Registered ' + skillSystem.listSkills().length + ' example skills');
}

module.exports = {
  SkillSystem,
  registerExampleSkills
};
