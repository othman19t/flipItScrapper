import express from 'express';
import { getPosts, getAllPosts } from '../controllers/post.js';

const router = express.Router();

router.get('/posts', getPosts);
router.get('/all/:userId', getAllPosts);
export default router;
