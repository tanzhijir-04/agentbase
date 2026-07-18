/**
 * Plan Mode 增强版 - 添加计划修改功能
 * 
 * 学习目标：
 * 1. 理解用户交互的设计模式
 * 2. 学习如何处理用户输入
 * 3. 理解数据结构的修改
 * 4. 学习异步编程和 Promise
 */

const readline = require('readline');

class PlanModeEnhanced {
    constructor(agent) {
        this.agent = agent;
        this.currentPlan = null;
        
        // 创建 readline 接口用于用户输入
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    /**
     * 生成执行计划
     * 
     * 原理：根据用户请求分析任务类型，生成相应的步骤
     * 
     * @param {string} userRequest - 用户请求
     * @returns {Object} 计划对象
     */
    generatePlan(userRequest) {
        console.log('\n📝 正在分析你的请求...');
        
        // 分析请求，生成计划
        const plan = {
            id: 'plan_' + Date.now(),
            description: userRequest,
            steps: this.analyzeAndCreateSteps(userRequest),
            status: 'draft',
            createdAt: new Date()
        };
        
        this.currentPlan = plan;
        return plan;
    }
    
    /**
     * 根据请求类型生成步骤
     * 
     * 原理：使用关键词匹配识别任务类型，生成相应的步骤
     * 这是一个简单的规则引擎，实际项目中可以用 AI 来生成
     * 
     * @param {string} userRequest - 用户请求
     * @returns {Array} 步骤数组
     */
    analyzeAndCreateSteps(userRequest) {
        const steps = [];
        const request = userRequest.toLowerCase();
        
        // 分析请求类型，生成相应步骤
        if (request.includes('读取') || request.includes('read') || request.includes('查看')) {
            // 读取文件任务
            const fileName = this.extractFileName(userRequest);
            steps.push({
                id: 1,
                action: `读取文件 ${fileName || '目标文件'}`,
                estimatedTime: '1秒',
                type: 'read_file',
                command: `read ${fileName || 'target.txt'}`
            });
            
        } else if (request.includes('写入') || request.includes('write') || request.includes('创建') || request.includes('添加')) {
            // 写入文件任务
            const fileName = this.extractFileName(userRequest);
            steps.push(
                {
                    id: 1,
                    action: '分析写入需求',
                    estimatedTime: '2秒',
                    type: 'analyze'
                },
                {
                    id: 2,
                    action: `写入文件 ${fileName || '目标文件'}`,
                    estimatedTime: '1秒',
                    type: 'write_file',
                    command: `write ${fileName || 'target.txt'}`
                }
            );
            
        } else if (request.includes('执行') || request.includes('exec') || request.includes('运行')) {
            // 执行命令任务
            const command = this.extractCommand(userRequest);
            steps.push(
                {
                    id: 1,
                    action: '分析命令需求',
                    estimatedTime: '1秒',
                    type: 'analyze'
                },
                {
                    id: 2,
                    action: `执行命令: ${command || '目标命令'}`,
                    estimatedTime: '3秒',
                    type: 'execute',
                    command: `exec ${command || 'dir'}`
                }
            );
            
        } else if (request.includes('重构') || request.includes('refactor')) {
            // 重构任务
            steps.push(
                {
                    id: 1,
                    action: '分析现有代码结构',
                    estimatedTime: '5分钟',
                    type: 'analyze'
                },
                {
                    id: 2,
                    action: '设计重构方案',
                    estimatedTime: '8分钟',
                    type: 'design'
                },
                {
                    id: 3,
                    action: '实施重构',
                    estimatedTime: '15分钟',
                    type: 'implement'
                },
                {
                    id: 4,
                    action: '测试验证',
                    estimatedTime: '5分钟',
                    type: 'test'
                }
            );
            
        } else {
            // 默认：简单任务
            steps.push({
                id: 1,
                action: `执行任务: ${userRequest}`,
                estimatedTime: '3秒',
                type: 'general'
            });
        }
        
        return steps;
    }
    
    /**
     * 从用户请求中提取文件名
     * 
     * 原理：简单的字符串解析，查找可能的文件名
     * 
     * @param {string} userRequest - 用户请求
     * @returns {string|null} 文件名
     */
    extractFileName(userRequest) {
        // 简单的文件名提取逻辑
        const words = userRequest.split(/\s+/);
        for (const word of words) {
            if (word.includes('.') && !word.startsWith('.')) {
                return word;
            }
        }
        return null;
    }
    
    /**
     * 从用户请求中提取命令
     * 
     * 原理：查找常见的命令关键词
     * 
     * @param {string} userRequest - 用户请求
     * @returns {string|null} 命令
     */
    extractCommand(userRequest) {
        // 简单的命令提取逻辑
        const words = userRequest.split(/\s+/);
        for (const word of words) {
            if (['ls', 'dir', 'pwd', 'cd', 'cat', 'echo', 'mkdir', 'rm'].includes(word.toLowerCase())) {
                return word;
            }
        }
        return null;
    }
    
    /**
     * 显示计划给用户
     * 
     * 原理：格式化输出，让用户清楚地看到计划内容
     * 
     * @param {Object} plan - 计划对象
     */
    displayPlan(plan) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 执行计划');
        console.log('='.repeat(60));
        console.log(`任务：${plan.description}`);
        console.log(`预估步骤：${plan.steps.length} 步`);
        console.log('-'.repeat(60));
        
        // 显示每个步骤
        plan.steps.forEach((step, index) => {
            console.log(`\n${index + 1}. ${step.action}`);
            console.log(`   ⏱️ 预估时间：${step.estimatedTime}`);
            console.log(`   📝 类型：${step.type}`);
            
            // 显示步骤状态
            if (step.status === 'completed') {
                console.log(`   ✅ 状态：已完成`);
            } else if (step.status === 'failed') {
                console.log(`   ❌ 状态：失败`);
            } else {
                console.log(`   ⏳ 状态：待执行`);
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('❓ 是否批准这个计划？');
        console.log('[1] 批准执行');
        console.log('[2] 修改计划');
        console.log('[3] 取消');
        console.log('='.repeat(60));
    }
    
    /**
     * 获取用户输入
     * 
     * 原理：使用 Promise 封装 readline，使其可以 await
     * 这是异步编程的常见模式
     * 
     * @param {string} question - 问题
     * @returns {Promise<string>} 用户输入
     */
    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
    
    /**
     * 修改计划
     * 
     * 原理：
     * 1. 显示当前计划的所有步骤
     * 2. 让用户选择要修改的步骤
     * 3. 获取新的步骤描述
     * 4. 更新计划
     * 5. 询问是否继续修改
     * 
     * @param {Object} plan - 计划对象
     * @returns {Promise<Object>} 修改后的计划
     */
    async modifyPlan(plan) {
        console.log('\n✏️ 修改计划模式');
        console.log('='.repeat(60));
        
        // 显示当前步骤
        console.log('当前步骤：');
        plan.steps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step.action}`);
        });
        
        console.log('-'.repeat(60));
        
        // 获取用户选择
        const stepIndex = await this.askQuestion('要修改哪个步骤？(输入编号，或输入 "done" 完成修改): ');
        
        // 检查是否完成修改
        if (stepIndex.toLowerCase() === 'done' || stepIndex === '') {
            console.log('✅ 修改完成');
            return plan;
        }
        
        // 验证输入
        const index = parseInt(stepIndex) - 1;
        if (isNaN(index) || index < 0 || index >= plan.steps.length) {
            console.log('❌ 无效的步骤编号');
            return this.modifyPlan(plan);
        }
        
        // 获取要修改的步骤
        const step = plan.steps[index];
        console.log(`\n当前步骤 ${index + 1}: ${step.action}`);
        
        // 获取新的描述
        const newAction = await this.askQuestion('输入新的描述 (或输入 "cancel" 取消): ');
        
        // 检查是否取消
        if (newAction.toLowerCase() === 'cancel') {
            console.log('✏️ 已取消修改');
            return this.modifyPlan(plan);
        }
        
        // 更新步骤
        if (newAction) {
            step.action = newAction;
            console.log(`✅ 步骤 ${index + 1} 已更新为: ${newAction}`);
        }
        
        // 重新显示计划
        this.displayPlan(plan);
        
        // 询问是否继续修改
        const continueModifying = await this.askQuestion('继续修改其他步骤？(y/n): ');
        
        if (continueModifying.toLowerCase() === 'y') {
            return this.modifyPlan(plan);
        }
        
        return plan;
    }
    
    /**
     * 执行计划
     * 
     * 原理：
     * 1. 按顺序执行每个步骤
     * 2. 根据步骤类型调用相应的执行方法
     * 3. 处理执行结果和错误
     * 4. 更新步骤状态
     * 
     * @param {Object} plan - 计划对象
     */
    async executePlan(plan) {
        console.log('\n🚀 开始执行计划...\n');
        plan.status = 'executing';
        
        // 记录开始时间
        const startTime = Date.now();
        
        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            
            // 显示进度
            this.displayProgress(i + 1, plan.steps.length, step.action);
            
            try {
                let result;
                
                // 根据步骤类型执行相应操作
                switch (step.type) {
                    case 'read_file':
                        result = this.agent.readFile(step.command.split(' ')[1]);
                        if (result.success) {
                            console.log(`✅ 读取成功：\n${result.content.substring(0, 100)}...`);
                        } else {
                            console.log(`❌ 读取失败：${result.content}`);
                        }
                        break;
                        
                    case 'write_file':
                        console.log('📝 请输入要写入的内容（输入END结束）：');
                        // 这里简化处理，实际应该让用户输入内容
                        const content = '示例内容';
                        result = this.agent.writeFile(step.command.split(' ')[1], content);
                        console.log(`✅ 写入完成：${result.message}`);
                        break;
                        
                    case 'execute':
                        result = this.agent.executeCommand(step.command.split(' ')[1]);
                        if (result.success) {
                            console.log(`✅ 执行成功：\n${result.output}`);
                        } else {
                            console.log(`❌ 执行失败：${result.output}`);
                        }
                        break;
                        
                    default:
                        console.log(`⏳ 模拟执行: ${step.action}`);
                        // 模拟执行
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        console.log('✅ 完成');
                        break;
                }
                
                // 更新步骤状态
                step.status = 'completed';
                
            } catch (error) {
                console.log(`❌ 步骤 ${i + 1} 失败: ${error.message}`);
                step.status = 'failed';
                
                // 询问用户是否继续
                const continueExecution = await this.askQuestion('是否继续执行后续步骤？(y/n): ');
                if (continueExecution.toLowerCase() !== 'y') {
                    console.log('🛑 计划执行已停止');
                    plan.status = 'failed';
                    return;
                }
            }
        }
        
        // 计算总耗时
        const endTime = Date.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(1);
        
        plan.status = 'completed';
        console.log('\n🎉 计划执行完成！');
        console.log(`⏱️ 总耗时: ${totalTime}秒`);
    }
    
    /**
     * 显示进度
     * 
     * 原理：计算进度百分比，显示进度条
     * 
     * @param {number} currentStep - 当前步骤
     * @param {number} totalSteps - 总步骤数
     * @param {string} stepAction - 步骤描述
     */
    displayProgress(currentStep, totalSteps, stepAction) {
        const progress = Math.round((currentStep / totalSteps) * 100);
        const progressBarLength = 20;
        const filledLength = Math.round((progress / 100) * progressBarLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(progressBarLength - filledLength);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`执行进度: ${progressBar} ${progress}%`);
        console.log(`当前步骤: ${currentStep}/${totalSteps} - ${stepAction}`);
        console.log('='.repeat(60));
    }
    
    /**
     * 主交互流程
     * 
     * 原理：
     * 1. 生成计划
     * 2. 显示计划
     * 3. 获取用户选择
     * 4. 根据选择执行相应操作
     * 
     * @param {string} userRequest - 用户请求
     */
    async run(userRequest) {
        // 1. 生成计划
        const plan = this.generatePlan(userRequest);
        
        // 2. 显示计划
        this.displayPlan(plan);
        
        // 3. 获取用户选择
        const choice = await this.askQuestion('请选择 (1/2/3): ');
        
        // 4. 根据选择执行相应操作
        switch (choice) {
            case '1':
                // 批准执行
                await this.executePlan(plan);
                break;
                
            case '2':
                // 修改计划
                const modifiedPlan = await this.modifyPlan(plan);
                // 询问是否执行修改后的计划
                const executeAfterModify = await this.askQuestion('是否执行修改后的计划？(y/n): ');
                if (executeAfterModify.toLowerCase() === 'y') {
                    await this.executePlan(modifiedPlan);
                }
                break;
                
            case '3':
                // 取消
                console.log('❌ 计划已取消');
                break;
                
            default:
                console.log('❌ 无效的选择');
                break;
        }
        
        // 关闭 readline
        this.rl.close();
    }
}

module.exports = PlanModeEnhanced;
