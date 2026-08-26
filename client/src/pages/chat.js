import { useEffect, useRef, useState } from 'react';
import { BookOpen, Bot, ChevronRight, FileText, Send, Sparkles, UserRound } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { api } from '../services/api';

const starters = ['What are the admission requirements?', 'When does the semester exam begin?', 'Tell me about hostel facilities'];
export default function CollegeChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Welcome to Campus Answers. Ask me about admissions, courses, fees, exams, hostel, library, placements, or scholarships. I will cite the college documents behind every answer.' }]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const inputRef = useRef(null);
  async function ask(value = question) {
    const clean = value.trim(); if (!clean || loading) return;
    setQuestion(''); setMessages(current => [...current, { role: 'user', content: clean }]); setLoading(true);
    try { const { data } = await api.post('/rag/chat', { question: clean }); setMessages(current => [...current, { role: 'assistant', content: data.answer, grounded: data.grounded }]); setSources(data.sources || []); }
    catch (error) { setMessages(current => [...current, { role: 'assistant', content: error.response?.data?.message || 'The knowledge service is unavailable right now. Please try again.' }]); }
    finally { setLoading(false); }
  }
  useEffect(() => { inputRef.current?.focus(); }, []);
  return <ProtectedRoute><AppShell activeTitle="College Chat"><div className="chat-layout"><section className="chat-main"><div className="chat-intro"><div className="chat-orb"><BookOpen size={26} /></div><div><span className="eyebrow acid">RAG KNOWLEDGE ASSISTANT</span><h2>Ask the campus.</h2><p>Answers grounded in your college's living knowledge base.</p></div></div><div className="messages">{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="message-icon">{message.role === 'assistant' ? <Bot size={16} /> : <UserRound size={16} />}</div><div className="message-bubble">{message.content}{message.role === 'assistant' && message.grounded !== false && index > 0 && <div className="citation-label"><FileText size={12} /> Retrieved from knowledge base</div>}</div></div>)}{loading && <div className="message-row assistant"><div className="message-icon"><Bot size={16} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}</div><div className="starter-row">{starters.map(starter => <button key={starter} onClick={() => ask(starter)}>{starter}<ChevronRight size={13} /></button>)}</div><form className="chat-composer" onSubmit={event => { event.preventDefault(); ask(); }}><input ref={inputRef} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about your college..." /><button aria-label="Send question" disabled={loading || !question.trim()}><Send size={17} /></button></form></section><aside className="chat-sidebar"><span className="eyebrow">RETRIEVAL CONTEXT</span><h3>Sources used</h3>{sources.length ? sources.map(source => <div className="source-card" key={source.documentId}><FileText size={16} /><div><b>{source.documentId}</b><p>{source.excerpt}</p><small>Relevance {Math.round(source.relevance * 100)}%</small></div></div>) : <div className="source-empty"><Sparkles size={20} /><p>Sources will appear here after your first grounded question.</p></div>}<div className="grounding-note"><span className="status-dot" /> Answers stay inside the knowledge base</div></aside></div></AppShell></ProtectedRoute>;
}
