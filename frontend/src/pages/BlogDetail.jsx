import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogPost, fetchBlogComments, createBlogComment } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [postRes, cmtRes] = await Promise.all([
          fetchBlogPost(id),
          fetchBlogComments(id, { page: 1, limit: 10 }),
        ]);
        setPost(postRes.data?.data || null);
        setComments(cmtRes.data?.data || []);
        setPagination(cmtRes.data?.pagination || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      await createBlogComment(id, comment.trim());
      setComment('');
      // Reload first page after comment
      try {
        setLoading(true);
        const cmtRes = await fetchBlogComments(id, { page: 1, limit: 10 });
        setComments(cmtRes.data?.data || []);
        setPagination(cmtRes.data?.pagination || null);
      } finally {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Gửi bình luận thất bại');
    }
  };

  if (loading) return <div className="container" style={{ padding: 16 }}>Đang tải...</div>;
  if (!post) return <div className="container" style={{ padding: 16 }}>Không tìm thấy bài viết</div>;

  return (
    <div className="container" style={{ padding: 16 }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/news">Tin tức</Link>
        <span> / </span>
        <span>{post.title}</span>
      </nav>

      <article style={{ maxWidth: 900, margin: '0 auto', background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        {post.image_url && (
          <div style={{ aspectRatio: '4/3', background: '#fafafa' }}>
            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>{post.title}</h1>
          {post.category_name && <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{post.category_name}</div>}
          <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>{new Date(post.created_at).toLocaleString('vi-VN')}</div>
          <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: toHtml(post.content) }} />
        </div>
      </article>

      <section style={{ maxWidth: 900, margin: '16px auto 0', background: '#fff', border: '1px solid #eee', borderRadius: 12 }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <strong>Bình luận</strong>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          {user ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Viết bình luận của bạn..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <button onClick={submitComment} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#14452F', color: '#fff', fontWeight: 700, width: 'fit-content' }}>Gửi bình luận</button>
            </div>
          ) : (
            <div style={{ color: '#666' }}>Vui lòng đăng nhập để bình luận.</div>
          )}

          {comments.length === 0 ? (
            <div>Chưa có bình luận.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {comments.map(c => (
                <div key={c.comment_id} style={{ borderTop: '1px solid #f2f2f2', paddingTop: 10 }}>
                  <div style={{ fontWeight: 700 }}>{c.user_name || c.username || 'Người dùng'}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>{new Date(c.created_at).toLocaleString('vi-VN')}</div>
                  <div style={{ marginTop: 6 }}>{c.comment}</div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const cmtRes = await fetchBlogComments(id, { page: i + 1, limit: 10 });
                      setComments(cmtRes.data?.data || []);
                      setPagination(cmtRes.data?.pagination || null);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: i + 1 === 1 ? '#14452F' : '#fff', color: i + 1 === 1 ? '#fff' : '#111' }}
                >{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function toHtml(text) {
  // very simple conversion: preserve line breaks
  if (!text) return '';
  return (text + '').replace(/\n/g, '<br/>');
}
