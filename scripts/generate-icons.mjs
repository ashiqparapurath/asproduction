import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
// Preserve the supplied monogram; remove its transparent canvas before sizing.
const logo = await sharp('public/ts logo black.png').trim().png().toBuffer();
await mkdir('public/icons', { recursive: true });
for (const size of [180, 192, 512, 1024]) {
  for (const maskable of size === 512 ? [false, true] : [false]) {
    const extent = Math.round(size * (maskable ? 0.56 : 0.68));
    const foreground = await sharp(logo).resize(extent, extent, { fit: 'inside' }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 3, background: '#faf8f3' } })
      .composite([{ input: foreground, gravity: 'centre' }]).png()
      .toFile(`public/icons/app-${size}${maskable ? '-maskable' : ''}.png`);
  }
}
