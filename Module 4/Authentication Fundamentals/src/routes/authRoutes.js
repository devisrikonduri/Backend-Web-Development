const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../db/userRepository');

const router = express.Router();
const COST_FACTOR = 12;

// Explicit safe-field allowlist mapper
function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

// ── POST /auth/register ───────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validate inputs (400 Bad Request)
    if (
      !name || typeof name !== 'string' || !name.trim() ||
      !email || typeof email !== 'string' || !email.trim() ||
      !password || typeof password !== 'string' || !password.trim()
    ) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check for existing account (409 Conflict)
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // 4. Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, COST_FACTOR);

    // 5. Persist user
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // 6. Return 201 with explicit safe shape
    return res.status(201).json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/login ──────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate inputs (400 Bad Request)
    if (
      !email || typeof email !== 'string' || !email.trim() ||
      !password || typeof password !== 'string' || !password.trim()
    ) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Generic error body required for both failures
    const invalidCredentialsError = {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };

    // 2. Look up account by normalized email
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json(invalidCredentialsError);
    }

    // 3. Verify candidate password with bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(invalidCredentialsError);
    }

    // 4. Return 200 with safe user shape
    return res.status(200).json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = router;