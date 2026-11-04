// Prepare before the final Share tap so image loading cannot consume the
// user activation required by the native share sheet.
export async function prepareSharePhoto(source, id) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Photo preparation unavailable');
  context.fillStyle = '#f7f1e6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .9));
  if (!blob) throw new Error('Photo preparation failed');
  return new File([blob], `pocitel-${id}.jpg`, { type: 'image/jpeg' });
}
