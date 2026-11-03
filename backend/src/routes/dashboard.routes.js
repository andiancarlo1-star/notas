const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [[usuarios]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    const [[alumnos]] = await pool.query('SELECT COUNT(*) AS total FROM alumnos');
    const [[materias]] = await pool.query('SELECT COUNT(*) AS total FROM materias');
    const [[tareas]] = await pool.query('SELECT COUNT(*) AS total FROM tareas');
    const [[tareasActivas]] = await pool.query("SELECT COUNT(*) AS total FROM tareas WHERE estado = 'ACTIVA'");
    const [[ciclos]] = await pool.query('SELECT COUNT(*) AS total FROM ciclos_escolares');
    const [[bimestresAbiertos]] = await pool.query("SELECT COUNT(*) AS total FROM bimestres WHERE estado = 'ABIERTO'");
    const [[entregas]] = await pool.query('SELECT COUNT(*) AS total FROM entregas_tareas');

    const [porRol] = await pool.query(
      "SELECT rol, COUNT(*) AS total FROM usuarios GROUP BY rol"
    );

    const [topMaestros] = await pool.query(`
      SELECT u.nombre, COUNT(DISTINCT mm.materia_id) AS materias
      FROM usuarios u
      JOIN materias_maestros mm ON mm.maestro_id = u.id_usuario
      WHERE u.rol = 'maestro'
      GROUP BY u.id_usuario
      ORDER BY materias DESC
      LIMIT 5
    `);

    const [materiasPorGrado] = await pool.query(`
      SELECT g.nombre AS grado, g.seccion, COUNT(m.id_materia) AS materias
      FROM grados g
      LEFT JOIN materias m ON m.grado_id = g.id_grado
      GROUP BY g.id_grado
      ORDER BY g.nombre
    `);

    res.json({
      totales: {
        usuarios: usuarios.total,
        alumnos: alumnos.total,
        materias: materias.total,
        tareas: tareas.total,
        tareasActivas: tareasActivas.total,
        ciclos: ciclos.total,
        bimestresAbiertos: bimestresAbiertos.total,
        entregas: entregas.total,
      },
      porRol,
      topMaestros,
      materiasPorGrado,
    });
  } catch (err) {
    console.error('[dashboard]', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
