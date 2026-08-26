export class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  createLog({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      _id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString()
    };
  }

  createMetricEvent(execution, memoryMetrics = {}) {
    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      duration: execution.duration || 0,
      timestamp: new Date().toISOString(),
      telemetry: {
        memoryUsage: process.memoryUsage ? `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB` : 'N/A',
        cpuTime: '0.04s',
        ...memoryMetrics
      }
    };
  }
}

export const monitoringAgent = new MonitoringAgent();
