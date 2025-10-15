import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchBlogCategories, fetchBlogPosts } from '@/services/api';

export default function Blog() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [params, setParams] = useSearchParams();

  const category_id = params.get('category_id') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catRes, postRes] = await Promise.all([
          fetchBlogCategories(),
          fetchBlogPosts({ category_id: category_id || undefined, page, limit: 8 }),
        ]);
        setCategories(catRes.data?.data || []);
        setPosts(postRes.data?.data || []);
        setPagination(postRes.data?.pagination || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category_id, page]);

  const goPage = (p) => setParams(prev => {
    const np = new URLSearchParams(prev);
    np.set('page', String(p));
    return np;
  });

  const chooseCategory = (id) => setParams(prev => {
    const np = new URLSearchParams(prev);
    if (id) np.set('category_id', String(id)); else np.delete('category_id');
    np.set('page', '1');
    return np;
  });

  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>Tin tức, chăm sóc hoa, ý nghĩa hoa</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <aside style={{ border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 800 }}>Chuyên mục</div>
          <div style={{ display: 'grid' }}>
            <button onClick={() => chooseCategory('')} style={catBtnStyle(category_id === '')}>Tất cả</button>
            {categories.map(c => (
              <button key={c.blog_category_id} onClick={() => chooseCategory(c.blog_category_id)} style={catBtnStyle(String(category_id) === String(c.blog_category_id))}>
                {c.name}
              </button>
            ))}
          </div>
        </aside>

        <section>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {posts.map(p => (
                  <Link key={p.post_id} to={`/news/${p.post_id}`} style={cardStyle}>
                    <div style={{ aspectRatio: '4/3', background: '#fafafa' }}>
                      <img src={p.image_url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: 10 }}>
                      <div style={{ fontWeight: 800 }}>{p.title}</div>
                      {p.category_name && <div style={{ fontSize: 12, color: '#666' }}>{p.category_name}</div>}
                      <div style={{ fontSize: 12, color: '#999' }}>{new Date(p.created_at).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  <button disabled={page <= 1} onClick={() => goPage(page - 1)} style={pagerBtn}>‹</button>
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button key={i} onClick={() => goPage(i + 1)} style={pageBtnStyle(page === i + 1)}>{i + 1}</button>
                  ))}
                  <button disabled={page >= pagination.totalPages} onClick={() => goPage(page + 1)} style={pagerBtn}>›</button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const catBtnStyle = (active) => ({
  textAlign: 'left', padding: '10px 12px', border: 'none', borderBottom: '1px solid #f2f2f2', background: active ? '#14452F' : 'transparent', color: active ? '#fff' : '#111', cursor: 'pointer'
});
const cardStyle = { textDecoration: 'none', color: '#111', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' };
const pagerBtn = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' };
const pageBtnStyle = (active) => ({ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: active ? '#14452F' : '#fff', color: active ? '#fff' : '#111' });
