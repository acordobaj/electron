// config/database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error al conectar con SQLite:', err.message);
  else console.log('Conectado a la base de datos SQLite.');
});

module.exports = db;

// controllers/rolesController.js
const db = require('../config/database');

const rolesController = {
  // Obtener todos los roles
  getAllRoles: (req, res) => {
    db.all("SELECT * FROM roles", [], (err, roles) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ roles });
    });
  },

  // Obtener un rol por ID
  getRoleById: (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM roles WHERE id = ?", [id], (err, role) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!role) return res.status(404).json({ error: "Rol no encontrado" });
      res.json({ role });
    });
  },

  // Crear un nuevo rol
  createRole: (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: "El nombre y la descripción son obligatorios" });
    }

    db.run("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rol creado exitosamente", roleId: this.lastID });
    });
  },

  // Actualizar un rol
  updateRole: (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    db.run(`UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
    [name, description, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Rol no encontrado" });
      res.json({ message: "Rol actualizado exitosamente" });
    });
  }
};

// controllers/tarjetasController.js
const db = require('../config/database');

const tarjetasController = {
  // Obtener todas las tarjetas
  getAllTarjetas: (req, res) => {
    db.all("SELECT * FROM tarjetas ORDER BY fecha_creacion DESC", [], (err, tarjetas) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ tarjetas });
    });
  },

  // Obtener una tarjeta por DMC
  getTarjetaByDMC: (req, res) => {
    const { dmc } = req.params;
    db.get("SELECT * FROM tarjetas WHERE dmc = ?", [dmc], (err, tarjeta) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tarjeta) return res.status(404).json({ error: "Tarjeta no encontrada" });
      res.json({ tarjeta });
    });
  },

  // Crear nueva tarjeta o actualizar contador si ya existe
  createTarjeta: (req, res) => {
    const { dmc, familia, linea } = req.body;

    if (!dmc || !familia || !linea) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    db.get("SELECT id FROM tarjetas WHERE dmc = ? AND familia = ?", [dmc, familia], (err, row) => {
      if (err) {
        console.error("Error al verificar la tarjeta:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        const tarjetaId = row.id;
        db.run("UPDATE tarjetas SET contador = 0 WHERE id = ?", [tarjetaId], function (err) {
          if (err) {
            console.error("Error al reiniciar el contador:", err.message);
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: `La tarjeta con DMC ${dmc} y familia ${familia} ya existía, contador reiniciado a 0.` });
        });
      } else {
        db.run("INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)", [dmc, familia, linea], function (err) {
          if (err) {
            console.error("Error al crear la tarjeta:", err.message);
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: "Tarjeta creada exitosamente", tarjetaId: this.lastID });
        });
      }
    });
  },

  // Actualizar tarjeta
  updateTarjeta: (req, res) => {
    const { dmc } = req.params;
    const { familia, linea } = req.body;

    db.run(`UPDATE tarjetas SET familia = COALESCE(?, familia), linea = COALESCE(?, linea) WHERE dmc = ?`, 
    [familia, linea, dmc], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Tarjeta no encontrada" });
      res.json({ message: "Tarjeta actualizada exitosamente" });
    });
  },

  // Incrementar contador de uso
  incrementarUso: (req, res) => {
    const { dmc } = req.params;
    
    db.serialize(() => {
      db.get("SELECT id FROM tarjetas WHERE dmc = ?", [dmc], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Tarjeta no encontrada" });

        const tarjetaId = row.id;
        
        db.run("UPDATE tarjetas SET contador = contador + 1 WHERE id = ?", [tarjetaId], function(err) {
          if (err) return res.status(500).json({ error: err.message });

          db.run("INSERT INTO historial_uso (tarjeta_id) VALUES (?)", [tarjetaId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Uso registrado exitosamente", tarjetaId: tarjetaId });
          });
        });
      });
    });
  },

  // Obtener historial de uso de una tarjeta
  getHistorialUso: (req, res) => {
    const { dmc } = req.params;
    
    db.all(`SELECT h.fecha_uso, t.dmc FROM historial_uso h JOIN tarjetas t ON h.tarjeta_id = t.id WHERE t.dmc = ? ORDER BY h.fecha_uso DESC`, 
    [dmc], (err, historial) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ historial });
    });
  }
};

// controllers/usuariosController.js
const db = require('../config/database');

const usuariosController = {
  // Obtener todos los usuarios
  getAllUsuarios: (req, res) => {
    db.all("SELECT * FROM usuarios", [], (err, usuarios) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ usuarios });
    });
  },

  // Obtener un usuario por ID
  getUsuarioById: (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, usuario) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ usuario });
    });
  },

  // Crear un nuevo usuario
  createUsuario: (req, res) => {
    const { name, lastname, dui, phone, roleid, email, password, state } = req.body;

    if (!name || !lastname || !dui || !phone || !roleid || !email || !password || !state) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    db.run("INSERT INTO usuarios (name, lastname, dui, phone, roleid, email, password, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, lastname, dui, phone, roleid, email, password, state], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Usuario creado exitosamente", usuarioId: this.lastID });
    });
  },

  // Actualizar un usuario
  updateUsuario: (req, res) => {
    const { id } = req.params;
    const { name, lastname, dui, phone, roleid, email, password, state } = req.body;

    db.run(`UPDATE usuarios SET name = COALESCE(?, name), lastname = COALESCE(?, lastname), dui = COALESCE(?, dui), 
            phone = COALESCE(?, phone), roleid = COALESCE(?, roleid), email = COALESCE(?, email), 
            password = COALESCE(?, password), state = COALESCE(?, state) WHERE id = ?`, 
    [name, lastname, dui, phone, roleid, email, password, state, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado exitosamente" });
    });
  },

  // Eliminar un usuario
  deleteUsuario: (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM usuarios WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ message: "Usuario eliminado exitosamente" });
    });
  }
};

// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const tarjetasController = require('../controllers/tarjetasController');
const usuariosController = require('../controllers/usuariosController');
const rolesController = require('../controllers/rolesController');

// Rutas de tarjetas
router.get('/tarjetas', tarjetasController.getAllTarjetas);
router.get('/tarjetas/:dmc', tarjetasController.getTarjetaByDMC);
router.post('/tarjetas', tarjetasController.createTarjeta);
router.put('/tarjetas/:dmc', tarjetasController.updateTarjeta);
router.post('/tarjetas/:dmc/usar', tarjetasController.incrementarUso);
router.get('/tarjetas/:dmc/historial', tarjetasController.getHistorialUso);

// Rutas de usuarios
router.get('/usuarios', usuariosController.getAllUsuarios);
router.get('/usuarios/:id', usuariosController.getUsuarioById);
router.post('/usuarios', usuariosController.createUsuario);
router.put('/usuarios/:id', usuariosController.updateUsuario);
router.delete('/usuarios/:id', usuariosController.deleteUsuario);

// Rutas de roles
router.get('/roles', rolesController.getAllRoles);
router.get('/roles/:id', rolesController.getRoleById);
router.post('/roles', rolesController.createRole);
router.put('/roles/:id', rolesController.updateRole);

module.exports = router;

// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/apiRoutes');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
