const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/db');
const { verificarAlumno, verificarMaestro } = require('../middlewares/auth.middleware');
const router = express.Router();

const directory = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(directory, { recursive: true });
const extensionByMime = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};
const storage = multer.diskStorage({
  destination: directory,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}${extensionByMime[file.mimetype]}`)
});
const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png'];
  cb(allowed.includes(file.mimetype) ? null : new Error('Tipo de archivo no permitido'), allowed.includes(file.mimetype));
} });

async function alumnoActual(userId) {
  const [rows] = await pool.query('SELECT id_alumno FROM alumnos WHERE usuario_id = ?', [userId]);
  return rows[0];
}

router.get('/mis-tareas', verificarAlumno, async (req, res) => {
  try {
    const alumno = await alumnoActual(req.user.id_usuario);
    if (!alumno) return res.status(404).json({ msg: 'Perfil de alumno no vinculado' });
    const [rows] = await pool.query(`SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_entrega, t.puntaje_maximo, t.estado, m.nombre AS materia,
      td.punteo, td.entregado, e.archivo_nombre, e.archivo_url, e.comentario, e.entregado_at
      FROM tarea_detalle td JOIN tareas t ON t.id_tarea = td.tarea_id JOIN materias m ON m.id_materia = t.materia_id
      LEFT JOIN entregas_tareas e ON e.tarea_id = t.id_tarea AND e.alumno_id = td.alumno_id
      WHERE td.alumno_id = ? ORDER BY t.fecha_entrega IS NULL, t.fecha_entrega DESC`, [alumno.id_alumno]);
    res.json(rows);
  } catch (err) {
    console.error('[entregas/mis-tareas]', err);
    res.status(500).json({ msg: 'Error al obtener tareas' });
  }
});

router.post('/tareas/:tareaId', verificarAlumno, upload.single('archivo'), async (req, res) => {
  try {
    const alumno = await alumnoActual(req.user.id_usuario);
    if (!alumno) return res.status(404).json({ msg: 'Perfil de alumno no vinculado' });
    const tareaId = Number(req.params.tareaId);
    const [details] = await pool.query(`SELECT t.estado FROM tarea_detalle td JOIN tareas t ON t.id_tarea = td.tarea_id WHERE td.tarea_id = ? AND td.alumno_id = ?`, [tareaId, alumno.id_alumno]);
    if (!details.length) return res.status(404).json({ msg: 'Tarea no asignada' });
    if (details[0].estado !== 'ACTIVA') return res.status(409).json({ msg: 'La tarea está cerrada' });
    if (!req.file && !req.body.comentario?.trim()) return res.status(400).json({ msg: 'Adjunta un archivo o escribe un comentario' });
    const fileUrl = req.file ? `/api/entregas/archivos/${req.file.filename}` : null;
    await pool.query(`INSERT INTO entregas_tareas (tarea_id, alumno_id, archivo_nombre, archivo_url, comentario) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE archivo_nombre = COALESCE(VALUES(archivo_nombre), archivo_nombre), archivo_url = COALESCE(VALUES(archivo_url), archivo_url), comentario = VALUES(comentario), entregado_at = NOW()`, [tareaId, alumno.id_alumno, req.file?.originalname || null, fileUrl, req.body.comentario?.trim() || null]);
    await pool.query('UPDATE tarea_detalle SET entregado = 1 WHERE tarea_id = ? AND alumno_id = ?', [tareaId, alumno.id_alumno]);
    res.status(201).json({ msg: 'Entrega registrada', archivo_url: fileUrl });
  } catch (err) {
    console.error('[entregas/tareas POST]', err);
    res.status(500).json({ msg: 'No se pudo registrar la entrega' });
  }
});

router.get('/archivos/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    if (!/^\d+-[0-9a-f-]{36}\.(pdf|docx|pptx|jpg|png)$/i.test(filename)) {
      return res.status(404).json({ msg: 'Archivo no encontrado' });
    }
    const [rows] = await pool.query(`
      SELECT e.archivo_nombre, t.maestro_id, a.usuario_id
      FROM entregas_tareas e
      JOIN tareas t ON t.id_tarea = e.tarea_id
      JOIN alumnos a ON a.id_alumno = e.alumno_id
      WHERE e.archivo_url IN (?, ?) LIMIT 1
    `, [`/api/entregas/archivos/${filename}`, `/uploads/${filename}`]);
    if (!rows.length) return res.status(404).json({ msg: 'Archivo no encontrado' });
    const row = rows[0];
    const allowed = ['admin', 'director'].includes(req.user.rol)
      || (req.user.rol === 'maestro' && String(row.maestro_id) === String(req.user.id_usuario))
      || (req.user.rol === 'alumno' && String(row.usuario_id) === String(req.user.id_usuario));
    if (!allowed) return res.status(403).json({ msg: 'No tienes acceso a este archivo' });

    const filePath = path.resolve(directory, filename);
    if (!filePath.startsWith(`${directory}${path.sep}`) || !fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'Archivo no encontrado' });
    }
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.download(filePath, path.basename(row.archivo_nombre || filename));
  } catch (err) {
    console.error('[GET /entregas/archivos]', err);
    return res.status(500).json({ msg: 'No se pudo obtener el archivo' });
  }
});

router.get('/tareas/:tareaId', verificarMaestro, async (req, res) => {
  const [rows] = await pool.query(`SELECT e.*, a.nombres, a.apellidos FROM entregas_tareas e JOIN tareas t ON t.id_tarea = e.tarea_id JOIN alumnos a ON a.id_alumno = e.alumno_id WHERE e.tarea_id = ? AND t.maestro_id = ? ORDER BY e.entregado_at DESC`, [req.params.tareaId, req.user.id_usuario]);
  res.json(rows);
});

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError || error.message === 'Tipo de archivo no permitido') return res.status(400).json({ msg: error.message });
  console.error('Entrega:', error); res.status(500).json({ msg: 'No se pudo guardar la entrega' });
});
module.exports = router;
