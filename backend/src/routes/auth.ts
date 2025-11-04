import { Router } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Sign up
router.post('/signup', validate(schemas.signup), async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Create user
  const user = await UserModel.create({ name, email, password });
  
  // Generate token
  const token = generateToken(user.id);
  
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// Log in
router.post('/login', validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Verify password
  const isValid = await UserModel.verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

export default router;
