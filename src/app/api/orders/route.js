import { NextResponse } from 'next/server';
import { getOrders, getOrderById } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verificar si hay un ID específico en la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const order = await getOrderById(parseInt(id));
      if (!order) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}