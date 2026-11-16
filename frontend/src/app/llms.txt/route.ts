import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    content = `# Gyanmitra News\n\n> ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित ताज़ा हिंदी समाचार पोर्टल।\n\n- [Home](https://gyanmitranews.com/)\n- [Competitions](https://gyanmitranews.com/competitions)\n- [Search](https://gyanmitranews.com/search)\n`;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
