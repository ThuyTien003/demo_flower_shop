import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, changePassword } from '@/services/api';
import { formatDate, formatPrice } from '@/utils/format';
import { getAuthToken } from '@/utils/session';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersErr, setOrdersErr] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // default show orders as in screenshot
  const navigate = useNavigate();


  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Không tải được hồ sơ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // No wishlist/address section

  const token = getAuthToken();
  const loadOrders = async (p = 1) => {
    try {
      setOrdersLoading(true);
      setOrdersErr('');
      const res = await fetch(`/api/orders/my?page=${p}&limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Không tải được đơn hàng');
      setOrders(data.data || []);
    } catch (e) {
      setOrdersErr(e.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangePwd = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await changePassword(pwd);
      setMsg('Đổi mật khẩu thành công');
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const onLogout = () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  if (loading) return <div style={styles.container}>Đang tải...</div>;
  if (err) return <div style={styles.container}>Lỗi: {err}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerBox}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>TRANG TÀI KHOẢN</div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>TRANG TÀI KHOẢN</div>
          {profile && (
            <div style={{ marginBottom: 10 }}>Xin chào, <b>{profile.full_name || profile.username}</b> !</div>
          )}
          <nav style={styles.navList}>
            <button style={{ ...styles.navItem, ...(activeTab === 'info' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('info')}>
              Thông tin tài khoản
            </button>
            <button style={{ ...styles.navItem, ...(activeTab === 'orders' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('orders')}>
              Đơn hàng của bạn
            </button>
            <button style={{ ...styles.navItem, ...(activeTab === 'password' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('password')}>
              Đổi mật khẩu
            </button>
            <button style={{ ...styles.navItem, ...styles.logoutBtn }} onClick={onLogout}>
              Đăng xuất
            </button>
          </nav>
        </aside>

        <section style={styles.content}>
          {activeTab === 'info' && (
            <div>
              <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>Thông tin tài khoản</h2>
              {profile && (
                <div style={styles.card}>
                  <div><b>Họ tên:</b> {profile.full_name || '-'}</div>
                  <div><b>Email:</b> {profile.email}</div>
                  <div><b>Tên đăng nhập:</b> {profile.username}</div>
                  <div><b>Điện thoại:</b> {profile.phone || '-'}</div>
                  <div><b>Địa chỉ:</b> {profile.address || '-'}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={styles.sectionTitle}>ĐƠN HÀNG CỦA BẠN</h2>
              <div style={styles.ordersBox}>
                {ordersLoading && <div>Đang tải danh sách đơn hàng...</div>}
                {ordersErr && <div style={styles.error}>Lỗi: {ordersErr}</div>}
                {!ordersLoading && !ordersErr && (
                  <>
                    {orders.length === 0 ? (
                      <div>Chưa có đơn hàng nào.</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                          <thead>
                            <tr style={styles.tableHeadRow}>
                              <th style={styles.th}>Đơn hàng</th>
                              <th style={styles.th}>Ngày</th>
                              <th style={styles.th}>Địa chỉ</th>
                              <th style={styles.th}>Giá trị đơn hàng</th>
                              <th style={styles.th}>TT thanh toán</th>
                              <th style={styles.th}>Trạng thái đơn hàng</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((o) => (
                              <tr key={o.order_id}>
                                <td style={styles.td}><Link to={`/orders/${o.order_id}`} style={{ color: '#0a58ca' }}>#{o.order_id}</Link></td>
                                <td style={styles.td}>{formatDate(o.created_at || o.createdAt || o.created_date || o.order_date)}</td>
                                <td style={styles.td}>{o.shipping_address || '-'}</td>
                                <td style={styles.td}>{formatPrice(o.total_amount || 0)}</td>
                                <td style={styles.td}>{(o.payment_status || 'Chưa thu tiền')}</td>
                                <td style={styles.td}>
                                  <span style={{ textTransform: 'capitalize' }}>{o.status || '-'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 style={styles.sectionTitle}>Đổi mật khẩu</h2>
              <form onSubmit={onChangePwd} style={styles.form}>
                {msg && <div style={styles.success}>{msg}</div>}
                {err && <div style={styles.error}>{err}</div>}
                <label>Mật khẩu hiện tại</label>
                <input style={styles.input} type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
                <label>Mật khẩu mới</label>
                <input style={styles.input} type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
                <button style={styles.button} type="submit">Cập nhật</button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1100, margin: '32px auto', padding: 24 },
  headerBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 },
  sidebar: { padding: 8, height: 'fit-content' },
  sidebarTitle: { fontWeight: 700, marginBottom: 8 },
  navList: { display: 'grid', gap: 8 },
  navItem: { display: 'block', textAlign: 'left', padding: '6px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: '#222', fontSize: 14 },
  navItemActive: { color: '#e85d04', fontWeight: 700 },
  logoutBtn: { color: '#b00020' },
  content: { },
  sectionTitle: { marginTop: 0, marginBottom: 12 },
  card: { border: '1px solid #f1f1f1', borderRadius: 12, padding: 16, background: '#fff', marginBottom: 20, display: 'grid', gap: 8 },
  form: { display: 'grid', gap: 10, maxWidth: 420 },
  success: { color: '#0a7', background: '#e8fff3', padding: 8, borderRadius: 8 },
  error: { color: '#b00020', background: '#fdecea', padding: 8, borderRadius: 8 },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 },
  button: { padding: '10px 14px', borderRadius: 10, border: '1px solid #0f3524', background: '#0f3524', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  ordersBox: { marginTop: 4, background: '#fff' },
  orderRow: { },
  linkBtn: { display: 'inline-block', marginTop: 6, padding: '6px 10px', border: '1px solid #0a58ca', color: '#0a58ca', borderRadius: 8 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 720 },
  tableHeadRow: { background: '#e85d04', color: '#fff' },
  th: { textAlign: 'left', padding: '10px 12px', fontWeight: 700, borderRight: '1px solid #f6b78a' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f1f1', color: '#222' },
};
