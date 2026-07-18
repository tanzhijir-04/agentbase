/**
 * Multi-agent Demo - Multi-agent系统演示
 * 
 * 演示多个Agent协作完成复杂任务的过程
 */

const { MultiAgentSystem, Coordinator, Worker } = require('../multi_agent_collaboration');

function runDemo() {
  console.log('=== Multi-agent System Demo ===\n');
  console.log('这个演示展示了多个Agent如何协作完成复杂任务。\n');
  
  // 创建系统
  const system = new MultiAgentSystem();
  
  // 创建Agent
  const coordinator = new Coordinator();
  const worker1 = new Worker('coder1', ['coding', 'debugging']);
  const worker2 = new Worker('designer1', ['design', 'ui']);
  const worker3 = new Worker('tester1', ['testing', 'quality']);
  
  // 注册Agent
  system.registerAgent(coordinator);
  system.registerAgent(worker1);
  system.registerAgent(worker2);
  system.registerAgent(worker3);
  
  console.log('=== System Setup ===');
  console.log(`Registered ${system.agents.size} agents:`);
  system.agents.forEach((agent, id) => {
    console.log(`  - ${id}: ${agent.role} (${agent.skills.join(', ')})`);
  });
  console.log('');
  
  // 显示初始状态
  console.log('=== Initial Status ===');
  coordinator.monitorSystem();
  
  // 创建项目任务
  console.log('=== Creating Project Tasks ===');
  console.log('Project: Build a simple web application\n');
  
  const tasks = [
    {
      id: 'design_ui',
      name: 'Design user interface',
      requiredSkills: ['design']
    },
    {
      id: 'implement_backend',
      name: 'Implement backend API',
      requiredSkills: ['coding']
    },
    {
      id: 'implement_frontend',
      name: 'Implement frontend',
      requiredSkills: ['coding', 'design']
    },
    {
      id: 'write_tests',
      name: 'Write integration tests',
      requiredSkills: ['testing']
    },
    {
      id: 'debug_issues',
      name: 'Debug and fix issues',
      requiredSkills: ['debugging']
    }
  ];
  
  // 创建任务
  tasks.forEach(task => {
    system.createTask(task);
  });
  
  console.log(`\nCreated ${tasks.length} tasks`);
  
  // 显示任务分配过程
  console.log('\n=== Task Assignment Process ===');
  
  // 模拟任务执行
  setTimeout(() => {
    console.log('\n=== Task Execution Status ===');
    system.getSystemStatus();
    
    // 显示每个Agent的状态
    console.log('\n=== Agent Status ===');
    Array.from(system.agents.values()).forEach(agent => {
      const status = agent.getStatus();
      console.log(`${status.id}: ${status.isBusy ? 'Busy' : 'Idle'}`);
      if (status.currentTask) {
        console.log(`  Current task: ${status.currentTask.name || 'Unknown'}`);
      }
    });
    
    // 等待任务完成
    setTimeout(() => {
      console.log('\n=== Final Status ===');
      coordinator.monitorSystem();
      
      console.log('\n=== Demo Complete ===');
      console.log('Multi-agent系统成功协作完成了所有任务！');
      console.log('\nKey features demonstrated:');
      console.log('1. Agent registration and management');
      console.log('2. Task creation and assignment');
      console.log('3. Skill-based agent selection');
      console.log('4. Task queue management');
      console.log('5. System monitoring');
      
    }, 3000);
    
  }, 1000);
}

// 运行演示
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo };
