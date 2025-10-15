import { useEffect, useState } from 'react';
import { fetchFeaturedProducts, fetchCategoriesWithCounts } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import { getCategoryIcon, getCategoryColor, getCategoryImage } from '@/constants/categories';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // Carousel state
  const heroImages = [
    'https://hoatuoithientruc.com/wp-content/uploads/2019/06/Hoa-tuoi-quan-3.jpg',
    'https://thumbs.dreamstime.com/b/floral-monochrome-composition-rose-buds-petals-pink-banner-copy-space-182062792.jpg',
    'https://shophoatuoibi.com/uploads/thuvien/banner1-jpg-11-jpg-20220313163610xWa2llK8fD.jpg',
    'https://shophoatuoibi.com/uploads/thuvien/banner2-jpg-22-jpg-20220313164345forKMeIw75.jpg',
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetchFeaturedProducts({ limit: 8 }),
          fetchCategoriesWithCounts(),
        ]);
        setFeatured(pRes.data.data || []);
        setCategories(cRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-rotate slides every ~3s
  useEffect(() => {
    if (!heroImages.length) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, [heroImages.length]);


  return (
    <div>
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div style={styles.carousel}>
            <div style={styles.carouselWrap}>
              {heroImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Hoa ${i + 1}`}
                  style={{
                    ...styles.carouselImage,
                    opacity: i === currentSlide ? 1 : 0,
                  }}
                  loading="lazy"
                />
              ))}
            </div>
            <div style={styles.dots}>
              {heroImages.map((_, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.dot,
                    ...(i === currentSlide ? styles.activeDot : {}),
                  }}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>DANH MỤC NỔI BẬT</h2>
          <div style={styles.cateSlider}>
            {categories.map((c) => (
              <div key={c.category_id} style={styles.cateSlide}>
                <Link
                  to={`/products?category_id=${c.category_id}`}
                  title={c.name}
                  style={styles.cateItem}
                  onMouseEnter={() => setHoveredCategoryId(c.category_id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  <div style={{
                    ...styles.boxCate,
                    borderColor: hoveredCategoryId === c.category_id ? getCategoryColor(c.name) : 'transparent',
                    background: hoveredCategoryId === c.category_id
                      ? 'radial-gradient(circle at 50% 40%, #6a6a72 0%, #46464d 55%, #2f2f35 100%)'
                      : styles.boxCate.background,
                    color: hoveredCategoryId === c.category_id ? '#fff' : styles.boxCate.color,
                  }}>
                    <div style={{
                      ...styles.cateImage,
                      background: hoveredCategoryId === c.category_id ? 'transparent' : styles.cateImage.background,
                    }}>
                      {getCategoryImage(c) ? (
                        <img
                          src={getCategoryImage(c)}
                          alt={c.name}
                          style={{
                            ...styles.cateImg,
                          }}
                        />
                      ) : (
                        <div style={{ ...styles.iconFallback, color: getCategoryColor(c.name) }}>
                          {(() => {
                            const Icon = getCategoryIcon(c.name);
                            return <Icon />;
                          })()}
                        </div>
                      )}
                    </div>
                    <h3 style={{ ...styles.cateName, color: hoveredCategoryId === c.category_id ? '#fff' : styles.cateName.color }}>{c.name}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>SẢN PHẨM MỚI</h2>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div style={styles.grid}>
              {featured.map((p) => (
                <ProductCard key={p.product_id} product={p} />)
              )}
            </div>
          )}
        </div>
      </section>

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations />
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(180deg, #fff0f6, #ffffff 60%)', padding: '40px 0', borderBottom: '1px solid var(--border)' },
  heroInner: { display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', gap: 20 },
  heroTitle: { fontSize: 48, margin: '10px 0 6px' },
  heroSub: { color: '#6b7280', maxWidth: 640 },
  cta: { display: 'inline-block', background: '#fff', color: 'var(--primary-600)', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', border: '1px solid #ffd8e8', fontWeight: 700 },
  ctaSecondary: { display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  categories: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 28 },
  cateSlider: { display: 'flex', gap: 24, overflowX: 'auto', padding: '0 12px 6px', scrollSnapType: 'x mandatory', justifyContent: 'space-between', scrollPaddingInline: 12 },
  cateSlide: { flex: '0 0 auto', width: 220, scrollSnapAlign: 'start' },
  cateItem: { display: 'block', textDecoration: 'none' },
  boxCate: { border: '1px solid transparent', borderRadius: 12, padding: 14, background: '#f3f4f6', color: '#111', textAlign: 'center', transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' },
  cateImage: { position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', background: 'transparent', marginBottom: 8 },
  cateImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  cateImgHover: { filter: 'brightness(0.6)' },
  cateOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' },
  iconFallback: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 32 },
  cateName: { margin: 0, fontSize: 16, fontWeight: 800, color: '#111', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  // Carousel styles
  carousel: { position: 'relative', width: '100%', height: 460, borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 20px rgba(255, 0, 100, 0.12)' },
  carouselWrap: { position: 'relative', width: '100%', height: '100%' },
  carouselImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 600ms ease' },
  dots: { position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 8, padding: 6, background: 'rgba(255,255,255,0.7)', borderRadius: 999 },
  dot: { width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb', cursor: 'pointer', transition: 'background 200ms' },
  activeDot: { background: 'var(--primary)' },
};

