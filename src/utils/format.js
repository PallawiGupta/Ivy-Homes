/**
 * Formats a number into Indian Rupee notation (Cr, Lakh, or thousands).
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Price on Request';
  const num = Math.abs(Number(val));
  if (num === 0) return 'Price on Request';

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Capitalizes string words.
 */
export function capitalize(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
