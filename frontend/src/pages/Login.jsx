import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', marginBottom: 12 }}>Đăng nhập</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <label>Email</label>
        <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Mật khẩu</label>
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12 }}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: 420, margin: '32px auto', padding: 20, background: '#fff', border: '1px solid #eee', borderRadius: 14, boxShadow: '0 10px 24px rgba(0,0,0,.06)' },
  form: { display: 'grid', gap: 10 },
  error: { color: '#b00020', background: '#fdecea', padding: 8, borderRadius: 8 },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 },
  button: { padding: '10px 14px', borderRadius: 10, border: '1px solid #0f3524', background: '#0f3524', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};
