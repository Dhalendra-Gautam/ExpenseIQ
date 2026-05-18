import express from 'express';
const aiRoute = express.Router();
import { getAIInsights } from '../controllers/aiController.js';
import { handleAIChat } from '../controllers/aiChatController.js';
import protect from '../middlewares/auth.js';

aiRoute.get('/insights', protect, getAIInsights);
aiRoute.post('/chat', protect, handleAIChat);

export default aiRoute;