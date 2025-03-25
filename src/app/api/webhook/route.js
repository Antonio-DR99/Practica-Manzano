import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { insertOrder } from '../../../lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get('Body');
    const from = formData.get('From');

    // Procesar el mensaje
    const orderDetails = processMessage(message);
    
    if (!orderDetails) {
      return sendWhatsAppResponse("Lo siento, no pude entender tu pedido. Por favor, especifica el producto y la cantidad.");
    }

    // Guardar el pedido en la base de datos
    await insertOrder({
      orderdate: new Date(),
      amount: orderDetails.amount,
      message: message,
      idproduct: orderDetails.productId,
      iduser: 1 // Por defecto asignamos al primer usuario, esto debería mejorarse
    });

    return sendWhatsAppResponse("¡Gracias! Tu pedido ha sido recibido y será procesado pronto.");
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function processMessage(message) {
  // Aquí implementaremos la lógica para extraer la información del pedido del mensaje
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('gafas')) {
    return { productId: 1, amount: 1 };
  } else if (lowerMessage.includes('lentillas')) {
    return { productId: 2, amount: 1 };
  }
  
  return null;
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