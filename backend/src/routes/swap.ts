import { Router } from 'express';
import { EventModel, EventStatus } from '../models/Event';
import { SwapRequestModel, SwapRequestStatus } from '../models/SwapRequest';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { getIO } from '../socket';

const router = Router();

// Get all swappable slots (excluding user's own)
router.get('/swappable-slots', authenticate, async (req: AuthRequest, res) => {
  const slots = await EventModel.findSwappableSlots(req.userId!);
  res.json(slots);
});

// Create a swap request
router.post('/swap-request', authenticate, validate(schemas.swapRequest), async (req: AuthRequest, res) => {
  const { mySlotId, theirSlotId } = req.body;
  
  // Verify my slot exists and belongs to me
  const mySlot = await EventModel.findById(mySlotId);
  if (!mySlot || mySlot.user_id !== req.userId) {
    return res.status(400).json({ error: 'Invalid slot: Your slot not found or unauthorized' });
  }
  
  // Verify my slot is swappable
  if (mySlot.status !== EventStatus.SWAPPABLE) {
    return res.status(400).json({ error: 'Your slot must be SWAPPABLE' });
  }
  
  // Verify their slot exists and is swappable
  const theirSlot = await EventModel.findById(theirSlotId);
  if (!theirSlot) {
    return res.status(400).json({ error: 'Target slot not found' });
  }
  
  if (theirSlot.status !== EventStatus.SWAPPABLE) {
    return res.status(400).json({ error: 'Target slot is not available for swapping' });
  }
  
  // Can't swap with yourself
  if (theirSlot.user_id === req.userId) {
    return res.status(400).json({ error: 'Cannot swap with your own slot' });
  }
  
  // Create swap request
  const swapRequest = await SwapRequestModel.create({
    requester_id: req.userId!,
    requester_slot_id: mySlotId,
    target_user_id: theirSlot.user_id,
    target_slot_id: theirSlotId
  });
  
  // Update both slots to SWAP_PENDING
  await EventModel.updateStatus(mySlotId, EventStatus.SWAP_PENDING);
  await EventModel.updateStatus(theirSlotId, EventStatus.SWAP_PENDING);
  
  // Send real-time notification to target user
  const io = getIO();
  io.to(`user_${theirSlot.user_id}`).emit('swap_request_received', {
    requestId: swapRequest.id,
    from: req.userId,
    message: 'You have a new swap request'
  });
  
  res.status(201).json(swapRequest);
});

// Respond to a swap request
router.post('/swap-response/:requestId', authenticate, validate(schemas.swapResponse), async (req: AuthRequest, res) => {
  const requestId = parseInt(req.params.requestId);
  const { accepted } = req.body;
  
  // Get the swap request
  const swapRequest = await SwapRequestModel.findById(requestId);
  if (!swapRequest) {
    return res.status(404).json({ error: 'Swap request not found' });
  }
  
  // Verify the user is the target of this request
  if (swapRequest.target_user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized: You are not the target of this request' });
  }
  
  // Verify request is still pending
  if (swapRequest.status !== SwapRequestStatus.PENDING) {
    return res.status(400).json({ error: 'This request has already been processed' });
  }
  
  const io = getIO();
  
  if (accepted) {
    // Accept the swap
    await SwapRequestModel.updateStatus(requestId, SwapRequestStatus.ACCEPTED);
    
    // Swap the owners of the two slots
    await EventModel.swapOwners(
      swapRequest.requester_slot_id,
      swapRequest.target_slot_id
    );
    
    // Notify requester
    io.to(`user_${swapRequest.requester_id}`).emit('swap_request_accepted', {
      requestId,
      message: 'Your swap request was accepted'
    });
    
    res.json({ message: 'Swap accepted successfully', swapRequest });
  } else {
    // Reject the swap
    await SwapRequestModel.updateStatus(requestId, SwapRequestStatus.REJECTED);
    
    // Set both slots back to SWAPPABLE
    await EventModel.updateStatus(swapRequest.requester_slot_id, EventStatus.SWAPPABLE);
    await EventModel.updateStatus(swapRequest.target_slot_id, EventStatus.SWAPPABLE);
    
    // Notify requester
    io.to(`user_${swapRequest.requester_id}`).emit('swap_request_rejected', {
      requestId,
      message: 'Your swap request was rejected'
    });
    
    res.json({ message: 'Swap rejected', swapRequest });
  }
});

// Get incoming swap requests
router.get('/requests/incoming', authenticate, async (req: AuthRequest, res) => {
  const requests = await SwapRequestModel.findIncomingRequests(req.userId!);
  res.json(requests);
});

// Get outgoing swap requests
router.get('/requests/outgoing', authenticate, async (req: AuthRequest, res) => {
  const requests = await SwapRequestModel.findOutgoingRequests(req.userId!);
  res.json(requests);
});

export default router;
