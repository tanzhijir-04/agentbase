#!/usr/bin/env node

/**
 * Plugin System - 插件系统（SKILL.md 技能组管理）
 *
 * Plugin = 一组 SKILL.md 技能的元组织
 *
 * 真实生态中，Plugin 是技能的打包方式：
 *   plugin.json 声明元数据
 *   skills/ 目录下包含多个 SKILL.md
 *
 * 功能：
 * 1. 发现插件目录（plugin.json）
 * 2. 管理插件生命周期（发现→启用→禁用）
 * 3. 注册/取消注册插件包含的技能
 * 4. 插件依赖管理
 */

const fs = require("fs");
const path = require("path");
const { SkillDiscovery } = require("./skill_discovery");

class Plugin {
  constructor(manifest, pluginDir) {
    this.name = manifest.name;
    this.displayName = manifest.displayName || manifest.name;
    this.version = manifest.version || "0.0.1";
    this.description = manifest.description || "";
    this.author = manifest.author || "";
    this.dependencies = manifest.dependencies || [];
    this.skills = manifest.skills || [];
    this.dir = pluginDir;
    this.entryDir = manifest.entry || "./skills";
    this.status = "discovered";
    this.enabledAt = null;
  }

  getStatus() {
    return {
      name: this.name,
      displayName: this.displayName,
      version: this.version,
      description: this.description,
      author: this.author,
      status: this.status,
      skills: this.skills,
      dependencies: this.dependencies,
      enabledAt: this.enabledAt
    };
  }
}

class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.pluginDirs = [];
    this.skillDiscovery = new SkillDiscovery();
    this.logger = console;
  }

  getSkillDiscovery() {
    return this.skillDiscovery;
  }

  addPluginDirectory(dir) {
    const absDir = path.resolve(dir);
    if (!this.pluginDirs.includes(absDir)) {
      this.pluginDirs.push(absDir);
    }
  }

  // ==================== 插件发现 ====================

  discoverPlugins() {
    const discovered = [];
    for (const dir of this.pluginDirs) {
      if (!fs.existsSync(dir)) continue;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pluginDir = path.join(dir, entry.name);
            const manifestPath = path.join(pluginDir, "plugin.json");
            if (fs.existsSync(manifestPath)) {
              const plugin = this._loadPluginManifest(manifestPath, pluginDir);
              if (plugin) discovered.push(plugin.name);
            }
          }
        }
      } catch (err) {
        this.logger.error("Error scanning " + dir + ": " + err.message);
      }
    }
    return discovered;
  }

  _loadPluginManifest(manifestPath, pluginDir) {
    try {
      const content = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(content);
      if (!manifest.name) {
        this.logger.warn("Manifest at " + manifestPath + " has no name");
        return null;
      }
      if (this.plugins.has(manifest.name)) {
        this.logger.warn("Plugin " + manifest.name + " already registered");
        return null;
      }
      const plugin = new Plugin(manifest, pluginDir);
      this.plugins.set(manifest.name, plugin);
      this.logger.log('Discovered plugin: "' + plugin.name + '" v' + plugin.version);
      return plugin;
    } catch (err) {
      this.logger.error("Failed to load manifest at " + manifestPath + ": " + err.message);
      return null;
    }
  }

  registerPlugin(pluginDef) {
    if (!pluginDef || !pluginDef.name) {
      this.logger.error("Plugin registration failed: name is required");
      return false;
    }
    if (this.plugins.has(pluginDef.name)) {
      this.logger.warn('Plugin "' + pluginDef.name + '" already registered');
      return false;
    }
    const plugin = new Plugin({
      name: pluginDef.name,
      displayName: pluginDef.displayName || pluginDef.name,
      version: pluginDef.version || "0.0.1",
      description: pluginDef.description || "",
      author: pluginDef.author || "",
      dependencies: pluginDef.dependencies || [],
      skills: pluginDef.skills || [],
      entry: pluginDef.entry || null
    }, null);
    plugin._data = pluginDef.data || {};
    plugin.status = "registered";
    this.plugins.set(pluginDef.name, plugin);
    this.logger.log('Plugin registered in memory: "' + plugin.name + '"');
    return true;
  }

  // ==================== 生命周期 ====================

  enablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.logger.error('Plugin "' + pluginName + '" not found');
      return false;
    }
    if (plugin.status === "enabled") {
      this.logger.warn('Plugin "' + pluginName + '" is already enabled');
      return true;
    }

    for (const dep of plugin.dependencies) {
      const depPlugin = this.plugins.get(dep);
      if (!depPlugin) {
        this.logger.error('Dependency "' + dep + '" not found for "' + pluginName + '"');
        return false;
      }
      if (depPlugin.status !== "enabled") {
        this.logger.log('Auto-enabling dependency "' + dep + '"');
        this.enablePlugin(dep);
      }
    }

    if (plugin.dir) {
      const skillsDir = path.resolve(plugin.dir, plugin.entryDir || ".");
      if (fs.existsSync(skillsDir)) {
        this.skillDiscovery.addSearchDirectory(skillsDir);
        const discovered = this.skillDiscovery.discoverSkills();
        plugin.skills = discovered;
        this.logger.log('Plugin "' + pluginName + '" found ' + discovered.length + " skills");
      }
    }

    plugin.status = "enabled";
    plugin.enabledAt = Date.now();
    this.logger.log('Plugin enabled: "' + pluginName + '"');
    return true;
  }

  disablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;
    if (plugin.status !== "enabled") return true;
    plugin.status = "disabled";
    this.logger.log('Plugin disabled: "' + pluginName + '"');
    return true;
  }

  loadAllPlugins() {
    const discovered = this.discoverPlugins();
    const enabled = [];
    for (const name of discovered) {
      if (this.enablePlugin(name)) enabled.push(name);
    }
    return enabled;
  }

  disableAllPlugins() {
    const disabled = [];
    const names = Array.from(this.plugins.keys()).reverse();
    for (const name of names) {
      if (this.plugins.get(name).status === "enabled") {
        this.disablePlugin(name);
        disabled.push(name);
      }
    }
    return disabled;
  }

  listPlugins(statusFilter) {
    const list = [];
    for (const plugin of this.plugins.values()) {
      if (!statusFilter || plugin.status === statusFilter) {
        list.push(plugin.getStatus());
      }
    }
    return list;
  }

  getPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    return plugin ? plugin.getStatus() : null;
  }

  removePlugin(pluginName) {
    this.disablePlugin(pluginName);
    this.plugins.delete(pluginName);
    return true;
  }

  getStatus() {
    const all = this.listPlugins();
    return {
      totalPlugins: all.length,
      enabled: all.filter(p => p.status === "enabled").length,
      searchDirs: [...this.pluginDirs],
      plugins: all
    };
  }

  setLogger(logger) {
    if (logger && typeof logger.log === "function") {
      this.logger = logger;
      this.skillDiscovery.setLogger(logger);
    }
  }
}

module.exports = { PluginSystem, Plugin };
