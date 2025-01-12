import { NextResponse } from 'next/server';
import { getTables } from '~~/utils/db';
import { logWithTime, errorWithTime } from '~~/utils/logger';

export async function GET() {
  try {
    logWithTime('API /tables: Start fetching tables');
    const tables = await getTables();
    logWithTime('API /tables: Tables fetched from DB:', tables);
    
    return NextResponse.json(tables);
  } catch (error) {
    errorWithTime('API /tables Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' }, 
      { status: 500 }
    );
  }
} 