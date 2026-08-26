import * as ragService from '../services/ragService.js';

export async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'DOCUMENT_REQUIRED', message: 'Attach a PDF, TXT, or Markdown file.' });
    const document = await ragService.ingest({ name: req.file.originalname, mimeType: req.file.mimetype, buffer: req.file.buffer, owner: ragService.getOwnerId(req) });
    res.status(201).json({ document });
  } catch (error) { next(error); }
}

export function documents(req, res) { res.json({ documents: ragService.listDocuments(ragService.getOwnerId(req)) }); }

export function deleteDocument(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'ADMIN_REQUIRED', message: 'Only administrators can remove knowledge-base documents.' });
  try { ragService.removeDocument(req.params.id, ragService.getOwnerId(req)); res.status(204).end(); } catch (error) { next(error); }
}

export async function chat(req, res, next) {
  try {
    const question = String(req.body.question || '').trim();
    if (question.length < 3) return res.status(400).json({ error: 'QUESTION_REQUIRED', message: 'Ask a question with at least three characters.' });
    res.json(await ragService.chat({ question, owner: ragService.getOwnerId(req), conversationId: req.body.conversationId }));
  } catch (error) { next(error); }
}

export function history(req, res) { res.json({ messages: ragService.history(ragService.getOwnerId(req), req.params.id) }); }
