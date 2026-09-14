/**
 * Formats a number into Indian Rupee notation (Cr, Lakh, or thousands).
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} Lakh`;
  }
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
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
