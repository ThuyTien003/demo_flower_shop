// Dispatch cart updated event
export const notifyCartUpdated = () => {
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

// Calculate cart totals - Returns { totalItems, totalQuantity, totalAmount }
export const calculateCartTotals = (items = []) => {
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.unit_price || item.price || 0);
    const qty = Number(item.quantity || 0);
    return sum + (price * qty);
  }, 0);

  return { totalItems, totalQuantity, totalAmount };
};

// Check if product is in stock
export const isInStock = (product, requestedQty = 1) => {
  const stock = Number(product.stock_quantity || product.stock || 0);
  return stock >= requestedQty;
};
