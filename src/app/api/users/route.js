import { NextResponse } from 'next/server';
import { getUsers, getUserById } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verificar si hay un ID específico en la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const user = await getUserById(parseInt(id));
      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}