import { NextResponse } from 'next/server';
import { getUsers, getUserById, updateUser, deleteUser, getUserStats, createUser } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verificar si hay un ID específico en la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      const userStats = await getUserStats();
      return NextResponse.json(userStats);
    }

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

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.email || !data.name || !data.phone) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }
    
    // Establecer rol por defecto si no se proporciona
    if (!data.role) {
      data.role = 'client';
    }
    
    // Crear contraseña temporal si no se proporciona
    if (!data.password) {
      data.password = Math.random().toString(36).slice(-8); // Contraseña aleatoria
    }
    
    const result = await createUser(data);
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Validar ID de usuario
    if (!data.iduser) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }
    
    // Validar datos requeridos
    if (!data.email || !data.name || !data.phone) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }
    
    // Verificar que el usuario existe
    const existingUser = await getUserById(data.iduser);
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const result = await updateUser(data);
    return NextResponse.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }
    
    // Verificar que el usuario existe
    const existingUser = await getUserById(parseInt(id));
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const result = await deleteUser(parseInt(id));
    return NextResponse.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}