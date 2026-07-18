#!/usr/bin/env node

/**
 * Skills/Plugins 系统综合演示（SKILL.md 真实模式）
 *
 * 演示内容：
 * 1. SKILL.md 文件发现和解析
 * 2. YAML Front Matter 解析
 * 3. Agent 视角的技能匹配
 * 4. Plugin 文件发现和加载
 * 5. Plugin 生命周期管理
 */

const { SkillDiscovery, YamlFrontMatterParser, registerPresetSkills } = require("../skill_discovery");
const { PluginSystem } = require("../plugin_system");
const path = require("path");

function printSep(title) {
  console.log("\n" + "=".repeat(60));
  console.log("  " + title);
  console.log("=".repeat(60));
}

async function main() {
  console.log("# Skills/Plugins 系统演示（SKILL.md 模式）");
  console.log("=".repeat(60));

  // ========== Part 1: SKILL.md 解析 ==========
  printSep("Part 1: SKILL.md 文件解析");

  console.log("\n[1a] 解析示例 YAML Front Matter：");
  const sample = [
    "---",
    "name: demo-skill",
    "description: 演示技能。触发词包括：演示、demo、示例",
    "metadata:",
    "  key: value",
    "---",
    "",
    "# Demo Skill",
    "这是技能的 Markdown 指令内容"
  ].join("\n");

  const parsed = YamlFrontMatterParser.parse(sample);
  console.log("  name: " + parsed.name);
  console.log("  description: " + parsed.description);
  console.log("  body: " + parsed._body.substring(0, 40) + "...");

  // ========== Part 2: SKILL.md 发现 ==========
  printSep("Part 2: 从 skills/ 目录发现 SKILL.md");

  const discovery = new SkillDiscovery();
  discovery.addSearchDirectory("C:/Users/20300/Desktop/AI-Agent-Study/skills/example-skills");
  const discovered = discovery.discoverSkills();

  console.log("\n  发现 " + discovered.length + " 个技能：");
  const skills = discovery.listSkills();
  skills.forEach(s => {
    const triggers = discovery.extractTriggers(s.description);
    console.log("  - " + s.name + ": " + triggers.slice(0, 3).join(", ") + (triggers.length > 3 ? "..." : ""));
  });

  // ========== Part 3: 读取 SKILL.md 内容 ==========
  printSep("Part 3: 读取 SKILL.md 指令内容");

  const translationBody = discovery.getSkillBody("translation");
  console.log("\n  [translation SKILL.md body]:");
  console.log("  " + (translationBody ? translationBody.substring(0, 200).replace(/\n/g, "\n  ") : "N/A") + "...");

  // ========== Part 4: 技能匹配（Agent 视角） ==========
  printSep("Part 4: 基于关键词的技能匹配");

  registerPresetSkills(discovery);

  const testInputs = [
    "今天北京天气怎么样？",
    "帮我翻译 hello world",
    "计算 123 + 456",
    "帮我写一个Node.js读取文件",
    "你好！"
  ];

  for (const input of testInputs) {
    const match = discovery.matchInput(input);
    if (match) {
      const skill = discovery.getSkill(match.skill);
      console.log("\n  输入: \"" + input + "\"");
      console.log("  匹配: " + match.skill + " (score: " + match.score + ")");
      console.log("  描述: " + (skill ? skill.description.substring(0, 60) + "..." : "N/A"));

      // 模拟 Agent 读取 SKILL.md body
      const body = discovery.getSkillBody(match.skill);
      if (body) {
        console.log("  [Agent 读取 SKILL.md 指令] " + body.substring(0, 80) + "...");
      }
    } else {
      console.log("\n  输入: \"" + input + "\"");
      console.log("  (无匹配)");
    }
  }

  // ========== Part 5: Plugin 发现 ==========
  printSep("Part 5: Plugin 发现与加载");

  const ps = new PluginSystem();
  ps.addPluginDirectory("C:/Users/20300/Desktop/AI-Agent-Study/plugins");
  const pluginNames = ps.discoverPlugins();

  console.log("\n  发现 " + pluginNames.length + " 个插件：");
  ps.listPlugins().forEach(p => {
    console.log("  - " + p.displayName + " (v" + p.version + ") [" + p.status + "]");
    console.log("    描述: " + p.description.substring(0, 60) + "...");
    console.log("    技能: " + (p.skills.length > 0 ? p.skills.join(", ") : "(待启用)"));
    console.log("    依赖: " + (p.dependencies.length > 0 ? p.dependencies.join(", ") : "无"));
  });

  // ========== Part 6: 启用插件 + 发现 SKILL.md ==========
  printSep("Part 6: 启用插件并发现 SKILL.md");

  console.log("\n[6a] 启用 text-processing 插件...");
  ps.enablePlugin("text-processing");
  let pStatus = ps.getPlugin("text-processing");
  console.log("  状态: " + pStatus.status);
  console.log("  发现的技能: " + pStatus.skills.join(", "));

  // 验证插件内的 SKILL.md 也被 skillDiscovery 发现
  const sd = ps.getSkillDiscovery();
  const charSkill = sd.getSkill("char-counter");
  console.log("\n[6b] 验证 SKILL.md 被 skillDiscovery 发现：");
  console.log("  char-counter: " + (charSkill ? "✅ (body: " + charSkill.bodyLength + " chars)" : "❌ 未发现"));
  const caseSkill = sd.getSkill("case-converter");
  console.log("  case-converter: " + (caseSkill ? "✅ (body: " + caseSkill.bodyLength + " chars)" : "❌ 未发现"));

  // ========== Part 7: 依赖管理 ==========
  printSep("Part 7: 插件依赖管理");

  console.log("\n[7a] 启用 network-tools 插件...");
  ps.enablePlugin("network-tools");
  console.log("  状态: " + ps.getPlugin("network-tools").status);

  console.log("\n[7b] 启用 dev-tools（依赖 text-processing，会自动解析）...");
  ps.enablePlugin("dev-tools");
  console.log("  状态: " + ps.getPlugin("dev-tools").status);

  // ========== Part 8: 系统状态 ==========
  printSep("Part 8: 系统状态总览");

  const status = ps.getStatus();
  console.log("\n  Plugin 系统：");
  console.log("  - 总插件数: " + status.totalPlugins);
  console.log("  - 已启用: " + status.enabled);

  const discStatus = sd.getStatus();
  console.log("\n  Skill Discovery：");
  console.log("  - 总技能数: " + discStatus.totalSkills);
  console.log("  - 搜索目录: " + discStatus.searchDirs.length + " 个");

  console.log("\n  📋 总结：");
  console.log("  " + "=".repeat(40));
  console.log("  Skill 系统（SKILL.md 模式）：");
  console.log("  - " + discStatus.totalSkills + " 个 SKILL.md 技能");
  console.log("  - 每个 SKILL.md = YAML front matter + Markdown 指令");
  console.log("  - Agent 读取匹配的 SKILL.md 后按指令执行");
  console.log("");
  console.log("  Plugin 系统：");
  console.log("  - " + status.totalPlugins + " 个插件（" + status.enabled + " 个已启用）");
  console.log("  - 每个 plugin.json + skills/ 目录 = 插件包");
  console.log("  " + "=".repeat(40));

  process.exit(0);
}

main().catch(err => { console.error("演示出错:", err); process.exit(1); });
