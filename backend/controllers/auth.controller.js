import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Configuración de JWT
const JWT_CONFIG = {
  expiresIn: '1h',
  algorithm: 'HS256'
};

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array() 
    });
  }

  try {
    const { nombre, email, password } = req.body;
    
    // Verificar usuario existente
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'El usuario ya está registrado' 
      });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const user = new User({ 
      nombre, 
      email, 
      password: hashedPassword,
      role: 'user' // Rol por defecto
    });
    
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      JWT_CONFIG
    );

    // Preparar respuesta sin contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      token,
      user: userResponse,
      expiresIn: 3600 // 1 hora en segundos
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array() 
    });
  }

  try {
    const { email, password } = req.body;
    
    // Buscar usuario incluyendo la contraseña
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      JWT_CONFIG
    );

    // Preparar respuesta sin contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true,
      token,
      user: userResponse,
      expiresIn: 3600 // 1 hora en segundos
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};