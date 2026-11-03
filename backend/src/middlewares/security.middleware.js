const pool = require('../config/db');
const rateLimitStore = new Map();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.start > entry.windowMs) rateLimitStore.delete(key);
  }
}, 60_000);
cleanupTimer.unref();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message = 'Demasiadas peticiones' } = {}) {
  return (req, res, next) => {
    const key = req.ip + ':' + (req.baseUrl || '');
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.start > windowMs) {
      rateLimitStore.set(key, { start: now, count: 1, windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > max) {
      return res.status(429).json({ msg: message });
    }
    next();
  };
}

function auditLog(action) {
  return async (req, res, next) => {
    res.once('finish', () => {
      if (res.statusCode >= 400 || !req.user) return;
      const detail = JSON.stringify({ method: req.method, path: req.path, status: res.statusCode });
      pool.query(
        'INSERT INTO audit_log (usuario_id, accion, tabla, detalle, ip) VALUES (?, ?, ?, ?, ?)',
        [req.user.id_usuario, action, req.baseUrl, detail, req.ip]
      ).catch(() => {});
    });
    next();
  };
}

function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err.stack || err);
  res.status(err.status || 500).json({
    msg: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
}

function notFound(req, res) {
  res.status(404).json({ msg: 'Ruta no encontrada' });
}

module.exports = { rateLimit, auditLog, errorHandler, notFound };
