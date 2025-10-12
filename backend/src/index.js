require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Rutas
const productsRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const utilsRoutes = require('./routes/utils');

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://localhost:5173',
    'https://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Crear directorio de exports si no existe
const exportsDir = path.join(__dirname, '..', 'exports');
require('fs').mkdirSync(exportsDir, { recursive: true });

// Rutas
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/utils', utilsRoutes);

// Servir archivos estáticos (CSV exports)
app.use('/exports', express.static(exportsDir));

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
