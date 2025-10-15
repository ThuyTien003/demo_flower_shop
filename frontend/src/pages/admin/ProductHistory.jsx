import { useEffect, useState, useCallback } from 'react';
import { listProductHistory, listProductHistoryByProduct } from '@/services/api';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';

export default function ProductHistory() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ productId: '', startDate: '', endDate: '' });

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      const params = { page: pg, limit };
      let res;
      if (filters.productId) {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        res = await listProductHistoryByProduct(filters.productId, params);
      } else {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        res = await listProductHistory(params);
      }
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

  const columns = [
    { title: 'Thời gian', render: (r) => new Date(r.created_at).toLocaleString('vi-VN'), style: { width: 180 } },
    { title: 'Action', render: (r) => <strong>{r.action}</strong>, style: { width: 100 } },
    { title: 'Product', render: (r) => `#${r.product_id}`, style: { width: 100 } },
    { title: 'Chi tiết', render: (r) => <span style={{ color: '#444' }}>{r.user_name || r.username || 'Admin'} • {r.before_data ? `before=${JSON.stringify(r.before_data)}` : ''} {r.after_data ? `after=${JSON.stringify(r.after_data)}` : ''}</span> },
  ];

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input type="number" placeholder="Product ID" value={filters.productId} onChange={(e) => setFilters((s) => ({ ...s, productId: e.target.value }))} />
      <input type="date" value={filters.startDate} onChange={(e) => setFilters((s) => ({ ...s, startDate: e.target.value }))} />
      <input type="date" value={filters.endDate} onChange={(e) => setFilters((s) => ({ ...s, endDate: e.target.value }))} />
      <button onClick={() => load(1)}>Lọc</button>
      <button onClick={() => setFilters({ productId: '', startDate: '', endDate: '' })}>Xóa lọc</button>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Product History" subtitle="Nhật ký thay đổi dữ liệu sản phẩm" actions={filterBar} />
      <AdminCard>
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải dữ liệu...</div>
        ) : (
          <AdminTable columns={columns} data={items} emptyText="Chưa có lịch sử nào." />
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
