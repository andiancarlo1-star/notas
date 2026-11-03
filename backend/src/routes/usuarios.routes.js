const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { verificarAdmin, verificarAdminODirector } = require('../middlewares/auth.middleware');

router.post('/', verificarAdminODirector, async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const password = req.body.contraseña || req.body.contrasena;

    if (!nombre?.trim() || !correo?.trim() || !password || !rol) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ msg: 'Formato de correo inválido' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!['director', 'maestro', 'alumno'].includes(rol)) {
      return res.status(400).json({ msg: 'Rol no permitido' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre.trim(), correo.trim().toLowerCase(), hash, rol]
    );

    res.status(201).json({ msg: 'Usuario creado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Ya existe un usuario con ese correo' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
});

router.get('/', verificarAdminODirector, async (req, res) => {
  try {
    const { rol, buscar } = req.query;
    let query = 'SELECT id_usuario, nombre, correo, rol, created_at FROM usuarios';
    const params = [];
    const conditions = [];

    if (rol && ['director', 'maestro', 'alumno'].includes(rol)) {
      conditions.push('rol = ?');
      params.push(rol);
    }
    if (buscar?.trim()) {
      conditions.push('(nombre LIKE ? OR correo LIKE ?)');
      params.push(`%${buscar.trim()}%`, `%${buscar.trim()}%`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY nombre';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
});

router.get('/:id', verificarAdminODirector, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, correo, rol, created_at FROM usuarios WHERE id_usuario = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuario' });
  }
});

router.put('/:id', verificarAdmin, async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const password = req.body.contraseña || req.body.contrasena;
    if (!nombre?.trim() || !correo?.trim()) {
      return res.status(400).json({ msg: 'Nombre y correo son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ msg: 'Formato de correo inválido' });
    }
    if (rol && !['admin', 'director', 'maestro', 'alumno'].includes(rol)) {
      return res.status(400).json({ msg: 'Rol no válido' });
    }

    let query = 'UPDATE usuarios SET nombre = ?, correo = ?, rol = COALESCE(?, rol)';
    const params = [nombre.trim(), correo.trim().toLowerCase(), rol || null];

    if (password && password.length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      query += ', contrasena = ?';
      params.push(bcrypt.hashSync(password, salt));
    }

    query += ' WHERE id_usuario = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);
    if (!result.affectedRows) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ msg: 'Usuario actualizado' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Ya existe un usuario con ese correo' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [self] = await db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id]);
    if (!self.length) return res.status(404).json({ msg: 'Usuario no encontrado' });

    await db.query('DELETE FROM materias_maestros WHERE maestro_id = ?', [id]);
    await db.query('UPDATE tareas SET maestro_id = NULL WHERE maestro_id = ?', [id]);
    await db.query('UPDATE alumnos SET usuario_id = NULL WHERE usuario_id = ?', [id]);
    await db.query('UPDATE bimestres SET cerrado_por = NULL WHERE cerrado_por = ?', [id]);
    await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al eliminar usuario' });
  }
});

module.exports = router;
