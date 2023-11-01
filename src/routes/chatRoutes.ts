import express from 'express';
import {
  createChat,
  deleteChat,
  addUsersToChat,
  removeUsersFromChat,
  getChat,
} from '../controllers/chatController';
import { passportConfig } from '../config/passport-config';

const router = express.Router();

// POST request to create a chat (Requires authentication)
router.post('/create', passportConfig.authenticate, createChat);

// DELETE request to delete a chat by ID (Requires authentication)
router.delete('/delete/:chatId', passportConfig.authenticate, deleteChat);

// PUT request to add users to a chat (Requires authentication)
router.put('/addUsers/:chatId', passportConfig.authenticate, addUsersToChat);

// PUT request to remove users from a chat (Requires authentication)
router.put('/removeUsers/:chatId', passportConfig.authenticate, removeUsersFromChat);

// GET request to get a specific chat by ID (Requires authentication)
router.get('/:chatId', passportConfig.authenticate, getChat);

export default router;
