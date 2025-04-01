import { NextResponse } from 'next/server';
import { getQuotes, getQuoteById, createQuote, updateQuote, deleteQuote } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verificar si hay un ID específico en la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (id) {
      const quote = await getQuoteById(parseInt(id));
      if (!quote) {
        return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
      }
      return NextResponse.json(quote);
    }

    // Filtrar por usuario si se proporciona userId
    if (userId) {
      const quotes = await getQuotes({ userId: parseInt(userId) });
      return NextResponse.json(quotes);
    }

    // Filtrar por fecha si se proporciona date
    if (date) {
      const quotes = await getQuotes({ date });
      return NextResponse.json(quotes);
    }

    const quotes = await getQuotes({});
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error getting quotes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.date || !data.iduser) {
      return NextResponse.json({ error: 'Faltan datos requeridos (fecha y usuario)' }, { status: 400 });
    }
    
    const result = await createQuote(data);
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Validar ID de la cita
    if (!data.idquote) {
      return NextResponse.json({ error: 'ID de cita requerido' }, { status: 400 });
    }
    
    // Validar datos requeridos
    if (!data.date || !data.iduser) {
      return NextResponse.json({ error: 'Faltan datos requeridos (fecha y usuario)' }, { status: 400 });
    }
    
    // Verificar que la cita existe
    const existingQuote = await getQuoteById(data.idquote);
    if (!existingQuote) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }
    
    const result = await updateQuote(data);
    return NextResponse.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de cita requerido' }, { status: 400 });
    }
    
    // Verificar que la cita existe
    const existingQuote = await getQuoteById(parseInt(id));
    if (!existingQuote) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }
    
    const result = await deleteQuote(parseInt(id));
    return NextResponse.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}