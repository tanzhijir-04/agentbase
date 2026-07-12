#!/usr/bin/env node

/**
 * Skill Discovery - SKILL.md 文件发现与加载器
 *
 * 真实 Agent 生态中，skills 是以 SKILL.md 文件形式存在的。
 * 每个 SKILL.md 包含：
 *   - YAML front matter（name, description, metadata）
 *   - Markdown 指令内容（Agent 读取并执行）
 *
 * 本模块负责：
 * 1. 扫描目录，发现所有 SKILL.md 文件
 * 2. 解析 YAML front matter 提取元数据
 * 3. 缓存技能元数据供查询
 * 4. 支持关键词匹配和查询
 *
 * 注意：Skill 的"执行"由 Agent 模型本身完成
 * （Agent 读取匹配的 SKILL.md 内容后按指令行动），
 * 本模块只负责发现和加载。
 */

const fs = require('fs');
const path = require('path');

/**
 * 简单的 YAML front matter 解析器
 * 解析 SKILL.md 文件中 --- 之间的元数据
 */
class YamlFrontMatterParser {
  static parse(content) {
    const result = { metadata: {} };
    const lines = content.split('\n');
    let inFrontMatter = false;
    let frontMatterLines = [];
    let bodyLines = [];
    let frontMatterCount = 0;

    for (const line of lines) {
      if (line.trim() === '---') {
        frontMatterCount++;
        if (!inFrontMatter) {
          inFrontMatter = true;
        } else {
          inFrontMatter = false;
        }
        continue;
      }

      if (inFrontMatter) {
        frontMatterLines.push(line);
      } else if (frontMatterCount >= 2) {
        bodyLines.push(line);
      }
    }

    // 解析 front matter 键值对
    let currentKey = null;
    let currentValue = [];

    for (const line of frontMatterLines) {
      const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
      if (keyMatch) {
        // 保存上一个 key
        if (currentKey) {
          result[currentKey] = this._finalizeValue(currentValue.join('\n').trim());
        }
        currentKey = keyMatch[1];
        const rest = keyMatch[2].trim();
        if (rest === '>') {
          currentValue = [];
        } else {
          currentValue = [rest];
        }
      } else if (currentKey && line.trim()) {
        currentValue.push(line);
      }
    }
    if (currentKey) {
      result[currentKey] = this._finalizeValue(currentValue.join('\n').trim());
    }

    result._body = bodyLines.join('\n').trim();
    return result;
  }

  static _finalizeValue(value) {
    // 尝试解析为数字
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    // 尝试解析为布尔值
    if (value === 'true') return true;
    if (value === 'false') return false;
    // 尝试解析为数组
    if (value.startsWith('[') && value.endsWith(']')) {
      try { return JSON.parse(value); } catch {}
    }
    return value;
  }
}

class SkillDiscovery {
  constructor() {
    this.skills = new Map();   // skillName -> SkillMetadata
    this.searchDirs = [];       // 搜索目录列表
    this.logger = console;
  }

  // ==================== 目录管理 ====================

  /**
   * 添加技能搜索目录
   * @param {string} dirPath - 目录路径
   */
  addSearchDirectory(dirPath) {
    const absPath = path.resolve(dirPath);
    if (!this.searchDirs.includes(absPath)) {
      this.searchDirs.push(absPath);
    }
  }

  // ==================== 技能发现 ====================

  /**
   * 从所有搜索目录中发现 SKILL.md 文件
   * @returns {Array<string>} 发现的技能名称列表
   */
  discoverSkills() {
    const discovered = [];

    for (const dir of this.searchDirs) {
      const dirSkills = this._discoverInDirectory(dir);
      discovered.push(...dirSkills);
    }

    return discovered;
  }

  /**
   * 在指定目录中递归查找 SKILL.md
   */
  _discoverInDirectory(dirPath) {
    const discovered = [];

    if (!fs.existsSync(dirPath)) return discovered;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // 递归搜索子目录
          const subSkills = this._discoverInDirectory(fullPath);
          discovered.push(...subSkills);
        } else if (entry.name === 'SKILL.md') {
          // 发现 SKILL.md 文件
          const skill = this._loadSkillFile(fullPath);
          if (skill) {
            // 使用目录名作为 fallback key
            const dirName = path.basename(path.dirname(fullPath));
            if (!this.skills.has(skill.name)) {
              this.skills.set(skill.name, skill);
              discovered.push(skill.name);
              this.logger.log('Discovered skill "' + skill.name + '" at ' + fullPath);
            }
          }
        }
      }
    } catch (err) {
      this.logger.error('Error scanning directory ' + dirPath + ': ' + err.message);
    }

    return discovered;
  }

  /**
   * 手动注册一个技能（从代码注册，不依赖文件）
   * @param {Object} skillMeta - 技能元数据
   * @param {string} skillMeta.name - 技能名称
   * @param {string} skillMeta.description - 技能描述
   * @param {string} skillMeta._body - 技能指令内容（SKILL.md 正文）
   * @returns {boolean}
   */
  registerSkill(skillMeta) {
    if (!skillMeta || !skillMeta.name) {
      this.logger.error('Skill registration failed: name is required');
      return false;
    }

    if (this.skills.has(skillMeta.name)) {
      this.logger.warn('Skill "' + skillMeta.name + '" already registered');
      return false;
    }

    this.skills.set(skillMeta.name, {
      name: skillMeta.name,
      description: skillMeta.description || '',
      metadata: skillMeta.metadata || {},
      filePath: skillMeta.filePath || null,
      body: skillMeta._body || skillMeta.body || ''
    });

    this.logger.log('Skill registered: "' + skillMeta.name + '"');
    return true;
  }

  // ==================== 文件加载 ====================

  /**
   * 加载并解析单个 SKILL.md 文件
   */
  _loadSkillFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = YamlFrontMatterParser.parse(content);

      if (!parsed.name) {
        this.logger.warn('SKILL.md at ' + filePath + ' has no name in front matter');
        const dirName = path.basename(path.dirname(filePath));
        parsed.name = dirName;
      }

      return {
        name: parsed.name,
        description: parsed.description || '',
        metadata: parsed.metadata || {},
        filePath: filePath,
        body: parsed._body || '',
        source: {
          directory: path.dirname(filePath),
          filename: path.basename(filePath)
        }
      };
    } catch (err) {
      this.logger.error('Failed to load SKILL.md at ' + filePath + ': ' + err.message);
      return null;
    }
  }

  // ==================== 查询 ====================

  /**
   * 根据关键词搜索匹配的技能
   * @param {string} query - 搜索关键词
   * @returns {Array} 匹配的技能列表
   */
  searchSkills(query) {
    if (!query || typeof query !== 'string') return [];

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const skill of this.skills.values()) {
      let score = 0;

      // name 匹配
      if (skill.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // description 匹配
      if (skill.description && skill.description.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }

      if (score > 0) {
        results.push({ skill: skill.name, score, description: skill.description });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 获取技能元数据
   * @param {string} skillName - 技能名称
   * @returns {Object|null} 技能信息
   */
  getSkill(skillName) {
    const skill = this.skills.get(skillName);
    if (!skill) return null;
    return {
      name: skill.name,
      description: skill.description,
      metadata: { ...skill.metadata },
      filePath: skill.filePath,
      source: skill.source ? { ...skill.source } : null,
      bodyLength: skill.body ? skill.body.length : 0
    };
  }

  /**
   * 获取技能的完整 body（SKILL.md 指令内容）
   * @param {string} skillName - 技能名称
   * @returns {string|null} 技能指令
   */
  getSkillBody(skillName) {
    const skill = this.skills.get(skillName);
    return skill ? skill.body : null;
  }

  /**
   * 获取所有已发现的技能
   * @returns {Array} 技能列表
   */
  listSkills() {
    return Array.from(this.skills.values()).map(s => ({
      name: s.name,
      description: s.description,
      filePath: s.filePath,
      bodyLength: s.body ? s.body.length : 0
    }));
  }

  /**
   * 从 description 中提取触发关键词
   * 解析 "触发词包括：" 之后的内容
   * @param {string} description - 技能描述
   * @returns {Array<string>} 触发词列表
   */
  extractTriggers(description) {
    if (!description) return [];

    const match = description.match(/触发词包括[：:]\s*(.+?)(?:。|$|\.)/);
    if (match) {
      return match[1].split(/[、，,、\s]+/).filter(t => t.trim().length > 0);
    }

    // 尝试匹配更宽泛的模式
    const triggerPatterns = description.match(/[""]([^""]+)[""]/g);
    if (triggerPatterns) {
      return triggerPatterns.map(t => t.replace(/[""]/g, ''));
    }

    return [];
  }

  /**
   * 输入内容匹配最合适的技能
   * 按照真实 Agent 的工作方式：基于 description 中的关键词匹配
   * @param {string} input - 用户输入
   * @returns {Object|null} 匹配结果
   */
  matchInput(input) {
    if (!input || typeof input !== 'string') return null;

    const lowerInput = input.toLowerCase();
    const matches = [];

    for (const skill of this.skills.values()) {
      const triggers = this.extractTriggers(skill.description);
      let score = 0;

      for (const trigger of triggers) {
        if (lowerInput.includes(trigger.toLowerCase())) {
          // 匹配度评分：越长越精确的触发词权重更高
          score += trigger.length * 2;
        }
      }

      if (score > 0) {
        matches.push({ skill: skill.name, score, description: skill.description });
      }
    }

    if (matches.length === 0) return null;
    matches.sort((a, b) => b.score - a.score);
    return matches[0];
  }

  // ==================== 状态 ====================

  /**
   * 获取系统状态
   */
  getStatus() {
    const all = this.listSkills();
    return {
      totalSkills: all.length,
      searchDirs: [...this.searchDirs],
      skills: all
    };
  }

  setLogger(logger) {
    if (logger && typeof logger.log === 'function') {
      this.logger = logger;
    }
  }
}

// ==================== 预置技能 ====================

/**
 * 注册一组预置的记忆技能（从 YAML-like 元数据注册，不依赖文件）
 * @param {SkillDiscovery} discovery - 发现器实例
 */
function registerPresetSkills(discovery) {
  const presets = [
    {
      name: 'translation',
      description: '文本翻译。触发词包括：翻译、translate、译成、翻译成、怎么翻译',
      body: '用户要求翻译文本时使用此技能。识别源语言和目标语言，生成翻译结果。'
    },
    {
      name: 'weather',
      description: '天气查询。触发词包括：天气、weather、气温、温度、多少度、下雨、天怎么样',
      body: '用户查询天气时使用此技能。解析城市名称和时间，返回天气信息。'
    },
    {
      name: 'calculator',
      description: '数学计算。触发词包括：计算、算一下、等于多少、公式、calculator、math',
      body: '用户需要数学计算时使用此技能。提取数学表达式，计算结果。'
    },
    {
      name: 'code-helper',
      description: '代码辅助：写代码、debug、格式化。触发词包括：代码、code、编程、写代码、debug、调试',
      body: '用户需要代码相关帮助时使用。识别编程语言，提供代码解决方案。'
    },
    {
      name: 'search',
      description: '信息搜索。触发词包括：搜索、search、查找、查询、搜一下、找找',
      body: '用户需要查找信息时使用。提取搜索关键词，从知识库或网络中检索。'
    },
    {
      name: 'greeting',
      description: '问候和基本对话。触发词包括：你好、您好、hello、hi、嗨、早上好',
      body: '用户打招呼时使用此技能。回应对等的问候，主动询问需求。'
    }
  ];

  for (const preset of presets) {
    discovery.registerSkill(preset);
  }

  console.log('Registered ' + presets.length + ' preset skills (in-memory)');
}

module.exports = {
  SkillDiscovery,
  YamlFrontMatterParser,
  registerPresetSkills
};
