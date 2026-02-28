import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
    
    const res = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      return NextResponse.json({ status: 'disconnected' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: 'disconnected', error: String(error) }, { status: 500 });
  }
}