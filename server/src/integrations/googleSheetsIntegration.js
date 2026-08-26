import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('Google Sheets', 'google-sheets');
  }

  getAuthUrl(state = '') {
    const clientId = env.integrations.googleSheets.clientId || 'demo_sheets_client_id';
    const redirectUri = encodeURIComponent(env.integrations.googleSheets.redirectUri);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  }

  async exchangeCode(code) {
    return {
      accessToken: `mock_sheets_token_${Date.now()}`,
      refreshToken: `mock_sheets_refresh_${Date.now()}`,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    };
  }

  async testConnection(credentials = {}) {
    return {
      ok: true,
      provider: 'google-sheets',
      spreadsheetName: credentials.spreadsheetName || 'Operations Lead Ledger',
      latencyMs: 130
    };
  }

  async executeAction(actionName, params = {}, credentials = {}) {
    const { spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', range = 'Sheet1!A:Z', values = [] } = params;

    if (actionName === 'append_row' || actionName === 'append') {
      return {
        success: true,
        spreadsheetId,
        tableRange: range,
        updates: {
          updatedRange: `${range.split('!')[0]}!A143:D143`,
          updatedRows: 1,
          updatedColumns: values.length || 4,
          updatedCells: values.length || 4
        },
        timestamp: new Date().toISOString()
      };
    }

    if (actionName === 'read_range' || actionName === 'read') {
      return {
        success: true,
        spreadsheetId,
        range,
        rows: [
          ['Timestamp', 'Item', 'Status', 'Cost'],
          [new Date().toISOString(), 'Cloud Compute Allocation', 'Approved', '$340.00'],
          [new Date().toISOString(), 'SSL Certificate Renewal', 'Approved', '$89.00']
        ]
      };
    }

    return { success: true, action: actionName, echo: params };
  }
}

export const googleSheetsIntegration = new GoogleSheetsIntegration();
