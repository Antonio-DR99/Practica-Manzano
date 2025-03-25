import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function insertOrder({ orderdate, amount, message, iduser, idproduct }) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO orders (orderdate, amount, message, iduser, idproduct) VALUES (?, ?, ?, ?, ?)',
      [orderdate, amount, message, iduser, idproduct]
    );
    return result;
  } catch (error) {
    console.error('Error inserting order:', error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, p.name as product_name, u.name as user_name 
      FROM orders o 
      JOIN products p ON o.idproduct = p.idproduct 
      JOIN usuarios u ON o.iduser = u.iduser
    `);
    return rows;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}