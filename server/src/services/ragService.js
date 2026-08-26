import crypto from 'crypto';
import { memory } from '../config/db.js';
import { env } from '../config/env.js';

const STOP_WORDS = new Set(['about', 'after', 'again', 'also', 'from', 'have', 'that', 'this', 'what', 'when', 'where', 'which', 'with', 'your']);

function tokenize(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function chunkText(text, size = 850, overlap = 120) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const chunks = [];
  for (let start = 0; start < words.length; start += size - overlap) {
    const content = words.slice(start, start + size).join(' ');
    if (content) chunks.push(content);
    if (start + size >= words.length) break;
  }
  return chunks;
}

function score(query, content) {
  const queryWords = tokenize(query);
  const contentWords = tokenize(content);
  const frequencies = contentWords.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map());
  return queryWords.reduce((total, word) => total + (frequencies.get(word) ? 1 + Math.min(frequencies.get(word) / 10, 0.5) : 0), 0) / Math.max(queryWords.length, 1);
}

function getOwnerId(req) {
  return req.user?.id || req.user?.sub || 'user-operator-1';
}

export async function ingest({ name, mimeType, buffer, owner }) {
  let text = buffer.toString('utf8');
  if (mimeType === 'application/pdf') {
    const { default: pdfParse } = await import('pdf-parse');
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  }
  text = text.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 20) throw Object.assign(new Error('The document does not contain enough readable text.'), { code: 'EMPTY_DOCUMENT' });
  const document = { id: `doc-${crypto.randomUUID()}`, name, mimeType, owner, status: 'ready', characterCount: text.length, chunkCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const contents = chunkText(text);
  document.chunkCount = contents.length;
  memory.documents.push(document);
  memory.documentChunks.push(...contents.map((content, index) => ({ id: `chunk-${crypto.randomUUID()}`, documentId: document.id, owner, index, content, embeddingModel: 'local-tfidf-v1' })));
  return document;
}

export function listDocuments(owner) {
  return memory.documents.filter(document => document.owner === owner).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function removeDocument(id, owner) {
  const index = memory.documents.findIndex(document => document.id === id && document.owner === owner);
  if (index === -1) throw Object.assign(new Error('Document not found.'), { code: 'DOCUMENT_NOT_FOUND' });
  memory.documents.splice(index, 1);
  for (let chunkIndex = memory.documentChunks.length - 1; chunkIndex >= 0; chunkIndex -= 1) if (memory.documentChunks[chunkIndex].documentId === id) memory.documentChunks.splice(chunkIndex, 1);
}

export function retrieve(query, owner, limit = 4) {
  return memory.documentChunks.filter(chunk => chunk.owner === owner).map(chunk => ({ ...chunk, relevance: score(query, chunk.content) })).filter(chunk => chunk.relevance > 0).sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}

function groundedAnswer(question, sources) {
  if (!sources.length || sources[0].relevance < 0.12) return { answer: "I couldn't find that in the college knowledge base. Try asking about admissions, courses, fees, exams, hostel, library, placements, or scholarships.", grounded: false };
  const excerpts = sources.map(source => source.content.slice(0, 260)).join(' ');
  return { answer: `According to the college knowledge base: ${excerpts}${excerpts.length >= 780 ? '...' : ''}`, grounded: true };
}

async function generateWithGemini(question, sources) {
  if (!env.geminiApiKey || !sources.length) return null;
  const context = sources.map(source => source.content).join('\n\n');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `Answer only from this college context. If the answer is absent, say you do not know.\n\nContext:\n${context}\n\nQuestion: ${question}` }] }] }) });
  if (!response.ok) return null;
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function chat({ question, owner, conversationId }) {
  const sources = retrieve(question, owner);
  const fallback = groundedAnswer(question, sources);
  const generated = fallback.grounded ? await generateWithGemini(question, sources).catch(() => null) : null;
  const answer = generated || fallback.answer;
  const chat = memory.ragChats.find(item => item.id === conversationId && item.owner === owner) || { id: conversationId || `chat-${crypto.randomUUID()}`, owner, messages: [], createdAt: new Date().toISOString() };
  chat.messages.push({ role: 'user', content: question, createdAt: new Date().toISOString() }, { role: 'assistant', content: answer, grounded: fallback.grounded, sources: sources.map(source => ({ documentId: source.documentId, excerpt: source.content.slice(0, 180), relevance: Number(source.relevance.toFixed(3)) })), createdAt: new Date().toISOString() });
  if (!memory.ragChats.includes(chat)) memory.ragChats.push(chat);
  return { conversationId: chat.id, answer, grounded: fallback.grounded, sources: chat.messages.at(-1).sources, model: generated ? 'gemini-1.5-flash' : 'local-grounded' };
}

export function history(owner, conversationId) {
  return memory.ragChats.find(chat => chat.id === conversationId && chat.owner === owner)?.messages || [];
}

export { getOwnerId };
