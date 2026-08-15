import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, baseId: user.baseId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit(user.id, 'LOGIN', `User ${username} logged in`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, baseId: true, base: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
