import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

function readMongoUri() {
  const configuredUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.DATABASE_URL || '';
  return configuredUri.trim().replace(/^(['"])(.*)\1$/, '$2');
}

export const env = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'agentflow-super-secret-jwt-key-32chars',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  mongoUri: readMongoUri(),
  redisUrl: process.env.REDIS_URL || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  integrations: {
    gmail: {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/gmail/callback'
    },
    slack: {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      redirectUri: process.env.SLACK_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/slack/callback'
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      botToken: process.env.DISCORD_BOT_TOKEN || '',
      redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/discord/callback'
    },
    googleSheets: {
      clientId: process.env.GOOGLE_SHEETS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SHEETS_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_SHEETS_REDIRECT_URI || 'http://localhost:4000/api/integrations/oauth/google-sheets/callback'
    }
  }
};
