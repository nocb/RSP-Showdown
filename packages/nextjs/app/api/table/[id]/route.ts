import { NextResponse } from 'next/server';
import { getTableById } from '~~/utils/db';
import { logWithTime, errorWithTime } from '~~/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = parseInt(params.id);
    logWithTime(`API /table/${tableId}: Start fetching table`);
    
    const table = await getTableById(tableId);
    logWithTime(`API /table/${tableId}: Table fetched from DB:`, table);
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    errorWithTime('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table info' }, 
      { status: 500 }
    );
  }
} 