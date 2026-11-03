const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, created_at FROM usuarios WHERE id_usuario = ?',
      [req.user.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[perfil/me]', err);
    res.status(500).json({ msg: 'Error al obtener perfil' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    if (!nombre?.trim() || !correo?.trim()) {
      return res.status(400).json({ msg: 'Nombre y correo son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ msg: 'Formato de correo inválido' });
    }
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?',
      [nombre.trim(), correo.trim().toLowerCase(), req.user.id_usuario]
    );
    if (!result.affectedRows) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ msg: 'Perfil actualizado' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Ya existe un usuario con ese correo' });
    }
    console.error('[perfil/me PUT]', err);
    res.status(500).json({ msg: 'Error al actualizar perfil' });
  }
});

router.put('/me/password', async (req, res) => {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva) {
      return res.status(400).json({ msg: 'Contraseña actual y nueva son obligatorias' });
    }
    if (nueva.length < 6) {
      return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    const [rows] = await pool.query('SELECT contrasena FROM usuarios WHERE id_usuario = ?', [req.user.id_usuario]);
    if (!rows.length) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(actual, rows[0].contrasena);
    if (!valid) return res.status(401).json({ msg: 'La contraseña actual es incorrecta' });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(nueva, salt);
    await pool.query('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?', [hash, req.user.id_usuario]);
    res.json({ msg: 'Contraseña actualizada' });
  } catch (err) {
    console.error('[perfil/me/password]', err);
    res.status(500).json({ msg: 'Error al cambiar contraseña' });
  }
});

module.exports = router;
