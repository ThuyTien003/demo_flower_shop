import { useState } from 'react';
import { submitContact } from '@/services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: 'Vui lòng nhập Họ tên, Email và Nội dung.' });
      return;
    }
    try {
      setLoading(true);
      await submitContact(form);
      setStatus({ type: 'success', text: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e) {
      setStatus({ type: 'error', text: 'Gửi liên hệ thất bại. Vui lòng thử lại.' });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>Liên hệ</h1>
      <p>Nếu bạn có thắc mắc hoặc yêu cầu, vui lòng điền form dưới đây.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 640, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <div style={rowStyle}>
          <label htmlFor="name" style={labelStyle}>Họ và tên</label>
          <input id="name" name="name" value={form.name} onChange={onChange} style={inputStyle} placeholder="Nguyễn Văn A" />
        </div>
        <div style={rowStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} style={inputStyle} placeholder="email@domain.com" />
        </div>
        <div style={rowStyle}>
          <label htmlFor="phone" style={labelStyle}>Điện thoại</label>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} style={inputStyle} placeholder="0327 458 490" />
        </div>
        <div style={rowStyle}>
          <label htmlFor="message" style={labelStyle}>Nội dung</label>
          <textarea id="message" name="message" rows={4} value={form.message} onChange={onChange} style={{ ...inputStyle, minHeight: 120 }} placeholder="Nhập nội dung liên hệ..." />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, background: '#14452F', color: '#fff', border: 'none', fontWeight: 700, width: 'fit-content' }}>
          {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
        </button>
        {status && (
          <div style={{ color: status.type === 'success' ? '#065f46' : '#b91c1c', fontWeight: 700 }}>{status.text}</div>
        )}
      </form>
    </div>
  );
}

const rowStyle = { display: 'grid', gap: 6 };
const labelStyle = { fontWeight: 700 };
const inputStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' };
