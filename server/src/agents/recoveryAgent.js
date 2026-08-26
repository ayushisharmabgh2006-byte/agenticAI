export class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
  }

  classifyFailure(error, retryCount = 0) {
    const errorStr = typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error));

    let failureType = 'TRANSIENT';
    let action = 'retry_with_backoff';
    let delayMs = Math.min(1000 * Math.pow(2, retryCount), 16000);

    if (errorStr.includes('INTEGRATION_NOT_CONNECTED') || errorStr.includes('AUTH_EXPIRED') || errorStr.includes('unauthorized') || errorStr.includes('401')) {
      failureType = 'AUTH_EXPIRED';
      action = 'escalate';
      delayMs = 0;
    } else if (errorStr.includes('MISSING_REQUIRED_FIELD') || errorStr.includes('MISSING_FIELDS') || errorStr.includes('validation')) {
      failureType = 'MISSING_FIELDS';
      action = 'escalate';
      delayMs = 0;
    } else if (errorStr.includes('RATE_LIMIT') || errorStr.includes('429') || errorStr.includes('Too Many Requests')) {
      failureType = 'RATE_LIMIT';
      action = 'retry_with_backoff';
      delayMs = 5000 * (retryCount + 1);
    } else if (errorStr.includes('500') || errorStr.includes('API_FAILURE') || errorStr.includes('ECONNREFUSED')) {
      failureType = 'API_FAILURE';
      action = retryCount < 3 ? 'retry_with_backoff' : 'escalate';
    }

    if (retryCount >= 3) {
      action = 'escalate';
    }

    return {
      failureType,
      action,
      retryCount: retryCount + 1,
      delayMs,
      reason: `Classified failure as ${failureType}. Decided strategy: ${action}.`,
      escalationReason: action === 'escalate' ? `Cannot auto-recover from ${failureType} after ${retryCount} attempts.` : null,
      timestamp: new Date().toISOString()
    };
  }
}

export const recoveryAgent = new RecoveryAgent();
