import { Router } from 'express';
import { EventModel } from '../models/Event';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Get all events for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const events = await EventModel.findByUserId(req.userId!);
  res.json(events);
});

// Get a specific event
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const event = await EventModel.findById(parseInt(req.params.id));
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (event.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  res.json(event);
});

// Create a new event
router.post('/', authenticate, validate(schemas.createEvent), async (req: AuthRequest, res) => {
  const event = await EventModel.create({
    user_id: req.userId!,
    ...req.body
  });
  
  res.status(201).json(event);
});

// Update an event
router.put('/:id', authenticate, validate(schemas.updateEvent), async (req: AuthRequest, res) => {
  const event = await EventModel.update(
    parseInt(req.params.id),
    req.userId!,
    req.body
  );
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found or unauthorized' });
  }
  
  res.json(event);
});

// Delete an event
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const deleted = await EventModel.delete(parseInt(req.params.id), req.userId!);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Event not found or unauthorized' });
  }
  
  res.status(204).send();
});

export default router;
