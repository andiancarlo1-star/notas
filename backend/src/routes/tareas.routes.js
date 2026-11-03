// src/routes/tareas.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verificarMaestro } = require("../middlewares/auth.middleware");

/**
 * POST /api/tareas
 * Crea una tarea y genera tarea_detalle para todos los alumnos del grado de esa materia
 */
// src/routes/tareas.routes.js
router.post("/", verificarMaestro, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const maestroId = req.user?.id_usuario;
    const { materia_id, bimestre_id = null, titulo, descripcion = null, fecha_entrega = null, puntaje_maximo = 100, ponderacion = 100 } = req.body;

    if (!materia_id || !titulo?.trim() || Number(puntaje_maximo) <= 0 || Number(ponderacion) <= 0) {
      conn.release();
      return res.status(400).json({ msg: "Faltan campos obligatorios (materia_id, titulo)" });
    }

    // seguridad: el maestro debe impartir la materia
    const [asignacion] = await conn.query(
      "SELECT 1 FROM materias_maestros WHERE maestro_id = ? AND materia_id = ? LIMIT 1",
      [maestroId, materia_id]
    );
    if (asignacion.length === 0) {
      conn.release();
      return res.status(403).json({ msg: "No puedes crear tareas en materias no asignadas" });
    }
    if (bimestre_id) {
      const [bimestre] = await conn.query('SELECT estado FROM bimestres WHERE id_bimestre = ? LIMIT 1', [bimestre_id]);
      if (bimestre.length === 0 || bimestre[0].estado !== 'ABIERTO') {
        conn.release();
        return res.status(409).json({ msg: 'El bimestre no existe o ya fue cerrado' });
      }
    }

    await conn.beginTransaction();

    // 1) Crear la tarea
    const [result] = await conn.query(
      `INSERT INTO tareas (materia_id, maestro_id, bimestre_id, titulo, descripcion, fecha_entrega, puntaje_maximo, ponderacion, estado, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVA', NOW())`,
      [materia_id, maestroId, bimestre_id, titulo.trim(), descripcion, fecha_entrega, puntaje_maximo, ponderacion]
    );
    const tareaId = result.insertId;

    // 2) Asignar la tarea a todos los alumnos del grado de la materia, evitando duplicados
    const [gradoRow] = await conn.query(
      "SELECT grado_id FROM materias WHERE id_materia = ? LIMIT 1",
      [materia_id]
    );
    const gradoId = gradoRow[0].grado_id;

    await conn.query(
      `
      INSERT INTO tarea_detalle (tarea_id, alumno_id, punteo, entregado, observacion, created_at)
      SELECT ?, a.id_alumno, NULL, 0, NULL, NOW()
      FROM alumnos a
      LEFT JOIN tarea_detalle td 
        ON td.alumno_id = a.id_alumno AND td.tarea_id = ?
      WHERE a.grado_id = ? AND td.alumno_id IS NULL
      `,
      [tareaId, tareaId, gradoId]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      id_tarea: tareaId,
      materia_id,
      maestro_id: maestroId,
      titulo: titulo.trim(),
      descripcion,
      fecha_entrega,
      bimestre_id,
      puntaje_maximo,
      ponderacion,
      estado: "ACTIVA",
      msg: "✅ Tarea creada y asignada a todos los alumnos del grado",
    });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    conn.release();
    console.error("[POST /api/tareas] error:", err);
    res.status(500).json({ msg: "Error al crear tarea" });
  }
});


/**
 * GET /api/tareas/por-materia/:materiaId
 * Devuelve todas las tareas de una materia (del maestro autenticado)
 */
router.get("/por-materia/:materiaId", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { materiaId } = req.params;

    const [asignacion] = await pool.query(
      "SELECT 1 FROM materias_maestros WHERE maestro_id = ? AND materia_id = ? LIMIT 1",
      [maestroId, materiaId]
    );
    if (asignacion.length === 0) {
      return res.status(403).json({ msg: "No autorizado para ver tareas de esta materia" });
    }

    const [rows] = await pool.query(
      `SELECT id_tarea, titulo, descripcion, fecha_entrega, puntaje_maximo, ponderacion, bimestre_id, estado, created_at
       FROM tareas
       WHERE materia_id = ? AND maestro_id = ?
       ORDER BY created_at DESC`,
      [materiaId, maestroId]
    );

    res.json(rows);
  } catch (err) {
    console.error("[GET /api/tareas/por-materia/:materiaId] error:", err);
    res.status(500).json({ msg: "Error al obtener tareas" });
  }
});

/**
 * GET /api/tareas/:tareaId
 */
router.get("/:tareaId", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;

    const [rows] = await pool.query(
      `SELECT t.id_tarea, t.materia_id, t.maestro_id, t.bimestre_id, t.titulo, t.descripcion,
              t.fecha_entrega, t.puntaje_maximo, t.ponderacion, t.estado, t.created_at
       FROM tareas t
       WHERE t.id_tarea = ? AND t.maestro_id = ?`,
      [tareaId, maestroId]
    );

    if (rows.length === 0) return res.status(404).json({ msg: "Tarea no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/tareas/:tareaId] error:", err);
    res.status(500).json({ msg: "Error al obtener tarea" });
  }
});

/**
 * GET /api/tareas/:tareaId/detalle
 * Devuelve los alumnos de la tarea para asignar punteo
 */
router.get("/:tareaId/detalle", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;

    // seguridad: la tarea es del maestro
    const [own] = await pool.query(
      "SELECT puntaje_maximo, estado FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado" });

    const [rows] = await pool.query(
      `
      SELECT 
        td.alumno_id, td.punteo, td.entregado, td.observacion,
        a.apellidos, a.nombres, e.archivo_nombre, e.archivo_url,
        e.comentario AS entrega_comentario, e.entregado_at
      FROM tarea_detalle td
      JOIN alumnos a ON a.id_alumno = td.alumno_id
      LEFT JOIN entregas_tareas e ON e.tarea_id = td.tarea_id AND e.alumno_id = td.alumno_id
      WHERE td.tarea_id = ?
      ORDER BY a.apellidos, a.nombres
      `,
      [tareaId]
    );

    res.json(rows.map(r => ({
      alumno_id: r.alumno_id,
      alumno_nombre: `${r.apellidos} ${r.nombres}`,
      punteo: r.punteo,
      entregado: !!r.entregado,
      observacion: r.observacion,
      archivo_nombre: r.archivo_nombre,
      archivo_url: r.archivo_url,
      entrega_comentario: r.entrega_comentario,
      entregado_at: r.entregado_at
    })));
  } catch (err) {
    console.error("[GET /api/tareas/:tareaId/detalle] error:", err);
    res.status(500).json({ msg: "Error al obtener detalle" });
  }
});

/**
 * PATCH /api/tareas/:tareaId/detalle/:alumnoId
 * Actualiza una nota puntual
 */
router.patch("/:tareaId/detalle/:alumnoId", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId, alumnoId } = req.params;
    const { punteo = null, entregado = false, observacion = null } = req.body || {};

    const [own] = await pool.query(
      "SELECT estado, puntaje_maximo FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado" });
    if (own[0].estado !== 'ACTIVA') return res.status(409).json({ msg: 'La tarea está cerrada' });
    if (punteo !== null && (!Number.isFinite(Number(punteo)) || Number(punteo) < 0 || Number(punteo) > Number(own[0].puntaje_maximo))) return res.status(400).json({ msg: `El punteo debe estar entre 0 y ${own[0].puntaje_maximo}` });

    const [r] = await pool.query(
      `
      UPDATE tarea_detalle
      SET punteo = ?, entregado = ?, observacion = ?
      WHERE tarea_id = ? AND alumno_id = ?
      `,
      [punteo, entregado ? 1 : 0, observacion, tareaId, alumnoId]
    );

    return r.affectedRows > 0
      ? res.sendStatus(204)
      : res.status(404).json({ msg: "Detalle no encontrado" });
  } catch (err) {
    console.error("[PATCH /api/tareas/:tareaId/detalle/:alumnoId] error:", err);
    res.status(500).json({ msg: "No se pudo actualizar la nota" });
  }
});

/**
 * PATCH /api/tareas/:tareaId/detalle
 * Bulk: { items: [{ alumnoId, punteo, entregado, observacion }, ...] }
 */
router.patch("/:tareaId/detalle", verificarMaestro, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      conn.release();
      return res.status(400).json({ msg: "Sin datos para actualizar" });
    }

    const [own] = await conn.query(
      "SELECT puntaje_maximo, estado FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) {
      conn.release();
      return res.status(403).json({ msg: "No autorizado" });
    }
    if (own[0].estado !== 'ACTIVA') {
      conn.release();
      return res.status(409).json({ msg: 'La tarea está cerrada' });
    }
    for (const item of items) {
      if (!Number.isInteger(Number(item.alumnoId)) || (item.punteo != null && (!Number.isFinite(Number(item.punteo)) || Number(item.punteo) < 0 || Number(item.punteo) > Number(own[0].puntaje_maximo)))) {
        conn.release();
        return res.status(400).json({ msg: 'Alumno o punteo inválido' });
      }
    }

    const ids = [...new Set(items.map(item => Number(item.alumnoId)))];
    const [assigned] = await conn.query(
      `SELECT alumno_id FROM tarea_detalle WHERE tarea_id = ? AND alumno_id IN (${ids.map(() => '?').join(',')})`,
      [tareaId, ...ids]
    );
    if (assigned.length !== ids.length) {
      conn.release();
      return res.status(403).json({ msg: 'Uno o más alumnos no están asignados a esta tarea' });
    }

    await conn.beginTransaction();

    for (const it of items) {
      await conn.query(
        `
        UPDATE tarea_detalle
        SET punteo = ?, entregado = ?, observacion = ?
        WHERE tarea_id = ? AND alumno_id = ?
        `,
        [it.punteo ?? null, it.entregado ? 1 : 0, it.observacion ?? null, tareaId, it.alumnoId]
      );
    }

    await conn.commit();
    conn.release();
    res.sendStatus(204);
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("[PATCH /api/tareas/:tareaId/detalle] error:", err);
    res.status(500).json({ msg: "No se pudieron actualizar las notas" });
  }
});

/**
 * PUT /api/tareas/:tareaId
 */
router.put("/:tareaId", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;
    const { titulo, descripcion = null, fecha_entrega = null } = req.body;

    if (!titulo) return res.status(400).json({ msg: "titulo es requerido" });

    const [own] = await pool.query(
      "SELECT 1 FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado para editar esta tarea" });

    await pool.query(
      `UPDATE tareas SET titulo = ?, descripcion = ?, fecha_entrega = ? WHERE id_tarea = ?`,
      [titulo, descripcion, fecha_entrega, tareaId]
    );
    res.json({ msg: "✅ Tarea actualizada" });
  } catch (err) {
    console.error("[PUT /api/tareas/:tareaId] error:", err);
    res.status(500).json({ msg: "Error al actualizar tarea" });
  }
});

/**
 * PATCH /api/tareas/:tareaId/estado
 */
router.patch("/:tareaId/estado", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;
    const { estado } = req.body;

    if (!["ACTIVA", "CERRADA"].includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }

    const [own] = await pool.query(
      "SELECT 1 FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado para cambiar estado de esta tarea" });

    await pool.query("UPDATE tareas SET estado = ? WHERE id_tarea = ?", [estado, tareaId]);
    res.json({ msg: "✅ Estado actualizado", estado });
  } catch (err) {
    console.error("[PATCH /api/tareas/:tareaId/estado] error:", err);
    res.status(500).json({ msg: "Error al cambiar estado" });
  }
});

/**
 * DELETE /api/tareas/:tareaId
 */
router.delete("/:tareaId", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const { tareaId } = req.params;

    const [own] = await pool.query(
      "SELECT 1 FROM tareas WHERE id_tarea = ? AND maestro_id = ? LIMIT 1",
      [tareaId, maestroId]
    );
    if (own.length === 0) return res.status(403).json({ msg: "No autorizado para eliminar esta tarea" });

    await pool.query("DELETE FROM tareas WHERE id_tarea = ?", [tareaId]);
    res.json({ msg: "🗑️ Tarea eliminada" });
  } catch (err) {
    console.error("[DELETE /api/tareas/:tareaId] error:", err);
    res.status(500).json({ msg: "Error al eliminar tarea" });
  }
});

module.exports = router;
