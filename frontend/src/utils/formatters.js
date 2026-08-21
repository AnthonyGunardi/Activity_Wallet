/**
 * Formats a numeric value into Indonesian Rupiah currency format.
 * @param {number} amount
 * @returns {string} e.g. "Rp 750.000"
 */
export function formatCurrency(amount = 0) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

/**
 * Formats ISO date string into readable Indonesian format.
 * @param {string} dateString
 * @returns {string} e.g. "19 Agu 2026, 14:30"
 */
export function formatTransactionDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (_e) {
    return dateString;
  }
}

export const formatDateTime = formatTransactionDate;

