/**
 * Plan Mode 测试脚本
 * 运行这个脚本来测试 Plan Mode 功能
 */

const Agent = require('../agent');

async function testPlanMode() {
    console.log('='.repeat(60));
    console.log('🧪 Plan Mode 测试脚本');
    console.log('='.repeat(60));
    
    const agent = new Agent();
    
    console.log('\n测试1：生成计划');
    console.log('-'.repeat(40));
    
    const testCases = [
        '帮我读取 README.md 文件',
        '创建一个新的测试文件',
        '帮我重构这个代码',
        '执行 ls 命令'
    ];
    
    for (const testCase of testCases) {
        console.log('\n请求：' + testCase);
        const plan = agent.planMode.generatePlan(testCase);
        console.log('计划：' + plan.steps.length + ' 个步骤');
        plan.steps.forEach((step, index) => {
            console.log('  ' + (index + 1) + '. ' + step.action);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('测试2：显示计划界面');
    console.log('-'.repeat(40));
    
    const plan = agent.planMode.generatePlan('帮我读取 README.md 文件');
    agent.planMode.displayPlan(plan);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    console.log('\n下一步：运行 node agent.js 来体验完整的 Plan Mode');
}

// 运行测试
testPlanMode().catch(console.error);

