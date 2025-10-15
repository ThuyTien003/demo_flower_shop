import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, padding: '16px 0' }}>
      <aside style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: '#fff', height: 'fit-content', position: 'sticky', top: 16 }}>
        <div style={{ padding: 14, fontWeight: 900, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>Admin Panel</div>
        <nav style={{ display: 'grid', padding: 8 }}>
          <Link to="/admin" style={{ ...styles.navItem, ...(isActive('/admin') ? styles.navItemActive : {}) }}>Dashboard</Link>
          <Link to="/admin/users" style={{ ...styles.navItem, ...(isActive('/admin/users') ? styles.navItemActive : {}) }}>Users</Link>
          <Link to="/admin/categories" style={{ ...styles.navItem, ...(isActive('/admin/categories') ? styles.navItemActive : {}) }}>Categories</Link>
          <Link to="/admin/products" style={{ ...styles.navItem, ...(isActive('/admin/products') ? styles.navItemActive : {}) }}>Products</Link>
          <Link to="/admin/orders" style={{ ...styles.navItem, ...(isActive('/admin/orders') ? styles.navItemActive : {}) }}>Orders</Link>
          <Link to="/admin/logs" style={{ ...styles.navItem, ...(isActive('/admin/logs') ? styles.navItemActive : {}) }}>Logs</Link>
          <Link to="/admin/product-history" style={{ ...styles.navItem, ...(isActive('/admin/product-history') ? styles.navItemActive : {}) }}>Product History</Link>
          <Link to="/admin/sliders" style={{ ...styles.navItem, ...(isActive('/admin/sliders') ? styles.navItemActive : {}) }}>Sliders</Link>
        </nav>
      </aside>
      <section style={{ minHeight: 360 }}>
        <div style={{ position: 'sticky', top: 16, zIndex: 1 }}>
          {/* Space reserved for sticky header if pages use AdminHeader */}
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}

const styles = {
  navItem: { padding: '10px 12px', textDecoration: 'none', color: '#111', fontWeight: 700, borderRadius: 8, margin: 4 },
  navItemActive: { background: '#0f3524', color: '#fff' },
};
