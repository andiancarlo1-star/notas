const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const { verificarAdminODirector, verificarAlumno, verificarAutenticado } = require('../middlewares/auth.middleware');

const router = express.Router();
const esNumero = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

router.post('/ciclos', verificarAdminODirector, async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin } = req.body;
  const errores = [];
  if (!nombre?.trim()) errores.push('El nombre es obligatorio');
  if (!fecha_inicio) errores.push('La fecha de inicio es obligatoria');
  if (!fecha_fin) errores.push('La fecha de fin es obligatoria');
  if (fecha_inicio && fecha_fin && fecha_inicio >= fecha_fin) errores.push('La fecha de fin debe ser posterior a la de inicio');
  if (errores.length) return res.status(400).json({ msg: errores.join('. ') });
  try {
    const [result] = await pool.query('INSERT INTO ciclos_escolares (nombre, fecha_inicio, fecha_fin) VALUES (?, ?, ?)', [nombre.trim(), fecha_inicio, fecha_fin]);
    res.status(201).json({ id_ciclo: result.insertId, nombre: nombre.trim() });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ msg: 'No se pudo crear el ciclo' });
  }
});

router.get('/ciclos', verificarAdminODirector, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ciclos_escolares ORDER BY fecha_inicio DESC');
    res.json(rows);
  } catch (error) {
    console.error('[GET /ciclos]', error);
    res.status(500).json({ msg: 'Error al obtener ciclos' });
  }
});

router.post('/bimestres', verificarAdminODirector, async (req, res) => {
  const { ciclo_id, numero, nombre, fecha_inicio, fecha_fin } = req.body;
  const errores = [];
  if (!ciclo_id || !esNumero(ciclo_id)) errores.push('Debes seleccionar un ciclo válido');
  if (numero === undefined || numero === null || !Number.isInteger(Number(numero))) errores.push('El número de bimestre debe ser un número entero');
  else if (Number(numero) < 1 || Number(numero) > 4) errores.push('El número de bimestre debe estar entre 1 y 4');
  if (!nombre?.trim()) errores.push('El nombre del bimestre es obligatorio');
  if (!fecha_inicio) errores.push('La fecha de inicio es obligatoria');
  if (!fecha_fin) errores.push('La fecha de fin es obligatoria');
  if (fecha_inicio && fecha_fin && fecha_inicio >= fecha_fin) errores.push('La fecha de fin debe ser posterior a la de inicio');
  if (errores.length) return res.status(400).json({ msg: errores.join('. ') });
  try {
    const [result] = await pool.query('INSERT INTO bimestres (ciclo_id, numero, nombre, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)', [ciclo_id, numero, nombre.trim(), fecha_inicio, fecha_fin]);
    res.status(201).json({ id_bimestre: result.insertId });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ msg: 'No se pudo crear el bimestre' });
  }
});

router.get('/bimestres', verificarAutenticado, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT b.*, c.nombre AS ciclo FROM bimestres b JOIN ciclos_escolares c ON c.id_ciclo = b.ciclo_id WHERE (? IS NULL OR b.ciclo_id = ?) ORDER BY b.numero', [req.query.ciclo_id || null, req.query.ciclo_id || null]);
    res.json(rows);
  } catch (error) {
    console.error('[GET /bimestres]', error);
    res.status(500).json({ msg: 'Error al obtener bimestres' });
  }
});

router.post('/bimestres/:id/cerrar', verificarAdminODirector, async (req, res) => {
  const bimestreId = Number(req.params.id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [periodos] = await conn.query('SELECT estado FROM bimestres WHERE id_bimestre = ? FOR UPDATE', [bimestreId]);
    if (!periodos.length) { await conn.rollback(); return res.status(404).json({ msg: 'Bimestre no encontrado' }); }
    if (periodos[0].estado === 'CERRADO') { await conn.rollback(); return res.status(409).json({ msg: 'El bimestre ya está cerrado' }); }
    await conn.query(`INSERT INTO cierre_bimestre_alumnos (bimestre_id, alumno_id, materia_id, promedio)
      SELECT t.bimestre_id, td.alumno_id, t.materia_id,
      ROUND(COALESCE(SUM((td.punteo / NULLIF(t.puntaje_maximo, 0)) * t.ponderacion) / NULLIF(SUM(t.ponderacion), 0) * 100, 0), 2)
      FROM tareas t JOIN tarea_detalle td ON td.tarea_id = t.id_tarea
      WHERE t.bimestre_id = ? GROUP BY t.bimestre_id, td.alumno_id, t.materia_id
      ON DUPLICATE KEY UPDATE promedio = VALUES(promedio), cerrado_at = NOW()`, [bimestreId]);
    await conn.query("UPDATE tareas SET estado = 'CERRADA' WHERE bimestre_id = ?", [bimestreId]);
    await conn.query("UPDATE bimestres SET estado = 'CERRADO', cerrado_por = ?, cerrado_at = NOW() WHERE id_bimestre = ?", [req.user.id_usuario, bimestreId]);
    await conn.commit();
    res.json({ msg: 'Bimestre cerrado. Las calificaciones fueron consolidadas.' });
  } catch (error) {
    await conn.rollback();
    console.error('Cierre de bimestre:', error);
    res.status(500).json({ msg: 'No se pudo cerrar el bimestre' });
  } finally { conn.release(); }
});

async function obtenerAlumnoAutorizado(req, res) {
  const alumnoId = Number(req.params.alumnoId);
  if (!esNumero(alumnoId)) { res.status(400).json({ msg: 'Alumno inválido' }); return null; }
  const [alumnos] = await pool.query('SELECT a.*, g.nombre AS grado, g.seccion FROM alumnos a JOIN grados g ON g.id_grado = a.grado_id WHERE a.id_alumno = ?', [alumnoId]);
  if (!alumnos.length) { res.status(404).json({ msg: 'Alumno no encontrado' }); return null; }
  return alumnos[0];
}

async function tarjeta(req, res) {
  const alumno = await obtenerAlumnoAutorizado(req, res); if (!alumno) return;
  const bimestreId = Number(req.query.bimestre_id);
  if (!esNumero(bimestreId)) return res.status(400).json({ msg: 'bimestre_id es obligatorio' });
  const [bimestres] = await pool.query('SELECT b.*, c.nombre AS ciclo FROM bimestres b JOIN ciclos_escolares c ON c.id_ciclo = b.ciclo_id WHERE b.id_bimestre = ?', [bimestreId]);
  if (!bimestres.length) return res.status(404).json({ msg: 'Bimestre no encontrado' });
  const [notas] = await pool.query(`SELECT m.nombre, c.promedio FROM cierre_bimestre_alumnos c JOIN materias m ON m.id_materia = c.materia_id WHERE c.bimestre_id = ? AND c.alumno_id = ? ORDER BY m.nombre`, [bimestreId, alumno.id_alumno]);
  const promedio = notas.length ? (notas.reduce((total, nota) => total + Number(nota.promedio), 0) / notas.length).toFixed(2) : '0.00';
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const safeName = `${alumno.apellidos}-${alumno.nombres}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="tarjeta-${safeName}.pdf"`);
  doc.pipe(res);
  doc.fillColor('#17365d').fontSize(21).text('Tarjeta de Calificaciones', { align: 'center' });
  doc.moveDown(0.5).fillColor('#333').fontSize(11).text(`Ciclo escolar: ${bimestres[0].ciclo}`, { align: 'center' });
  doc.moveDown(1.5).fontSize(12).text(`Estudiante: ${alumno.nombres} ${alumno.apellidos}`);
  doc.text(`Grado: ${alumno.grado} - ${alumno.seccion}`);
  doc.text(`Periodo: ${bimestres[0].nombre}`);
  doc.moveDown();
  const x = 55; const y = doc.y; const width = 485;
  doc.fillColor('#17365d').rect(x, y, width, 26).fill();
  doc.fillColor('white').fontSize(11).text('Materia', x + 12, y + 8).text('Promedio', x + 390, y + 8, { width: 80, align: 'right' });
  let rowY = y + 26;
  notas.forEach((nota, index) => { if (index % 2 === 0) doc.fillColor('#edf3f8').rect(x, rowY, width, 25).fill(); doc.fillColor('#222').fontSize(11).text(nota.nombre, x + 12, rowY + 7).text(Number(nota.promedio).toFixed(2), x + 390, rowY + 7, { width: 80, align: 'right' }); rowY += 25; });
  doc.fillColor('#17365d').rect(x, rowY + 8, width, 31).fill();
  doc.fillColor('white').fontSize(13).text(`Promedio general: ${promedio}`, x + 12, rowY + 17, { align: 'right', width: width - 24 });
  doc.fillColor('#555').fontSize(9).text('Documento generado por Control Escolar. Las notas corresponden a un periodo cerrado.', 50, 760, { align: 'center' });
  doc.end();
}

router.get('/alumnos/:alumnoId/tarjeta.pdf', verificarAdminODirector, async (req, res, next) => {
  try { await tarjeta(req, res); } catch (error) { next(error); }
});
router.get('/mis-bimestres', verificarAlumno, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT b.id_bimestre, b.nombre, b.numero, b.estado, c.nombre AS ciclo
      FROM cierre_bimestre_alumnos cb
      JOIN bimestres b ON b.id_bimestre = cb.bimestre_id
      JOIN ciclos_escolares c ON c.id_ciclo = b.ciclo_id
      JOIN alumnos a ON a.id_alumno = cb.alumno_id
      WHERE a.usuario_id = ? AND b.estado = 'CERRADO'
      ORDER BY c.nombre DESC, b.numero
    `, [req.user.id_usuario]);
    res.json(rows);
  } catch (error) {
    console.error('[GET /mis-bimestres]', error);
    res.status(500).json({ msg: 'Error al obtener bimestres' });
  }
});

router.get('/mi-tarjeta.pdf', verificarAlumno, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id_alumno FROM alumnos WHERE usuario_id = ?', [req.user.id_usuario]);
    if (!rows.length) return res.status(404).json({ msg: 'Perfil de alumno no vinculado' });
    req.params.alumnoId = rows[0].id_alumno;
    await tarjeta(req, res);
  } catch (error) { next(error); }
});
module.exports = router;
