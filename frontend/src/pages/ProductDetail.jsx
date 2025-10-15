import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, addToCartApi, trackProductView } from '@/services/api';
import SimilarProducts from '@/components/SimilarProducts';
import { useSessionId } from '@/hooks/useSessionId';
import { formatPrice } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const sessionId = useSessionId();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProductById(id);
        const productData = res.data.data || null;
        setProduct(productData);
        
        // Track product view
        if (productData && sessionId) {
          try {
            await trackProductView(productData.product_id, sessionId);
          } catch (err) {
            console.error('Error tracking view:', err);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, sessionId]);

  if (loading) return <div style={styles.container}>Đang tải...</div>;
  if (!product) return <div style={styles.container}>Không tìm thấy sản phẩm</div>;

  const images = product.images && product.images.length > 0 ? product.images : [{ image_url: product.primary_image }];

  return (
    <div style={styles.container}>
      <nav style={styles.breadcrumbs}>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div style={styles.layout}>
        <div style={styles.gallery}>
          <div style={styles.mainImageWrap}>
            <img src={(images[0] && images[0].image_url) || 'https://via.placeholder.com/600x450?text=No+Image'} alt={product.name} style={styles.mainImage} />
          </div>
          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((img, idx) => (
                <img key={idx} src={img.image_url} alt={img.alt_text || product.name} style={styles.thumb} />
              ))}
            </div>
          )}
        </div>

        <div style={styles.info}>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={styles.price}>{formatPrice(product.price)}</div>
          <div style={styles.meta}>Danh mục: {product.category_name}</div>
          <p style={styles.desc}>{product.description || 'Chưa có mô tả.'}</p>
          {!(product.description || '').includes('Giá cả có thể thay đổi') && (
          <div style={styles.notice}>
            <strong>Thông tin sản phẩm</strong>
            <p style={{ marginTop: 6 }}>
              Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.
              Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.
              Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.
              Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.
              Cảm ơn bạn đã tin tưởng ủng hộ!!!
            </p>
          </div>
          )}
          <div style={styles.qtyLine}>
            <div style={styles.qtyLabel}>Số lượng</div>
            <div style={styles.qtyControls}>
              <button
                type="button"
                style={styles.qtyBtn}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setQty(Number.isNaN(v) || v <= 0 ? 1 : v);
                }}
                style={styles.qtyInput}
                aria-label="Số lượng"
              />
              <button
                type="button"
                style={styles.qtyBtn}
                onClick={() => setQty((q) => q + 1)}
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>
          <button
            style={styles.buyBtn}
            onClick={async () => {
              try {
                await addToCartApi({ product_id: product.product_id, quantity: qty });
                window.dispatchEvent(new CustomEvent('cart-updated'));
                alert('Đã thêm vào giỏ hàng');
              } catch (e) {
                alert('Thêm vào giỏ thất bại');
                console.error(e);
              }
            }}
          >Thêm vào giỏ</button>
        </div>
      </div>

      {product.related_products && product.related_products.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h3>Sản phẩm liên quan</h3>
          <div style={styles.relatedGrid}>
            {product.related_products.map((p) => (
              <Link key={p.product_id} to={`/products/${p.product_id}`} style={styles.relatedCard}>
                <div style={styles.relatedThumbWrap}>
                  <img src={p.primary_image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={p.name} style={styles.relatedThumb} />
                </div>
                <div style={styles.relatedInfo}>
                  <div>{p.name}</div>
                  <div style={{ color: '#e85d04', fontWeight: 700 }}>
                    {formatPrice(p.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Similar Products */}
      {product && <SimilarProducts productId={product.product_id} />}
    </div>
  );
}

const styles = {
    container: { maxWidth: 1100, margin: '0 auto', padding: 16 },
    breadcrumbs: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#555', marginBottom: 12 },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
    gallery: { display: 'grid', gap: 8 },
    mainImageWrap: { border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' },
    mainImage: { width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/3' },
    thumbRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    thumb: { width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' },
    info: { display: 'grid', gap: 12 },
    price: { color: '#e85d04', fontSize: 22, fontWeight: 800 },
    meta: { fontSize: 14, color: '#666' },
    desc: { lineHeight: 1.6 },
    notice: { fontSize: 13, color: '#4b5563', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 10, borderRadius: 8 },
    qtyLine: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, maxWidth: 320 },
    qtyLabel: { fontWeight: 700, color: '#111827' },
    qtyControls: { display: 'flex', alignItems: 'center', gap: 8 },
    qtyBtn: { width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#111', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyInput: { width: 56, height: 36, textAlign: 'center', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' },
    buyBtn: { padding: '10px 16px', borderRadius: 8, background: '#5e5ce6', color: '#fff', border: 'none', cursor: 'pointer', width: 'fit-content' },
    relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    relatedCard: { textDecoration: 'none', color: '#222', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' },
    relatedThumbWrap: { aspectRatio: '4/3', background: '#fafafa' },
    relatedThumb: { width: '100%', height: '100%', objectFit: 'cover' },
    relatedInfo: { padding: 10, display: 'grid', gap: 4 },
  };
