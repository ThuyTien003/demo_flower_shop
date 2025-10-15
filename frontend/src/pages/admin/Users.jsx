import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaUserShield, FaKey, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { listAdminUsers, updateUserRole, adminResetPassword, createAdminUser, updateAdminUser, deleteAdminUser } from '@/services/api';

export default function Users() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ q: '', role: '' });
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', full_name: '', phone: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ username: '', email: '', full_name: '', phone: '', address: '' });

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      const res = await listAdminUsers({ page: pg, limit, ...filters });
      setItems(res.data?.data || []);
      setPagination(res.data?.pagination || { total: 0, page: 1, totalPages: 1 });
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => { load(1); }, [load]);

  const onChangeRole = useCallback(async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Đổi vai trò của ${user.username} thành ${nextRole}?`)) return;
    try {
      await updateUserRole(user.user_id, nextRole);
      await load(page);
    } catch (e) { alert(e?.response?.data?.message || 'Cập nhật vai trò thất bại'); }
  }, [page, load]);

  const onResetPassword = useCallback(async (user) => {
    const newPassword = prompt(`Nhập mật khẩu mới cho ${user.username} (>= 6 ký tự):`);
    if (!newPassword) return;
    try {
      await adminResetPassword(user.user_id, newPassword);
      alert('Đã đặt lại mật khẩu');
    } catch (e) { alert(e?.response?.data?.message || 'Đặt lại mật khẩu thất bại'); }
  }, []);

  const onCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || form.password.length < 6) {
      alert('Vui lòng nhập username, email và mật khẩu (>=6 ký tự)');
      return;
    }
    try {
      await createAdminUser(form);
      setForm({ username: '', email: '', password: '', role: 'user', full_name: '', phone: '', address: '' });
      await load(1);
      alert('Đã tạo user');
    } catch (e) {
      alert(e?.response?.data?.message || 'Tạo user thất bại');
    }
  };

  const onStartEdit = (u) => {
    setEditingId(u.user_id);
    setEditData({
      username: u.username || '',
      email: u.email || '',
      full_name: u.full_name || '',
      phone: u.phone || '',
      address: u.address || '',
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditData({ username: '', email: '', full_name: '', phone: '', address: '' });
  };

  const onSaveEdit = useCallback(async () => {
    try {
      await updateAdminUser(editingId, editData);
      await load(page);
      onCancelEdit();
      alert('Đã cập nhật user');
    } catch (e) {
      alert(e?.response?.data?.message || 'Cập nhật user thất bại');
    }
  }, [editingId, editData, load, page]);

  const onDeleteUser = useCallback(async (u) => {
    if (!confirm(`Xóa user ${u.username}? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteAdminUser(u.user_id);
      await load(page);
    } catch (e) {
      alert(e?.response?.data?.message || 'Xóa user thất bại');
    }
  }, [load, page]);

  const columns = useMemo(() => ([
    { title: 'Username', render: (u) => (
      editingId === u.user_id ? (
        <input value={editData.username} onChange={(e) => setEditData((s) => ({ ...s, username: e.target.value }))} />
      ) : u.username
    ) },
    { title: 'Email', render: (u) => (
      editingId === u.user_id ? (
        <input value={editData.email} onChange={(e) => setEditData((s) => ({ ...s, email: e.target.value }))} />
      ) : u.email
    ) },
    { title: 'Họ tên', render: (u) => (
      editingId === u.user_id ? (
        <input value={editData.full_name} onChange={(e) => setEditData((s) => ({ ...s, full_name: e.target.value }))} />
      ) : (u.full_name || '')
    ) },
    { title: 'Điện thoại', style: { width: 120 }, render: (u) => (
      editingId === u.user_id ? (
        <input value={editData.phone} onChange={(e) => setEditData((s) => ({ ...s, phone: e.target.value }))} />
      ) : (u.phone || '')
    ) },
    { title: 'Địa chỉ', render: (u) => (
      editingId === u.user_id ? (
        <input value={editData.address} onChange={(e) => setEditData((s) => ({ ...s, address: e.target.value }))} />
      ) : (u.address || '')
    ) },
    { title: 'Role', render: (u) => <strong>{u.role}</strong>, style: { width: 100 } },
    { title: 'Ngày tạo', render: (u) => new Date(u.created_at).toLocaleString('vi-VN'), style: { width: 180 } },
    { title: 'Thao tác', style: { width: 280 }, render: (u) => (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button title={u.role === 'admin' ? 'Set User' : 'Set Admin'} onClick={() => onChangeRole(u)} style={styles.iconBtn}><FaUserShield /></button>
        <button title="Reset mật khẩu" onClick={() => onResetPassword(u)} style={styles.iconBtn}><FaKey /></button>
        {editingId === u.user_id ? (
          <>
            <button title="Lưu" onClick={onSaveEdit} style={{ ...styles.iconBtn, color: '#065f46' }}><FaCheck /></button>
            <button title="Hủy" onClick={onCancelEdit} style={{ ...styles.iconBtn, color: '#991b1b' }}><FaTimes /></button>
          </>
        ) : (
          <button title="Sửa" onClick={() => onStartEdit(u)} style={styles.iconBtn}><FaEdit /></button>
        )}
        <button title="Xóa" onClick={() => onDeleteUser(u)} style={{ ...styles.iconBtn, color: '#b91c1c' }}><FaTrash /></button>
      </div>
    ) },
  ]), [editingId, editData, onChangeRole, onResetPassword, onSaveEdit, onDeleteUser]);

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input placeholder="Tìm username/email/họ tên" value={filters.q} onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))} />
      <select value={filters.role} onChange={(e) => setFilters((s) => ({ ...s, role: e.target.value }))}>
        <option value="">Tất cả vai trò</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={() => load(1)}>Lọc</button>
      <button onClick={() => setFilters({ q: '', role: '' })}>Xóa lọc</button>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Quản lý Users" subtitle="Danh sách người dùng và quyền hạn" actions={filterBar} />
      <AdminCard title="Tạo user mới">
        <form onSubmit={onCreateUser} style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <input placeholder="Username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            <input type="password" placeholder="Password (>=6)" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <input placeholder="Họ tên" value={form.full_name} onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))} />
            <input placeholder="Điện thoại" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
            <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <input placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
          <div>
            <button type="submit">Tạo user</button>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách Users">
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải dữ liệu...</div>
        ) : (
          <AdminTable columns={columns} data={items} emptyText="Chưa có người dùng." />
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
