import { useEffect, useState, useCallback } from 'react';
import { listSliders, createSlider, updateSlider, deleteSlider } from '@/services/api';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';

export default function Sliders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', is_active: 1, sort_order: 0 });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listSliders({ limit: 100 });
      setItems(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSlider(form);
      setForm({ title: '', image_url: '', link_url: '', is_active: 1, sort_order: 0 });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Tạo slider thất bại');
    }
  };

  const onToggleActive = async (id, current) => {
    try {
      await updateSlider(id, { is_active: current ? 0 : 1 });
      await load();
    } catch (e) { console.error(e); }
  };

  const onDelete = async (id) => {
    if (!confirm('Xóa slider này?')) return;
    try {
      await deleteSlider(id);
      await load();
    } catch (e) { console.error(e); }
  };

  const columns = [
    { title: 'Ảnh', render: (s) => <img src={s.image_url} alt={s.title || 'slider'} style={{ width: 120, height: 70, objectFit: 'cover', borderRadius: 8 }} />, style: { width: 140 } },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Link', render: (s) => <span style={{ color: '#0f52ba' }}>{s.link_url || ''}</span> },
    { title: 'Trạng thái', render: (s) => <span style={{ fontWeight: 800, color: s.is_active ? '#065f46' : '#991b1b' }}>{s.is_active ? 'Active' : 'Disabled'}</span>, style: { width: 120 } },
    { title: 'Thao tác', render: (s) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onToggleActive(s.id, s.is_active)}>{s.is_active ? 'Disable' : 'Enable'}</button>
        <button onClick={() => onDelete(s.id)} style={{ color: '#b91c1c' }}>Xóa</button>
      </div>
    ), style: { width: 160 } },
  ];

  return (
    <div>
      <AdminHeader title="Quản lý Sliders" subtitle="Thêm/sửa/xóa banner trang chủ" />

      <AdminCard title="Thêm Slider">
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề (tuỳ chọn)" />
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL (bắt buộc)" required />
          <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="Link URL (tuỳ chọn)" />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label><input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} /> Active</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Sort order" />
          </div>
          <button type="submit">Thêm Slider</button>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách Sliders">
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải...</div>
        ) : (
          <AdminTable columns={columns} data={items} emptyText="Chưa có slider nào." />
        )}
      </AdminCard>
    </div>
  );
}
