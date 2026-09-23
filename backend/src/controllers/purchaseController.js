import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, date } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid baseId, equipmentTypeId, and quantity are required.' });
    }

    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== Number(baseId)) {
      return res.status(403).json({ message: 'Access Denied: Base scope violation.' });
    }

    const purchase = await prisma.purchase.create({
      data: {
        baseId: Number(baseId),
        equipmentTypeId: Number(equipmentTypeId),
        quantity: Number(quantity),
        ...(date && { date: new Date(date) }),
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit(
      req.user.id,
      'PURCHASE',
      `Purchased ${quantity} x ${purchase.equipmentType.name} for ${purchase.base.name}`
    );

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    let baseId = req.query.baseId ? Number(req.query.baseId) : undefined;
    if (req.user.role === 'BASE_COMMANDER') baseId = req.user.baseId;

    const purchases = await prisma.purchase.findMany({
      where: baseId ? { baseId } : undefined,
      include: { base: true, equipmentType: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
