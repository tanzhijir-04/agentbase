#!/usr/bin/env node

/**
 * Workflow Engine - DAG工作流引擎
 *
 * 功能：
 * 1. DAG任务图定义与执行
 * 2. 并行执行与依赖解析
 * 3. 条件分支与循环
 * 4. 事件驱动触发
 * 5. 工作流状态持久化
 */

// ==================== 工作流节点 ====================

class WorkflowNode {
  /**
   * @param {string} id - 节点ID
   * @param {Object} config - 节点配置
   * @param {string} config.name - 节点名称
   * @param {Function} config.execute - 执行函数 (context) => Promise<any>
   * @param {string[]} config.dependsOn - 依赖的节点ID列表
   * @param {Object} config.options - 额外选项
   * @param {number} config.options.timeout - 节点超时（毫秒）
   * @param {number} config.options.retries - 节点重试次数
   * @param {Function} config.options.condition - 条件执行函数 (context) => boolean
   */
  constructor(id, config) {
    this.id = id;
    this.name = config.name || id;
    this.executeFn = config.execute || (async function() {});
    this.dependsOn = config.dependsOn || [];
    this.options = config.options || {};

    this.status = 'pending'; // pending | running | completed | failed | skipped
    this.result = null;
    this.error = null;
    this.startedAt = null;
    this.completedAt = null;
    this.attempts = 0;
  }

  /**
   * 是否可以执行（依赖全部完成）
   */
  canExecute(completedNodes) {
    if (this.status === 'completed' || this.status === 'failed') return false;
    return this.dependsOn.every(function(depId) {
      var depNode = completedNodes[depId];
      return depNode && depNode.status === 'completed';
    });
  }

  /**
   * 是否应该跳过（条件不满足）
   */
  shouldSkip(context) {
    if (this.options.condition) {
      return !this.options.condition(context);
    }
    return false;
  }

  /**
   * 执行节点
   */
  async execute(context) {
    this.status = 'running';
    this.startedAt = Date.now();
    this.attempts++;

    try {
      if (this.options.timeout) {
        this.result = await this.executeWithTimeout(context, this.options.timeout);
      } else {
        this.result = await this.executeFn(context);
      }
      this.status = 'completed';
      this.completedAt = Date.now();
      return { success: true, nodeId: this.id, result: this.result };
    } catch (error) {
      this.error = error.message;
      this.status = 'failed';
      this.completedAt = Date.now();
      return { success: false, nodeId: this.id, error: error.message };
    }
  }

  /**
   * 带超时的执行
   */
  async executeWithTimeout(context, timeout) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var timer = setTimeout(function() {
        reject(new Error("Node '" + self.id + "' timed out after " + timeout + "ms"));
      }, timeout);

      self.executeFn(context).then(function(result) {
        clearTimeout(timer);
        resolve(result);
      }).catch(function(error) {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  /**
   * 重置节点状态
   */
  reset() {
    this.status = 'pending';
    this.result = null;
    this.error = null;
    this.startedAt = null;
    this.completedAt = null;
  }

  /**
   * 获取节点状态摘要
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      dependsOn: this.dependsOn,
      attempts: this.attempts,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      duration: this.startedAt && this.completedAt ? this.completedAt - this.startedAt : null,
      hasResult: this.result !== null,
      hasError: this.error !== null,
      error: this.error
    };
  }
}


// ==================== 工作流引擎 ====================

class WorkflowEngine {
  /**
   * 创建工作流引擎
   * @param {string} name - 工作流名称
   * @param {Object} options
   * @param {number} options.maxConcurrency - 最大并行数（默认 5）
   * @param {Function} options.onNodeComplete - 节点完成回调
   * @param {Function} options.onWorkflowComplete - 工作流完成回调
   */
  constructor(name, options) {
    if (!options) options = {};
    this.name = name || 'unnamed';
    this.maxConcurrency = options.maxConcurrency || 5;
    this.onNodeComplete = options.onNodeComplete || null;
    this.onWorkflowComplete = options.onWorkflowComplete || null;

    this.nodes = {};
    this.context = {};
    this.status = 'idle'; // idle | running | completed | failed | paused
    this.startedAt = null;
    this.completedAt = null;
    this.eventLog = [];
  }

  /**
   * 添加节点
   */
  addNode(id, config) {
    if (this.nodes[id]) {
      throw new Error('Node already exists: ' + id);
    }
    var node = new WorkflowNode(id, config);
    this.nodes[id] = node;
    return this;
  }

  /**
   * 批量添加节点
   */
  addNodes(nodes) {
    var self = this;
    Object.keys(nodes).forEach(function(id) {
      self.addNode(id, nodes[id]);
    });
    return this;
  }

  /**
   * 设置上下文
   */
  setContext(key, value) {
    this.context[key] = value;
    return this;
  }

  /**
   * 获取上下文
   */
  getContext(key) {
    if (key) return this.context[key];
    return this.context;
  }

  /**
   * 执行工作流
   */
  async run(initialContext) {
    if (initialContext) {
      var self = this;
      Object.keys(initialContext).forEach(function(k) {
        self.context[k] = initialContext[k];
      });
    }

    this.status = 'running';
    this.startedAt = Date.now();
    this.eventLog.push({ type: 'workflow_start', name: this.name, timestamp: this.startedAt });

    try {
      var result = await this.executeGraph();
      this.status = result.success ? 'completed' : 'failed';
      this.completedAt = Date.now();
      this.eventLog.push({ type: 'workflow_end', status: this.status, timestamp: this.completedAt });

      if (this.onWorkflowComplete) {
        this.onWorkflowComplete({
          name: this.name,
          status: this.status,
          duration: this.completedAt - this.startedAt,
          results: result
        });
      }

      return result;
    } catch (error) {
      this.status = 'failed';
      this.completedAt = Date.now();
      this.eventLog.push({ type: 'workflow_error', error: error.message, timestamp: this.completedAt });

      return { success: false, error: error.message };
    }
  }

  /**
   * 执行DAG图
   */
  async executeGraph() {
    var completed = {};
    var totalNodes = Object.keys(this.nodes).length;
    var processedCount = 0;

    while (processedCount < totalNodes) {
      // 查找可执行节点
      var readyNodes = this.getReadyNodes(completed);

      if (readyNodes.length === 0 && processedCount < totalNodes) {
        // 检查是否有节点失败或无法满足依赖
        var blockedCount = this.getBlockedNodes(completed).length;
        if (blockedCount > 0) {
          return {
            success: false,
            reason: 'blocked',
            message: blockedCount + ' nodes are blocked due to dependency failures',
            completedNodes: this.getCompletedSummaries(completed),
            failedNodes: this.getFailedSummaries()
          };
        }
        break;
      }

      // 并行执行就绪节点
      var self = this;
      var batch = [];
      var runningCount = 0;

      for (var i = 0; i < readyNodes.length && runningCount < this.maxConcurrency; i++) {
        var node = readyNodes[i];

        // 检查条件
        if (node.shouldSkip(this.context)) {
          node.status = 'skipped';
          completed[node.id] = node;
          processedCount++;
          this.eventLog.push({ type: 'node_skipped', nodeId: node.id, timestamp: Date.now() });
          continue;
        }

        runningCount++;
        batch.push(node.execute(this.context).then(function(nodeResult) {
          var n = nodeResult.nodeId;
          var nodeObj = self.nodes[n];
          completed[n] = nodeObj;
          processedCount++;

          self.eventLog.push({
            type: nodeResult.success ? 'node_completed' : 'node_failed',
            nodeId: n,
            timestamp: Date.now(),
            duration: nodeObj.completedAt - nodeObj.startedAt,
            attempts: nodeObj.attempts
          });

          if (self.onNodeComplete) {
            self.onNodeComplete(nodeResult);
          }

          // 如果是重试节点且失败，尝试重试
          if (!nodeResult.success && nodeObj.options.retries && nodeObj.attempts <= nodeObj.options.retries) {
            return self.retryNode(nodeObj, completed, self.context);
          }

          return nodeResult;
        }));
      }

      await Promise.all(batch);
    }

    var hasFailed = false;
    for (var id in this.nodes) {
      if (this.nodes[id].status === "failed") { hasFailed = true; break; }
    }
    return {
      success: !hasFailed,
      completedNodes: this.getCompletedSummaries(completed),
      failedNodes: this.getFailedSummaries(),
      context: this.context
    };
  }

  /**
   * 重试节点
   */
  async retryNode(nodeObj, completed, context) {
    this.eventLog.push({ type: 'node_retry', nodeId: nodeObj.id, attempt: nodeObj.attempts, timestamp: Date.now() });

    var retryDelay = Math.min(1000 * Math.pow(2, nodeObj.attempts - 1), 30000);
    await new Promise(function(r) { setTimeout(r, retryDelay); });

    var retryResult = await nodeObj.execute(context);
    if (retryResult.success) {
      completed[nodeObj.id] = nodeObj;
    }
    return retryResult;
  }

  /**
   * 获取就绪节点（依赖已完成的节点）
   */
  getReadyNodes(completed) {
    var self = this;
    var readyNodes = [];

    Object.keys(this.nodes).forEach(function(id) {
      var node = self.nodes[id];
      if (node.status === 'pending' && node.canExecute(completed)) {
        readyNodes.push(node);
      }
    });

    return readyNodes;
  }

  /**
   * 获取阻塞节点
   */
  getBlockedNodes(completed) {
    var self = this;
    return Object.keys(this.nodes).filter(function(id) {
      var node = self.nodes[id];
      if (node.status !== 'pending') return false;
      return node.dependsOn.some(function(depId) {
        var depNode = completed[depId] || self.nodes[depId];
        return depNode && depNode.status === 'failed';
      });
    }).map(function(id) { return self.nodes[id]; });
  }

  /**
   * 暂停工作流
   */
  pause() {
    if (this.status === 'running') {
      this.status = 'paused';
      this.eventLog.push({ type: 'workflow_paused', timestamp: Date.now() });
    }
  }

  /**
   * 恢复工作流
   */
  resume() {
    if (this.status === 'paused') {
      this.status = 'running';
      this.eventLog.push({ type: 'workflow_resumed', timestamp: Date.now() });
    }
  }

  /**
   * 重置工作流
   */
  reset() {
    var self = this;
    Object.keys(this.nodes).forEach(function(id) {
      self.nodes[id].reset();
    });
    this.context = {};
    this.status = 'idle';
    this.startedAt = null;
    this.completedAt = null;
    this.eventLog = [];
  }

  /**
   * 获取完成节点摘要
   */
  getCompletedSummaries(completed) {
    var summaries = {};
    var self = this;
    Object.keys(completed).forEach(function(id) {
      summaries[id] = self.nodes[id].getSummary();
    });
    return summaries;
  }

  /**
   * 获取失败节点摘要
   */
  getFailedSummaries() {
    var self = this;
    var failed = {};
    Object.keys(this.nodes).forEach(function(id) {
      var node = self.nodes[id];
      if (node.status === 'failed') {
        failed[id] = node.getSummary();
      }
    });
    return failed;
  }

  /**
   * 获取工作流状态
   */
  getStatus() {
    var self = this;
    var nodeSummaries = {};
    Object.keys(this.nodes).forEach(function(id) {
      nodeSummaries[id] = self.nodes[id].getSummary();
    });

    return {
      name: this.name,
      status: this.status,
      totalNodes: Object.keys(this.nodes).length,
      completedNodes: Object.keys(this.nodes).filter(function(id) { return self.nodes[id].status === 'completed'; }).length,
      failedNodes: Object.keys(this.nodes).filter(function(id) { return self.nodes[id].status === 'failed'; }).length,
      pendingNodes: Object.keys(this.nodes).filter(function(id) { return self.nodes[id].status === 'pending'; }).length,
      runningNodes: Object.keys(this.nodes).filter(function(id) { return self.nodes[id].status === 'running'; }).length,
      duration: this.startedAt ? (this.completedAt ? this.completedAt - this.startedAt : Date.now() - this.startedAt) : null,
      nodes: nodeSummaries,
      eventLogSize: this.eventLog.length
    };
  }

  /**
   * 可视化DAG（返回Mermaid流程图文本）
   */
  toMermaid() {
    var lines = ['graph TD;'];
    var self = this;

    Object.keys(this.nodes).forEach(function(id) {
      var node = self.nodes[id];
      if (node.dependsOn.length === 0) {
        lines.push('  ' + id + '[' + node.name + ']');
      } else {
        node.dependsOn.forEach(function(dep) {
          lines.push('  ' + dep + '-->' + id);
        });
      }
    });

    return lines.join('\n');
  }
}


// ==================== 导出 ====================

module.exports = {
  WorkflowNode: WorkflowNode,
  WorkflowEngine: WorkflowEngine
};

// ==================== 独立运行演示 ====================

if (require.main === module) {
  (async function() {
    console.log('=== Workflow Engine Demo ===\n');

    // 创建一个数据处理工作流
    var workflow = new WorkflowEngine('data-pipeline', {
      maxConcurrency: 3,
      onNodeComplete: function(r) {
        var icon = r.success ? 'OK' : 'FAIL';
        console.log('  [' + icon + '] ' + r.nodeId + (r.success ? '' : ': ' + r.error));
      }
    });

    workflow.addNodes({
      'fetch-data': {
        name: '获取数据',
        execute: async function(ctx) {
          console.log('    Fetching data...');
          await new Promise(function(r) { setTimeout(r, 500); });
          ctx.rawData = { items: [1, 2, 3, 4, 5] };
          return ctx.rawData;
        }
      },
      'validate-data': {
        name: '验证数据',
        execute: async function(ctx) {
          console.log('    Validating data...');
          await new Promise(function(r) { setTimeout(r, 300); });
          if (!ctx.rawData || !ctx.rawData.items) {
            throw new Error('Invalid data format');
          }
          ctx.validated = true;
          return { validated: true, count: ctx.rawData.items.length };
        },
        dependsOn: ['fetch-data']
      },
      'process-items': {
        name: '处理数据项',
        execute: async function(ctx) {
          console.log('    Processing items...');
          await new Promise(function(r) { setTimeout(r, 800); });
          ctx.processed = ctx.rawData.items.map(function(x) { return x * 2; });
          return ctx.processed;
        },
        dependsOn: ['validate-data']
      },
      'generate-report': {
        name: '生成报告',
        execute: async function(ctx) {
          console.log('    Generating report...');
          await new Promise(function(r) { setTimeout(r, 400); });
          return {
            totalItems: ctx.rawData.items.length,
            processedItems: ctx.processed.length,
            results: ctx.processed
          };
        },
        dependsOn: ['process-items']
      },
      'send-notification': {
        name: '发送通知',
        execute: async function(ctx) {
          console.log('    Sending notification...');
          await new Promise(function(r) { setTimeout(r, 200); });
          return { notified: true, message: 'Pipeline completed' };
        },
        dependsOn: ['generate-report']
      }
    });

    console.log('  Pipeline DAG:');
    console.log(workflow.toMermaid());
    console.log();

    console.log('  Running workflow...');
    var result = await workflow.run();
    console.log();
    console.log('  Result: ' + (result.success ? 'Success' : 'Failed'));
    console.log('  Duration: ' + workflow.getStatus().duration + 'ms');

    if (!result.success && result.error) {
      console.log('  Error: ' + result.error);
    }

    console.log();
    console.log('  Workflow Status:');
    console.log(JSON.stringify(workflow.getStatus(), null, 4));
  })().catch(function(err) { console.error('Demo error:', err); });
}
