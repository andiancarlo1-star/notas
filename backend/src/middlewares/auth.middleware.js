// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// Usa SIEMPRE la misma clave (env o fallback al literal que ya usabas)
const SECRET = process.env.JWT_SECRET || 'desarrollo-no-usar-en-produccion';

// Extrae token de Authorization: Bearer ... (y opcionalmente de cookie)
function extraerToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies?.token) return req.cookies.token; // opcional si usas cookies
  return null;
}

// Normaliza el usuario al mismo shape SIEMPRE: req.user = { id_usuario, rol, nombre }
function setReqUser(req, decoded) {
  req.user = {
    id_usuario: decoded.id_usuario ?? decoded.id ?? decoded.userId,
    rol: decoded.rol,
    nombre: decoded.nombre,
  };
}

/* ------------------------------ Middlewares ------------------------------ */

function verificarAdmin(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No token, acceso denegado' });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.rol !== 'admin') {
      return res.status(403).json({ msg: 'Acceso solo para administradores' });
    }
    setReqUser(req, decoded);
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

function verificarDirector(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No token, acceso denegado' });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.rol !== 'director') {
      return res.status(403).json({ msg: 'Acceso solo para directores' });
    }
    setReqUser(req, decoded);
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

function verificarAdminODirector(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No token, acceso denegado' });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.rol !== 'admin' && decoded.rol !== 'director') {
      return res.status(403).json({ msg: 'Acceso solo para administradores o directores' });
    }
    setReqUser(req, decoded);
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

function verificarMaestro(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, SECRET); // <-- misma clave
    if (decoded.rol !== 'maestro') {
      return res.status(403).json({ msg: 'No eres maestro' });
    }
    setReqUser(req, decoded); // <-- ahora SIEMPRE req.user
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

function verificarAlumno(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No autorizado' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.rol !== 'alumno') return res.status(403).json({ msg: 'Acceso solo para alumnos' });
    setReqUser(req, decoded);
    next();
  } catch (_err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

function verificarAutenticado(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ msg: 'No token, acceso denegado' });
  try {
    const decoded = jwt.verify(token, SECRET);
    setReqUser(req, decoded);
    next();
  } catch (_err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

module.exports = { verificarAdmin, verificarDirector, verificarAdminODirector, verificarMaestro, verificarAlumno, verificarAutenticado };
