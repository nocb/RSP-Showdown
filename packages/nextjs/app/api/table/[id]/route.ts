import { NextResponse } from 'next/server';
import { getTableById } from '~~/utils/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = parseInt(params.id);
    const table = await getTableById(tableId);
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table info' }, 
      { status: 500 }
    );
  }
} 