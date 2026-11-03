// src/routes/maestros.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verificarMaestro } = require("../middlewares/auth.middleware");

/**
 * GET /api/maestros/mis-grados
 */
router.get("/mis-grados", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const [rows] = await pool.query(`
      SELECT DISTINCT g.id_grado, g.nombre AS grado, g.seccion
      FROM materias_maestros mm
      JOIN materias m ON m.id_materia = mm.materia_id
      JOIN grados   g ON g.id_grado   = m.grado_id
      WHERE mm.maestro_id = ?
      ORDER BY g.nombre, g.seccion
    `, [maestroId]);

    res.json(rows);
  } catch (err) {
    console.error("[GET /mis-grados] error:", err);
    res.status(500).json({ msg: "Error al obtener grados" });
  }
});

/**
 * GET /api/maestros/grados/:gradoId/alumnos
 */
router.get("/grados/:gradoId/alumnos", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { gradoId } = req.params;

    const [perm] = await pool.query(`
      SELECT 1
      FROM materias_maestros mm
      JOIN materias m ON m.id_materia = mm.materia_id
      WHERE mm.maestro_id = ? AND m.grado_id = ?
      LIMIT 1
    `, [maestroId, gradoId]);

    if (perm.length === 0) return res.status(403).json({ msg: "No autorizado" });

    const [alumnos] = await pool.query(`
      SELECT
        a.id_alumno,
        a.nombres,
        a.apellidos,
        a.grado_id,
        a.created_at
      FROM alumnos a
      WHERE a.grado_id = ?
      ORDER BY a.apellidos, a.nombres
    `, [gradoId]);

    res.json(alumnos);
  } catch (err) {
    console.error("[GET /grados/:gradoId/alumnos] error:", err);
    res.status(500).json({ msg: "Error al obtener alumnos" });
  }
});

/**
 * GET /api/maestros/grados/:gradoId/alumnos-tareas
 */
router.get("/grados/:gradoId/alumnos-tareas", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { gradoId } = req.params;

    const [check] = await pool.query(
      `SELECT 1 
       FROM materias_maestros mm
       JOIN materias m ON m.id_materia = mm.materia_id
       WHERE mm.maestro_id = ? AND m.grado_id = ? LIMIT 1`,
      [maestroId, gradoId]
    );

    if (check.length === 0) return res.status(403).json({ msg: "No autorizado para ver este grado" });

    const [rows] = await pool.query(
      `SELECT 
         a.id_alumno,
         CONCAT(a.apellidos, ' ', a.nombres) AS alumno_nombre,
         t.id_tarea,
         t.titulo AS tarea_titulo,
         t.fecha_entrega,
         t.estado AS tarea_estado,
         CASE
           WHEN td.alumno_id IS NOT NULL THEN 'ASIGNADO'
           ELSE 'NO ASIGNADO'
         END AS estado_tarea,
         td.punteo AS nota
       FROM alumnos a
       JOIN materias m ON m.grado_id = a.grado_id
       JOIN tareas t ON t.materia_id = m.id_materia
       LEFT JOIN tarea_detalle td
         ON td.alumno_id = a.id_alumno
         AND td.tarea_id = t.id_tarea
       WHERE a.grado_id = ?
       ORDER BY a.apellidos, a.nombres, t.created_at`,
      [gradoId]
    );

    res.json(rows);
  } catch (err) {
    console.error("[GET /grados/:gradoId/alumnos-tareas] error:", err);
    res.status(500).json({ msg: "Error al obtener alumnos con tareas" });
  }
});

/**
 * PUT /api/maestros/tareas/:tareaId/nota
 */
router.put("/tareas/:tareaId/nota", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;
    const { alumnoId, nota } = req.body;

    const score = Number(nota);
    if (alumnoId == null || nota == null || !Number.isFinite(score) || score < 0) {
      return res.status(400).json({ msg: "Falta alumnoId o nota" });
    }

    const [check] = await pool.query(
      `SELECT t.puntaje_maximo, t.estado
       FROM tareas t
       WHERE t.id_tarea = ? AND t.maestro_id = ? LIMIT 1`,
      [tareaId, maestroId]
    );

    if (check.length === 0) return res.status(403).json({ msg: "No autorizado para modificar esta tarea" });
    if (check[0].estado !== 'ACTIVA') return res.status(409).json({ msg: 'La tarea está cerrada' });
    if (score > Number(check[0].puntaje_maximo)) return res.status(400).json({ msg: 'La nota supera el puntaje máximo' });

    const [existe] = await pool.query(
      `SELECT 1 FROM tarea_detalle WHERE tarea_id = ? AND alumno_id = ?`,
      [tareaId, alumnoId]
    );

    if (existe.length === 0) return res.status(403).json({ msg: 'El alumno no está asignado a esta tarea' });
    await pool.query(
      `UPDATE tarea_detalle SET punteo = ? WHERE tarea_id = ? AND alumno_id = ?`,
      [score, tareaId, alumnoId]
    );

    res.json({ msg: "Nota guardada correctamente" });
  } catch (err) {
    console.error("[PUT /tareas/:tareaId/nota] error:", err);
    res.status(500).json({ msg: "Error al guardar la nota" });
  }
});

/**
 * GET /api/maestros/tareas/:tareaId/nota/:alumnoId
 */
router.get("/tareas/:tareaId/nota/:alumnoId", verificarMaestro, async (req, res) => {
  try {
    const { tareaId, alumnoId } = req.params;
    const maestroId = req.user.id_usuario;

    const [own] = await pool.query(
      `SELECT 1 FROM tareas t WHERE t.id_tarea = ? AND t.maestro_id = ? LIMIT 1`,
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado" });

    const [rows] = await pool.query(
      `SELECT punteo FROM tarea_detalle WHERE tarea_id = ? AND alumno_id = ?`,
      [tareaId, alumnoId]
    );

    res.json({ nota: rows[0]?.punteo ?? null });
  } catch (err) {
    console.error("[GET /tareas/:tareaId/nota/:alumnoId] error:", err);
    res.status(500).json({ msg: "Error al obtener la nota" });
  }
});

module.exports = router;
