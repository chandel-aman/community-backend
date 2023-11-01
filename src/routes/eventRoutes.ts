import express from 'express';
import {
  createEvent,
  fetchEvent,
  deleteEvent,
  listCommunityEvents,
} from '../controllers/eventController';
import { passportConfig } from '../config/passport-config';

const router = express.Router();

// POST - Create an event
router.post('/create', passportConfig.authenticate, createEvent);

// GET - Fetch a specific event by ID
router.get('/:id', fetchEvent);

// DELETE - Delete an event by ID
router.delete('/delete/:id', passportConfig.authenticate, deleteEvent);

// GET - List all events of a community by ID
router.get('/:id/all', listCommunityEvents);

export default router;
