import { useState, useEffect } from 'react';
import { getPersonalizedRecommendations } from '@/services/api';
import ProductCard from './ProductCard';
import ProductSkeleton from './LoadingSkeleton';
import { useSessionId } from '@/hooks/useSessionId';

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId = useSessionId();

  useEffect(() => {
    if (sessionId) {
      loadRecommendations(sessionId);
    }
  }, [sessionId]);

  const loadRecommendations = async (sid) => {
    try {
      setLoading(true);
      const response = await getPersonalizedRecommendations(sid, 8);
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>✨ Dành riêng cho bạn</h2>
            <p style={styles.subtitle}>Đang tải gợi ý...</p>
          </div>
          <div style={styles.grid}>
            <ProductSkeleton count={8} />
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>✨ Dành riêng cho bạn</h2>
          <p style={styles.subtitle}>Gợi ý dựa trên sở thích và lịch sử của bạn</p>
        </div>

        <div style={styles.grid}>
          {recommendations.map((product) => (
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 10,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 24,
  },
};

export default PersonalizedRecommendations;
