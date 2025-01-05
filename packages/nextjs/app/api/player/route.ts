import { NextResponse } from 'next/server';
import { savePlayerInfo } from '~~/utils/db';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    const result = await savePlayerInfo(address);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save player info' }, 
      { status: 500 }
    );
  }
} 