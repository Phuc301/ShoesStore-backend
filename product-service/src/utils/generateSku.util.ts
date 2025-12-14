export const generateSku = (productId: number, color: string, size: string) => {
  const colorCode = color.replace(/\s+/g, '').toUpperCase();
  const idCode = productId.toString().padStart(4, '0');
  return `${idCode}-${colorCode}-${size}`;
};
