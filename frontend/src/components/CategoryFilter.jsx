import { useEffect, useState } from 'react';
import { fetchCategoriesWithCounts } from '@/services/api';

export default function CategoryFilter({ value, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategoriesWithCounts();
        setCategories(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div style={styles.wrap}>
      <select value={value || ''} onChange={(e) => onChange?.(e.target.value || null)} style={styles.select}>
        <option value="">TẤT CẢ DANH MỤC</option>
        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>
            {c.name} ({c.product_count})
          </option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex' },
  select: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 },
};
