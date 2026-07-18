/**
 * Plan Mode 实现
 * 让 Agent 先制定计划，再执行任务
 */

class PlanMode {
    constructor(agent) {
        this.agent = agent;
        this.currentPlan = null;
    }
    
    /**
     * 生成执行计划
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
     * @param {Object} plan - 计划对象
     */
    displayPlan(plan) {
        console.log('\n' + '='.repeat(50));
        console.log('📋 执行计划');
        console.log('='.repeat(50));
        console.log(`任务：${plan.description}`);
        console.log(`预估步骤：${plan.steps.length} 步`);
        console.log('-'.repeat(50));
        
        plan.steps.forEach((step, index) => {
            console.log(`\n${index + 1}. ${step.action}`);
            console.log(`   ⏱️ 预估时间：${step.estimatedTime}`);
            console.log(`   📝 类型：${step.type}`);
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('❓ 是否批准这个计划？');
        console.log('[1] 批准执行');
        console.log('[2] 修改计划');
        console.log('[3] 取消');
        console.log('='.repeat(50));
    }
    
    /**
     * 执行计划
     * @param {Object} plan - 计划对象
     */
    async executePlan(plan) {
        console.log('\n🚀 开始执行计划...\n');
        plan.status = 'executing';
        
        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            console.log(`\n🔄 执行步骤 ${i + 1}/${plan.steps.length}: ${step.action}`);
            
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
                
                // 简单的错误处理：询问用户是否继续
                console.log('是否继续执行后续步骤？(y/n)');
                // 这里简化处理，实际应该等待用户输入
            }
        }
        
        plan.status = 'completed';
        console.log('\n🎉 计划执行完成！');
    }
}

module.exports = PlanMode;