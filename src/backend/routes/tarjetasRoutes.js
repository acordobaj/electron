import express from 'express';
const router = express.Router();
import tarjetasController from '../controllers/tarjetasController.js';

// Rutas para tarjetas
router.get('/', tarjetasController.getAllTarjetas);
router.get('/:dmc', tarjetasController.getTarjetaByDMC);
router.post('/', tarjetasController.createTarjeta);

export default router;
