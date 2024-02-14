import express from 'express';
import scrap from '../controllers/scrap.js';

const router = express.Router();

router.get('/run', scrap);
export default router;
