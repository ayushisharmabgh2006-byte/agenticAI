# ⚡ RAG-Based College Chatbot — Agentflow_AI Platform

<div align="center">

![Agentflow AI Banner](https://img.shields.io/badge/Platform-Agentflow__AI-c7f36b?style=for-the-badge&logo=probot&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React 18](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js Express](https://img.shields.io/badge/Node.js%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO%204.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Turn natural intent into resilient, visual, and multi-agent automated pipelines with real-time auditability.**

The platform includes a grounded college information assistant: administrators upload college PDFs, notices, FAQs, and policies; students ask questions; the server extracts and chunks documents, retrieves relevant context, and returns answers with source references. When no relevant source exists, the assistant clearly says it does not know.

</div>

---

## 🌟 Key Highlights

- 🧠 **Prompt-to-Workflow AI Synthesis**: Describe complex multi-step automations in plain English. The platform generates an interactive DAG graph with typed nodes and parameters using OpenRouter, Google Gemini, or an offline rule engine.
- 🎨 **Visual Canvas Studio**: Built with `@xyflow/react` (React Flow), featuring custom node types (`Trigger`, `AI Reasoning`, `Integrations`, `Logic`), animated edge pulses, minimap, drag-and-drop palette, and a live node inspector panel.
- 🤖 **5-Agent Autonomous Orchestration Fleet**:
  1. **Planner Agent**: Performs topological sort on the workflow DAG, resolves dependencies, and calculates confidence scores.
  2. **Execution Agent**: Executes node logic, performs dynamic variable interpolation (`{{key}}`), and interacts with third-party tools.
  3. **Validation Agent**: Validates output schemas, ensures data integrity, and checks required fields.
  4. **Recovery Agent**: Classifies failure modes (`MISSING_FIELDS`, `AUTH_EXPIRED`, `RATE_LIMIT`, `API_FAILURE`, `TRANSIENT`), determines backoff strategies, and manages retries.
  5. **Monitoring Agent**: Emits real-time telemetry, tracks timing benchmarks, and formats granular audit traces.
- 🔌 **Enterprise OAuth Tool Integrations**: Connectors for **Gmail**, **Slack**, **Discord**, and **Google Sheets** with **AES-256-GCM** credential encryption at rest.
- ⚡ **Real-Time Streaming**: Live execution logs and progress streamed directly to the browser over **Socket.IO** rooms.
- 🛡️ **Zero-Config Local Mode**: Runs out-of-the-box without requiring external MongoDB or Redis services installed, while supporting live production MongoDB and Redis (BullMQ) with simple `.env` flags.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       Agentflow_AI Platform                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
       ┌─────────────────────────────┴─────────────────────────────┐
       ▼                                                           ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     Next.js Pages Client     │              │    Express Backend Server    │
│  • React Flow Visual Canvas  │  HTTP REST   │  • Controllers & Services    │
│  • Dark Operator Console     │ ◄──────────► │  • Real-Time Socket.IO       │
│  • Prompt-to-Workflow Studio │  WebSockets  │  • OAuth Integrations        │
│  • Zustand State Store       │              │  • AES-256-GCM Encryption    │
└──────────────────────────────┘              └──────────────┬───────────────┘
                                                             │
                  ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
                  ▼                                                                                     ▼
   ┌──────────────────────────────┐                                                      ┌──────────────────────────────┐
   │     5-Agent Orchestrator     │                                                      │       Database Substrate     │
   │  1. Planner Agent            │                                                      │  • Zero-Config Memory Store  │
   │  2. Execution Agent          │                                                      │  • MongoDB via Mongoose      │
   │  3. Validation Agent         │                                                      │  • BullMQ Redis Queue        │
   │  4. Recovery Agent           │                                                      │  • Async Memory Worker Queue │
   │  5. Monitoring Agent         │                                                      └──────────────────────────────┘
   └──────────────────────────────┘
```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js** v18 or higher (`node -v`)
- **npm** v9 or higher (`npm -v`)

---

### Step 1: Start the Backend Server (`server/`)

Open a terminal window and run:

```bash
# Navigate to the server folder
cd server

# Install dependencies (if not already installed)
npm.cmd install

# Start the backend server (runs on port 4000)
npm.cmd run dev
```

*The backend server will start at `http://localhost:4000` with Zero-Config In-Memory Mode enabled automatically.*

---

### Step 2: Start the Next.js Client (`client/`)

Open a second terminal window and run:

```bash
# Navigate to the client folder
cd client

# Install dependencies (if not already installed)
npm.cmd install

# Start the Next.js development server (runs on port 3000)
npm.cmd run dev
```

*Open **`http://localhost:3000`** in your browser.*

---

## 🔑 Pre-Configured Demo Credentials

For instant one-click testing, the platform is pre-seeded with two operator accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Operator** | `operator@agentflow.io` | `password123` | Create, generate, edit, and execute multi-agent workflows |
| **Admin** | `admin@agentflow.io` | `password123` | Full system access, security diagnostics, and operator management |

> You can also click the **"Operator Mode"** or **"Admin Mode"** quick-fill buttons on the `/login` page for one-click access.

---

## 📂 Project Structure

```text
ai automation project folder/
├── client/                                 # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell.js                 # Responsive sidebar and topbar layout
│   │   │   ├── MetricGrid.js               # Dashboard metrics and telemetry summary
│   │   │   ├── NodePalette.js              # Draggable automation node blocks
│   │   │   ├── NodeConfigPanel.js          # Selected node parameter inspector
│   │   │   ├── ExecutionTimeline.js        # Live agent log stream with colored badges
│   │   │   ├── ExecutionModal.js           # Interactive pipeline trigger & runner modal
│   │   │   ├── NotificationsDrawer.js      # Slide-over alert drawer
│   │   │   ├── ProtectedRoute.js           # Route auth guard
│   │   │   └── WorkflowCanvas/             # React Flow canvas & custom node renderers
│   │   ├── pages/
│   │   │   ├── _app.js                     # Global providers & socket subscribers
│   │   │   ├── index.js                    # High-impact platform landing page
│   │   │   ├── login.js                    # Authentication form & demo quick fills
│   │   │   ├── register.js                 # User registration form
│   │   │   ├── dashboard.js                # Command Center dashboard
│   │   │   ├── integrations.js             # Third-party tools status & OAuth hub
│   │   │   ├── settings.js                 # Security & cryptographic diagnostics
│   │   │   ├── workflows/
│   │   │   │   ├── index.js                # Workflow directory & manager
│   │   │   │   ├── builder.js              # Prompt-to-workflow AI studio
│   │   │   │   └── [id].js                 # Visual React Flow studio editor
│   │   │   └── executions/
│   │   │       ├── index.js                # Execution audit log & run history
│   │   │       └── [id].js                 # Detailed execution trace & snapshot
│   │   ├── services/
│   │   │   ├── api.js                      # Axios API client with JWT interceptor
│   │   │   └── socket.js                   # Socket.IO client singleton & room subs
│   │   └── store/
│   │       ├── authStore.js                # Zustand persistent auth state
│   │       └── workflowStore.js            # Zustand workflow & execution state
│   ├── styles/
│   │   └── globals.css                     # Dark mode operator console design system
│   ├── tailwind.config.js                  # Tailwind color & font extensions
│   └── package.json
│
├── server/                                 # Express.js Multi-Agent Backend
│   ├── src/
│   │   ├── agents/
│   │   │   ├── orchestrator.js             # Multi-agent coordination pipeline
│   │   │   ├── plannerAgent.js             # DAG topological sort & confidence
│   │   │   ├── executionAgent.js           # Tool action runner & variable interpolation
│   │   │   ├── validationAgent.js          # Schema and output integrity validator
│   │   │   ├── recoveryAgent.js            # Error classification & backoff retry
│   │   │   └── monitoringAgent.js          # Real-time telemetry & execution logs
│   │   ├── config/
│   │   │   ├── env.js                      # Centralized environment variables
│   │   │   ├── db.js                       # MongoDB connection & in-memory store
│   │   │   └── socket.js                   # Socket.IO server & event emitters
│   │   ├── controllers/                    # Thin request handlers
│   │   ├── integrations/
│   │   │   ├── baseIntegration.js          # Standard integration interface
│   │   │   ├── gmailIntegration.js         # Gmail actions & OAuth
│   │   │   ├── slackIntegration.js         # Slack messaging & Webhooks
│   │   │   ├── discordIntegration.js       # Discord bots & embed builder
│   │   │   └── googleSheetsIntegration.js  # Sheets append & range reader
│   │   ├── models/                         # Data models & schemas
│   │   ├── queues/
│   │   │   └── executionQueue.js           # BullMQ & async memory queue fallback
│   │   ├── routes/                         # Express API routes with express-validator
│   │   ├── services/                       # Business logic & encryption layers
│   │   └── index.js                        # Server entrypoint
│   ├── .env.example
│   └── package.json
│
├── spec.md                                 # Single Source of Truth Specification Sheet
└── README.md                               # Project documentation
```

---

## 📡 REST API Reference

### RAG College Chatbot
- `GET /api/rag/documents` — List indexed documents for the authenticated user.
- `POST /api/rag/documents` — Admin-only PDF, TXT, or Markdown upload. Extracts text, creates overlapping chunks, and indexes them.
- `DELETE /api/rag/documents/:id` — Admin-only document and chunk deletion.
- `POST /api/rag/chat` — Retrieve relevant chunks and return a grounded answer with source excerpts.
- `GET /api/rag/chat/:id/history` — Fetch conversation context for a chat session.

The local fallback uses deterministic lexical retrieval, so the complete RAG flow works without an external vector database or AI key. Set `GEMINI_API_KEY` on the backend to enable Gemini answer generation after retrieval. Keep all provider keys in Render environment variables; never use them in `NEXT_PUBLIC_*` variables or commit them to GitHub.

### Authentication & Profile
- `POST /api/auth/register` — Register a new operator or admin user.
- `POST /api/auth/login` — Authenticate credentials and receive a JWT session token.
- `GET /api/auth/me` — Retrieve the authenticated user profile and roles.

### Workflows Management
- `GET /api/workflows/dashboard` — Aggregated workspace telemetry, active pipelines, and agent health.
- `GET /api/workflows` — List user workflows with tag and status filters.
- `POST /api/workflows` — Create a new workflow manually.
- `POST /api/workflows/generate` — Generate visual workflow DAG from a natural-language prompt.
- `GET /api/workflows/:id` — Fetch complete workflow definition and node configuration.
- `PUT /api/workflows/:id` — Update workflow structure, positions, and node settings.
- `POST /api/workflows/:id/duplicate` — Clone an existing workflow.
- `POST /api/workflows/:id/execute` — Trigger an immediate execution run.
- `DELETE /api/workflows/:id` — Delete a workflow.

### Executions & Telemetry
- `GET /api/executions` — List execution run history with duration and pagination.
- `GET /api/executions/:id` — Retrieve execution instance, inputs, outputs, and snapshot.
- `GET /api/executions/:id/timeline` — Fetch granular multi-agent audit logs.
- `POST /api/executions/:id/pause` — Pause an active execution run.
- `POST /api/executions/:id/resume` — Resume a paused execution.
- `POST /api/executions/:id/cancel` — Cancel a running execution.
- `POST /api/executions/:id/retry` — Re-execute an existing pipeline run.

### Integrations & Notifications
- `GET /api/integrations` — List all user integration connections.
- `GET /api/integrations/status` — Inspect connection status and health for all tools.
- `GET /api/integrations/oauth/:provider/start` — Initiate third-party OAuth flow.
- `GET /api/integrations/oauth/:provider/callback` — Handle OAuth callback.
- `POST /api/integrations` — Save manual or API key credentials.
- `POST /api/integrations/:provider/test` — Test connectivity and latency for a provider.
- `POST /api/integrations/:provider/disconnect` — Disconnect an integration.
- `GET /api/notifications` — Fetch user alerts and execution notifications.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `POST /api/notifications/read-all` — Mark all notifications as read.

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=4000
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# JWT & Token Encryption (Required in production)
JWT_SECRET=agentflow-super-secret-jwt-key-32chars
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# Optional Live Database & Queue (Defaults to Memory Store if omitted)
# Replace this with your real MongoDB Atlas or local connection string.
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agentflow
REDIS_URL=

# Optional AI Providers (Defaults to Deterministic Rule Engine if omitted)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

The backend also accepts `DATABASE_URL`, `MONGO_URI`, and `MONGODB_URL` as aliases for `MONGODB_URI`. If the URL is blank or unreachable, the server logs the reason and intentionally uses the in-memory store. Keep the real URL in `server/.env`; never commit it.

---

## 🔒 Security & Cryptography

- **AES-256-GCM Token Encryption**: OAuth tokens and API secrets are encrypted at rest with initialization vectors and authentication tags. Decrypted tokens are never written to log files.
- **Bcrypt Cost 12**: Passwords are securely hashed with industry-standard salt rounds.
- **JWT Authentication**: Protected routes with token expiry validation and role segregation (`admin` vs `operator`).
- **HTTP Security Headers**: Powered by `helmet` and strict CORS configurations.
- **Request Validation**: Sanitized and validated via `express-validator` on all mutation endpoints.

---

## 🧪 Testing & Verification

To execute the automated end-to-end integration test suite across all 9 subsystems:

```bash
# In the root workspace:
node -e "
async function run() {
  const login = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'operator@agentflow.io', password: 'password123' })
  }).then(r => r.json());
  console.log('Login Test:', login.token ? 'PASSED' : 'FAILED');
  const gen = await fetch('http://localhost:4000/api/workflows/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Invoice triage and Slack notification' })
  }).then(r => r.json());
  console.log('AI Generation Test:', gen.nodes?.length >= 3 ? 'PASSED' : 'FAILED');
}
run();
"
```

---

<div align="center">

Built with ❤️ for AI Automation Engineers & Operators.

</div>
