import express from 'express';
import { getTickerHistoryData } from '../controllers/StockController.js';

const router = express.Router();

router.post('/get_history', getTickerHistoryData);

export default router;
