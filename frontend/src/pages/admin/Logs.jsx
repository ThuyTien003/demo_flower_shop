import { useEffect, useState, useCallback } from 'react';
import { listAdminLogs } from '@/services/api';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ action: '', resource: '', user: '', startDate: '', endDate: '' });

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      const params = { page: pg, limit };
      if (filters.action) params.action = filters.action;
      if (filters.resource) params.resource = filters.resource;
      if (filters.user) params.user = filters.user;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await listAdminLogs(params);
      let data = res.data?.data || [];
      // Optional client-side user filtering fallback if backend ignores 'user' param
      if (filters.user) {
        const q = filters.user.toLowerCase();
        data = data.filter(r => `${r.user_name || r.username || ''}`.toLowerCase().includes(q));
      }
      setLogs(data);
      setPagination(res.data?.pagination || { total: 0, page: 1, totalPages: 1 });
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => { load(1); }, [load]);

  const columns = [
    { title: 'Thời gian', render: (r) => new Date(r.created_at).toLocaleString('vi-VN'), style: { width: 180 } },
    { title: 'Hành động', render: (r) => <strong>{r.action}</strong>, style: { width: 120 } },
    { title: 'Tài nguyên', render: (r) => `${r.resource}#${r.resource_id ?? '-'}`, style: { width: 160 } },
    { title: 'Chi tiết', render: (r) => <span style={{ color: '#444' }}>{r.user_name || r.username || 'Admin'}{r.details ? ` • ${JSON.stringify(r.details)}` : ''}</span> },
  ];

  const exportCSV = () => {
    const headers = ['created_at','action','resource','resource_id','user','details'];
    const rows = logs.map(r => [
      r.created_at ? new Date(r.created_at).toISOString() : '',
      r.action || '',
      r.resource || '',
      r.resource_id ?? '',
      r.user_name || r.username || 'Admin',
      r.details ? JSON.stringify(r.details) : ''
    ]);
    const csv = [headers, ...rows]
      .map(cols => cols.map(v => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <select value={filters.action} onChange={(e) => setFilters((s) => ({ ...s, action: e.target.value }))}>
        <option value="">Tất cả hành động</option>
        <option value="create">Create</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
      <select value={filters.resource} onChange={(e) => setFilters((s) => ({ ...s, resource: e.target.value }))}>
        <option value="">Tất cả tài nguyên</option>
        <option value="product">Product</option>
      </select>
      <input placeholder="Tìm theo user" value={filters.user} onChange={(e) => setFilters((s) => ({ ...s, user: e.target.value }))} />
      <input type="date" value={filters.startDate} onChange={(e) => setFilters((s) => ({ ...s, startDate: e.target.value }))} />
      <input type="date" value={filters.endDate} onChange={(e) => setFilters((s) => ({ ...s, endDate: e.target.value }))} />
      <button onClick={() => load(1)}>Lọc</button>
      <button onClick={() => { setFilters({ action: '', resource: '', user: '', startDate: '', endDate: '' }); }}>Xóa lọc</button>
      <button onClick={exportCSV}>Xuất CSV</button>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Admin Logs" subtitle="Theo dõi thao tác thêm / sửa / xóa" actions={filterBar} />
      <AdminCard>
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải dữ liệu...</div>
        ) : (
          <AdminTable columns={columns} data={logs} emptyText="Chưa có log nào." />
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
