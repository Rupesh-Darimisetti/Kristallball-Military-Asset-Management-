import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'All transfer fields are required with quantity > 0.' });
    }

    if (Number(sourceBaseId) === Number(destinationBaseId)) {
      return res.status(400).json({ message: 'Source and destination bases must differ.' });
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const record = await tx.transfer.create({
        data: {
          sourceBaseId: Number(sourceBaseId),
          destinationBaseId: Number(destinationBaseId),
          equipmentTypeId: Number(equipmentTypeId),
          quantity: Number(quantity),
          initiatedBy: userId,
          status: 'COMPLETED',
        },
        include: {
          sourceBase: true,
          destinationBase: true,
          equipmentType: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRANSFER',
          details: `Transferred ${quantity} x ${record.equipmentType.name} from ${record.sourceBase.name} to ${record.destinationBase.name}`,
        },
      });

      return record;
    });

    res.status(201).json({ message: 'Transfer completed successfully', transfer });
  } catch (error) {
    res.status(500).json({ error: 'Transfer failed: ' + error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'BASE_COMMANDER') {
      where = {
        OR: [
          { sourceBaseId: req.user.baseId },
          { destinationBaseId: req.user.baseId },
        ],
      };
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        sourceBase: true,
        destinationBase: true,
        equipmentType: true,
        initiator: { select: { username: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
