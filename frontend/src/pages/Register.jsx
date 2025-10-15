import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', marginBottom: 12 }}>Đăng ký</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <label>Tên đăng nhập</label>
        <input style={styles.input} name="username" value={form.username} onChange={onChange} required />
        <label>Email</label>
        <input style={styles.input} name="email" type="email" value={form.email} onChange={onChange} required />
        <label>Mật khẩu</label>
        <input style={styles.input} name="password" type="password" value={form.password} onChange={onChange} required />
        <label>Họ tên</label>
        <input style={styles.input} name="full_name" value={form.full_name} onChange={onChange} />
        <label>Điện thoại</label>
        <input style={styles.input} name="phone" value={form.phone} onChange={onChange} />
        <label>Địa chỉ</label>
        <input style={styles.input} name="address" value={form.address} onChange={onChange} />
        <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12 }}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: 520, margin: '32px auto', padding: 20, background: '#fff', border: '1px solid #eee', borderRadius: 14, boxShadow: '0 10px 24px rgba(0,0,0,.06)' },
  form: { display: 'grid', gap: 10, maxWidth: 520, margin: '0 auto' },
  error: { color: '#b00020', background: '#fdecea', padding: 8, borderRadius: 8 },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 },
  button: { padding: '10px 14px', borderRadius: 10, border: '1px solid #0f3524', background: '#0f3524', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};
