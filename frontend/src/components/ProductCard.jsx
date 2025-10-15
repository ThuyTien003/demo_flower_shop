import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { addToWishlist, removeFromWishlist, checkWishlist, addToCartApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/format';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const img = product.primary_image || product.image_url || 'https://via.placeholder.com/400x300?text=No+Image';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await checkWishlist(product.product_id);
        if (mounted) setWishlisted(!!res?.data?.in_wishlist);
      } catch {
        // ignore
      }
    };
    if (user) load();
    return () => { mounted = false; };
  }, [product.product_id, user]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (wlLoading) return;
    try {
      setWlLoading(true);
      if (wishlisted) {
        await removeFromWishlist(product.product_id);
        setWishlisted(false);
      } else {
        await addToWishlist(product.product_id);
        setWishlisted(true);
      }
    } catch (err) {
      // Optionally show toast/error
      console.error(err);
    } finally {
      setWlLoading(false);
    }
  };

  const quickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartLoading) return;
    try {
      setCartLoading(true);
      await addToCartApi({ product_id: product.product_id, quantity: 1 });
      // inform navbar/cart badge to refresh
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.product_id}`} className="product-card card" style={styles.card}>
      <div style={styles.thumbWrap}>
        <img src={img} alt={product.name} style={styles.thumb} />
        <button
          aria-label="Thêm vào giỏ hàng"
          title="Thêm vào giỏ hàng"
          onClick={quickAddToCart}
          style={{
            ...styles.cartBtn,
            ...(cartLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}),
          }}
        >
          <FaShoppingCart />
        </button>
        <button
          aria-label={wishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          onClick={toggleWishlist}
          style={{
            ...styles.wishBtn,
            ...(wishlisted ? styles.wishBtnActive : {}),
            ...(wlLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}),
          }}
        >
          <FaHeart />
        </button>
      </div>
      <div style={styles.info}>
        <div style={styles.name}>{product.name}</div>
        <div style={styles.row}>
          <div style={styles.price}>{formatPrice(product.price)}</div>
          {product.category_name && (
            <span className="pill">{product.category_name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'block',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'var(--text)',
    background: 'var(--surface)',
    boxShadow: '0 1px 2px rgba(16,24,40,.04)',
    transition: 'transform .2s ease, box-shadow .2s ease',
  },
  thumbWrap: { position: 'relative', aspectRatio: '4/3', background: 'var(--surface-2)' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: 14, display: 'grid', gap: 8 },
  name: { fontWeight: 700, lineHeight: 1.35 },
  price: { color: 'var(--primary-600)', fontWeight: 800 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cartBtn: { position: 'absolute', top: 8, left: 8, width: 36, height: 36, borderRadius: 999, border: '1px solid #0f3524', background: '#fff', color: '#0f3524', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.08)', cursor: 'pointer', transition: 'transform .15s ease, background .2s ease, color .2s ease, border-color .2s ease' },
  wishBtn: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 999, border: '1px solid #0f3524', background: '#0f3524', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.08)', cursor: 'pointer', transition: 'transform .15s ease, background .2s ease, color .2s ease, border-color .2s ease' },
  wishBtnActive: { background: '#fff', borderColor: '#e11d48', color: '#e11d48' },
};
