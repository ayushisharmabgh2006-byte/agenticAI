export class BaseIntegration {
  constructor(name, provider) {
    this.name = name;
    this.provider = provider;
  }

  async testConnection(credentials = {}) {
    throw new Error(`testConnection not implemented for ${this.name}`);
  }

  async executeAction(actionName, params = {}, credentials = {}) {
    throw new Error(`executeAction not implemented for ${this.name}`);
  }

  getAuthUrl(state = '') {
    throw new Error(`getAuthUrl not implemented for ${this.name}`);
  }

  async exchangeCode(code) {
    throw new Error(`exchangeCode not implemented for ${this.name}`);
  }

  async refreshToken(refreshToken) {
    throw new Error(`refreshToken not implemented for ${this.name}`);
  }
}
