import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaPhoneAlt, FaHeart, FaShoppingCart, FaUser, FaChevronDown, FaTools } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { fetchCategories, getCartCount } from '@/services/api';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';

export default function Navbar() {
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  // Load categories to build header menu links by category_id
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Load cart count and subscribe to cart updates
  useEffect(() => {
    let cancelled = false;
    const loadCount = async () => {
      try {
        const res = await getCartCount();
        if (!cancelled) {
          setCartCount(res.data?.data?.count || 0);
        }
      } catch {
        // ignore
      }
    };
    loadCount();
    const onUpdated = () => loadCount();
    window.addEventListener('cart-updated', onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('cart-updated', onUpdated);
    };
  }, []);

  const getCategoryIdByName = (name) => {
    const found = categories.find((c) => (c.name || '').toLowerCase() === name.toLowerCase());
    return found?.category_id;
  };

  const categoryLink = (name) => {
    const id = getCategoryIdByName(name);
    return id ? `/products?category_id=${encodeURIComponent(id)}` : '/products';
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname, location.search, categories);

  return (
    <header>
      {/* Main Header */}
      <div style={styles.mainHeaderBg}>
        <div className="container" style={styles.mainHeader}>
          <div style={styles.brand}><Link to="/" style={styles.brandLink}>NHÀ HOA TƯƠI</Link></div>
          <form onSubmit={onSearch} style={styles.searchWide}>
            <input type="text" placeholder="Tìm kiếm hoa..." value={q} onChange={(e) => setQ(e.target.value)} style={styles.input} />
            <button type="submit" style={styles.searchBtn}>Tìm</button>
          </form>
          <div style={styles.actions}>
            <a href="tel:0123456789" style={styles.actionLink}>
              <FaPhoneAlt />
              <span style={styles.phoneText}>
                <span style={styles.phoneTitle}>Gọi giao hàng</span>
                <span style={styles.phoneNumber}>032 745 8490</span>
              </span>
            </a>
            <div
              style={styles.account}
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                type="button"
                style={styles.accountBtn}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                <FaUser /> <span>Thông tin tài khoản</span>
                <FaChevronDown style={{ transition: 'transform .2s', transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {accountOpen && (
                <div className="account-dropdown" style={styles.dropdown} role="menu">
                  {!user ? (
                    <>
                      <Link
                        to="/register"
                        className="account-dropdown-item"
                        style={{ ...styles.dropdownItem, ...(hoveredItem === 0 ? styles.dropdownItemHover : {}) }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(0)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Đăng ký</Link>
                      <Link
                        to="/login"
                        className="account-dropdown-item"
                        style={{ ...styles.dropdownItem, ...(hoveredItem === 1 ? styles.dropdownItemHover : {}) }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(1)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Đăng nhập</Link>
                      <Link
                        to="/wishlist"
                        className="account-dropdown-item"
                        style={{ ...styles.dropdownItem, ...(hoveredItem === 2 ? styles.dropdownItemHover : {}) }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(2)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Danh sách yêu thích</Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        className="account-dropdown-item"
                        style={{ ...styles.dropdownItem, ...(hoveredItem === 0 ? styles.dropdownItemHover : {}) }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(0)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Tài khoản của tôi</Link>
                      <Link
                        to="/wishlist"
                        className="account-dropdown-item"
                        style={{ ...styles.dropdownItem, ...(hoveredItem === 1 ? styles.dropdownItemHover : {}) }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(1)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Danh sách yêu thích</Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="account-dropdown-item"
                          style={{ ...styles.dropdownItem, ...(hoveredItem === 2 ? styles.dropdownItemHover : {}) }}
                          role="menuitem"
                          title="Trang quản trị: Quản lý Logs • Lịch sử sản phẩm • Slider"
                          aria-label="Trang quản trị: Quản lý Logs, Lịch sử sản phẩm và Slider"
                          onMouseEnter={() => setHoveredItem(2)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: hoveredItem === 2 ? '#fff' : '#14452F', transition: 'color 200ms ease' }}>
                            <FaTools />
                            <span style={{ color: 'inherit', transition: 'color 200ms ease' }}>Trang quản trị</span>
                            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, color: hoveredItem === 2 ? '#0f3524' : '#14452F', background: hoveredItem === 2 ? '#fff' : '#e9f5ef', border: '1px solid #14452F', padding: '2px 6px', borderRadius: 999, transition: 'color 200ms ease, background 200ms ease, border-color 200ms ease' }}>ADMIN</span>
                          </span>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="account-dropdown-item"
                        style={{
                          ...styles.dropdownItem,
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          // Ensure hover styles take precedence
                          ...(hoveredItem === 3 ? styles.dropdownItemHover : {}),
                        }}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItem(3)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >Đăng xuất</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/cart" style={{ ...styles.actionLink, position: 'relative' }}>
              <FaShoppingCart /> Giỏ hàng
              {cartCount > 0 && (
                <span style={styles.cartBadge} aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Header Menu */}
      <div style={styles.menuBg}>
        <nav className="container" style={styles.menu}>
          <Link to="/" className="menu-link" style={styles.menuLink}>Trang chủ</Link>
          <Link to="/products" className="menu-link" style={styles.menuLink}>Tất cả sản phẩm</Link>
          <Link to={categoryLink('Bó hoa tươi')} className="menu-link" style={styles.menuLink}>Bó hoa tươi</Link>
          <Link to={categoryLink('Hoa cưới')} className="menu-link" style={styles.menuLink}>Hoa cưới</Link>
          <Link to={categoryLink('Hoa khai trương')} className="menu-link" style={styles.menuLink}>Hoa khai trương</Link>
          <Link to={categoryLink('Hoa sáp')} className="menu-link menu-link--white-underline" style={styles.menuLink}>Hoa sáp</Link>
          <Link to="/news" className="menu-link" style={styles.menuLink}>Tin tức</Link>
          <Link to="/contact" className="menu-link" style={styles.menuLink}>Liên hệ</Link>
        </nav>
      </div>

      {/* Breadcrumbs */}
      <div style={styles.breadcrumbBg}>
        <div className="container" style={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((bc, idx) => (
            <span key={idx} style={styles.breadcrumbItem}>
              {bc.to && idx !== breadcrumbs.length - 1 ? (
                <Link to={bc.to} style={styles.breadcrumbLink}>{bc.label}</Link>
              ) : (
                <span style={styles.breadcrumbCurrent}>{bc.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span style={styles.breadcrumbSep}>›</span>}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

const styles = {
  mainHeaderBg: { position: 'sticky', top: 0, zIndex: 20, background: '#14452F', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.1)' },
  mainHeader: { display: 'grid', gridTemplateColumns: '1fr 2fr 1.6fr', alignItems: 'center', gap: 16, padding: '10px 0' },
  brand: { fontWeight: 800, fontSize: 22, fontFamily: 'Playfair Display, serif' },
  brandLink: { textDecoration: 'none', color: '#fff' },
  searchWide: { display: 'flex', gap: 8 },
  input: { padding: '10px 12px', border: '1px solid rgba(255,255,255,.3)', borderRadius: 999, flex: 1, background: '#fff', color: '#111' },
  searchBtn: { padding: '10px 14px', borderRadius: 999, border: '1px solid #0f3524', background: '#0f3524', color: '#fff' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, position: 'relative' },
  actionLink: { display: 'flex', alignItems: 'center', gap: 6, color: '#fff', textDecoration: 'none', fontWeight: 600 },
  cartBadge: { position: 'absolute', top: -6, right: -10, background: '#e85d04', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12, fontWeight: 800 },
  phoneText: { display: 'grid', lineHeight: 1.1 },
  phoneTitle: { fontSize: 12, opacity: 0.9, fontWeight: 600 },
  phoneNumber: { fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap' },
  account: { position: 'relative' },
  accountBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 700 },
  dropdown: { position: 'absolute', top: '100%', right: 0, minWidth: 220, background: '#fff', color: '#111', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 8, display: 'grid', zIndex: 50 },
  dropdownItem: { padding: '10px 12px', borderRadius: 8, color: '#111', textDecoration: 'none', fontWeight: 600, transition: 'background 160ms ease, color 160ms ease', cursor: 'pointer' },
  dropdownItemHover: { background: '#0f3524', color: '#fff' },
  logoutBtn: { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff' },
  menuBg: { background: '#14452F', color: '#fff' },
  menu: { display: 'flex', gap: 0, padding: '8px 0', overflowX: 'auto', justifyContent: 'space-between' },
  menuLink: { color: '#fff', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap', flex: 1, textAlign: 'center', padding: '10px 0' },
  breadcrumbBg: { background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' },
  breadcrumbs: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 14 },
  breadcrumbItem: { display: 'flex', alignItems: 'center', gap: 8 },
  breadcrumbLink: { color: 'var(--muted)', textDecoration: 'none' },
  breadcrumbCurrent: { color: 'var(--text)', fontWeight: 700 },
  breadcrumbSep: { color: 'var(--muted)' },
}
