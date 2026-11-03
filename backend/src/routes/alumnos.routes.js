const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarAdminODirector, verificarAlumno } = require('../middlewares/auth.middleware');

router.post('/', verificarAdminODirector, async (req, res) => {
  try {
    const { nombres, apellidos, grado_id } = req.body;
    if (!nombres?.trim() || !apellidos?.trim() || !grado_id) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }
    const [result] = await db.query(
      'INSERT INTO alumnos (nombres, apellidos, grado_id) VALUES (?, ?, ?)',
      [nombres.trim(), apellidos.trim(), grado_id]
    );
    res.status(201).json({ id_alumno: result.insertId, msg: 'Alumno creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear alumno' });
  }
});

router.get("/", verificarAdminODirector, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id_alumno, a.nombres, a.apellidos, a.usuario_id, a.grado_id, g.nombre AS grado_nombre, g.seccion
      FROM alumnos a
      JOIN grados g ON a.grado_id = g.id_grado
      ORDER BY g.nombre, g.seccion, a.apellidos, a.nombres
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener alumnos" });
  }
});

router.get("/grado/:id", verificarAdminODirector, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT a.id_alumno, a.nombres, a.apellidos, a.usuario_id, g.nombre AS grado_nombre, g.seccion
      FROM alumnos a
      JOIN grados g ON a.grado_id = g.id_grado
      WHERE g.id_grado = ?
      ORDER BY a.apellidos, a.nombres
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener alumnos por grado" });
  }
});

router.get('/mi-perfil', verificarAlumno, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT a.id_alumno, a.nombres, a.apellidos, g.nombre AS grado, g.seccion
      FROM alumnos a JOIN grados g ON g.id_grado = a.grado_id WHERE a.usuario_id = ?`, [req.user.id_usuario]);
    if (!rows.length) return res.status(404).json({ msg: 'Perfil de alumno no vinculado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /mi-perfil] error:', err);
    res.status(500).json({ msg: 'Error al obtener perfil' });
  }
});

router.put('/:id', verificarAdminODirector, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, grado_id } = req.body;
    if (!nombres?.trim() || !apellidos?.trim() || !grado_id) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }
    const [result] = await db.query(
      'UPDATE alumnos SET nombres = ?, apellidos = ?, grado_id = ? WHERE id_alumno = ?',
      [nombres.trim(), apellidos.trim(), grado_id, id]
    );
    if (!result.affectedRows) return res.status(404).json({ msg: 'Alumno no encontrado' });
    res.json({ msg: 'Alumno actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar alumno' });
  }
});

router.delete('/:id', verificarAdminODirector, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM entregas_tareas WHERE alumno_id = ?', [id]);
    await db.query('DELETE FROM tarea_detalle WHERE alumno_id = ?', [id]);
    await db.query('DELETE FROM cierre_bimestre_alumnos WHERE alumno_id = ?', [id]);
    const [result] = await db.query('DELETE FROM alumnos WHERE id_alumno = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ msg: 'Alumno no encontrado' });
    res.json({ msg: 'Alumno eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al eliminar alumno' });
  }
});

router.patch('/:id/usuario', verificarAdminODirector, async (req, res) => {
  try {
    const alumnoId = Number(req.params.id); const usuarioId = Number(req.body.usuario_id);
    if (!Number.isInteger(alumnoId) || !Number.isInteger(usuarioId)) return res.status(400).json({ msg: 'IDs inválidos' });
    const [usuarios] = await db.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'alumno'", [usuarioId]);
    if (!usuarios.length) return res.status(400).json({ msg: 'La cuenta debe existir y tener rol alumno' });
    const [result] = await db.query('UPDATE alumnos SET usuario_id = ? WHERE id_alumno = ?', [usuarioId, alumnoId]);
    if (!result.affectedRows) return res.status(404).json({ msg: 'Alumno no encontrado' });
    res.json({ msg: 'Cuenta de alumno vinculada' });
  } catch (error) { res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ msg: 'No se pudo vincular la cuenta' }); }
});

module.exports = router;
