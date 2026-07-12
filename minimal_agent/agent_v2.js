#!/usr/bin/env node

/**
 * Minimal Coding Agent - 完整版
 * 
 * 功能：
 * 1. 执行terminal命令
 * 2. 读写文件
 * 3. Plan Mode：先制定计划，再执行任务
 * 4. Memory系统：记住用户信息和对话历史
 * 5. 语言识别：自动检测中文/英文，编程语言
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const PlanMode = require('./plan_mode');
const { MemoryManager } = require('./memory');

class MinimalCodingAgent {
    /**
     * 最小的Coding Agent实现
     * 
     * 核心功能：
     * - executeCommand(): 执行shell命令
     * - readFile(): 读取文件
     * - writeFile(): 写入文件
     * - Plan Mode: 计划执行
     * - Memory系统: 记忆管理
     * - 语言识别: 检测语言类型
     */
    
    constructor(workingDirectory = '.') {
        this.workingDirectory = path.resolve(workingDirectory);
        this.history = [];
        
        // 新增：Plan Mode
        this.planMode = new PlanMode(this);
        
        // 新增：Memory系统
        this.memory = new MemoryManager();
        
        // 新增：语言检测器
        this.languageDetector = new LanguageDetector();
        
        console.log('🤖 Agent 已启动（含Memory系统）');
        console.log('   输入 "help" 查看所有命令\n');
    }
    
    // ==================== 核心功能 ====================
    
    /**
     * 执行terminal命令
     */
    executeCommand(command) {
        try {
            this.history.push(`EXECUTE: ${command}`);
            
            const output = execSync(command, {
                cwd: this.workingDirectory,
                encoding: 'utf-8',
                timeout: 30000,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            // 记录到短期记忆
            this.memory.addAssistantMessage(`执行命令: ${command}\n输出: ${output.substring(0, 200)}`);
            
            return { success: true, output: output };
            
        } catch (error) {
            return { 
                success: false, 
                output: `Error (code ${error.status}):\n${error.stderr || error.message}` 
            };
        }
    }
    
    /**
     * 读取文件内容
     */
    readFile(filePath) {
        try {
            const fullPath = path.resolve(this.workingDirectory, filePath);
            this.history.push(`READ: ${filePath}`);
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, content: `Error: File not found: ${filePath}` };
            }
            
            const content = fs.readFileSync(fullPath, 'utf-8');
            
            // 记录到短期记忆
            this.memory.addAssistantMessage(`读取文件: ${filePath}`);
            
            return { success: true, content: content };
            
        } catch (error) {
            return { success: false, content: `Error reading file: ${error.message}` };
        }
    }
    
    /**
     * 写入文件内容
     */
    writeFile(filePath, content) {
        try {
            const fullPath = path.resolve(this.workingDirectory, filePath);
            this.history.push(`WRITE: ${filePath}`);
            
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, content, 'utf-8');
            
            // 记录到短期记忆
            this.memory.addAssistantMessage(`写入文件: ${filePath}`);
            
            return { success: true, message: `Successfully wrote to ${filePath}` };
            
        } catch (error) {
            return { success: false, message: `Error writing file: ${error.message}` };
        }
    }
    
    // ==================== Memory功能 ====================
    
    /**
     * 记住用户信息
     */
    remember(key, value) {
        this.memory.longTerm.remember(key, value);
        return `✅ 已记住: ${key} = ${value}`;
    }
    
    /**
     * 回忆用户信息
     */
    recall(key) {
        const value = this.memory.longTerm.recall(key);
        if (value !== undefined) {
            return `📝 ${key} = ${value}`;
        }
        return `❓ 未找到关于 "${key}" 的记忆`;
    }
    
    /**
     * 忘记用户信息
     */
    forget(key) {
        delete this.memory.longTerm.memory.userPreferences[key];
        this.memory.longTerm.save();
        return `🗑️ 已忘记: ${key}`;
    }
    
    /**
     * 显示所有记忆
     */
    showMemory() {
        const prefs = this.memory.longTerm.memory.userPreferences;
        const knowledge = this.memory.longTerm.memory.learnedKnowledge;
        const recentMessages = this.memory.shortTerm.getRecentMessages(5);
        
        let output = '\n📊 Memory 状态\n';
        output += '═'.repeat(40) + '\n';
        
        // 用户偏好
        output += '\n👤 用户偏好:\n';
        if (Object.keys(prefs).length === 0) {
            output += '  (暂无)\n';
        } else {
            for (const [key, value] of Object.entries(prefs)) {
                output += `  ${key}: ${value}\n`;
            }
        }
        
        // 学到的知识
        output += '\n📚 学到的知识:\n';
        if (knowledge.length === 0) {
            output += '  (暂无)\n';
        } else {
            knowledge.forEach((item, i) => {
                output += `  ${i + 1}. ${item.topic}: ${item.knowledge.substring(0, 50)}...\n`;
            });
        }
        
        // 最近对话
        output += '\n💬 最近对话 (短期记忆):\n';
        if (recentMessages.length === 0) {
            output += '  (暂无)\n';
        } else {
            recentMessages.forEach((msg, i) => {
                const role = msg.role === 'user' ? '👤' : '🤖';
                output += `  ${role} ${msg.content.substring(0, 40)}...\n`;
            });
        }
        
        output += '═'.repeat(40) + '\n';
        
        return output;
    }
    
    /**
     * 从用户消息中自动学习
     */
    learnFromUserMessage(message) {
        // 添加到短期记忆
        this.memory.addUserMessage(message);
        
        // 尝试自动提取信息
        const extracted = this.extractUserInfo(message);
        
        return extracted;
    }
    
    /**
     * 提取用户信息
     */
    extractUserInfo(message) {
        const patterns = [
            { regex: /我叫([^\s，,。！!\n]+)(?:[，,。！!\n]|$)/i, key: 'name', desc: '名字' },
            { regex: /我是([^\s，,。！!\n]+)(?:[，,。！!\n]|$)/i, key: 'name', desc: '名字' },
            { regex: /我的名字是([^\s，,。！!\n]+)(?:[，,。！!\n]|$)/i, key: 'name', desc: '名字' },
            { regex: /我喜欢(.+?)(?:[。！!\n]|$)/i, key: 'preference', desc: '偏好' },
            { regex: /我想要(.+?)(?:[。！!\n]|$)/i, key: 'preference', desc: '偏好' },
            { regex: /我今年(\d+)岁/i, key: 'age', desc: '年龄' },
            { regex: /我住在([^\s，,。！!\n]+)(?:[，,。！!\n]|$)/i, key: 'location', desc: '地址' }
        ];
        
        const results = [];
        
        for (const pattern of patterns) {
            const match = message.match(pattern.regex);
            if (match) {
                this.memory.longTerm.remember(pattern.key, match[1].trim());
                results.push({ key: pattern.key, value: match[1].trim(), desc: pattern.desc });
            }
        }
        
        return results;
    }
    
    // ==================== 语言识别功能 ====================
    
    /**
     * 检测自然语言（中文/英文）
     */
    detectNaturalLanguage(text) {
        return this.languageDetector.detectNaturalLanguage(text);
    }
    
    /**
     * 检测编程语言（基于文件扩展名）
     */
    detectFileLanguage(filePath) {
        return this.languageDetector.detectFileLanguage(filePath);
    }
    
    // ==================== 其他功能 ====================
    
    getHistory() {
        return [...this.history];
    }
    
    clearHistory() {
        this.history = [];
    }
    
    async handleRequest(userRequest) {
        console.log(`\n收到请求：${userRequest}`);
        
        const plan = this.planMode.generatePlan(userRequest);
        this.planMode.displayPlan(plan);
        
        const userChoice = await this.getUserChoice();
        
        if (userChoice === '1') {
            await this.planMode.executePlan(plan);
        } else {
            console.log('❌ 已取消');
        }
    }
    
    async getUserChoice() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question('\n请选择 (1:执行, 2:修改, 3:取消): ', (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }
}

// ==================== 语言检测器 ====================

class LanguageDetector {
    constructor() {
        this.LANGUAGE_MAP = {
            '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
            '.ts': 'typescript', '.tsx': 'typescript',
            '.py': 'python', '.pyw': 'python',
            '.java': 'java', '.go': 'go', '.rs': 'rust',
            '.rb': 'ruby', '.php': 'php',
            '.c': 'c', '.cpp': 'cpp', '.h': 'c-header',
            '.cs': 'csharp', '.swift': 'swift', '.kt': 'kotlin',
            '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
            '.toml': 'toml', '.xml': 'xml',
            '.html': 'html', '.css': 'css', '.scss': 'scss',
            '.md': 'markdown', '.txt': 'plaintext',
            '.sh': 'bash', '.bash': 'bash', '.zsh': 'zsh',
            '.ps1': 'powershell', '.bat': 'batch', '.cmd': 'batch'
        };
    }
    
    detectFileLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.LANGUAGE_MAP[ext] || 'unknown';
    }
    
    detectNaturalLanguage(text) {
        const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
        const chineseChars = text.match(chineseRegex);
        const chineseCount = chineseChars ? chineseChars.length : 0;
        
        const cleanText = text.replace(/[\s\p{P}]/gu, '');
        const totalChars = cleanText.length;
        
        const chineseRatio = totalChars > 0 ? chineseCount / totalChars : 0;
        
        let lang, confidence;
        
        if (chineseRatio > 0.3) {
            lang = 'zh';
            confidence = Math.min(0.5 + chineseRatio, 1.0);
        } else {
            lang = 'en';
            confidence = 1.0 - chineseRatio;
        }
        
        return { lang, confidence: Math.round(confidence * 100) / 100 };
    }
    
    detectProgrammingLanguage(content) {
        if (/function\s+\w+/.test(content) || /=>\s*\{/.test(content)) return 'javascript';
        if (/def\s+\w+/.test(content) || /self\.\w+/.test(content)) return 'python';
        if (/interface\s+\w+/.test(content) || /:\s*(string|number)/.test(content)) return 'typescript';
        return 'unknown';
    }
}

// ==================== 主程序 ====================

async function main() {
    const agent = new MinimalCodingAgent();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askQuestion = (question) => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    };
    
    console.log('🤖 Minimal Coding Agent v2.0 (含Memory系统)');
    console.log('   输入 "help" 查看所有命令\n');
    
    while (true) {
        try {
            const userInput = await askQuestion('🤖 Agent> ');
            
            if (!userInput) continue;
            
            const parts = userInput.split(/\s+/);
            const command = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');
            
            // ====== 基础命令 ======
            
            if (command === 'quit' || command === 'exit') {
                console.log('👋 再见！');
                rl.close();
                break;
            }
            
            else if (command === 'exec') {
                if (!args) {
                    console.log('❌ 用法: exec <command>');
                    continue;
                }
                
                console.log(`\n⏳ 执行命令: ${args}`);
                const { success, output } = agent.executeCommand(args);
                
                if (success) {
                    console.log(`✅ 成功！\n${output}`);
                } else {
                    console.log(`❌ 失败：\n${output}`);
                }
            }
            
            else if (command === 'read') {
                if (!args) {
                    console.log('❌ 用法: read <file>');
                    continue;
                }
                
                console.log(`\n📖 读取文件: ${args}`);
                const { success, content } = agent.readFile(args);
                
                if (success) {
                    console.log(`✅ 文件内容：\n${content}`);
                } else {
                    console.log(`❌ ${content}`);
                }
            }
            
            else if (command === 'write') {
                if (!args) {
                    console.log('❌ 用法: write <file>');
                    continue;
                }
                
                console.log(`\n✏️ 写入文件: ${args}`);
                console.log('请输入内容（输入END结束）：');
                
                const lines = [];
                while (true) {
                    const line = await askQuestion('');
                    if (line.trim() === 'END') break;
                    lines.push(line);
                }
                
                const content = lines.join('\n');
                const { success, message } = agent.writeFile(args, content);
                
                if (success) {
                    console.log(`✅ ${message}`);
                } else {
                    console.log(`❌ ${message}`);
                }
            }
            
            else if (command === 'history') {
                const history = agent.getHistory();
                if (history.length > 0) {
                    console.log('\n📋 操作历史：');
                    history.forEach((record, i) => {
                        console.log(`  ${i + 1}. ${record}`);
                    });
                } else {
                    console.log('📋 暂无历史记录');
                }
            }
            
            else if (command === 'plan') {
                const userRequest = args || '请描述你的任务';
                await agent.handleRequest(userRequest);
            }
            
            // ====== Memory命令 ======
            
            else if (command === 'remember') {
                // 记住信息：remember key value
                if (!args) {
                    console.log('❌ 用法: remember <key> <value>');
                    console.log('   示例: remember name 张三');
                    continue;
                }
                
                const spaceIndex = args.indexOf(' ');
                if (spaceIndex === -1) {
                    console.log('❌ 用法: remember <key> <value>');
                    continue;
                }
                
                const key = args.substring(0, spaceIndex);
                const value = args.substring(spaceIndex + 1);
                
                console.log(agent.remember(key, value));
            }
            
            else if (command === 'recall') {
                // 回忆信息：recall key
                if (!args) {
                    console.log('❌ 用法: recall <key>');
                    console.log('   示例: recall name');
                    continue;
                }
                
                console.log(agent.recall(args));
            }
            
            else if (command === 'forget') {
                // 忘记信息：forget key
                if (!args) {
                    console.log('❌ 用法: forget <key>');
                    continue;
                }
                
                console.log(agent.forget(args));
            }
            
            else if (command === 'memory' || command === 'mem') {
                // 显示所有记忆
                console.log(agent.showMemory());
            }
            
            // ====== 语言识别命令 ======
            
            else if (command === 'lang') {
                // 检测语言：lang <text> 或 lang --file <filepath>
                if (!args) {
                    console.log('❌ 用法:');
                    console.log('   lang <text>        - 检测自然语言');
                    console.log('   lang --file <file> - 检测文件编程语言');
                    continue;
                }
                
                if (args.startsWith('--file ')) {
                    const filePath = args.substring(7);
                    const lang = agent.detectFileLanguage(filePath);
                    console.log(`📄 文件 "${filePath}" 的编程语言: ${lang}`);
                } else {
                    const result = agent.detectNaturalLanguage(args);
                    const langName = result.lang === 'zh' ? '中文' : '英文';
                    console.log(`🗣️ 语言: ${langName} (置信度: ${result.confidence})`);
                }
            }
            
            else if (command === 'chat') {
                // 智能对话：自动学习用户信息
                if (!args) {
                    console.log('❌ 用法: chat <消息>');
                    console.log('   Agent会自动记住你提到的信息');
                    continue;
                }
                
                // 自动学习用户信息
                const extracted = agent.learnFromUserMessage(args);
                
                // 回应用户
                let response = '';
                
                if (extracted.length > 0) {
                    response += '✅ 我记住了：\n';
                    extracted.forEach(item => {
                        response += `   ${item.desc}: ${item.value}\n`;
                    });
                    response += '\n';
                }
                
                // 检测语言并用对应语言回复
                const langResult = agent.detectNaturalLanguage(args);
                
                if (langResult.lang === 'zh') {
                    response += `💬 收到你的消息（中文）：${args}`;
                } else {
                    response += `💬 Got your message (English): ${args}`;
                }
                
                console.log(response);
            }
            
            // ====== 帮助 ======
            
            else if (command === 'help') {
                console.log('\n📋 可用命令：');
                console.log('');
                console.log('【基础命令】');
                console.log('  exec <command>     - 执行shell命令');
                console.log('  read <file>        - 读取文件');
                console.log('  write <file>       - 写入文件');
                console.log('  plan <request>     - 使用Plan Mode执行任务');
                console.log('  history            - 查看操作历史');
                console.log('');
                console.log('【Memory命令】');
                console.log('  remember <k> <v>   - 记住信息');
                console.log('  recall <key>       - 回忆信息');
                console.log('  forget <key>       - 忘记信息');
                console.log('  memory             - 查看所有记忆');
                console.log('  chat <message>     - 智能对话（自动学习）');
                console.log('');
                console.log('【语言识别】');
                console.log('  lang <text>        - 检测自然语言');
                console.log('  lang --file <file> - 检测编程语言');
                console.log('');
                console.log('【其他】');
                console.log('  help               - 显示帮助');
                console.log('  quit               - 退出');
                console.log('');
                console.log('💡 使用示例：');
                console.log('  remember name 张三        - 记住你的名字');
                console.log('  recall name               - 回忆你的名字');
                console.log('  chat 我叫张三，我喜欢Python - 自动学习信息');
                console.log('  lang 你好世界              - 检测语言');
                console.log('  lang --file agent.js      - 检测文件语言');
            }
            
            else {
                console.log(`❌ 未知命令: ${command}`);
                console.log('输入 "help" 查看所有命令');
            }
            
        } catch (error) {
            if (error.message.includes('readline was closed')) {
                console.log('\n\n👋 再见！');
                break;
            }
            console.log(`❌ 错误: ${error.message}`);
        }
    }
}

module.exports = { MinimalCodingAgent, LanguageDetector };

if (require.main === module) {
    main().catch(console.error);
}

