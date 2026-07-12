/**
 * Multi-agent System Tests
 * 
 * 测试Multi-agent系统的各个组件
 */

const assert = require('assert');
const { Agent, CoordinatorAgent, WorkerAgent } = require('../multi_agent_system');
const MessageQueue = require('../message_queue');
const TaskScheduler = require('../task_scheduler');
const { MultiAgentSystem, Coordinator, Worker } = require('../multi_agent_collaboration');

// 测试Agent类
function testAgent() {
  console.log('Testing Agent class...');
  
  const agent = new Agent('test-agent', 'worker', ['coding', 'testing']);
  
  // 测试基本属性
  assert.strictEqual(agent.id, 'test-agent');
  assert.strictEqual(agent.role, 'worker');
  assert.deepStrictEqual(agent.capabilities, ['coding', 'testing']);
  assert.strictEqual(agent.isBusy, false);
  
  // 测试状态获取
  const status = agent.getStatus();
  assert.strictEqual(status.id, 'test-agent');
  assert.strictEqual(status.role, 'worker');
  assert.strictEqual(status.isBusy, false);
  
  console.log('✓ Agent class tests passed');
}

// 测试CoordinatorAgent类
function testCoordinatorAgent() {
  console.log('Testing CoordinatorAgent class...');
  
  const coordinator = new CoordinatorAgent();
  const worker1 = new Agent('worker1', 'worker', ['coding']);
  const worker2 = new Agent('worker2', 'worker', ['design']);
  
  // 添加工作者
  coordinator.addWorker(worker1);
  coordinator.addWorker(worker2);
  
  // 测试分配任务
  const taskAssigned = coordinator.assignTask({
    id: 'task1',
    content: 'Test task',
    requiredSkills: ['coding']
  });
  
  assert.strictEqual(taskAssigned, true);
  
  // 测试系统监控
  coordinator.monitorSystem();
  
  console.log('✓ CoordinatorAgent class tests passed');
}

// 测试WorkerAgent类
function testWorkerAgent() {
  console.log('Testing WorkerAgent class...');
  
  const worker = new WorkerAgent('test-worker', ['coding', 'design']);
  
  // 测试技能检查
  const canCode = worker.canExecuteTask({
    requiredSkills: ['coding']
  });
  assert.strictEqual(canCode, true);
  
  const canTest = worker.canExecuteTask({
    requiredSkills: ['testing']
  });
  assert.strictEqual(canTest, false);
  
  console.log('✓ WorkerAgent class tests passed');
}

// 测试MessageQueue类
function testMessageQueue() {
  console.log('Testing MessageQueue class...');
  
  const mq = new MessageQueue();
  
  // 创建队列
  mq.createQueue('agent1');
  mq.createQueue('agent2');
  
  // 发送消息
  const messageId = mq.send({
    type: 'task',
    content: 'Test message'
  }, 'agent1');
  
  assert.ok(messageId);
  
  // 接收消息
  const message = mq.receive('agent1');
  assert.ok(message);
  assert.strictEqual(message.type, 'task');
  assert.strictEqual(message.content, 'Test message');
  
  // 测试队列大小
  const queueSize = mq.getQueueSize('agent1');
  assert.strictEqual(queueSize, 0);
  
  // 测试订阅
  mq.subscribe('agent1', 'test_topic');
  mq.subscribe('agent2', 'test_topic');
  
  const broadcastCount = mq.broadcast({
    type: 'broadcast',
    content: 'Broadcast message'
  }, 'test_topic');
  
  assert.strictEqual(broadcastCount, 2);
  
  console.log('✓ MessageQueue class tests passed');
}

// 测试TaskScheduler类
function testTaskScheduler() {
  console.log('Testing TaskScheduler class...');
  
  const scheduler = new TaskScheduler();
  
  // 添加任务
  scheduler.addTask({
    id: 'task1',
    name: 'Task 1',
    requiredSkills: ['coding'],
    dependencies: []
  });
  
  scheduler.addTask({
    id: 'task2',
    name: 'Task 2',
    requiredSkills: ['design'],
    dependencies: ['task1']
  });
  
  // 添加Agent
  scheduler.addAgent({
    id: 'agent1',
    isBusy: false,
    capabilities: ['coding']
  });
  
  scheduler.addAgent({
    id: 'agent2',
    isBusy: false,
    capabilities: ['design']
  });
  
  // 测试依赖检查
  const depsMet = scheduler.dependenciesMet('task1');
  assert.strictEqual(depsMet, true);
  
  const depsNotMet = scheduler.dependenciesMet('task2');
  assert.strictEqual(depsNotMet, false);
  
  // 测试可执行任务
  const executableTasks = scheduler.getExecutableTasks();
  assert.strictEqual(executableTasks.length, 1);
  
  // 测试调度
  scheduler.schedule();
  
  // 测试系统状态
  const status = scheduler.getSystemStatus();
  assert.strictEqual(status.totalTasks, 2);
  assert.strictEqual(status.pendingTasks, 1);
  
  console.log('✓ TaskScheduler class tests passed');
}

// 测试MultiAgentSystem类
function testMultiAgentSystem() {
  console.log('Testing MultiAgentSystem class...');
  
  const system = new MultiAgentSystem();
  
  // 创建Agent
  const coordinator = new Coordinator();
  const worker = new Worker('worker1', ['coding']);
  
  // 注册Agent
  system.registerAgent(coordinator);
  system.registerAgent(worker);
  
  // 测试系统状态
  const status = system.getSystemStatus();
  assert.strictEqual(status.totalAgents, 2);
  
  // 测试消息发送
  system.sendMessage('coordinator', 'worker1', {
    type: 'test',
    content: 'Test message'
  });
  
  console.log('✓ MultiAgentSystem class tests passed');
}

// 运行所有测试
function runAllTests() {
  console.log('=== Running Multi-agent System Tests ===\n');
  
  try {
    testAgent();
    testCoordinatorAgent();
    testWorkerAgent();
    testMessageQueue();
    testTaskScheduler();
    testMultiAgentSystem();
    
    console.log('\n=== All tests passed! ===');
    return true;
  } catch (error) {
    console.error('\n=== Test failed! ===');
    console.error(error.message);
    return false;
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runAllTests();
}

// 导出测试函数
module.exports = {
  runAllTests
};
