// Removed unused types imports
// Helper: format price in INR
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// Helper: calculate discount percentage
export const getDiscountPercent = (price: number, salePrice: number): number =>
  Math.round(((price - salePrice) / price) * 100);
