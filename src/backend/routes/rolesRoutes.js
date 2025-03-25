import express from 'express';
import rolesController from '../controllers/rolesController.js';

const router = express.Router();

router.get('/roles', rolesController.getAllRoles);
router.get('/roles/:id', rolesController.getRoleById);
router.post('/roles', rolesController.createRole);
router.put('/roles/:id', rolesController.updateRole);

export default router;
