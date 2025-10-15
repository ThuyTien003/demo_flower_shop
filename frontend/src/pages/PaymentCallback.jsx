import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Đang xác nhận thanh toán...');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : '';

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Map các tham số phổ biến từ VNPay/MoMo về payload chung
    const gateway = (params.get('gateway') || params.get('provider') || params.get('pgw') || '').toLowerCase();

    // VNPay thường trả vnp_TxnRef là order_id, vnp_ResponseCode === '00' là success
    const vnpTxnRef = params.get('vnp_TxnRef'); // thường là order_id
    const vnpResponseCode = params.get('vnp_ResponseCode'); // '00' là success
    const vnpTransactionNo = params.get('vnp_TransactionNo');
    const vnpAmount = params.get('vnp_Amount'); // đơn vị đồng * 100

    // MoMo thường trả orderId, resultCode === '0' là success, transId là transaction_id
    const momoOrderId = params.get('orderId'); // order_id
    const momoResultCode = params.get('resultCode'); // '0' là success
    const momoTransId = params.get('transId');
    const momoAmount = params.get('amount');

    // Common fallbacks
    const qOrderId = params.get('order_id') || vnpTxnRef || momoOrderId;
    const status = params.get('status')
      || (vnpResponseCode === '00' ? 'success' : (vnpResponseCode ? 'failed' : undefined))
      || (momoResultCode === '0' ? 'success' : (momoResultCode ? 'failed' : undefined))
      || 'pending';
    const transaction_id = params.get('transaction_id') || momoTransId || vnpTransactionNo || params.get('txn') || params.get('tx');
    const amount = Number(params.get('amount') || momoAmount || (vnpAmount ? Number(vnpAmount) / 100 : 0)) || undefined;

    const payload = {
      gateway: gateway || (vnpResponseCode ? 'vnpay' : (momoResultCode ? 'momo' : null)),
      order_id: qOrderId ? Number(qOrderId) : undefined,
      status,
      transaction_id,
      amount,
      raw: Object.fromEntries(params.entries())
    };

    const confirm = async () => {
      try {
        setOrderId(qOrderId ? Number(qOrderId) : null);
        const res = await fetch('/api/payments/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || data?.error || 'Xác nhận thất bại');
        setMsg('Xác nhận thanh toán thành công');
        if (qOrderId) {
          // Điều hướng sang trang chi tiết đơn hàng sau 1s
          setTimeout(() => navigate(`/orders/${qOrderId}`), 1000);
        }
      } catch (e) {
        setError(e.message);
        setMsg('');
      }
    };

    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>Kết quả thanh toán</h1>
      {msg && <div style={{ color: '#056608' }}>{msg}</div>}
      {error && (
        <div style={{ color: '#b00020' }}>
          Lỗi: {error}
          <div style={{ marginTop: 8 }}>
            {orderId ? (
              <>
                <Link to={`/orders/${orderId}`} style={{ color: '#0a58ca' }}>Xem chi tiết đơn hàng</Link>
                <span> · </span>
                <Link to="/profile" style={{ color: '#0a58ca' }}>Trang tài khoản</Link>
              </>
            ) : (
              <Link to="/profile" style={{ color: '#0a58ca' }}>Trang tài khoản</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
