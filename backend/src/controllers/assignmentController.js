import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, personnelName, quantity } = req.body;

    if (!baseId || !equipmentTypeId || !personnelName || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'All assignment fields are required.' });
    }

    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== Number(baseId)) {
      return res.status(403).json({ message: 'Access Denied: Base scope violation.' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        baseId: Number(baseId),
        equipmentTypeId: Number(equipmentTypeId),
        personnelName,
        quantity: Number(quantity),
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit(
      req.user.id,
      'ASSIGNMENT',
      `Assigned ${quantity} x ${assignment.equipmentType.name} to ${personnelName} at ${assignment.base.name}`
    );

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid baseId, equipmentTypeId, and quantity are required.' });
    }

    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== Number(baseId)) {
      return res.status(403).json({ message: 'Access Denied: Base scope violation.' });
    }

    const expenditure = await prisma.expenditure.create({
      data: {
        baseId: Number(baseId),
        equipmentTypeId: Number(equipmentTypeId),
        quantity: Number(quantity),
        reason: reason ?? null,
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit(
      req.user.id,
      'EXPENDITURE',
      `Expended ${quantity} x ${expenditure.equipmentType.name} at ${expenditure.base.name}${reason ? ` (${reason})` : ''}`
    );

    res.status(201).json(expenditure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    let baseId = req.query.baseId ? Number(req.query.baseId) : undefined;
    if (req.user.role === 'BASE_COMMANDER') baseId = req.user.baseId;

    const assignments = await prisma.assignment.findMany({
      where: baseId ? { baseId } : undefined,
      include: { base: true, equipmentType: true },
      orderBy: { assignedAt: 'desc' },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    let baseId = req.query.baseId ? Number(req.query.baseId) : undefined;
    if (req.user.role === 'BASE_COMMANDER') baseId = req.user.baseId;

    const expenditures = await prisma.expenditure.findMany({
      where: baseId ? { baseId } : undefined,
      include: { base: true, equipmentType: true },
      orderBy: { expendedAt: 'desc' },
    });
    res.json(expenditures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
