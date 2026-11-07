import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const size = url.searchParams.get('size') === '192' ? 192 : 512;
  const logo = await readFile(path.join(process.cwd(), 'public', 'ts logo black.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
      <img src={src} alt="" width={Math.round(size * 0.86)} height={Math.round(size * 0.86)} style={{ objectFit: 'contain' }} />
    </div>,
    { width: size, height: size, headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
