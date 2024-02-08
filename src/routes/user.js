import express from 'express';
import { Signup } from '../controllers/user.js';

const router = express.Router();

router.post('/signup', Signup);
export default router;
