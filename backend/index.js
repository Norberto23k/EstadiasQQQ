import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno con path absoluto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Debug: Verificar variables de entorno
console.log('Variables de entorno cargadas:', {
  MONGO_URI: process.env.MONGO_URI ? '✅' : '❌ No definida',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'No definida, usando valores por defecto',
  PORT: process.env.PORT || '4000 (por defecto)'
});

console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
// Configuración de orígenes permitidos con valores por defecto
const allowedOrigins = process.env.CORS_ORIGIN 

  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8100', 'http://localhost:4200'];

// Configuración mejorada de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permitir solicitudes sin origen
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Intento de acceso desde origen no permitido: ${origin}`);
      callback(new Error(`Origen no permitido por CORS. Orígenes permitidos: ${allowedOrigins.join(', ')}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB con manejo robusto de errores
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('La variable MONGO_URI no está definida en el archivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.log('🔍 Verifica que:');
    console.log('1. El archivo .env existe y tiene la variable MONGO_URI');
    console.log('2. La contraseña está correctamente codificada (usar %24 para $)');
    console.log('3. Tu IP está en la lista de permitidos en MongoDB Atlas');
    process.exit(1);
  }
};

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import materialsRoutes from './routes/material.routes.js';
import loansRoutes from './routes/loans.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins,
    memoryUsage: process.memoryUsage()
  });
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      allowedOrigins
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 4000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('🌍 Orígenes permitidos:', allowedOrigins);
  });

  // Manejo de error de puerto en uso
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ El puerto ${PORT} está en uso. Soluciones:`);
      console.log('1. Espera unos segundos y vuelve a intentar');
      console.log(`2. Mata el proceso: "npx kill-port ${PORT}"`);
      console.log(`3. Cambia el puerto en el archivo .env (PORT=4001)`);
    } else {
      console.error('❌ Error al iniciar el servidor:', err);
    }
    process.exit(1);
  });
};

startServer();

// Manejo de cierre elegante
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal de terminación (SIGINT)');
  mongoose.connection.close(() => {
    console.log('🛑 Conexión a MongoDB cerrada');
    process.exit(0);
  });
});