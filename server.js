const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || '26.106.45.23',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'practicasmanzano',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Rutas
// GET todos los pedidos
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone 
      FROM orders o 
      JOIN products p ON o.idproduct = p.idproduct 
      JOIN usuarios u ON o.iduser = u.iduser
      ORDER BY o.orderdate DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET un pedido específico
app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone 
      FROM orders o 
      JOIN products p ON o.idproduct = p.idproduct 
      JOIN usuarios u ON o.iduser = u.iduser
      WHERE o.idorder = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST nuevo pedido
app.post('/api/orders', async (req, res) => {
  const { orderdate, amount, message, iduser, idproduct } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO orders (orderdate, amount, message, iduser, idproduct) VALUES (?, ?, ?, ?, ?)',
      [orderdate, amount, message, iduser, idproduct]
    );
    res.status(201).json({ 
      id: result.insertId,
      message: 'Pedido creado exitosamente' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET usuarios
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT iduser, name, email, phone, role FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});