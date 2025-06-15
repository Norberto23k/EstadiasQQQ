const express = require('express');
const { body } = require('express-validator');
const { loginUser, registerUser } = require('../controllers/auth.controller');

const router = express.Router();

// Registro de usuario
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email no válido'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
  ],
  registerUser
);

// Inicio de sesión
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  loginUser
);

module.exports = router;