import express from 'express';
import { body } from 'express-validator';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

// Validaciones comunes
const emailValidator = body('email')
  .isEmail().withMessage('Debe ser un email válido')
  .normalizeEmail();

const passwordValidator = body('password')
  .notEmpty().withMessage('La contraseña es requerida')
  .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres');

// Registro de usuario
router.post(
  '/register',
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es requerido')
      .trim()
      .escape(),
    emailValidator,
    passwordValidator
  ],
  registerUser
);

// Inicio de sesión
router.post(
  '/login',
  [
    emailValidator,
    body('password')
      .notEmpty().withMessage('La contraseña es requerida')
  ],
  loginUser
);

export default router;