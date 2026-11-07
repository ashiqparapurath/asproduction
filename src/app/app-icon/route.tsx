import { NextResponse } from 'next/server';
// Preserve existing installed-app URLs while serving build-time assets.
export function GET(request: Request) {
  const size = new URL(request.url).searchParams.get('size') === '192' ? 192 : 512;
  return NextResponse.redirect(new URL(`/icons/app-${size}.png`, request.url), 308);
}
