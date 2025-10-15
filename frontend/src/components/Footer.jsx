import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        {/* Contact */}
        <div style={styles.col}>
          <div style={styles.brand}>NHÀ HOA TƯƠI</div>
          <ul style={styles.contactList} className="footer-contact">
            <li style={styles.contactItem}><FaMapMarkerAlt /> <span>Địa chỉ: 8 Châu Thị Hóa, Phường 4, Quận 8 (Online)</span></li>
            <li style={styles.contactItem}><FaPhoneAlt /> <a href="tel:0327458490" className="footer-link">Điện thoại: 0327458490</a></li>
            <li style={styles.contactItem}><FaEnvelope /> <a href="mailto:gochoaxinh@gmail.com" className="footer-link">Email: nhahoatuoi@gmail.com</a></li>
          </ul>
          <div style={styles.socials}>
            <a href="#" aria-label="Facebook" style={styles.socialBtn}><FaFacebookF /></a>
            <a href="#" aria-label="Instagram" style={styles.socialBtn}><FaInstagram /></a>
          </div>
        </div>

        {/* Menu */}
        <div style={styles.col}>
          <div style={styles.colTitle}>MENU</div>
          <ul style={styles.linkList}>
            <li><Link to="/" style={styles.link} className="footer-link">TRANG CHỦ</Link></li>
            <li><Link to="/products" style={styles.link} className="footer-link">TẤT CẢ SẢN PHẨM</Link></li>
            <li><Link to={{ pathname: '/products', search: '?q=Bó%20hoa%20tươi' }} style={styles.link} className="footer-link">BÓ HOA TƯƠI</Link></li>
            <li><Link to={{ pathname: '/products', search: '?q=Kệ%20hoa%20chúc%20mừng' }} style={styles.link} className="footer-link">KỆ HOA CHÚC MỪNG</Link></li>
            <li><Link to={{ pathname: '/products', search: '?q=Hoa%20cưới' }} style={styles.link} className="footer-link">HOA CUỚI</Link></li>
            <li><Link to={{ pathname: '/products', search: '?q=Hoa%20sáp' }} style={styles.link} className="footer-link">HOA SÁP</Link></li>
            <li><Link to="/news" style={styles.link} className="footer-link">TIN TỨC</Link></li>
            <li><Link to="/contact" style={styles.link} className="footer-link">LIÊN HỆ</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div style={styles.col}>
          <div style={styles.colTitle}>CHÍNH SÁCH</div>
          <ul style={styles.linkList}>
            <li><Link to="/policies/payment" style={styles.link} className="footer-link">Hình Thức Thanh Toán</Link></li>
            <li><Link to="/policies/shipping" style={styles.link} className="footer-link">Chính sách giao hàng</Link></li>
            <li><Link to="/policies/privacy" style={styles.link} className="footer-link">Chính sách bảo mật thông tin</Link></li>
            <li><Link to="/policies/warranty" style={styles.link} className="footer-link">Chính sách bảo hành</Link></li>
            <li><Link to="/policies/terms" style={styles.link} className="footer-link">Điều khoản sử dụng</Link></li>
          </ul>
        </div>
      </div>

      <div style={styles.bottom}>
        <div className="container" style={styles.bottomInner}>
          <span>© {new Date().getFullYear()} NHÀ HOA TƯƠI. Thủy Tiên . Yến Bình</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { marginTop: 40, background: '#14452F', color: '#fff', borderTop: '1px solid rgba(255,255,255,.1)' },
  inner: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24, padding: '32px 0' },
  brand: { fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 8 },
  socials: { display: 'flex', gap: 12, marginTop: 12 },
  socialBtn: { width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,.35)', color: '#fff', textDecoration: 'none' },
  col: {},
  colTitle: { fontWeight: 700, marginBottom: 12, color: '#fff' },
  linkList: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 },
  link: { textDecoration: 'none', color: '#fff' },
  contactList: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 },
  contactItem: { display: 'flex', alignItems: 'center', gap: 8, color: '#fff' },
  bottom: { borderTop: '1px solid rgba(255,255,255,.1)', background: '#14452F' },
  bottomInner: { padding: '12px 0', color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
};
