/**
 * Plan Mode 增强版测试脚本
 * 
 * 运行这个脚本来测试增强版的 Plan Mode 功能
 */

const Agent = require('../agent');
const PlanModeEnhanced = require('../plan_mode_enhanced');

async function testEnhancedPlanMode() {
    console.log('='.repeat(60));
    console.log('🧪 Plan Mode 增强版测试');
    console.log('='.repeat(60));
    
    const agent = new Agent();
    const planMode = new PlanModeEnhanced(agent);
    
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
        const plan = planMode.generatePlan(testCase);
        console.log('计划：' + plan.steps.length + ' 个步骤');
        plan.steps.forEach((step, index) => {
            console.log('  ' + (index + 1) + '. ' + step.action);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('测试2：显示计划界面');
    console.log('-'.repeat(40));
    
    const plan = planMode.generatePlan('帮我读取 README.md 文件');
    planMode.displayPlan(plan);
    
    console.log('\n' + '='.repeat(60));
    console.log('测试3：修改计划功能');
    console.log('-'.repeat(40));
    
    console.log('修改功能需要交互式输入，运行以下命令测试：');
    console.log('cd minimal_agent');
    console.log('node -e "');
    console.log('const Agent = require(\'./agent\');');
    console.log('const PlanMode = require(\'./plan_mode_enhanced\');');
    console.log('const agent = new Agent();');
    console.log('const planMode = new PlanMode(agent);');
    console.log('planMode.run(\'帮我重构这个代码\');');
    console.log('"');
    
    console.log('\n' + '='.repeat(60));
    console.log('测试4：进度显示');
    console.log('-'.repeat(40));
    
    console.log('模拟进度显示：');
    for (let i = 1; i <= 5; i++) {
        planMode.displayProgress(i, 5, '步骤 ' + i);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    console.log('\n下一步：运行交互式测试体验完整的修改功能');
}

// 运行测试
testEnhancedPlanMode().catch(console.error);

