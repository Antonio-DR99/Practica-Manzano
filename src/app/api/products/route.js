import { NextResponse } from 'next/server';
import { getProducts, getProductById } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verificar si hay un ID específico en la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await getProductById(parseInt(id));
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}