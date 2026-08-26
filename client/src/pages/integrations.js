import { useState, useEffect } from 'react';
import {
  Cable,
  Mail,
  MessageSquare,
  MessageCircle,
  FileSpreadsheet,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Power,
  Play,
  Loader2,
  Check
} from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { api } from '../services/api';

const INTEGRATIONS_CATALOG = [
  {
    provider: 'gmail',
    name: 'Gmail',
    description: 'Send alerts and ingest incoming support emails over Google OAuth 2.0.',
    icon: Mail,
    color: 'text-[#fb7185]',
    bgColor: 'bg-[#fb7185]/10',
    scopes: ['gmail.send', 'gmail.readonly']
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Post automated notifications and action cards into channels and user DMs.',
    icon: MessageSquare,
    color: 'text-[#38bdf8]',
    bgColor: 'bg-[#38bdf8]/10',
    scopes: ['chat:write', 'channels:read', 'incoming-webhook']
  },
  {
    provider: 'discord',
    name: 'Discord',
    description: 'Dispatch rich webhook embeds and bot announcements to server channels.',
    icon: MessageCircle,
    color: 'text-[#818cf8]',
    bgColor: 'bg-[#818cf8]/10',
    scopes: ['bot', 'webhook.incoming']
  },
  {
    provider: 'google-sheets',
    name: 'Google Sheets',
    description: 'Read ranges, query database rows, and append real-time telemetry records.',
    icon: FileSpreadsheet,
    color: 'text-[#34d399]',
    bgColor: 'bg-[#34d399]/10',
    scopes: ['spreadsheets']
  },
  {
    provider: 'openrouter',
    name: 'OpenRouter AI',
    description: 'Unified AI routing to Claude 3.5 Sonnet, GPT-4o, and reasoning models.',
    icon: Bot,
    color: 'text-[#c084fc]',
    bgColor: 'bg-[#c084fc]/10',
    scopes: ['model.generate']
  },
  {
    provider: 'gemini',
    name: 'Google Gemini',
    description: 'High-throughput multimodel reasoning with Gemini 1.5 Flash and Pro.',
    icon: Sparkles,
    color: 'text-[#fbbf24]',
    bgColor: 'bg-[#fbbf24]/10',
    scopes: ['gemini.generateContent']
  }
];

export default function IntegrationsPage() {
  const [integrationsStatus, setIntegrationsStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/integrations/status');
      setIntegrationsStatus(data.integrations || []);
    } catch (err) {
      console.error('Error fetching integrations status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (provider) => {
    try {
      // Connect sandbox/local simulator
      await api.post('/integrations', {
        provider,
        credentials: { mockToken: `live_${provider}_token` },
        scopes: ['all'],
        metadata: { connectedAt: new Date().toISOString() }
      });
      fetchStatus();
    } catch (err) {
      alert('Connection error');
    }
  };

  const handleDisconnect = async (provider) => {
    try {
      await api.post(`/integrations/${provider}/disconnect`);
      fetchStatus();
    } catch (err) {
      alert('Disconnect error');
    }
  };

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const { data } = await api.post(`/integrations/${provider}/test`);
      setTestResult({ ok: true, provider, data: data.result });
    } catch (err) {
      setTestResult({
        ok: false,
        provider,
        error: err.response?.data?.error || err.message || 'Connection test failed'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell activeTitle="Integrations">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-[#13161a] border border-[#262c35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8]">
                <Cable size={14} />
                <span>ENTERPRISE TOOL CONNECTORS</span>
              </div>
              <h2 className="font-grotesk text-2xl font-bold text-white mt-1">
                Third-Party Integrations Hub
              </h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                OAuth 2.0 credentials securely encrypted at rest via AES-256-GCM
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted bg-[#181b21] px-3 py-1.5 rounded-lg border border-[#262c35] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#c7f36b]" /> Encryption Key Active
              </span>
            </div>
          </div>

          {/* Test Result Toast/Banner */}
          {testResult && (
            <div className={`p-4 rounded-xl border flex items-center justify-between font-mono text-xs ${
              testResult.ok
                ? 'bg-[#152419] border-[#c7f36b]/40 text-[#c7f36b]'
                : 'bg-[#2b181b] border-[#fb7185]/40 text-[#fb7185]'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>
                  {testResult.ok
                    ? `Connection test passed for "${testResult.provider}". Latency nominal.`
                    : `Connection error: ${testResult.error}`}
                </span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-xs text-muted hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATIONS_CATALOG.map((item) => {
              const Icon = item.icon;
              const statusObj = integrationsStatus.find(s => s.provider === item.provider);
              const isConnected = Boolean(statusObj?.isConnected);
              const isTesting = testingProvider === item.provider;

              return (
                <div
                  key={item.provider}
                  className="p-6 rounded-2xl bg-[#13161a] border border-[#262c35] hover:border-[#38414e] transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className={`h-11 w-11 rounded-xl ${item.bgColor} border border-[#262c35] grid place-items-center ${item.color}`}>
                        <Icon size={22} />
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#c7f36b] shadow-[0_0_8px_#c7f36b]' : 'bg-[#6b7280]'}`} />
                        <span className={isConnected ? 'text-[#c7f36b] font-bold' : 'text-muted'}>
                          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-grotesk font-bold text-lg text-white mt-4">{item.name}</h3>
                    <p className="text-xs text-muted-light mt-1.5 leading-relaxed">{item.description}</p>

                    {/* Scopes */}
                    <div className="mt-4 pt-3 border-t border-[#262c35]">
                      <span className="text-[10px] font-mono text-muted uppercase block mb-1.5">Scopes</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.scopes.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-[#181b21] border border-[#262c35] text-muted-light px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-[#262c35] flex items-center justify-between gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleTestConnection(item.provider)}
                          disabled={isTesting}
                          className="secondary-button small !py-1.5"
                        >
                          {isTesting ? <Loader2 className="animate-spin" size={13} /> : <Play size={13} />}
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => handleDisconnect(item.provider)}
                          className="danger-button text-xs !py-1.5"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(item.provider)}
                        className="primary-button small w-full justify-center"
                      >
                        <Power size={14} /> Connect Provider
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
