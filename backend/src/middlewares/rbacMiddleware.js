export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level.',
      });
    }
    next();
  };
};

export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
    req.query.baseId = String(req.user.baseId);
    req.scopedBaseId = req.user.baseId;
  }
  next();
};

export const assertBaseAccess = (baseId) => {
  return (req, res, next) => {
    if (req.user.role === 'ADMIN') return next();
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId === Number(baseId)) {
      return next();
    }
    return res.status(403).json({ message: 'Access Denied: Base scope violation.' });
  };
};
