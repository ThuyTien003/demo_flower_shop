// Generate breadcrumbs based on current route
export const generateBreadcrumbs = (pathname, search, categories = []) => {
  const items = [{ label: 'Trang chủ', to: '/' }];
  const params = new URLSearchParams(search || '');

  if (pathname === '/') return items;

  // Products page
  if (pathname === '/products') {
    const catId = params.get('category_id');
    if (catId) {
      const cat = categories.find(c => String(c.category_id) === String(catId));
      items.push({ label: cat?.name || 'Tất cả sản phẩm', to: `/products${search}` });
    } else {
      items.push({ label: 'Tất cả sản phẩm', to: '/products' });
    }
    return items;
  }

  // Product detail
  if (pathname.startsWith('/products/')) {
    items.push({ label: 'Tất cả sản phẩm', to: '/products' });
    items.push({ label: 'Chi tiết sản phẩm' });
    return items;
  }

  // Common pages
  const commonPages = {
    '/wishlist': 'Danh sách yêu thích',
    '/cart': 'Giỏ hàng',
    '/checkout': 'Thanh toán',
    '/profile': 'Tài khoản của tôi'
  };

  if (commonPages[pathname]) {
    items.push({ label: commonPages[pathname], to: pathname });
    return items;
  }

  // Fallback: split path segments
  const segments = pathname.split('/').filter(Boolean);
  segments.forEach((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/');
    const label = decodeURIComponent(seg).replace(/-/g, ' ');
    items.push({ label, to: path });
  });

  return items;
};
