import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ ok: false, error: 'Only available in development' }, { status: 403 });
  }

  try {
    const { level, args, timestamp, url } = await request.json();
    
    const colors = {
      log: '\x1b[37m',    // blanco
      info: '\x1b[36m',   // cyan
      warn: '\x1b[33m',   // amarillo
      error: '\x1b[31m',  // rojo
      reset: '\x1b[0m'
    };

    const color = colors[level as keyof typeof colors] || colors.log;
    const time = new Date(timestamp).toLocaleTimeString();
    
    // 🔥 Esto aparece en tu terminal de Next.js
    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${time} - ${args.join(' ')}`);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in dev-logs endpoint:', error);
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}