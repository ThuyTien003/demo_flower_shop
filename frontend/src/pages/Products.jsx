import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, searchProducts } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Products() {
  const query = useQuery();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const category_id = query.get('category_id') || '';
  const q = query.get('q') || '';
  const page = Number(query.get('page') || 1);
  const sort = query.get('sort') || 'default';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiCall = q ? searchProducts(q, { page, limit: 12 }) : fetchProducts({ category_id, page, limit: 12 });
        const res = await apiCall;
        setItems(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category_id, q, page]);

  // Derived items based on sort
  const sortedItems = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case 'name-asc':
        arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        arr.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'newest':
        arr.sort((a, b) => (b.product_id || 0) - (a.product_id || 0));
        break;
      case 'price-asc':
        arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      default:
        // default: keep server order
        break;
    }
    return arr;
  }, [items, sort]);

  const onCategoryChange = (cat) => {
    const params = new URLSearchParams({ ...Object.fromEntries(query.entries()) });
    if (cat) params.set('category_id', cat); else params.delete('category_id');
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const goPage = (p) => {
    const params = new URLSearchParams({ ...Object.fromEntries(query.entries()) });
    params.set('page', String(p));
    navigate(`/products?${params.toString()}`);
  };

  const onSortChange = (value) => {
    const params = new URLSearchParams({ ...Object.fromEntries(query.entries()) });
    if (value && value !== 'default') params.set('sort', value); else params.delete('sort');
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  // Note: filterCount removed since it is not displayed anymore

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>SẢN PHẨM</h1>
        <CategoryFilter value={category_id} onChange={onCategoryChange} />
      </div>

      {q && (
        <div style={styles.note}>
          Kết quả tìm kiếm cho: "{q}" {loading ? '' : `(${sortedItems.length})`}
        </div>
      )}

      {/* Toolbar: Filter count (left) and Sort options (right) */}
      <div style={styles.toolbar}>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Xếp theo</span>
          <button onClick={() => onSortChange('default')} style={{ ...styles.sortBtn, ...(sort === 'default' ? styles.sortBtnActive : {}) }}>Mặc định</button>
          <button onClick={() => onSortChange('newest')} style={{ ...styles.sortBtn, ...(sort === 'newest' ? styles.sortBtnActive : {}) }}>Hàng mới</button>
          <button onClick={() => onSortChange('price-asc')} style={{ ...styles.sortBtn, ...(sort === 'price-asc' ? styles.sortBtnActive : {}) }}>Giá thấp đến cao</button>
          <button onClick={() => onSortChange('price-desc')} style={{ ...styles.sortBtn, ...(sort === 'price-desc' ? styles.sortBtnActive : {}) }}>Giá cao xuống thấp</button>
        </div>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {sortedItems.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
          <div style={styles.pagination}>
            <button disabled={pagination.page <= 1} onClick={() => goPage(pagination.page - 1)}>Trước</button>
            <span>Trang {pagination.page} / {pagination.totalPages}</span>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => goPage(pagination.page + 1)}>Sau</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1100, margin: '0 auto', padding: 16 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  note: { margin: '8px 0 16px', color: '#666' },
  toolbar: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16 },
  filterCount: { fontWeight: 700 },
  sortRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  sortLabel: { color: '#666', marginRight: 8 },
  sortBtn: { padding: '6px 10px', borderRadius: 999, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', color: 'var(--text)', fontWeight: 600 },
  sortBtnActive: { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, justifyContent: 'center', justifyItems: 'center' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 },
};
