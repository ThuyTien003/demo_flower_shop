import { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '@/services/api';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { formatPrice } from '@/utils/format';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWishlist();
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (pid) => {
    // Optimistic UI update
    setItems((prev) => prev.filter((p) => p.product_id !== pid));
    try {
      await removeFromWishlist(pid);
    } catch (e) {
      // On failure, reload to sync
      console.error(e);
      load();
    }
  };

  if (loading) return <div style={styles.container}>Đang tải...</div>;

  return (
    <div style={styles.container}>
      <h1>Danh sách yêu thích</h1>
      {items.length === 0 ? (
        <div>Chưa có sản phẩm nào. <Link to="/products">Xem sản phẩm</Link></div>
      ) : (
        <div style={styles.grid}>
          {items.map((p) => (
            <div key={p.product_id} style={styles.card}>
              <Link to={`/products/${p.product_id}`} style={styles.link}>
                <div style={styles.thumbWrap}>
                  <img src={p.primary_image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={p.name} style={styles.thumb} />
                  <button
                    aria-label="Bỏ yêu thích"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(p.product_id); }}
                    style={{ ...styles.wishBtn, ...styles.wishBtnActive }}
                  >
                    <FaHeart />
                  </button>
                </div>
                <div style={styles.info}>
                  <div>{p.name}</div>
                  <div style={styles.price}>{formatPrice(p.price)}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '24px auto', padding: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  card: { border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff', position: 'relative' },
  link: { textDecoration: 'none', color: 'inherit' },
  thumbWrap: { position: 'relative', aspectRatio: '4/3', background: '#fafafa' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: 10, display: 'grid', gap: 4 },
  price: { color: '#e85d04', fontWeight: 700 },
  // Heart button styles aligned with ProductCard
  wishBtn: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 999, border: '1px solid #0f3524', background: '#0f3524', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.08)', cursor: 'pointer', transition: 'transform .15s ease, background .2s ease, color .2s ease, border-color .2s ease' },
  wishBtnActive: { background: '#fff', borderColor: '#e11d48', color: '#e11d48' },
};
