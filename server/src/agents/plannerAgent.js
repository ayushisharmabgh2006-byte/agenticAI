export class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  async plan(workflow, input = {}) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      return {
        success: false,
        confidenceScore: 0.0,
        order: [],
        error: 'WORKFLOW_EMPTY: No nodes present in workflow definition'
      };
    }

    // Build Adjacency List and In-Degree Map for Topological Sort
    const inDegree = new Map();
    const adj = new Map();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      adj.set(n.id, []);
    });

    edges.forEach(e => {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source).push(e.target);
        inDegree.set(e.target, inDegree.get(e.target) + 1);
      }
    });

    // Kahn's Algorithm for DAG Topological Ordering
    const queue = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const orderedNodeIds = [];
    while (queue.length > 0) {
      const current = queue.shift();
      orderedNodeIds.push(current);

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles or unattached node ordering
    if (orderedNodeIds.length < nodes.length) {
      // Append any disconnected nodes in sequence
      nodes.forEach(n => {
        if (!orderedNodeIds.includes(n.id)) orderedNodeIds.push(n.id);
      });
    }

    const triggerCount = nodes.filter(n => n.type === 'trigger' || n.data?.type === 'trigger').length;
    const aiCount = nodes.filter(n => n.type === 'ai' || n.data?.type === 'ai').length;
    const integrationCount = nodes.filter(n => n.type === 'integration' || n.data?.type === 'integration').length;

    let confidence = 0.95;
    if (triggerCount === 0) confidence -= 0.15;
    if (nodes.length > 8) confidence -= 0.05;

    return {
      success: true,
      confidenceScore: Math.max(0.7, Math.min(1.0, confidence)),
      order: orderedNodeIds,
      summary: `Resolved ${nodes.length} nodes into linear DAG. (${triggerCount} triggers, ${aiCount} AI models, ${integrationCount} integrations).`,
      timestamp: new Date().toISOString()
    };
  }
}

export const plannerAgent = new PlannerAgent();
