import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import twilio from 'twilio';
import { insertOrder, getProducts, getUserByPhone, createUser } from './src/lib/db.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

console.log('TWILIO_ACCOUNT_SID:', JSON.stringify(process.env.TWILIO_ACCOUNT_SID));
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***loaded***' : 'undefined');
console.log('TWILIO_PHONE_NUMBER:', JSON.stringify(process.env.TWILIO_PHONE_NUMBER));

const app = express();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_PHONE_NUMBER;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// In-memory sessions
const sessions = new Map();

// Generate dates for current or next weeks
function getAvailableDates(weekOffset) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun..6=Sat
  const dates = [];
  if (weekOffset === 0) {
    // from today through Saturday (dow=6)
    const daysToSat = 6 - dow;
    for (let i = 0; i <= daysToSat; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
  } else {
    // starting next week's Monday through Sunday
    const daysToNextMon = ((8 - dow) % 7) + (weekOffset - 1) * 7;
    const start = new Date(today);
    start.setDate(today.getDate() + daysToNextMon);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
  }
  return dates;
}

// Format date labels
function formatDateLabel(d) {
  const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${dayName} ${day}/${month}`;
}

// Format slot labels
function getTimeSlotsForDate(date) {
  const slots = [];
  let dt = new Date(date);
  dt.setHours(9, 0, 0, 0);
  const end = new Date(date);
  end.setHours(18, 0, 0, 0);
  while (dt < end) {
    slots.push(new Date(dt));
    dt = new Date(dt.getTime() + 30 * 60000);
  }
  return slots;
}

// Send plain numbered list
async function sendNumberedList(to, lines) {
  const text = lines.join('\n');
  await twilioClient.messages.create({
    from: `whatsapp:${twilioWhatsAppNumber}`,
    to:   `whatsapp:${to}`,
    body: text
  });
}

// Simple response
async function sendWhatsAppResponse(to, text) {
  await twilioClient.messages.create({
    from: `whatsapp:${twilioWhatsAppNumber}`,
    to:   `whatsapp:${to}`,
    body: text
  });
}

async function parseOrderMessage(msg) {
  const products = await getProducts();
  const lower = msg.toLowerCase();
  for (const p of products) {
    const nm = p.name.toLowerCase();
    const re = new RegExp(`\\b(\\d+)\\s*(?:${nm}|par(?:es)? de ${nm})\\b`, 'i');
    const m = lower.match(re);
    if (m) return { productId: p.idproduct, productName: p.name, amount: parseInt(m[1],10), price: p.price };
  }
  return null;
}

// Webhook
app.post('/api/webhook', async (req, res) => {
  try {
  const message = (req.body.Body||'').trim();
  const fromRaw = req.body.From || '';
  const from    = fromRaw.replace('whatsapp:', '');
  let session   = sessions.get(from);

  // 1) No session: show main menu
  if (!session) {
    sessions.set(from, { flow:'await_choice', data:{} });
    await sendWhatsAppResponse(from,
      '👋 Hola! ¿Qué deseas hacer?\n1) PEDIR\n2) CITAS'
    );
    return res.sendStatus(200);
  }

  // 2) Main choice
  if (session.flow === 'await_choice') {
    if (/^2|citas/i.test(message)) {
      session.flow = 'appointment';
      session.data.weekOffset = 0;
      session.data.step = 'ask_date';
      sessions.set(from, session);
      // list dates
      const dates = getAvailableDates(0);
      const lines = ['Elige un día (próxima semana)'];
      dates.forEach((d,i) => lines.push(`${i+1}) ${formatDateLabel(d)}`));
      lines.push('0) Semana siguiente');
      lines.push('Envía el número de tu elección.');
      await sendNumberedList(from, lines);
      return res.sendStatus(200);
    }
    if (/^1|pedir/i.test(message)) {
      session.flow = 'order';
      sessions.set(from, session);
      await sendWhatsAppResponse(from, '🛒 ¿Qué producto y cantidad quieres? Ej: "2 gafas"');
      return res.sendStatus(200);
    }
    await sendWhatsAppResponse(from,'Por favor responde 1 para PEDIR o 2 para CITAS.');
    return res.sendStatus(200);
  }

  // Ensure user exists
  let user = await getUserByPhone(parseInt(from));
  if (!user) {
    await createUser({ email:`${from}@temp.com`, name:`Cliente ${from}`, phone:from, password:Math.random().toString(36).slice(-8), role:'client' });
    user = await getUserByPhone(parseInt(from));
  }

  // Appointment flow
  if (session.flow === 'appointment') {
    // ask_date
    if (session.data.step === 'ask_date') {
      const dates = getAvailableDates(session.data.weekOffset);
      const choice = parseInt(message,10);
      if (message === '0') {
        session.data.weekOffset++;
        sessions.set(from, session);
        const nextDates = getAvailableDates(session.data.weekOffset);
        const lines = ['Elige día (semana siguiente)'];
        nextDates.forEach((d,i) => lines.push(`${i+1}) ${formatDateLabel(d)}`));
        lines.push('0) Semana siguiente');
        await sendNumberedList(from, lines);
        return res.sendStatus(200);
      }
      if (!isNaN(choice) && choice >=1 && choice <= dates.length) {
        const d = dates[choice-1];
        session.data.date = d.toISOString().slice(0,10);
        session.data.step = 'ask_time';
        sessions.set(from, session);
        // list times
        const slots = getTimeSlotsForDate(d);
        const lines = ['Selecciona hora (30min)'];
        slots.forEach((s,i) => lines.push(`${i+1}) ${s.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}`));
        lines.push('0) Volver a fechas');
        await sendNumberedList(from, lines);
        return res.sendStatus(200);
      }
      // invalid
      await sendNumberedList(from,['Opción no válida.','Envía el número de la fecha.'].concat(dates.map((d,i)=>`${i+1}) ${formatDateLabel(d)}`), ['0) Semana siguiente']));
      return res.sendStatus(200);
    }
    // ask_time
    if (session.data.step === 'ask_time') {
      const d = new Date(`${session.data.date}T00:00:00`);
      const slots = getTimeSlotsForDate(d);
      const choice = parseInt(message,10);
      if (message === '0') {
        session.data.step = 'ask_date';
        sessions.set(from, session);
        // resend date list
        const dates = getAvailableDates(session.data.weekOffset);
        const lines = ['Elige un día'];
        dates.forEach((dd,i)=>lines.push(`${i+1}) ${formatDateLabel(dd)}`));
        lines.push('0) Semana siguiente');
        await sendNumberedList(from, lines);
        return res.sendStatus(200);
      }
      if (!isNaN(choice) && choice>=1 && choice<=slots.length) {
        const start = slots[choice-1];
        const end = new Date(start.getTime()+30*60000);
        // create event
        const oAuth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
        oAuth2.setCredentials({refresh_token:process.env.GOOGLE_REFRESH_TOKEN});
        const calendar = google.calendar({version:'v3',auth:oAuth2});
        try {
          await calendar.events.insert({calendarId:'primary',resource:{summary:`Cita WhatsApp - ${user.name}`,start:{dateTime:start.toISOString(),timeZone:'Europe/Madrid'},end:{dateTime:end.toISOString(),timeZone:'Europe/Madrid'}}});
          sessions.delete(from);
          await sendWhatsAppResponse(from,`✅ Cita confirmada: ${start.toLocaleString('es-ES',{dateStyle:'full',timeStyle:'short'})}`);
        } catch(err) {
          console.error(err);
          sessions.delete(from);
          await sendWhatsAppResponse(from,'❌ Error creando cita. Intenta más tarde.');
        }
        return res.sendStatus(200);
      }
      // invalid
      const lines = ['Opción no válida.','Selecciona una hora:'].concat(slots.map((s,i)=>`${i+1}) ${s.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}`),['0) Volver a fechas']);
      await sendNumberedList(from,lines);
      return res.sendStatus(200);
    }
  }

  // Order flow
  if (session.flow==='order') {
    const details = await parseOrderMessage(message);
    if (!details) {
      const prods = await getProducts();
      const listText = prods.map(p=>`${p.name} (${p.price}€)`).join(', ');
      await sendWhatsAppResponse(from,`No entendí tu pedido. Productos: ${listText}. Ej: "2 gafas"`);
      return res.sendStatus(200);
    }
    await insertOrder({orderdate:new Date(),amount:details.amount,message,iduser:user.iduser,idproduct:details.productId});
    sessions.delete(from);
    await sendWhatsAppResponse(from,`✅ Pedido: ${details.amount}× ${details.productName} — Total: ${details.amount*details.price}€`);
    return res.sendStatus(200);
  }

  // Fallback
  sessions.delete(from);
  res.sendStatus(200);
} catch (err) {
    console.error('Error in /api/webhook handler:', err);
  } 
    // Always respond to Twilio
    res.sendStatus(200);
});

// Otros endpoints REST (orders, products, users)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone
       FROM orders o
       JOIN products p ON o.idproduct = p.idproduct
       JOIN usuarios u ON o.iduser = u.iduser
       ORDER BY o.orderdate DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error getting orders:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT o.*, p.name as product_name, p.price, u.name as user_name, u.phone
       FROM orders o
       JOIN products p ON o.idproduct = p.idproduct
       JOIN usuarios u ON o.iduser = u.iduser
       WHERE o.idorder = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting order:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { orderdate, amount, message, iduser, idproduct } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO orders (orderdate, amount, message, iduser, idproduct) VALUES (?, ?, ?, ?, ?)',
      [orderdate, amount, message, iduser, idproduct]
    );
    res.status(201).json({ id: result.insertId, message: 'Pedido creado' });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT iduser, name, email, phone, role FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Express corriendo en puerto ${PORT}`);
});
