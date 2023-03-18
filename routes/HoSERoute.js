import express from 'express';
import { getTickerHistoryData } from '../controllers/HoSEController.js';

const router = express.Router();

router.post('/get_history', getTickerHistoryData);

export default router;
