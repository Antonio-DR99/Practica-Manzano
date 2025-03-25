import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { insertOrder, getProducts, getUserByPhone, createUser } from '../../../lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get('Body');
    const fromNumber = formData.get('From').replace('whatsapp:', '');

    // Intentar obtener el usuario por número de teléfono
    let user = await getUserByPhone(parseInt(fromNumber));
    
    // Si el usuario no existe, crearlo
    if (!user) {
      const result = await createUser({
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
      return sendWhatsAppResponse(
        `Lo siento, no pude entender tu pedido. Por favor, especifica el producto y la cantidad.\n` +
        `Productos disponibles: ${productList}\n` +
        `Ejemplo: "Quiero 2 gafas" o "1 par de lentillas"`
      );
    }

    // Guardar el pedido en la base de datos
    await insertOrder({
      orderdate: new Date(),
      amount: orderDetails.amount,
      message: message,
      iduser: user.iduser,
      idproduct: orderDetails.productId
    });

    return sendWhatsAppResponse(
      `¡Gracias ${user.name}! Tu pedido ha sido recibido:\n` +
      `${orderDetails.amount}x ${orderDetails.productName}\n` +
      `Total: ${orderDetails.amount * orderDetails.price}€\n` +
      `Te contactaremos pronto para confirmar los detalles.`
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function processMessage(message) {
  try {
    const products = await getProducts();
    const lowerMessage = message.toLowerCase();
    
    // Buscar coincidencias de productos en el mensaje
    for (const product of products) {
      const regex = new RegExp(`\\b(\\d+)\\s*(?:${product.name}|par(?:es)?\\s+de\\s+${product.name})\\b`);
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

function sendWhatsAppResponse(message) {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  
  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}