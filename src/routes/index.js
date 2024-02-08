import { Router } from 'express';
import user from './user.js';
import Scrap from './scrap.js';
import Notification from './notification.js';

const routers = Router();

routers.use('/user', user);
routers.use('/scrap', Scrap);
routers.use('/notifications', Notification);

export default routers;
