const MAX_PRODUCT_IMAGE_EDGE = 960;
const WEBP_QUALITY = 0.78;

export const prepareProductImage = async (file) => {
  if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }
  if (typeof document === 'undefined' || !HTMLCanvasElement.prototype.toBlob) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, MAX_PRODUCT_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
    if (!webp || webp.type !== 'image/webp' || webp.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') || 'product';
    return new File([webp], `${name}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
