const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verificarAdminODirector, verificarMaestro } = require('../middlewares/auth.middleware');

router.post("/", verificarAdminODirector, async (req, res) => {
  const { nombre, grado_id } = req.body;
  if (!nombre?.trim() || !grado_id) return res.status(400).json({ msg: "Faltan datos" });
  try {
    const [resultado] = await pool.query(
      "INSERT INTO materias (nombre, grado_id) VALUES (?, ?)",
      [nombre.trim(), grado_id]
    );
    res.status(201).json({ id_materia: resultado.insertId, nombre: nombre.trim(), grado_id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ msg: "Ya existe una materia con ese nombre en este grado" });
    }
    console.error(err);
    res.status(500).json({ msg: "Error al crear materia" });
  }
});

router.get("/grados", verificarAdminODirector, async (req, res) => {
  try {
    const [grados] = await pool.query("SELECT id_grado, nombre, seccion FROM grados ORDER BY nombre, seccion");
    res.json(grados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al cargar grados" });
  }
});

router.get("/por-grado/:gradoId", verificarAdminODirector, async (req, res) => {
  const { gradoId } = req.params;
  try {
    const [materias] = await pool.query(
      "SELECT * FROM materias WHERE grado_id = ? ORDER BY nombre",
      [gradoId]
    );
    res.json(materias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener materias" });
  }
});

router.get("/todas", verificarAdminODirector, async (req, res) => {
  try {
    const [materias] = await pool.query(`
      SELECT m.id_materia, m.nombre, m.grado_id, g.nombre AS grado_nombre, g.seccion
      FROM materias m
      JOIN grados g ON m.grado_id = g.id_grado
      ORDER BY g.nombre, g.seccion, m.nombre
    `);
    res.json(materias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener materias" });
  }
});

router.get("/asignadas", verificarAdminODirector, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT mm.id, u.nombre AS maestro, u.id_usuario AS maestro_id, m.nombre AS materia, m.id_materia, g.nombre AS grado, g.seccion
      FROM materias_maestros mm
      JOIN usuarios u ON mm.maestro_id = u.id_usuario
      JOIN materias m ON mm.materia_id = m.id_materia
      JOIN grados g ON m.grado_id = g.id_grado
      ORDER BY u.nombre, g.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener materias asignadas" });
  }
});

router.get("/asignadas/mias", verificarMaestro, async (req, res) => {
  try {
    const maestroId = req.user?.id_usuario;
    if (!maestroId) return res.status(400).json({ msg: "No se pudo determinar el maestro desde el token" });
    const [rows] = await pool.query(`
      SELECT m.id_materia AS materia_id, m.nombre AS materia_nombre, g.nombre AS grado, g.seccion
      FROM materias_maestros mm
      JOIN materias m ON m.id_materia = mm.materia_id
      JOIN grados g ON g.id_grado = m.grado_id
      WHERE mm.maestro_id = ?
      ORDER BY g.nombre, m.nombre
    `, [maestroId]);
    res.json(rows);
  } catch (err) {
    console.error("Error /asignadas/mias:", err);
    res.status(500).json({ error: "Error al cargar mis materias" });
  }
});

router.post("/asignar", verificarAdminODirector, async (req, res) => {
  const { maestroId, materiaId } = req.body;
  if (!maestroId || !materiaId) return res.status(400).json({ msg: "Faltan datos" });
  try {
    await pool.query(
      "INSERT INTO materias_maestros (maestro_id, materia_id) VALUES (?, ?)",
      [maestroId, materiaId]
    );
    res.status(201).json({ msg: "Maestro asignado correctamente" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ msg: "Este maestro ya está asignado a esta materia" });
    }
    console.error(err);
    res.status(500).json({ msg: "Error al asignar maestro" });
  }
});

router.delete("/asignar/:id", verificarAdminODirector, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM materias_maestros WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ msg: "Asignación no encontrada" });
    res.json({ msg: "Asignación eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al eliminar asignación" });
  }
});

router.get("/:id", verificarAdminODirector, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT m.*, g.nombre AS grado_nombre, g.seccion FROM materias m JOIN grados g ON g.id_grado = m.grado_id WHERE m.id_materia = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: "Materia no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener materia" });
  }
});

router.put("/:id", verificarAdminODirector, async (req, res) => {
  try {
    const { nombre, grado_id } = req.body;
    if (!nombre?.trim() || !grado_id) return res.status(400).json({ msg: "Faltan datos" });
    const [result] = await pool.query(
      "UPDATE materias SET nombre = ?, grado_id = ? WHERE id_materia = ?",
      [nombre.trim(), grado_id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ msg: "Materia no encontrada" });
    res.json({ msg: "Materia actualizada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ msg: "Ya existe una materia con ese nombre en este grado" });
    }
    console.error(err);
    res.status(500).json({ msg: "Error al actualizar materia" });
  }
});

router.delete("/:id", verificarAdminODirector, async (req, res) => {
  try {
    const [tareas] = await pool.query("SELECT COUNT(*) AS total FROM tareas WHERE materia_id = ?", [req.params.id]);
    if (tareas[0].total > 0) {
      return res.status(409).json({ msg: "No se puede eliminar: tiene tareas asociadas" });
    }
    const [result] = await pool.query("DELETE FROM materias WHERE id_materia = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ msg: "Materia no encontrada" });
    res.json({ msg: "Materia eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al eliminar materia" });
  }
});

module.exports = router;
