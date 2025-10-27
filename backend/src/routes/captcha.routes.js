import express from 'express';
import { generateCaptchaPng } from '../utils/captcha.js';
const router = express.Router();
router.get('/png', generateCaptchaPng);
export default router;
