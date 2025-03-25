import db from '../config/database.js';

const usuariosController = {
  getAllUsuarios: (req, res) => {
    db.all("SELECT * FROM usuarios", [], (err, usuarios) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ usuarios });
    });
  },

  getUsuarioById: (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, usuario) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ usuario });
    });
  },

  createUsuario: (req, res) => {
    const { name, lastname, dui, phone, roleid, email, password, state } = req.body;
    if (!name || !lastname || !dui || !phone || !roleid || !email || !password || !state) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    db.run("INSERT INTO usuarios (name, lastname, dui, phone, roleid, email, password, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, lastname, dui, phone, roleid, email, password, state], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario creado exitosamente", usuarioId: this.lastID });
      });
  }
};

export default usuariosController;
