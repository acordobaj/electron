import express from 'express';
const router = express.Router();
import usuariosController from '../controllers/usuariosController.js';

// Rutas para usuarios
router.get('/', usuariosController.getAllUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/', usuariosController.createUsuario);

export default router;
