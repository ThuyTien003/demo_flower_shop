import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchOrderDetail, cancelOrder as cancelOrderApi } from '@/services/api';
import { formatPrice } from '@/utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [polling, setPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchOrderDetail(id);
      setOrder(res.data?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto refresh status for a short period after landing here (useful after payment)
  useEffect(() => {
    if (!order) return;
    const terminal = ['delivered', 'cancelled'];
    if (terminal.includes((order.status || '').toLowerCase())) {
      setPolling(false);
      return;
    }
    if (!polling) return;
    if (pollCount >= 20) { // ~60s if interval is 3s
      setPolling(false);
      return;
    }
    const t = setInterval(async () => {
      try {
        await fetchOrder();
        setPollCount((c) => c + 1);
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, polling, pollCount]);

  const canCancel = order && ['pending', 'processing'].includes(order.status);

  const onCancel = async () => {
    if (!canCancel) return;
    const reason = prompt('Lý do hủy đơn (tuỳ chọn):', '');
    try {
      setCancelling(true);
      const res = await cancelOrderApi(id, reason || '');
      alert('Đã hủy đơn hàng');
      setOrder(res.data?.data);
    } catch (e) {
      alert(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 16 }}>Đang tải chi tiết đơn hàng...</div>;
  if (error) return (
    <div className="container" style={{ padding: 16 }}>
      <div style={{ color: '#b00020' }}>Lỗi: {error}</div>
      <button onClick={fetchOrder} style={{ marginTop: 8 }}>Thử lại</button>
    </div>
  );
  if (!order) return <div className="container" style={{ padding: 16 }}>Không có dữ liệu đơn hàng</div>;

  const shippingCost = Number(order.shipping_cost || 0);
  const items = order.items || [];
  const subtotal = items.reduce((s, it) => s + Number(it.subtotal || (it.quantity * it.unit_price) || 0), 0);
  const total = Number(order.total_amount || subtotal + shippingCost);

  return (
    <div className="container" style={{ padding: 16 }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/">Trang chủ</Link> <span>/</span> <Link to="/profile">Tài khoản</Link> <span>/</span> <span>Đơn #{order.order_id}</span>
      </nav>

      <h1>Đơn hàng #{order.order_id}</h1>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1fr' }}>
        <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' }}>
          <h3>Thông tin chung</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            <div><b>Trạng thái:</b> <span style={{ textTransform: 'capitalize' }}>{order.status}</span></div>
            <div><b>Địa chỉ giao hàng:</b> {order.shipping_address}</div>
            <div><b>Phương thức giao hàng:</b> {order.shipping_method || '-'} {shippingCost ? `(Phí: ${formatPrice(shippingCost)})` : ''}</div>
            <div><b>Phương thức thanh toán:</b> {order.payment_method || '-'}</div>
            {order.note && <div><b>Ghi chú:</b> {order.note}</div>}
          </div>
        </section>

        <aside style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff', height: 'fit-content' }}>
          <h3>Tóm tắt</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tạm tính</span>
              <b>{formatPrice(subtotal)}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Phí giao hàng</span>
              <b>{formatPrice(shippingCost)}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>Tổng</span>
              <span style={{ color: '#e85d04' }}>{formatPrice(total)}</span>
            </div>
          </div>
          {['pending', 'processing'].includes(order.status) && (
            <button onClick={onCancel} disabled={cancelling} style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#b00020', color: '#fff' }}>
              {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}
        </aside>
      </div>

      <section style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' }}>
        <h3>Sản phẩm</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map(it => (
            <div key={it.order_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {it.image_url && <img src={it.image_url} alt={it.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />}
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>Đơn giá: {formatPrice(it.unit_price)} · SL: {it.quantity}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{formatPrice(it.subtotal || (it.quantity * it.unit_price))}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate('/profile')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}>Về trang tài khoản</button>
      </div>
    </div>
  );
}
