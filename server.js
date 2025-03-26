import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import twilio from 'twilio';
import { insertOrder, getProducts, getUserByPhone, createUser } from './src/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_PHONE_NUMBER;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || '26.106.45.23',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD,
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

//POST para twillo
app.post('/api/webhook', async (req, res) => {
  try {
    const message = req.body.Body;
    const fromNumber = req.body.From.replace('whatsapp:', '');
    
    // Obtener o crear usuario
    let user = await getUserByPhone(parseInt(fromNumber));
    if (!user) {
      await createUser({
        email: `${fromNumber}@temp.com`,
        name: `Cliente ${fromNumber}`,
        phone: parseInt(fromNumber),
        password: Math.random().toString(36).slice(-8),
        role: 'client'
      });
      user = await getUserByPhone(parseInt(fromNumber));
    }
    
    // Procesar el mensaje
    const orderDetails = await processMessage(message);
    if (!orderDetails) {
      const products = await getProducts();
      const productList = products.map(p => `${p.name} (${p.price}€)`).join(', ');
      await sendWhatsAppResponse(fromNumber,
        `Lo siento, no pude entender tu pedido. Por favor, especifica el producto y la cantidad.\n` +
        `Productos disponibles: ${productList}\n` +
        `Ejemplo: "Quiero 2 gafas" o "1 par de lentillas"`
      );
      return res.sendStatus(200);
    }
    
    // Guardar el pedido en la base de datos
    await insertOrder({
      orderdate: new Date(),
      amount: orderDetails.amount,
      message: message,
      iduser: user.iduser,
      idproduct: orderDetails.productId
    });
    
    await sendWhatsAppResponse(fromNumber,
      `¡Gracias ${user.name}! Tu pedido ha sido recibido:\n` +
      `${orderDetails.amount}x ${orderDetails.productName}\n` +
      `Total: ${orderDetails.amount * orderDetails.price}€\n` +
      `Te contactaremos pronto para confirmar los detalles.`
    );
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Funciones de apoyo adaptadas para Express
async function processMessage(message) {
  try {
    const products = await getProducts();
    const lowerMessage = message.toLowerCase();
    
    for (const product of products) {
      const productNameLower = product.name.toLowerCase();
      const regex = new RegExp(`\\b(\\d+)\\s*(?:${productNameLower}|par(?:es)?\\s+de\\s+${productNameLower})\\b`, 'i');
      const match = lowerMessage.match(regex);
      if (match) {
        return {
          productId: product.idproduct,
          productName: product.name,
          amount: parseInt(match[1]),
          price: product.price
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error processing message:', error);
    return null;
  }
}

async function sendWhatsAppResponse(toNumber, message) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:+${toNumber}`
    });
  } catch (error) {
    console.error('Error sending WhatsApp response:', error);
  }
}

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});