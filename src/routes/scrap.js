import express from 'express';
import { scrap } from '../controllers/scrap.js';

const router = express.Router();

router.get('/posts', scrap);
export default router;
