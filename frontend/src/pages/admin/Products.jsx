import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';
import {
  fetchProducts,
  fetchProductsByCategory,
  searchProducts,
  fetchCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '@/services/api';

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({ q: '', categoryId: '' });

  const [form, setForm] = useState({
    name: '', slug: '', price: '', category_id: '', stock_quantity: 0, is_active: 1, description: '', images_text: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    name: '', price: '', category_id: '', stock_quantity: 0, is_active: 1, description: '', images_text: ''
  });

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data?.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      let res;
      if (filters.q) {
        res = await searchProducts(filters.q, { page: pg, limit });
        setItems(res.data?.products || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, totalPages: 1 });
      } else if (filters.categoryId) {
        res = await fetchProductsByCategory(filters.categoryId, { page: pg, limit });
        setItems(res.data?.products || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, totalPages: 1 });
      } else {
        res = await fetchProducts({ page: pg, limit });
        setItems(res.data?.products || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, totalPages: 1 });
      }
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { load(1); }, [load]);

  const parseImages = (text) => {
    const lines = String(text || '').split(/\n|,/).map(s => s.trim()).filter(Boolean);
    return lines.map((url, idx) => ({ image_url: url, is_primary: idx === 0 ? 1 : 0, alt_text: '' }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.slug || !form.name || !form.price || !form.category_id) {
      alert('Vui lòng nhập Name, Slug, Price, Category');
      return;
    }
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: Number(form.price),
        category_id: Number(form.category_id),
        stock_quantity: Number(form.stock_quantity || 0),
        is_active: form.is_active ? 1 : 0,
      };
      const images = parseImages(form.images_text);
      await adminCreateProduct({ ...payload, images });
      setForm({ name: '', slug: '', price: '', category_id: '', stock_quantity: 0, is_active: 1, description: '', images_text: '' });
      await load(1);
      alert('Đã tạo sản phẩm');
    } catch (e) {
      alert(e?.response?.data?.message || 'Tạo sản phẩm thất bại');
    }
  };

  const startEdit = (p) => {
    setEditingId(p.product_id);
    setEdit({
      name: p.name || '',
      price: p.price || '',
      category_id: p.category_id || '',
      stock_quantity: p.stock_quantity || 0,
      is_active: p.is_active ? 1 : 0,
      description: p.description || '',
      images_text: '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEdit({ name: '', price: '', category_id: '', stock_quantity: 0, is_active: 1, description: '', images_text: '' }); };

  const saveEdit = useCallback(async () => {
    try {
      const payload = {
        name: edit.name,
        description: edit.description || null,
        price: Number(edit.price),
        category_id: Number(edit.category_id),
        stock_quantity: Number(edit.stock_quantity || 0),
        is_active: edit.is_active ? 1 : 0,
      };
      const images = parseImages(edit.images_text);
      await adminUpdateProduct(editingId, images.length ? { ...payload, images } : payload);
      await load(page);
      cancelEdit();
      alert('Đã cập nhật sản phẩm');
    } catch (e) { alert(e?.response?.data?.message || 'Cập nhật sản phẩm thất bại'); }
  }, [editingId, edit, load, page]);

  const onDelete = useCallback(async (p) => {
    if (!confirm(`Xóa sản phẩm ${p.name}?`)) return;
    try { await adminDeleteProduct(p.product_id); await load(page); }
    catch (e) { alert(e?.response?.data?.message || 'Xóa sản phẩm thất bại'); }
  }, [load, page]);

  const columns = useMemo(() => ([
    { title: 'ID', dataIndex: 'product_id', style: { width: 70 } },
    { title: 'Tên', render: (p) => (
      editingId === p.product_id ? (
        <input value={edit.name} onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} />
      ) : p.name
    ) },
    { title: 'Giá', render: (p) => (
      editingId === p.product_id ? (
        <input type="number" value={edit.price} onChange={(e) => setEdit((s) => ({ ...s, price: e.target.value }))} />
      ) : new Intl.NumberFormat('vi-VN').format(p.price)
    ), style: { width: 120 } },
    { title: 'Danh mục', render: (p) => (
      editingId === p.product_id ? (
        <select value={edit.category_id} onChange={(e) => setEdit((s) => ({ ...s, category_id: e.target.value }))}>
          <option value="">-- Chọn --</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
      ) : p.category_name || p.category_id
    ), style: { width: 180 } },
    { title: 'Kho', render: (p) => (
      editingId === p.product_id ? (
        <input type="number" value={edit.stock_quantity} onChange={(e) => setEdit((s) => ({ ...s, stock_quantity: e.target.value }))} />
      ) : p.stock_quantity
    ), style: { width: 100 } },
    { title: 'Kích hoạt', render: (p) => (
      editingId === p.product_id ? (
        <input type="checkbox" checked={!!edit.is_active} onChange={(e) => setEdit((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
      ) : (p.is_active ? '✅' : '❌')
    ), style: { width: 100 } },
    { title: 'Mô tả', render: (p) => (
      editingId === p.product_id ? (
        <input value={edit.description} onChange={(e) => setEdit((s) => ({ ...s, description: e.target.value }))} />
      ) : (p.description || '')
    ) },
    { title: 'Thao tác', style: { width: 200 }, render: (p) => (
      <div style={{ display: 'flex', gap: 8 }}>
        {editingId === p.product_id ? (
          <>
            <button onClick={saveEdit}>Lưu</button>
            <button onClick={cancelEdit}>Hủy</button>
          </>
        ) : (
          <button onClick={() => startEdit(p)}>Sửa</button>
        )}
        <button style={{ color: '#b91c1c' }} onClick={() => onDelete(p)}>Xóa</button>
      </div>
    ) },
  ]), [editingId, edit, categories, saveEdit, onDelete]);

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input placeholder="Tìm theo tên/mô tả" value={filters.q} onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))} />
      <select value={filters.categoryId} onChange={(e) => setFilters((s) => ({ ...s, categoryId: e.target.value }))}>
        <option value="">Tất cả danh mục</option>
        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
      </select>
      <button onClick={() => load(1)}>Lọc</button>
      <button onClick={() => { setFilters({ q: '', categoryId: '' }); load(1); }}>Xóa lọc</button>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Quản lý Sản phẩm" subtitle="Tạo/sửa/xóa sản phẩm và quản lý hình ảnh" actions={filterBar} />

      <AdminCard title="Tạo sản phẩm">
        <form onSubmit={onCreate} style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <input placeholder="Tên" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} required />
            <input type="number" placeholder="Giá" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <select value={form.category_id} onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value }))} required>
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
            <input type="number" placeholder="Tồn kho" value={form.stock_quantity} onChange={(e) => setForm((s) => ({ ...s, stock_quantity: e.target.value }))} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} /> Kích hoạt
            </label>
          </div>
          <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          <textarea rows={3} placeholder="Danh sách URL ảnh (mỗi dòng một URL, dòng đầu là ảnh chính)" value={form.images_text} onChange={(e) => setForm((s) => ({ ...s, images_text: e.target.value }))} />
          <div>
            <button type="submit">Tạo sản phẩm</button>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách Sản phẩm">
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải...</div>
        ) : (
          <AdminTable columns={columns} data={items} emptyText="Chưa có sản phẩm." />
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
