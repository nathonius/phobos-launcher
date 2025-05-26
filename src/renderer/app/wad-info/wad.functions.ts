import type { Picture, Rgb } from '@nrkn/wad/dist/lumps/types';

export function getColor(palette: Rgb[], i: number) {
  const p = i * 3;
  const r = palette[p];
  const g = palette[p + 1];
  const b = palette[p + 2];
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const color = `rgb( ${r}, ${g}, ${b} )`;
  return color;
}

const transparent = 247;

export function imageToCanvas(image: Picture, palette: Rgb[], block = 4) {
  const { width, height, columns } = image;
  const canvas = document.createElement('canvas');
  const cw = block * width;
  const ch = block * height;
  canvas.width = cw;
  canvas.height = ch;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas for image');
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = columns[x][y];
      if (c !== transparent) {
        const color = getColor(palette, c);
        context.fillStyle = color;
        context.fillRect(x * block, y * block, block, block);
      }
    }
  }
  return canvas;
}

export async function canvasToBuffer(canvas: HTMLCanvasElement) {
  const { promise, resolve } = Promise.withResolvers<Blob | null>();
  canvas.toBlob((b) => {
    resolve(b);
  });
  const blob: Blob | null = await promise;
  return await blob?.arrayBuffer();
}
