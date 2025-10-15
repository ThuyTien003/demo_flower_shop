import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, fetchShippingMethods, fetchPaymentMethods, createOrder } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/format';

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total_items: 0, total_quantity: 0, total_amount: 0 });
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingId, setShippingId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [dynamicShipCost, setDynamicShipCost] = useState(null);
  const [calculatingShip, setCalculatingShip] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showAfterPlace, setShowAfterPlace] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [cartRes, shipRes, payRes] = await Promise.all([
          getCart(),
          fetchShippingMethods(),
          fetchPaymentMethods(),
        ]);
        const cart = cartRes.data?.data || {};
        setItems(cart.items || []);
        setSummary(cart.total || { total_items: 0, total_quantity: 0, total_amount: 0 });
        const ships = shipRes.data?.data || [];
        const pays = payRes.data?.data || [];
        setShippingMethods(ships);
        setPaymentMethods(pays);
        if (ships[0]) setShippingId(String(ships[0].shipping_id));
        if (pays[0]) setPaymentId(String(pays[0].payment_id));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) {
      // Require login to place an order
      // Redirect to login and then come back to checkout
      // Alternatively, show a message
    }
  }, [user]);

  const selectedShipping = shippingMethods.find(s => String(s.shipping_id) === String(shippingId));
  const fallbackShipCost = selectedShipping ? Number(selectedShipping.cost || 0) : 0;
  const shippingCost = dynamicShipCost != null ? Number(dynamicShipCost) : fallbackShipCost;
  const totalPayable = Number(summary.total_amount || 0) + shippingCost;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }
    if (!address || !shippingId || !paymentId) {
      alert('Vui lòng nhập địa chỉ và chọn phương thức giao hàng / thanh toán');
      return;
    }
    if (!items || items.length === 0) {
      alert('Giỏ hàng trống');
      navigate('/cart');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        shipping_address: address,
        shipping_id: Number(shippingId),
        payment_id: Number(paymentId),
        note,
      };
      const res = await createOrder(payload);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      const order = res?.data?.data?.order;
      const payment = res?.data?.data?.payment;
      setCreatedOrder(order || null);
      setPaymentResult(payment || null);
      // Nếu là redirect (VNPay/MoMo) thì điều hướng cùng tab để tránh popup bị chặn
      if (payment?.status === 'redirect') {
        setShowAfterPlace(true);
        if (payment.payment_url) {
          // Thay vì alert thành công, hiển thị thông điệp chờ thanh toán trên UI
          // Điều hướng đến cổng thanh toán
          window.location.assign(payment.payment_url);
        } else {
          console.error('payment_url is missing for redirect payment');
          alert('Không thể chuyển đến cổng thanh toán do thiếu payment_url');
        }
      } else {
        // Các phương thức khác (COD/Bank Transfer) hiển thị hướng dẫn tại chỗ
        setShowAfterPlace(true);
      }
    } catch (e) {
      console.error(e);
      alert('Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamically calculate shipping cost when address or shipping method changes
  useEffect(() => {
    const calc = async () => {
      if (!shippingId) { setDynamicShipCost(null); return; }
      // If no address, fall back to static cost from method
      if (!address || !address.trim()) { setDynamicShipCost(null); return; }

      try {
        setCalculatingShip(true);
        // Estimate weight by total quantity (can be refined if you have product weights)
        const totalQty = Number(summary.total_quantity || items.reduce((sum, it) => sum + Number(it.quantity || 0), 0));
        const resp = await fetch(`/api/shipping/${shippingId}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, weight: totalQty || 1 })
        });
        const data = await resp.json();
        if (resp.ok && data?.success && data?.data?.cost != null) {
          setDynamicShipCost(Number(data.data.cost));
        } else {
          // Fallback if API doesn't return expected structure
          setDynamicShipCost(null);
        }
      } catch (err) {
        console.error('Calculate shipping error', err);
        setDynamicShipCost(null);
      } finally {
        setCalculatingShip(false);
      }
    };
    calc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingId, address, summary.total_quantity, items.length]);

  if (loading) return <div className="container" style={{ padding: 16 }}>Đang tải trang thanh toán...</div>;

  return (
    <div className="container" style={{ padding: 16 }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/">Trang chủ</Link> <span>/</span> <Link to="/cart">Giỏ hàng</Link> <span>/</span> <span>Thanh toán</span>
      </nav>

      <h1>Thanh toán</h1>

      <div style={styles.layout}>
        <form onSubmit={onSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Địa chỉ giao hàng</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, phường/xã, quận/huyện, tỉnh/thành..." rows={4} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Phương thức giao hàng</label>
            <select value={shippingId} onChange={(e) => setShippingId(e.target.value)} style={styles.input}>
              {shippingMethods.map((s) => (
                <option key={s.shipping_id} value={s.shipping_id}>{s.name} (+{formatPrice(s.cost)}, ~{s.estimated_days || '?'} ngày)</option>
              ))}
            </select>
            {selectedShipping && (
              <div style={{ color: '#555', fontSize: 12, marginTop: 6 }}>
                Chi phí: <b>{formatPrice(shippingCost)}</b> · Thời gian dự kiến: <b>{selectedShipping.estimated_days || '?'} ngày</b>
              </div>
            )}
            {calculatingShip && (
              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Đang tính phí giao hàng theo địa chỉ...</div>
            )}
            {!shippingMethods.length && (
              <div style={{ color: '#b00020', fontSize: 12, marginTop: 6 }}>Hiện chưa có phương thức giao hàng khả dụng</div>
            )}
          </div>
          <div>
            <label style={styles.label}>Phương thức thanh toán</label>
            <select value={paymentId} onChange={(e) => setPaymentId(e.target.value)} style={styles.input}>
              {paymentMethods.map((p) => (
                <option key={p.payment_id} value={p.payment_id}>{p.name}</option>
              ))}
            </select>
            {!!paymentMethods.length && (
              <div style={{ color: '#555', fontSize: 12, marginTop: 6 }}>
                Đã chọn: <b>{(paymentMethods.find(p => String(p.payment_id) === String(paymentId))?.name) || '—'}</b>
              </div>
            )}
            {!paymentMethods.length && (
              <div style={{ color: '#b00020', fontSize: 12, marginTop: 6 }}>Hiện chưa có phương thức thanh toán khả dụng</div>
            )}
          </div>
          <div>
            <label style={styles.label}>Ghi chú (tuỳ chọn)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Giao trước 5h chiều" style={styles.input} />
          </div>

          <button
            type="submit"
            style={{
              ...styles.placeBtn,
              opacity: submitting || !items.length || !shippingId || !paymentId || !address ? 0.7 : 1,
              cursor: submitting || !items.length || !shippingId || !paymentId || !address ? 'not-allowed' : 'pointer'
            }}
            disabled={submitting || !items.length || !shippingId || !paymentId || !address}
            title={!address ? 'Vui lòng nhập địa chỉ' : (!shippingId ? 'Chọn phương thức giao hàng' : (!paymentId ? 'Chọn phương thức thanh toán' : ''))}
          >
            {submitting ? 'Đang tạo đơn...' : 'Đặt hàng'}
          </button>
        </form>

        <aside style={styles.aside}>
          <h3>Đơn hàng của bạn</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <div key={it.cart_item_id} style={{ ...styles.row, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <img src={it.image_url} alt={it.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{it.name}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>Đơn giá: {formatPrice(it.unit_price)} · SL: {it.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatPrice(it.quantity * it.unit_price)}</div>
              </div>
            ))}
            <div style={styles.row}><span>Tạm tính</span><span>{formatPrice(summary.total_amount || 0)}</span></div>
            <div style={styles.row}><span>Phí giao hàng</span><span>{formatPrice(shippingCost)}</span></div>
            <div style={{ ...styles.row, fontWeight: 800 }}><span>Tổng thanh toán</span><span style={{ color: '#e85d04' }}>{formatPrice(totalPayable)}</span></div>
            <div style={{ color: '#666', fontSize: 12 }}>
              Phương thức giao hàng: <b>{selectedShipping?.name || '—'}</b>
              {selectedShipping ? ` (≈ ${selectedShipping.estimated_days || '?'} ngày)` : ''}
              <br />
              Phương thức thanh toán: <b>{(paymentMethods.find(p => String(p.payment_id) === String(paymentId))?.name) || '—'}</b>
            </div>
          </div>
        </aside>
      </div>

      {/* After place order panel */}
      {showAfterPlace && (
        <div style={styles.resultBox}>
          <h3>
            {paymentResult?.status === 'redirect'
              ? 'Đã tạo đơn - vui lòng hoàn tất thanh toán'
              : (paymentResult?.bank_info ? 'Đã tạo đơn - vui lòng chuyển khoản' : 'Đặt hàng thành công')}
          </h3>
          {createdOrder && (
            <div style={{ marginBottom: 8 }}>
              Mã đơn hàng: <b>{createdOrder.order_id}</b>
              <br />
              Tổng tiền: <b>{formatPrice(createdOrder.total_amount)}</b>
              <br />
              Trạng thái: <b>{createdOrder.status}</b>
              <br />
              <Link to={`/orders/${createdOrder.order_id}`} style={{ color: '#0a58ca' }}>Xem chi tiết đơn hàng</Link>
            </div>
          )}
          {paymentResult && (
            <div style={{ padding: 12, border: '1px dashed #ddd', borderRadius: 8, background: '#fcfcfc' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Hướng dẫn thanh toán</div>
              {paymentResult.status === 'pending' && paymentResult.bank_info ? (
                <div>
                  <div>Vui lòng chuyển khoản theo thông tin sau:</div>
                  <ul>
                    <li>Ngân hàng: <b>{paymentResult.bank_info.bank_name}</b></li>
                    <li>Chủ tài khoản: <b>{paymentResult.bank_info.account_name}</b></li>
                    <li>Số tài khoản: <b>{paymentResult.bank_info.account_number}</b></li>
                    <li>Số tiền: <b>{formatPrice(paymentResult.bank_info.amount)}</b></li>
                    <li>Nội dung: <b>{paymentResult.bank_info.content}</b></li>
                  </ul>
                  {/* Ưu tiên VietQR nếu có bank_bin; fallback QR minh hoạ nếu không có */}
                  <div style={{ marginTop: 8 }}>
                    {paymentResult.bank_info.bank_bin ? (
                      <div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Quét VietQR để chuyển khoản nhanh:</div>
                        <img
                          alt="VietQR"
                          style={{ width: 200, height: 200 }}
                          src={`https://img.vietqr.io/image/${paymentResult.bank_info.bank_bin}-${paymentResult.bank_info.account_number}-compact2.jpg?amount=${paymentResult.bank_info.amount}&addInfo=${encodeURIComponent(paymentResult.bank_info.content)}&accountName=${encodeURIComponent(paymentResult.bank_info.account_name)}`}
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Quét QR (minh hoạ) để điền sẵn nội dung:</div>
                        <img alt="QR" style={{ width: 160, height: 160 }}
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(paymentResult.bank_info.content + ' - ' + paymentResult.bank_info.amount)}`} />
                      </div>
                    )}
                  </div>
                </div>
              ) : paymentResult.status === 'redirect' && paymentResult.payment_url ? (
                <div>
                  <div>Bạn sẽ được chuyển hướng đến cổng thanh toán. Nếu không tự chuyển, hãy bấm nút bên dưới:</div>
                  <div style={{ marginTop: 8 }}>
                    <a href={paymentResult.payment_url} target="_blank" rel="noreferrer" style={{
                      display: 'inline-block', padding: '10px 12px', background: '#e85d04', color: '#fff', borderRadius: 8
                    }}>Mở trang thanh toán</a>
                  </div>
                </div>
              ) : (
                <div>
                  {paymentResult.message || 'Đơn hàng đang chờ xử lý thanh toán.'}
                  {paymentResult.transaction_id && (
                    <div>Mã giao dịch: <b>{paymentResult.transaction_id}</b></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 12 },
  form: { display: 'grid', gap: 12, border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' },
  aside: { border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff', height: 'fit-content' },
  label: { display: 'block', marginBottom: 6, fontWeight: 700 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' },
  placeBtn: { marginTop: 8, padding: '10px 12px', borderRadius: 8, border: 'none', background: '#14452F', color: '#fff', fontWeight: 800 },
  resultBox: { marginTop: 16, border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' },
};
