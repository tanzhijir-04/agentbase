#!/usr/bin/env node

/**
 * Minimal Coding Agent - 第一节课 + Plan Mode
 * 根据教程要求：实现最小的coding agent，包含terminal执行和文件IO读写
 * 新增：Plan Mode 功能，让 Agent 先制定计划，再执行任务
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const PlanMode = require('./plan_mode');

class MinimalCodingAgent {
    /**
     * 最小的Coding Agent实现
     * 包含三个核心功能：
     * 1. 执行terminal命令
     * 2. 读写文件
     * 3. Plan Mode：先制定计划，再执行任务
     */
    
    constructor(workingDirectory = '.') {
        this.workingDirectory = path.resolve(workingDirectory);
        this.history = []; // 记录操作历史
        this.planMode = new PlanMode(this);  // 新增：Plan Mode 实例
    }
    
    /**
     * 核心功能1：执行terminal命令并返回输出
     * @param {string} command - 要执行的shell命令
     * @returns {Object} {success: boolean, output: string}
     */
    executeCommand(command) {
        try {
            // 记录到历史
            this.history.push(`EXECUTE: ${command}`);
            
            // 执行命令
            const output = execSync(command, {
                cwd: this.workingDirectory,
                encoding: 'utf-8',
                timeout: 30000, // 30秒超时
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            return { success: true, output: output };
            
        } catch (error) {
            return { 
                success: false, 
                output: `Error (code ${error.status}):\n${error.stderr || error.message}` 
            };
        }
    }
    
    /**
     * 核心功能2：读取文件内容
     * @param {string} filePath - 文件路径（相对于workingDirectory）
     * @returns {Object} {success: boolean, content: string}
     */
    readFile(filePath) {
        try {
            // 构建完整路径
            const fullPath = path.resolve(this.workingDirectory, filePath);
            
            // 记录到历史
            this.history.push(`READ: ${filePath}`);
            
            // 检查文件是否存在
            if (!fs.existsSync(fullPath)) {
                return { success: false, content: `Error: File not found: ${filePath}` };
            }
            
            // 读取文件
            const content = fs.readFileSync(fullPath, 'utf-8');
            
            return { success: true, content: content };
            
        } catch (error) {
            return { success: false, content: `Error reading file: ${error.message}` };
        }
    }
    
    /**
     * 核心功能2：写入文件内容
     * @param {string} filePath - 文件路径（相对于workingDirectory）
     * @param {string} content - 要写入的内容
     * @returns {Object} {success: boolean, message: string}
     */
    writeFile(filePath, content) {
        try {
            // 构建完整路径
            const fullPath = path.resolve(this.workingDirectory, filePath);
            
            // 记录到历史
            this.history.push(`WRITE: ${filePath}`);
            
            // 确保目录存在
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // 写入文件
            fs.writeFileSync(fullPath, content, 'utf-8');
            
            return { success: true, message: `Successfully wrote to ${filePath}` };
            
        } catch (error) {
            return { success: false, message: `Error writing file: ${error.message}` };
        }
    }
    
    /**
     * 获取操作历史
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * 清空历史记录
     */
    clearHistory() {
        this.history = [];
    }
    
    /**
     * 处理用户请求（带 Plan Mode）
     * @param {string} userRequest - 用户请求
     */
    async handleRequest(userRequest) {
        console.log(`\n收到请求：${userRequest}`);
        
        // 1. 生成计划
        const plan = this.planMode.generatePlan(userRequest);
        
        // 2. 显示计划
        this.planMode.displayPlan(plan);
        
        // 3. 等待用户确认
        const userChoice = await this.getUserChoice();
        
        if (userChoice === '1') {
            // 4. 执行计划
            await this.planMode.executePlan(plan);
        } else if (userChoice === '2') {
            console.log('✏️ 请描述需要修改的内容...');
            // 这里可以添加修改计划的逻辑
        } else {
            console.log('❌ 计划已取消');
        }
    }
    
    /**
     * 获取用户输入
     * @returns {Promise<string>} 用户选择
     */
    getUserChoice() {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('请选择 (1/2/3): ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}

/**
 * 交互式主循环
 * 这是Agent的核心：理解用户意图 -> 执行操作 -> 返回结果
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🤖 Minimal Coding Agent - 第一节课 + Plan Mode');
    console.log('='.repeat(60));
    console.log('这是一个最小的coding agent，包含三个核心功能：');
    console.log('1. 执行terminal命令');
    console.log('2. 读写文件');
    console.log('3. Plan Mode：先制定计划，再执行任务');
    console.log('');
    console.log('命令格式：');
    console.log('  exec <command>     - 执行shell命令');
    console.log('  read <file>        - 读取文件');
    console.log('  write <file>       - 写入文件（然后输入内容，以END结束）');
    console.log('  plan <request>     - 使用Plan Mode执行任务');
    console.log('  history            - 查看操作历史');
    console.log('  help               - 显示帮助');
    console.log('  quit               - 退出');
    console.log('');
    console.log('💡 Plan Mode使用示例：');
    console.log('  plan 帮我读取 README.md 文件');
    console.log('  plan 帮我重构这个代码');
    console.log('  plan 创建一个新的测试文件');
    console.log('='.repeat(60));
    
    const agent = new MinimalCodingAgent();
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askQuestion = (question) => {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    };
    
    while (true) {
        try {
            // 获取用户输入
            const userInput = (await askQuestion('\n🤖 Agent> ')).trim();
            
            if (!userInput) {
                continue;
            }
            
            // 解析命令
            const parts = userInput.split(/\s+/);
            const command = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');
            
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
                    if (line.trim() === 'END') {
                        break;
                    }
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
                    history.forEach((record, index) => {
                        console.log(`  ${index + 1}. ${record}`);
                    });
                } else {
                    console.log('📋 暂无历史记录');
                }
            }
            
            else if (command === 'plan') {
                // Plan Mode 命令
                const userRequest = args || '请描述你的任务';
                await agent.handleRequest(userRequest);
            }
            
            else if (command === 'help') {
                // 帮助命令
                console.log('\n📋 可用命令：');
                console.log('  exec <command>     - 执行shell命令');
                console.log('  read <file>        - 读取文件');
                console.log('  write <file>       - 写入文件');
                console.log('  plan <request>     - 使用Plan Mode执行任务');
                console.log('  history            - 查看操作历史');
                console.log('  help               - 显示帮助');
                console.log('  quit               - 退出');
                console.log('\n💡 Plan Mode使用示例：');
                console.log('  plan 帮我读取 README.md 文件');
                console.log('  plan 帮我重构这个代码');
                console.log('  plan 创建一个新的测试文件');
            }
            
            else {
                console.log(`❌ 未知命令: ${command}`);
                console.log('可用命令: exec, read, write, plan, history, help, quit');
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

// 导出类供其他模块使用
module.exports = MinimalCodingAgent;

// 运行主程序
if (require.main === module) {
    main().catch(console.error);
}
