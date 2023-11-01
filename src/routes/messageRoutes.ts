import express from 'express';
import { addMessageToChat } from '../controllers/messageController';
import { passportConfig } from '../config/passport-config';

const router = express.Router();

// POST request to add messages to chat
router.put('/add', passportConfig.authenticate, addMessageToChat);


export default router;
