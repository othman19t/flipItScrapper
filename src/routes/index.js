import { Router } from 'express';
import Scrap from './scrap.js';

const routers = Router();

routers.use('/scrap', Scrap);

export default routers;
