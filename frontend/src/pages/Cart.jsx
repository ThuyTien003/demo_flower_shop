import { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeCartItem } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/format';

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total_items: 0, total_quantity: 0, total_amount: 0 });
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getCart();
      const data = res.data?.data || {};
      setItems(data.items || []);
      setSummary(data.total || { total_items: 0, total_quantity: 0, total_amount: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const onQtyChange = async (product_id, qty) => {
    try {
      await updateCartItem(product_id, qty);
      await loadCart();
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const onRemove = async (product_id) => {
    try {
      await removeCartItem(product_id);
      await loadCart();
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="container" style={{ padding: 16 }}>Đang tải giỏ hàng...</div>;

  return (
    <div className="container" style={{ padding: 16 }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/">Trang chủ</Link> <span>/</span> <span>Giỏ hàng</span>
      </nav>

      <h1>Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div style={styles.empty}>Giỏ hàng trống. <Link to="/products">Tiếp tục mua sắm</Link></div>
      ) : (
        <div>
          <div style={styles.table}>
            <div style={styles.headerRow}>
              <div style={{ ...styles.headerCell, flex: 1 }}>THÔNG TIN SẢN PHẨM</div>
              <div style={styles.headerCell}>ĐƠN GIÁ</div>
              <div style={styles.headerCell}>SỐ LƯỢNG</div>
              <div style={styles.headerCell}>THÀNH TIỀN</div>
            </div>

            {items.map((item) => (
              <div key={item.cart_item_id} style={styles.bodyRow}>
                <div style={{ ...styles.colInfo }}>
                  <img src={item.image_url || 'https://via.placeholder.com/100x75?text=No+Image'} alt={item.name} style={styles.thumb} />
                  <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <button onClick={() => onRemove(item.product_id)} style={styles.removeBtn}>Xóa</button>
                  </div>
                </div>
                <div style={styles.colPrice}>{formatPrice(item.unit_price)}</div>
                <div style={styles.colQty}>
                  <button style={styles.qtyBtn} onClick={() => onQtyChange(item.product_id, Math.max(0, item.quantity - 1))}>−</button>
                  <input
                    type="number"
                    value={item.quantity}
                    min={0}
                    max={item.stock_quantity || 999}
                    onChange={(e) => onQtyChange(item.product_id, Math.max(0, parseInt(e.target.value || '0', 10)))}
                    style={styles.qtyInput}
                  />
                  <button style={styles.qtyBtn} onClick={() => onQtyChange(item.product_id, Math.min((item.stock_quantity || 999), item.quantity + 1))}>+</button>
                </div>
                <div style={styles.colTotal}>{formatPrice(item.quantity * item.unit_price)}</div>
              </div>
            ))}
          </div>

          <div style={styles.actionsRow}>
            <Link to="/products" style={styles.continueBtn}>TIẾP TỤC MUA HÀNG</Link>
            <div style={styles.summaryBox}>
              <div style={styles.totalLabel}>TỔNG TIỀN:</div>
              <div style={styles.totalValue}>{formatPrice(summary.total_amount || 0)}</div>
              <button style={styles.checkoutPrimary} onClick={() => navigate('/checkout')}>THANH TOÁN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // Table layout
  table: { border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' },
  headerRow: { display: 'grid', gridTemplateColumns: '1fr 160px 160px 160px', gap: 0, background: '#f7f7f7', color: '#111', fontWeight: 800, borderBottom: '1px solid #eee' },
  headerCell: { padding: '12px 14px', borderRight: '1px solid #eee', textAlign: 'center' },
  bodyRow: { display: 'grid', gridTemplateColumns: '1fr 160px 160px 160px', alignItems: 'center', borderBottom: '1px solid #f1f1f1' },
  colInfo: { display: 'flex', alignItems: 'center', gap: 12, padding: 12 },
  colPrice: { textAlign: 'center', color: '#e85d04', fontWeight: 700 },
  colQty: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  colTotal: { textAlign: 'center', fontWeight: 800, color: '#111' },
  // Controls
  thumb: { width: 100, height: 75, objectFit: 'cover', borderRadius: 8, background: '#fafafa' },
  qtyBtn: { width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#111', lineHeight: 1 },
  qtyInput: { width: 56, height: 32, textAlign: 'center', borderRadius: 6, border: '1px solid #e5e7eb' },
  removeBtn: { marginTop: 0, background: 'transparent', border: 'none', color: '#d00', cursor: 'pointer', width: 'fit-content', textAlign: 'left' },
  // Footer actions
  actionsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  continueBtn: { display: 'inline-block', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', color: '#111', textDecoration: 'none', background: '#fff' },
  summaryBox: { display: 'flex', alignItems: 'center', gap: 12 },
  totalLabel: { fontWeight: 800 },
  totalValue: { color: '#e85d04', fontWeight: 800 },
  checkoutPrimary: { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#14452F', color: '#fff', fontWeight: 800 },
  empty: { padding: 24, border: '1px dashed #ccc', borderRadius: 12, background: '#fff' }
};
