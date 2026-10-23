import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', rateLimit({ windowMs: 15 * 60_000, limit: 10 }), async (req, res) => {
  const { email, password } = req.body || {};
  const user = email && (await User.findOne({ email: String(email).toLowerCase() }));
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: signToken(user), email: user.email });
});

router.get('/me', requireAuth, (req, res) => res.json({ email: req.user.email }));

export default router;
