import db from '../config/database.js';

const rolesController = {
  getAllRoles: (req, res) => {
    db.all("SELECT * FROM roles", [], (err, roles) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ roles });
    });
  },

  getRoleById: (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM roles WHERE id = ?", [id], (err, role) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!role) return res.status(404).json({ error: "Rol no encontrado" });
      res.json({ role });
    });
  },

  createRole: (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) return res.status(400).json({ error: "Campos requeridos" });

    db.run("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rol creado exitosamente", roleId: this.lastID });
    });
  },

  updateRole: (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    db.run(`UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
      [name, description, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Rol no encontrado" });
        res.json({ message: "Rol actualizado exitosamente" });
      });
  }
};

export default rolesController;
