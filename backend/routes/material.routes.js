import express from 'express';
import { 
  getMaterials, 
  createMaterial, 
  deleteMaterial 
} from '../controllers/materials.controller.js';
import { verifyToken as authMiddleware } from '../middleware/auth.js';
import { adminCheck as adminMiddleware } from '../middleware/admin.js';
import { singleUpload } from '../middleware/upload.js'; // Cambiado a singleUpload
import { handleUploadErrors } from '../middleware/upload.js'; // Añadido manejo de errores

const router = express.Router();

// Ruta para obtener materiales (pública o autenticada según tus necesidades)
router.get('/', getMaterials);

// Ruta para crear nuevo material (protegida)
router.post(
  '/',
  authMiddleware,        // Requiere autenticación
  adminMiddleware,       // Requiere rol de admin
  singleUpload('imagen'), // Middleware para subir un solo archivo
  handleUploadErrors,    // Manejo específico de errores de upload
  createMaterial         // Controlador final
);

// Ruta para eliminar material (protegida)
router.delete(
  '/:id',
  authMiddleware,    // Requiere autenticación
  adminMiddleware,   // Requiere rol de admin
  deleteMaterial     // Controlador
);

export default router;