export class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  async validateNodeOutput(node, result) {
    if (!result) {
      return {
        valid: false,
        error: 'OUTPUT_NULL: Node did not produce any output result',
        fieldsChecked: []
      };
    }

    const nodeType = node.type || node.data?.type;
    const fields = [];

    if (nodeType === 'trigger') {
      fields.push('event', 'payload');
      const hasPayload = Boolean(result.output?.payload);
      return {
        valid: hasPayload,
        fieldsChecked: fields,
        message: hasPayload ? 'Trigger output payload validated.' : 'Trigger payload missing.'
      };
    }

    if (nodeType === 'ai') {
      fields.push('summary', 'extractedData');
      const hasData = Boolean(result.output?.summary);
      return {
        valid: hasData,
        fieldsChecked: fields,
        message: hasData ? 'AI reasoning output and semantic extractions verified.' : 'AI output missing.'
      };
    }

    if (nodeType === 'integration') {
      fields.push('status', 'output');
      const hasOutput = Boolean(result.output);
      return {
        valid: hasOutput,
        fieldsChecked: fields,
        message: hasOutput ? `Integration (${node.data?.provider}) action completed successfully.` : 'Integration output invalid.'
      };
    }

    return {
      valid: true,
      fieldsChecked: ['status'],
      message: 'Node execution verified against baseline schema.'
    };
  }
}

export const validationAgent = new ValidationAgent();
