require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/materials', require('./routes/materials.routes'));
app.use('/api/loans', require('./routes/loans.routes'));
app.use('/api/reservations', require('./routes/reservations.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});