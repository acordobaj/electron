import db from '../config/database.js';

const tarjetasController = {
  getAllTarjetas: (req, res) => {
    db.all("SELECT * FROM tarjetas ORDER BY fecha_creacion DESC", [], (err, tarjetas) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ tarjetas });
    });
  },

  getTarjetaByDMC: (req, res) => {
    const { dmc } = req.params;
    db.get("SELECT * FROM tarjetas WHERE dmc = ?", [dmc], (err, tarjeta) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tarjeta) return res.status(404).json({ error: "Tarjeta no encontrada" });
      res.json({ tarjeta });
    });
  },

  createTarjeta: (req, res) => {
    const { dmc, familia, linea } = req.body;
    if (!dmc || !familia || !linea) return res.status(400).json({ error: "Todos los campos son obligatorios" });

    db.get("SELECT id FROM tarjetas WHERE dmc = ? AND familia = ?", [dmc, familia], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        db.run("UPDATE tarjetas SET contador = 0 WHERE id = ?", [row.id], function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Tarjeta ya existía, contador reiniciado" });
        });
      } else {
        db.run("INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)", [dmc, familia, linea], function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Tarjeta creada exitosamente", tarjetaId: this.lastID });
        });
      }
    });
  }
};

export default tarjetasController;
