import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use API_URL for server-side calls (not exposed to browser)
    const apiUrl = process.env.API_URL || 
                   process.env.NEXT_PUBLIC_API_URL || 
                   'http://localhost:8000';
    
    console.log('Calling API at:', apiUrl);
    
    const res = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ status: 'disconnected', error: String(error) }, { status: 500 });
  }
}