import { Router } from 'express';
import user from './user.js';
import Scrap from './scrap.js';
import Notification from './notification.js';
import post from './post.js';

const routers = Router();

routers.use('/user', user);
routers.use('/scrap', Scrap);
routers.use('/notification', Notification);
routers.use('/post', post);
export default routers;
