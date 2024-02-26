import express from 'express';
import scrapFacebook from '../controllers/scrapFacebook.js';
import scrapFacebookSinglePage from '../controllers/scrapFacebookSinglePage.js';

const router = express.Router();

router.post('/run', scrapFacebook);
router.post('/facebooksingle', scrapFacebookSinglePage);

export default router;
