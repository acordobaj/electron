

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { validateUserInput } from '../utils/validation.js';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const JWT_SECRET = dotenv.config().parsed.JWT_SECRET || 'clave_secreta';

// Registro de usuario
const register = async (req, res) => {
  const { nombre, password, role_id } = req.body;

  try {
    validateUserInput(nombre, password, role_id);

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO usuarios (nombre, password, role_id) VALUES (?, ?, ?)`;
    
    db.run(query, [nombre, hashedPassword, role_id], function (err) {
      if (err) {
        console.error('Error al registrar el usuario:', err.message);
        return res.status(500).json({ error: 'Error al registrar el usuario.' });
      }

      return res.status(201).json({
        message: 'Usuario registrado con éxito.',
        userId: this.lastID,
      });
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: 'El nombre y la contraseña son requeridos.' });
  }

  try {
    const query = `SELECT * FROM usuarios WHERE nombre = ?`;
    db.get(query, [nombre], async (err, user) => {
      if (err) {
        console.error("Error al obtener el usuario:", err.message);
        return res.status(500).json({ error: 'Error en la base de datos.' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
      }

      // Obtener el nombre del rol basado en el role_id
      const rolesQuery = `SELECT * FROM roles WHERE id = ?`;
      db.get(rolesQuery, [user.role_id], (err, role) => {
        if (err) {
          console.error("Error al obtener el rol del usuario:", err.message);
          return res.status(500).json({ error: 'Error al obtener el rol.' });
        }

        const payload = {
          userId: user.id,
          nombre: user.nombre,
          roleId: user.role_id,
          roleNombre: role ? role.nombre : 'Sin rol'
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Definir la redirección basada en el role_id
        let redirectTo = user.role_id === 2 ? '/' : '/dashboard'; // Modifica '/dashboard' según lo que necesites

        return res.status(200).json({
          message: 'Inicio de sesión exitoso.',
          token,
          user: { id: user.id, nombre: user.nombre, roleId: user.role_id, roleNombre: role ? role.nombre : 'Sin rol' },
          roles: [role ? role.nombre : 'Sin rol'],
          redirectTo, // Incluir la URL de redirección en la respuesta
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Logout de usuario (Eliminar el token en el cliente)
const logout = (req, res) => {
  // Aquí puedes hacer que el cliente elimine el token almacenado (por ejemplo, en cookies o localStorage)
  // En el servidor, no necesitas hacer nada con el token, solo responde que se cerró la sesión.

  return res.status(200).json({
    message: 'Sesión cerrada con éxito.'
  });
};

export default { register, login, logout };