// Format number to Vietnamese currency with symbol
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format price: 100000 → "100,000 đ"
export const formatPrice = (amount) => {
  return Number(amount).toLocaleString('vi-VN') + ' đ';
};

// Format date to Vietnamese locale
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('vi-VN');
};

// Format time to HH:MM
export const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
