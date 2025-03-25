import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bcrypt from "bcrypt";

// Activar modo "verbose" en SQLite3
const sqlite = sqlite3.verbose();

const app = express();
const PORT = 5000;
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(cors());

// Conexión a la base de datos
const db = new sqlite.Database("./database.db", (err) => {
  if (err) console.error("Error al conectar con SQLite:", err.message);
  else console.log("Conectado a la base de datos SQLite.");
});

// Crear tablas al iniciar
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK(id > 0),
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      )
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      ),
      password TEXT NOT NULL,
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      role_id INTEGER NOT NULL DEFAULT 2,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET DEFAULT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tarjetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK(id > 0),
      dmc TEXT NOT NULL UNIQUE CHECK(
        LENGTH(dmc) >= 6 AND LENGTH(dmc) < 30 AND 
        dmc GLOB '*[A-Za-z0-9]*'
      ),
      familia TEXT NOT NULL CHECK(
        LENGTH(familia) >= 3 AND LENGTH(familia) <= 50 AND 
        familia GLOB '*[A-Za-z]*'
      ),
      linea TEXT NOT NULL CHECK(
        LENGTH(linea) >= 3 AND LENGTH(linea) <= 50 AND 
        linea GLOB '*[A-Za-z]*'
      ),
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      contador INTEGER NOT NULL DEFAULT 0 CHECK(contador >= 0)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS historial_uso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarjeta_id INTEGER NOT NULL,
      fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tarjeta_id) REFERENCES tarjetas (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accion TEXT NOT NULL CHECK(
        accion IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')
      ),
      entidad TEXT NOT NULL CHECK(
        entidad IN ('usuarios', 'tarjetas', 'historial_uso', 'roles')
      ),
      descripcion TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Función para registrar auditoría
const registrarAuditoria = (accion, entidad, descripcion) => {
  db.run(
    "INSERT INTO auditoria (accion, entidad, descripcion) VALUES (?, ?, ?)",
    [accion, entidad, descripcion],
    (err) => {
      if (err) console.error("Error registrando auditoría:", err.message);
    }
  );
};

// Rutas del servidor
app.get("/", (req, res) => res.send("Servidor en funcionamiento"));

// Registrar usuario con validación y hash de contraseña
app.post("/register", async (req, res) => {
  const { nombre, password } = req.body;

  // Validación avanzada de los campos
  if (!nombre || !password) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  if (nombre.length < 3 || nombre.length > 50 || !/^[A-Za-z]+$/.test(nombre)) {
    return res.status(400).send("El nombre debe tener entre 3 y 50 caracteres y solo puede contener letras.");
  }

  if (password.length < 6) {
    return res.status(400).send("La contraseña debe tener al menos 6 caracteres.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    db.run(
      "INSERT INTO usuarios (nombre, password) VALUES (?, ?)", 
      [nombre, hashedPassword],
      (err) => {
        if (err) return res.status(500).send("Error al registrar el usuario.");
        registrarAuditoria("INSERT", "usuarios", `Usuario ${nombre} registrado.`);
        res.send("Usuario registrado correctamente.");
      }
    );
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud.");
  }
});

// Obtener tarjetas con el campo 'contador' renombrado como 'veces_usada'
app.get("/tarjetas", (req, res) => {
  db.all("SELECT id, dmc, familia, linea, fecha_creacion, contador AS veces_usada FROM tarjetas", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener las tarjetas.");
    if (rows.length === 0) return res.status(404).send("No se encontraron tarjetas.");
    res.json(rows);
  });
});

// Registrar o actualizar tarjeta (y reiniciar contador si ya existe)
app.post("/tarjetas", (req, res) => {
  const { dmc, familia, linea } = req.body;

  // Validación avanzada de los campos
  if (!dmc || !familia || !linea) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  if (dmc.length < 6 || dmc.length > 30 || !/^[A-Za-z0-9]+$/.test(dmc)) {
    return res.status(400).send("El DMC debe tener entre 6 y 30 caracteres y solo puede contener letras y números.");
  }

  if (familia.length < 3 || familia.length > 50 || !/^[A-Za-z]+$/.test(familia)) {
    return res.status(400).send("La familia debe tener entre 3 y 50 caracteres y solo puede contener letras.");
  }

  // Verificar si ya existe una tarjeta con el mismo 'dmc' y 'familia'
  db.get("SELECT id FROM tarjetas WHERE dmc = ? AND familia = ?", [dmc, familia], (err, row) => {
    if (err) return res.status(500).send("Error al verificar la tarjeta.");

    if (row) {
      // Si la tarjeta ya existe, se reinicia el contador a 0
      db.run("UPDATE tarjetas SET contador = 0 WHERE id = ?", [row.id], (err) => {
        if (err) return res.status(500).send("Error al actualizar la tarjeta.");
        registrarAuditoria("UPDATE", "tarjetas", `Contador de tarjeta ${dmc} (familia: ${familia}) reiniciado.`);
        res.json({ message: `Tarjeta ${dmc} (familia: ${familia}) ya existía, contador reiniciado a 0.` });
      });
    } else {
      // Si la tarjeta no existe, se registra una nueva tarjeta
      db.run(
        "INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)",
        [dmc, familia, linea],
        function (err) {
          if (err) return res.status(500).send("Error interno al registrar la tarjeta.");
          registrarAuditoria("INSERT", "tarjetas", `Tarjeta ${dmc} (familia: ${familia}) registrada.`);
          res.json({ message: "Tarjeta registrada correctamente", tarjetaId: this.lastID });
        }
      );
    }
  });
});

// Incrementar contador y registrar en historial con transacción
app.post("/usar/:dmc", (req, res) => {
  const { dmc } = req.params;

  db.serialize(() => {
    db.get("SELECT id FROM tarjetas WHERE dmc = ?", [dmc], (err, row) => {
      if (err) return res.status(500).send("Error al buscar la tarjeta.");
      if (!row) return res.status(404).send("Tarjeta no encontrada.");

      const tarjetaId = row.id;

      db.run("BEGIN TRANSACTION");
      db.run("UPDATE tarjetas SET contador = contador + 1 WHERE id = ?", [tarjetaId], (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).send("Error al actualizar el contador.");
        }

        db.run("INSERT INTO historial_uso (tarjeta_id) VALUES (?)", [tarjetaId], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).send("Error al registrar el uso de la tarjeta.");
          }

          db.run("COMMIT");
          registrarAuditoria("UPDATE", "tarjetas", `Contador incrementado para tarjeta ${dmc}.`);
          res.send("Contador actualizado correctamente.");
        });
      });
    });
  });
});

// Endpoint para mostrar todos los usuarios
app.get("/usuarios", (req, res) => {
  db.all("SELECT id, nombre, role_id FROM usuarios", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener los usuarios.");
    if (rows.length === 0) return res.status(404).send("No se encontraron usuarios.");
    res.json(rows);
  });
});

// Endpoint para obtener roles
app.get("/roles", (req, res) => {
  db.all("SELECT id, nombre FROM roles", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener los roles.");
    res.json(rows);
  });
});

// Endpoint para asignar rol a usuario
app.put("/usuarios/:id/role", (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;

  // Validación del rol
  if (!role_id) {
    return res.status(400).send("El rol es obligatorio.");
  }

  db.run(
    "UPDATE usuarios SET role_id = ? WHERE id = ?",
    [role_id, id],
    (err) => {
      if (err) return res.status(500).send("Error al asignar el rol.");
      registrarAuditoria("UPDATE", "usuarios", `Rol actualizado para usuario con ID ${id}.`);
      res.send("Rol actualizado correctamente.");
    }
  );
});

// Endpoint para registrar un nuevo usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, password, role_id } = req.body;

  // Validación de los campos
  if (!nombre || !password || !role_id) {
    return res.status(400).send("Todos los campos son obligatorios (nombre, password, role_id).");
  }

  if (nombre.length < 3 || nombre.length > 50 || !/^[A-Za-z]+$/.test(nombre)) {
    return res.status(400).send("El nombre debe tener entre 3 y 50 caracteres y solo puede contener letras.");
  }

  if (password.length < 6) {
    return res.status(400).send("La contraseña debe tener al menos 6 caracteres.");
  }

  try {
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertar el usuario en la base de datos
    db.run(
      "INSERT INTO usuarios (nombre, password, role_id) VALUES (?, ?, ?)", 
      [nombre, hashedPassword, role_id],
      function (err) {
        if (err) {
          return res.status(500).send("Error al registrar el usuario.");
        }
        registrarAuditoria("INSERT", "usuarios", `Usuario ${nombre} registrado.`);
        res.status(201).send({
          message: "Usuario registrado correctamente",
          usuarioId: this.lastID
        });
      }
    );
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud.");
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
