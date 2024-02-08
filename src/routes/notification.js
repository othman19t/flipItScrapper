import express from 'express';
import {
  createNotification,
  getNotifications,
} from '../controllers/notification.js';

const router = express.Router();

router.post('/createOne', createNotification);
router.get('/:userId', getNotifications);
export default router;
