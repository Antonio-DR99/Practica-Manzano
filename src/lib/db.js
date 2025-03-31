import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funciones para Orders
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

export async function getOrders() {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone 
      FROM orders o 
      JOIN products p ON o.idproduct = p.idproduct 
      JOIN usuarios u ON o.iduser = u.iduser
      ORDER BY o.orderdate DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function getOrderById(idorder) {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone 
      FROM orders o 
      JOIN products p ON o.idproduct = p.idproduct 
      JOIN usuarios u ON o.iduser = u.iduser
      WHERE o.idorder = ?
    `, [idorder]);
    return rows[0];
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

// Funciones para Products
export async function getProducts() {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

export async function getProductById(idproduct) {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE idproduct = ?', [idproduct]);
    return rows[0];
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

// Funciones para Users
export async function getUsers() {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios');
    return rows;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

export async function getUserById(iduser) {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE iduser = ?', [iduser]);
    return rows[0];
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
}

export async function getUserByPhone(phone) {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE phone = ?', [phone]);
    return rows[0];
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
}

export async function createUser({ email, name, phone, password, role }) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (email, name, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [email, name, phone, password, role]
    );
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser({ iduser, email, name, phone, role }) {
  try {
    const [result] = await pool.execute(
      'UPDATE usuarios SET email = ?, name = ?, phone = ?, role = ? WHERE iduser = ?',
      [email, name, phone, role, iduser]
    );
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(iduser) {
  try {
    const [result] = await pool.execute('DELETE FROM usuarios WHERE iduser = ?', [iduser]);
    return result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUserStats() {
  try {
    // Obtener estadísticas de usuarios
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
    const [activeResult] = await pool.execute('SELECT COUNT(*) as active FROM usuarios WHERE role = ?', ['client']);
    const [newUsersResult] = await pool.execute(
      'SELECT COUNT(*) as newUsers FROM usuarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'
    );
    
    return {
      total: totalResult[0].total,
      active: activeResult[0].active,
      newUsers: newUsersResult[0].newUsers || 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

export async function validateUser(email, password) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    );
    return rows[0];
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
}