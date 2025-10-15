import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { fetchCategories, createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin } from '@/services/api';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ name: '', slug: '', parent_id: '', description: '' });

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      const res = await fetchCategories();
      const data = res.data?.data || [];
      setItems(data);
      // simple paging client-side for now
      const total = data.length;
      setPagination({ total, page: pg, totalPages: Math.max(1, Math.ceil(total / limit)) });
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(1); }, [load]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) { alert('Name và slug là bắt buộc'); return; }
    try {
      await createCategoryAdmin({
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        description: form.description || null,
      });
      setForm({ name: '', slug: '', parent_id: '', description: '' });
      await load(1);
    } catch (e) { alert(e?.response?.data?.message || 'Tạo category thất bại'); }
  };

  const startEdit = (c) => {
    setEditingId(c.category_id);
    setEdit({ name: c.name || '', slug: c.slug || '', parent_id: c.parent_id || '', description: c.description || '' });
  };
  const cancelEdit = () => { setEditingId(null); setEdit({ name: '', slug: '', parent_id: '', description: '' }); };
  const saveEdit = useCallback(async () => {
    try {
      await updateCategoryAdmin(editingId, {
        name: edit.name,
        slug: edit.slug,
        parent_id: edit.parent_id ? Number(edit.parent_id) : null,
        description: edit.description || null,
      });
      await load(page);
      cancelEdit();
    } catch (e) { alert(e?.response?.data?.message || 'Cập nhật category thất bại'); }
  }, [editingId, edit, load, page]);
  const onDelete = useCallback(async (c) => {
    if (!confirm(`Xóa danh mục ${c.name}?`)) return;
    try { await deleteCategoryAdmin(c.category_id); await load(page); }
    catch (e) { alert(e?.response?.data?.message || 'Xóa category thất bại'); }
  }, [load, page]);

  const columns = useMemo(() => ([
    { title: 'ID', dataIndex: 'category_id', style: { width: 80 } },
    { title: 'Tên', render: (c) => (
      editingId === c.category_id ? (
        <input value={edit.name} onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} />
      ) : c.name
    ) },
    { title: 'Slug', render: (c) => (
      editingId === c.category_id ? (
        <input value={edit.slug} onChange={(e) => setEdit((s) => ({ ...s, slug: e.target.value }))} />
      ) : c.slug
    ) },
    { title: 'Parent ID', render: (c) => (
      editingId === c.category_id ? (
        <input type="number" value={edit.parent_id} onChange={(e) => setEdit((s) => ({ ...s, parent_id: e.target.value }))} />
      ) : (c.parent_id || '')
    ), style: { width: 120 } },
    { title: 'Mô tả', render: (c) => (
      editingId === c.category_id ? (
        <input value={edit.description} onChange={(e) => setEdit((s) => ({ ...s, description: e.target.value }))} />
      ) : (c.description || '')
    ) },
    { title: 'Thao tác', style: { width: 220 }, render: (c) => (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {editingId === c.category_id ? (
          <>
            <button title="Lưu" onClick={saveEdit} style={{ ...styles.iconBtn, color: '#065f46' }}><FaCheck /></button>
            <button title="Hủy" onClick={cancelEdit} style={{ ...styles.iconBtn, color: '#991b1b' }}><FaTimes /></button>
          </>
        ) : (
          <button title="Sửa" onClick={() => startEdit(c)} style={styles.iconBtn}><FaEdit /></button>
        )}
        <button title="Xóa" onClick={() => onDelete(c)} style={{ ...styles.iconBtn, color: '#b91c1c' }}><FaTrash /></button>
      </div>
    ) },
  ]), [editingId, edit, page, saveEdit, onDelete]);

  return (
    <div>
      <AdminHeader title="Quản lý Danh mục" subtitle="Tạo/sửa/xóa danh mục sản phẩm" />
      <AdminCard title="Tạo danh mục">
        <form onSubmit={onCreate} style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <input placeholder="Tên" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} required />
            <input type="number" placeholder="Parent ID (tuỳ chọn)" value={form.parent_id} onChange={(e) => setForm((s) => ({ ...s, parent_id: e.target.value }))} />
          </div>
          <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          <button type="submit">Tạo danh mục</button>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách Danh mục">
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải...</div>
        ) : (
          <AdminTable columns={columns} data={items.slice((page-1)*limit, (page-1)*limit + limit)} emptyText="Chưa có danh mục." />
        )}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrev={() => load(page - 1)}
            onNext={() => load(page + 1)}
          />
        </div>
      </AdminCard>
    </div>
  );
}

const styles = {
  iconBtn: {
    border: '1px solid var(--border)',
    background: '#fff',
    borderRadius: 8,
    padding: 6,
    cursor: 'pointer',
    display: 'inline-grid',
    placeItems: 'center',
    color: '#14452F',
    transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease'
  },
};
