const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materials.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', materialsController.getMaterials);
router.post('/', authMiddleware, adminMiddleware, upload.single('imagen'), materialsController.createMaterial);
router.delete('/:id', authMiddleware, adminMiddleware, materialsController.deleteMaterial);

module.exports = router;