import prisma from '../config/db.js';

const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return Object.keys(filter).length ? filter : undefined;
};

export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate } = req.query;

    if (req.user.role === 'BASE_COMMANDER') {
      baseId = String(req.user.baseId);
    }

    const baseFilter = baseId ? Number(baseId) : undefined;
    const equipmentFilter = equipmentTypeId ? Number(equipmentTypeId) : undefined;
    const dateFilter = buildDateFilter(startDate, endDate);

    const purchaseWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipmentFilter && { equipmentTypeId: equipmentFilter }),
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const transferInWhere = {
      status: 'COMPLETED',
      ...(baseFilter && { destinationBaseId: baseFilter }),
      ...(equipmentFilter && { equipmentTypeId: equipmentFilter }),
      ...(dateFilter && { timestamp: dateFilter }),
    };

    const transferOutWhere = {
      status: 'COMPLETED',
      ...(baseFilter && { sourceBaseId: baseFilter }),
      ...(equipmentFilter && { equipmentTypeId: equipmentFilter }),
      ...(dateFilter && { timestamp: dateFilter }),
    };

    const assignmentWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipmentFilter && { equipmentTypeId: equipmentFilter }),
      ...(dateFilter && { assignedAt: dateFilter }),
    };

    const expenditureWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipmentFilter && { equipmentTypeId: equipmentFilter }),
      ...(dateFilter && { expendedAt: dateFilter }),
    };

    const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
      prisma.purchase.aggregate({ where: purchaseWhere, _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferInWhere, _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferOutWhere, _sum: { quantity: true } }),
      prisma.assignment.aggregate({ where: assignmentWhere, _sum: { quantity: true } }),
      prisma.expenditure.aggregate({ where: expenditureWhere, _sum: { quantity: true } }),
    ]);

    const totalPurchases = purchases._sum.quantity ?? 0;
    const totalTransfersIn = transfersIn._sum.quantity ?? 0;
    const totalTransfersOut = transfersOut._sum.quantity ?? 0;
    const totalAssigned = assigned._sum.quantity ?? 0;
    const totalExpended = expended._sum.quantity ?? 0;

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
    const closingBalance = netMovement - totalAssigned - totalExpended;

    res.json({
      openingBalance: 0,
      purchases: totalPurchases,
      transfersIn: totalTransfersIn,
      transfersOut: totalTransfersOut,
      netMovement,
      assigned: totalAssigned,
      expended: totalExpended,
      closingBalance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBases = async (req, res) => {
  try {
    const where =
      req.user.role === 'BASE_COMMANDER' ? { id: req.user.baseId } : undefined;
    const bases = await prisma.base.findMany({ where, orderBy: { name: 'asc' } });
    res.json(bases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEquipmentTypes = async (_req, res) => {
  try {
    const types = await prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
