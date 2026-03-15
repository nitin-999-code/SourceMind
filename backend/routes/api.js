import express from 'express';
import { analyzeRepository, chatWithRepository, explainFile } from '../controllers/repoController.js';

const router = express.Router();

router.post('/analyze', analyzeRepository);
router.post('/chat', chatWithRepository);
router.post('/explain-file', explainFile);

export default router;
