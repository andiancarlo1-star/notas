const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarAdminODirector, verificarMaestro, verificarAutenticado } = require("../middlewares/auth.middleware");

router.get("/", verificarAdminODirector, async (req, res) => {
  try {
    const [grados] = await db.query(`
      SELECT g.*, u.nombre AS guia_nombre
      FROM grados g
      LEFT JOIN usuarios u ON g.maestro_guia_id = u.id_usuario
      ORDER BY g.nombre, g.seccion
    `);
    res.json(grados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener grados" });
  }
});

router.get("/mios", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    const [grados] = await db.query(`
      SELECT g.id_grado, g.nombre AS grado, g.seccion
      FROM grados g
      WHERE g.maestro_guia_id = ?
      ORDER BY g.nombre, g.seccion
    `, [maestroId]);
    res.json(grados);
  } catch (err) {
    console.error("[GET /grados/mios]", err);
    res.status(500).json({ msg: "Error al obtener grados del maestro guía" });
  }
});

router.get("/:gradoId/boleta", verificarAutenticado, async (req, res) => {
  try {
    const { gradoId } = req.params;
    const bimestreId = Number(req.query.bimestre_id);
    if (!bimestreId) return res.status(400).json({ msg: "bimestre_id es obligatorio" });

    let alumnoId = null;
    if (req.user.rol === "maestro") {
      const [g] = await db.query("SELECT maestro_guia_id FROM grados WHERE id_grado = ?", [gradoId]);
      if (!g.length || g[0].maestro_guia_id !== req.user.id_usuario) {
        return res.status(403).json({ msg: "No eres el maestro guía de este grado" });
      }
    } else if (req.user.rol === "alumno") {
      const [a] = await db.query("SELECT id_alumno, grado_id FROM alumnos WHERE usuario_id = ?", [req.user.id_usuario]);
      if (!a.length || String(a[0].grado_id) !== String(gradoId)) {
        return res.status(403).json({ msg: "No puedes consultar la boleta de este grado" });
      }
      alumnoId = a[0].id_alumno;
    } else if (!['admin', 'director'].includes(req.user.rol)) {
      return res.status(403).json({ msg: "Rol sin permiso para consultar boletas" });
    }

    const [alumnos] = await db.query(`
      SELECT a.id_alumno, a.nombres, a.apellidos,
        cb.materia_id, m.nombre AS materia, cb.promedio
      FROM alumnos a
      JOIN cierre_bimestre_alumnos cb ON cb.alumno_id = a.id_alumno
      JOIN materias m ON m.id_materia = cb.materia_id
      WHERE a.grado_id = ? AND cb.bimestre_id = ? AND (? IS NULL OR a.id_alumno = ?)
      ORDER BY a.apellidos, a.nombres, m.nombre
    `, [gradoId, bimestreId, alumnoId, alumnoId]);
    res.json(alumnos);
  } catch (err) {
    console.error("[GET /grados/:gradoId/boleta]", err);
    res.status(500).json({ msg: "Error al obtener boleta del grado" });
  }
});

router.post("/", verificarAdminODirector, async (req, res) => {
  try {
    const { nombre, seccion, maestro_guia_id } = req.body;
    if (!nombre?.trim() || !seccion?.trim()) {
      return res.status(400).json({ msg: "Nombre y sección son obligatorios" });
    }
    const [result] = await db.query(
      "INSERT INTO grados (nombre, seccion, maestro_guia_id) VALUES (?, ?, ?)",
      [nombre.trim(), seccion.trim(), maestro_guia_id || null]
    );
    res.status(201).json({ id_grado: result.insertId, nombre: nombre.trim(), seccion: seccion.trim() });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ msg: "Ya existe un grado con ese nombre y sección" });
    }
    console.error(err);
    res.status(500).json({ msg: "Error al crear grado" });
  }
});

router.put("/:id", verificarAdminODirector, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, seccion, maestro_guia_id } = req.body;
    if (!nombre?.trim() || !seccion?.trim()) {
      return res.status(400).json({ msg: "Nombre y sección son obligatorios" });
    }
    const [result] = await db.query(
      "UPDATE grados SET nombre = ?, seccion = ?, maestro_guia_id = ? WHERE id_grado = ?",
      [nombre.trim(), seccion.trim(), maestro_guia_id || null, id]
    );
    if (!result.affectedRows) return res.status(404).json({ msg: "Grado no encontrado" });
    res.json({ msg: "Grado actualizado" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ msg: "Ya existe un grado con ese nombre y sección" });
    }
    console.error(err);
    res.status(500).json({ msg: "Error al actualizar grado" });
  }
});

router.delete("/:id", verificarAdminODirector, async (req, res) => {
  try {
    const { id } = req.params;
    const [alumnos] = await db.query("SELECT COUNT(*) AS total FROM alumnos WHERE grado_id = ?", [id]);
    if (alumnos[0].total > 0) {
      return res.status(409).json({ msg: "No se puede eliminar: tiene alumnos asignados" });
    }
    const [materias] = await db.query("SELECT COUNT(*) AS total FROM materias WHERE grado_id = ?", [id]);
    if (materias[0].total > 0) {
      return res.status(409).json({ msg: "No se puede eliminar: tiene materias asignadas" });
    }
    const [result] = await db.query("DELETE FROM grados WHERE id_grado = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ msg: "Grado no encontrado" });
    res.json({ msg: "Grado eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al eliminar grado" });
  }
});

module.exports = router;
