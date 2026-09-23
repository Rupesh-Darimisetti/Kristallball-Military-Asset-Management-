import prisma from '../config/db.js';

export const logAudit = async (userId, action, details) => {
  await prisma.auditLog.create({
    data: { userId, action, details },
  });
};

export const auditLogger = (action, getDetails) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const details = typeof getDetails === 'function' ? getDetails(req, body) : getDetails;
          await logAudit(req.user.id, action, details);
        } catch (err) {
          console.error('Audit log failed:', err.message);
        }
      }
      return originalJson(body);
    };
    next();
  };
};
