import { useFetch } from '@/hooks/useFetch';
import { getSimilarProducts } from '@/services/api';
import ProductCard from './ProductCard';
import ProductSkeleton from './LoadingSkeleton';

const SimilarProducts = ({ productId }) => {
  const { data, loading } = useFetch(
    () => getSimilarProducts(productId, 8),
    [productId]
  );

  const products = data?.products || [];

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.title}>Gợi ý tương tự</h2>
          <p style={styles.subtitle}>Hoa cùng loại, cùng giá, cùng dịp</p>
          <div style={styles.grid}>
            <ProductSkeleton count={4} />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Gợi ý tương tự</h2>
        <p style={styles.subtitle}>Hoa cùng loại, cùng giá, cùng dịp</p>
        <div style={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 0',
    background: '#f8f9fa',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 24,
  },
};

export default SimilarProducts;
