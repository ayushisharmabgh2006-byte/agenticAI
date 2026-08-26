# Agentflow_AI Deployment Guide

This guide deploys the backend to Render, the frontend to Vercel, and MongoDB through MongoDB Atlas.

## 1. Check the project locally

From the project root:

```powershell
cd server
npm.cmd install
node --check src/index.js

cd ..\client
npm.cmd install
npm.cmd run build
```

The local API should respond at `http://localhost:4000/api/health` and the client should run at `http://localhost:3000`.

## 2. Push the project to GitHub

The root `.gitignore` excludes dependencies, build output, local environment files, and logs. Confirm that secrets are not tracked before pushing:

```powershell
cd "C:\Users\hy\Desktop\ai automation project folder"
git init
git status
git add .
git status
git commit -m "Initial Agentflow AI platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the repository URL with your GitHub repository. Do not commit `server/.env` or `client/.env.local`.

## 3. Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster and database named `agentflow`.
2. Create a database user and save its username and password.
3. In **Network Access**, add the Render connection. For a quick first deployment, `0.0.0.0/0` allows connections from Render, but use a restricted policy when your production network is known.
4. Copy the driver connection string and replace the username, password, and database name.

Example format:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/agentflow?retryWrites=true&w=majority
```

URL-encode special characters in the database username or password. For example, `@` becomes `%40`.

## 4. Deploy the backend to Render

1. Open Render and choose **New > Web Service**.
2. Connect the GitHub repository.
3. Set these service values:
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add these environment variables under **Environment**:

```text
NODE_ENV=production
CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
JWT_SECRET=generate-a-long-random-secret
CREDENTIAL_ENCRYPTION_KEY=use-a-32-byte-key
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/agentflow?retryWrites=true&w=majority
```

Optional variables can be added when their providers are configured:

```text
REDIS_URL=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=https://YOUR-RENDER-DOMAIN.onrender.com/api/integrations/oauth/gmail/callback
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=https://YOUR-RENDER-DOMAIN.onrender.com/api/integrations/oauth/slack/callback
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=https://YOUR-RENDER-DOMAIN.onrender.com/api/integrations/oauth/discord/callback
GOOGLE_SHEETS_CLIENT_ID=
GOOGLE_SHEETS_CLIENT_SECRET=
GOOGLE_SHEETS_REDIRECT_URI=https://YOUR-RENDER-DOMAIN.onrender.com/api/integrations/oauth/google-sheets/callback
```

Render supplies `PORT` automatically. Do not set it unless you have a specific reason.

After deployment, verify:

```text
https://YOUR-RENDER-DOMAIN.onrender.com/api/health
```

The response should contain `"ok": true`. Check Render logs for either a successful MongoDB connection or the intentional memory-store fallback message.

## 5. Deploy the frontend to Vercel

1. Open Vercel and choose **Add New > Project**.
2. Import the same GitHub repository.
3. Set **Root Directory** to `client`.
4. Keep the framework as **Next.js**.
5. Add these Vercel environment variables:

```text
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-DOMAIN.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-RENDER-DOMAIN.onrender.com
```

6. Deploy the project.
7. Copy the Vercel production URL and update Render's `CLIENT_URL` to that exact URL.
8. Redeploy the Render service after changing `CLIENT_URL`.

The backend CORS policy allows the configured `CLIENT_URL`, so the URL must include the correct protocol and must not have an extra trailing slash unless the browser origin also uses it.

## 6. Verify the deployed connection

Open the Vercel app and test this flow:

1. Open `/login` and sign in with a seeded demo account or register a new account.
2. Open **Workflow studio**.
3. Generate a workflow from a prompt such as `Send an email and notify the finance team in Slack`.
4. Confirm that the browser Network panel shows requests to the Render API URL.
5. Confirm the Render logs show the request and no CORS error appears in the browser console.

## Troubleshooting

### MongoDB still falls back to memory mode

- Confirm the Render variable is named exactly `MONGODB_URI`.
- Confirm its value is not blank and includes the database name.
- URL-encode special characters in the credentials.
- Add the required Atlas network access rule.
- Check Render logs for the exact Mongoose connection error.

### Browser reports a CORS error

- Set Render `CLIENT_URL` to the exact Vercel origin, for example `https://agentflow-ai.vercel.app`.
- Do not use a trailing slash in `CLIENT_URL`.
- Redeploy the Render service after changing the variable.
- Confirm Vercel `NEXT_PUBLIC_API_URL` points to Render and ends with `/api`.

### Vercel uses localhost

- Add `NEXT_PUBLIC_API_URL` in Vercel project settings, not only in a local file.
- Trigger a new deployment because Next.js exposes public environment variables at build time.

### OAuth callbacks fail

- Replace every localhost callback URL with the deployed Render URL.
- Add each exact callback URL to the matching provider's OAuth application settings.
- Set provider credentials in Render, never in the frontend or Git repository.

## Updating deployments

```powershell
cd "C:\Users\hy\Desktop\ai automation project folder"
git add .
git commit -m "Describe the change"
git push origin main
```

Render and Vercel can be configured for automatic deployments from `main`.
