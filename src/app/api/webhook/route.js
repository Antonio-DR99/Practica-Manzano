import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { insertOrder, getProducts, getUserByPhone, createUser } from '../../../lib/db';
import { google } from 'googleapis';

// Sesiones en memoria: phone → { flow, data }
const sessions = new Map();

// Inicializamos Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_PHONE_NUMBER;

// Helpers para listas interactivas
function buildDateSections() {
  const today = new Date();
  const sections = [];
  for (let week = 1; week <= 2; week++) {
    const rows = [];
    for (let i = (week - 1) * 7 + 1; i <= week * 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
      rows.push({
        id:    `DATE|${iso}`,
        title: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${d.getDate()}/${d.getMonth()+1}`
      });
    }
    sections.push({ title: `Semana ${week}`, rows });
  }
  return sections;
}

function buildTimeSections(dateIso) {
  const [y, m, d] = dateIso.split('-');
  let dt = new Date(`${y}-${m}-${d}T09:00:00`);
  const end = new Date(`${y}-${m}-${d}T18:00:00`);
  const rows = [];
  while (dt < end) {
    const label = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    rows.push({
      id:    `TIME|${dt.toISOString()}`,
      title: label
    });
    dt = new Date(dt.getTime() + 30 * 60000);
  }
  return [{ title: `Franjas para ${dateIso}`, rows }];
}

async function sendInteractiveList(to, buttonText, sections, bodyText = '') {
  await twilioClient.messages.create({
    from: `whatsapp:${twilioWhatsAppNumber}`,
    to:   `whatsapp:${to}`,
    interactive: {
      type:   'list',
      header: { type: 'text', text: '📅 Reserva de Cita' },
      body:   { text: bodyText || 'Selecciona una opción' },
      footer: { text: 'Envía "menu" para volver al inicio' },
      action: { button: buttonText, sections }
    }
  });
  return new NextResponse('', { status: 200 });
}

export async function POST(req) {
  const formData = await req.formData();
  const fromRaw  = formData.get('From');
  const message  = formData.get('Body').trim();
  const from     = fromRaw.replace('whatsapp:', '');

  let session = sessions.get(from);

  // 1️⃣ Menú principal
  if (!session) {
    sessions.set(from, { flow: 'await_choice', data: {} });
    return sendWhatsAppResponse(from,
      '👋 ¡Hola! ¿Qué deseas hacer?\n1️⃣ PEDIR\n2️⃣ CITAS'
    );
  }

  // 2️⃣ Elección inicial
  if (session.flow === 'await_choice') {
    const lower = message.toLowerCase();
    if (lower.includes('2') || lower.includes('citas')) {
      session.flow = 'appointment';
      session.data.step = 'ask_date';
      sessions.set(from, session);
      return sendInteractiveList(
        from,
        'Elegir fecha',
        buildDateSections(),
        'Elige el día de la semana (plazo máximo 2 semanas)'
      );
    }
    if (lower.includes('1') || lower.includes('pedir')) {
      session.flow = 'order';
      sessions.set(from, session);
      return sendWhatsAppResponse(from,
        '🛒 Perfecto, ¿qué producto y cantidad quieres? (Ej: "2 gafas")'
      );
    }
    return sendWhatsAppResponse(from,
      'No entendí tu elección. Escribe 1 para PEDIR o 2 para CITAS.'
    );
  }

  // Aseguramos que el usuario exista en BD
  let user = await getUserByPhone(parseInt(from));
  if (!user) {
    await createUser({
      email:    `${from}@temp.com`,
      name:     `Cliente ${from}`,
      phone:    from,
      password: Math.random().toString(36).slice(-8),
      role:     'client'
    });
    user = await getUserByPhone(parseInt(from));
  }

  // 3️⃣ Flujo de citas
  if (session.flow === 'appointment') {
    // cancelar
    if (/^menu$/i.test(message)) {
      sessions.delete(from);
      return sendWhatsAppResponse(from, 'Menú: 1️⃣ PEDIR | 2️⃣ CITAS');
    }
    // 3.1) Fecha
    if (session.data.step === 'ask_date') {
      if (message.startsWith('DATE|')) {
        session.data.date = message.split('|')[1];
        session.data.step = 'ask_time';
        sessions.set(from, session);
        return sendInteractiveList(
          from,
          'Elegir hora',
          buildTimeSections(session.data.date),
          `Selecciona la hora para el ${session.data.date}`
        );
      }
      // reenviar si no es válido
      return sendInteractiveList(
        from,
        'Elegir fecha',
        buildDateSections(),
        'Elige el día (plazo máximo 2 semanas)'
      );
    }
    // 3.2) Hora
    if (session.data.step === 'ask_time') {
      if (message.startsWith('TIME|')) {
        const dateTimeIso = message.split('|')[1];
        const start = new Date(dateTimeIso);
        const end   = new Date(start.getTime() + 30 * 60000);

        // Google Calendar
        const oAuth2 = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        oAuth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        const calendar = google.calendar({ version: 'v3', auth: oAuth2 });

        try {
          await calendar.events.insert({
            calendarId: 'primary',
            resource: {
              summary: `Cita WhatsApp - ${user.name}`,
              start:   { dateTime: start.toISOString(), timeZone: 'Europe/Madrid' },
              end:     { dateTime: end.toISOString(),   timeZone: 'Europe/Madrid' }
            }
          });
          sessions.delete(from);
          return sendWhatsAppResponse(from,
            `✅ Cita confirmada para ${start.toLocaleString('es-ES',{ dateStyle:'full', timeStyle:'short' })}`
          );
        } catch (err) {
          console.error('Calendar error:', err);
          sessions.delete(from);
          return sendWhatsAppResponse(from,
            '❌ Error creando la cita. Intenta más tarde.'
          );
        }
      }
      // reenviar lista de horas
      return sendInteractiveList(
        from,
        'Elegir hora',
        buildTimeSections(session.data.date),
        `Selecciona la hora para el ${session.data.date}`
      );
    }
  }

  // 4️⃣ Flujo de pedidos
  if (session.flow === 'order') {
    const details = await processMessage(message);
    if (!details) {
      const products = await getProducts();
      const list = products.map(p => `${p.name} (${p.price}€)`).join(', ');
      return sendWhatsAppResponse(from,
        `No entendí tu pedido. Productos: ${list}\nEj: "2 gafas"`
      );
    }
    await insertOrder({
      orderdate: new Date(),
      amount:    details.amount,
      message:   message,
      iduser:    user.iduser,
      idproduct: details.productId
    });
    sessions.delete(from);
    return sendWhatsAppResponse(from,
      `✅ ¡Pedido recibido! ${details.amount}× ${details.productName}\n` +
      `Total: ${details.amount * details.price}€`
    );
  }

  // Fallback
  sessions.delete(from);
  return sendWhatsAppResponse(from,
    'Ocurrió un error. Envía "menu" para volver al inicio.'
  );
}

// ——— Helpers ———

async function processMessage(message) {
  try {
    const products = await getProducts();
    const lower = message.toLowerCase();
    for (const p of products) {
      const nm = p.name.toLowerCase();
      const regex = new RegExp(`\\b(\\d+)\\s*(?:${nm}|par(?:es)? de ${nm})\\b`, 'i');
      const m = lower.match(regex);
      if (m) {
        return {
          productId:   p.idproduct,
          productName: p.name,
          amount:      parseInt(m[1], 10),
          price:       p.price
        };
      }
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function sendWhatsAppResponse(to, body) {
  // 1) Mensaje vía API
  await twilioClient.messages.create({
    from: `whatsapp:${twilioWhatsAppNumber}`,
    to:   `whatsapp:${to}`,
    body
  });
  // 2) TwiML para el webhook
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(body);
  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}
