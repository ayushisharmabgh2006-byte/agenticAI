import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { requireAuth } from './authMiddleware.js';
import * as controller from '../controllers/ragController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, callback) => {
  const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
  callback(allowed.includes(file.mimetype) ? null : new Error('Only PDF, TXT, and Markdown documents are supported.'), allowed.includes(file.mimetype));
} });
function validate(req, res, next) { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ error: 'VALIDATION_ERROR', details: errors.array() }); next(); }
function adminOnly(req, res, next) { if (req.user.role !== 'admin') return res.status(403).json({ error: 'ADMIN_REQUIRED' }); next(); }
router.use(requireAuth);
router.get('/documents', controller.documents);
router.post('/documents', adminOnly, upload.single('document'), controller.upload);
router.delete('/documents/:id', adminOnly, controller.deleteDocument);
router.post('/chat', body('question').isString().trim().isLength({ min: 3, max: 2000 }), validate, controller.chat);
router.get('/chat/:id/history', controller.history);
export default router;
