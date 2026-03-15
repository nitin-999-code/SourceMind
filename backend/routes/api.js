import express from 'express';
import { analyzeRepository, chatWithRepository, explainFile, clearCache } from '../controllers/repoController.js';

const router = express.Router();

router.post('/analyze', analyzeRepository);
router.post('/chat', chatWithRepository);
router.post('/explain-file', explainFile);
router.post('/clear-cache', clearCache);

export default router;
