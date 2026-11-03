const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) return res.status(400).json({ msg: 'Correo y contraseña son obligatorios' });
  if (typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ msg: 'Formato de correo inválido' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    const usuario = rows[0];
    const isMatch = await bcrypt.compare(contraseña, usuario.contrasena);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET || 'desarrollo-no-usar-en-produccion',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
