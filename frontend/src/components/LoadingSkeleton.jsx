
export const ProductSkeleton = ({ count = 4 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="product-card skeleton" style={styles.skeleton}>
          <div style={styles.skeletonImage}></div>
          <div style={styles.skeletonText}></div>
          <div style={styles.skeletonTextShort}></div>
        </div>
      ))}
    </>
  );
};

const styles = {
  skeleton: {
    border: '1px solid #eee',
    borderRadius: 14,
    overflow: 'hidden',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: '4/3',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  },
  skeletonText: {
    height: 16,
    margin: '12px 14px 8px',
    background: '#f0f0f0',
    borderRadius: 4
  },
  skeletonTextShort: {
    height: 16,
    width: '60%',
    margin: '0 14px 12px',
    background: '#f0f0f0',
    borderRadius: 4
  }
};

export default ProductSkeleton;
