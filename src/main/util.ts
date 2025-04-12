export function asBase64Image(
  data: Buffer<ArrayBufferLike> | string,
  extension = 'png'
): string {
  return `data:image/${extension};base64,${
    typeof data === 'string' ? data : data.toString('base64')
  }`;
}
