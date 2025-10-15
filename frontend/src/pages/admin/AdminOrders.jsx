import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { listAllOrders, adminUpdateOrderStatus, fetchOrderDetail, cancelOrder } from '@/services/api';

export default function AdminOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', statuses: '', q: '' });

  // Stable loader independent of filters state to avoid effect loops
  const fetchOrders = useCallback(async (pg = 1, nextFilters = {}) => {
    try {
      setLoading(true);
      const multi = String(nextFilters.statuses || '').trim();
      if (multi) {
        // Multi-status: fetch a larger page and filter client-side
        const res = await listAllOrders({ page: 1, limit: 500 });
        const all = res.data?.data || [];
        const arr = multi.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const filtered = all.filter(o => arr.includes(String(o.status || '').toLowerCase()));
        // client-side pagination
        const start = (pg - 1) * limit;
        const pageItems = filtered.slice(start, start + limit);
        setItems(pageItems);
        setPagination({ total: filtered.length, page: pg, totalPages: Math.max(1, Math.ceil(filtered.length / limit)) });
        setPage(pg);
      } else {
        const params = { page: pg, limit };
        if (nextFilters.status) params.status = nextFilters.status;
        if (nextFilters.q) params.q = nextFilters.q; // backend may ignore q
        const res = await listAllOrders(params);
        const data = res.data?.data || [];
        setItems(data);
        const pag = res.data?.pagination || { total: data.length, page: pg, totalPages: Math.max(1, Math.ceil((data.length || 0) / limit)) };
        setPagination(pag);
        setPage(pg);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Tải danh sách đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Read filters from URL on mount and whenever the query string changes
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const status = sp.get('status') || '';
    const statuses = sp.get('statuses') || '';
    const q = sp.get('q') || '';
    const next = { status, statuses, q };
    // Only update state if changed to avoid re-renders
    setFilters((prev) => {
      if (prev.status === next.status && prev.statuses === next.statuses && prev.q === next.q) return prev;
      return next;
    });
    fetchOrders(1, next);
  }, [location.search, fetchOrders]);

  const onUpdateStatus = useCallback(async (order, status) => {
    try {
      await adminUpdateOrderStatus(order.order_id, status);
      await fetchOrders(page, filters);
      alert('Đã cập nhật trạng thái');
    } catch (e) {
      alert(e?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  }, [fetchOrders, page, filters]);

  const onViewDetail = useCallback(async (order) => {
    try {
      const res = await fetchOrderDetail(order.order_id);
      const detail = res.data?.data;
      alert(JSON.stringify(detail, null, 2));
    } catch (e) {
      alert(e?.response?.data?.message || 'Xem chi tiết đơn hàng thất bại');
    }
  }, []);

  const onCancelOrder = useCallback(async (order) => {
    const reason = prompt('Lý do hủy đơn hàng:');
    if (!reason) return;
    try {
      await cancelOrder(order.order_id, reason);
      await fetchOrders(page, filters);
      alert('Đã hủy đơn hàng');
    } catch (e) {
      alert(e?.response?.data?.message || 'Hủy đơn hàng thất bại');
    }
  }, [fetchOrders, page, filters]);

  const columns = useMemo(() => ([
    { title: 'Mã', dataIndex: 'order_id', style: { width: 80 } },
    { title: 'User', render: (o) => o.user_id, style: { width: 100 } },
    { title: 'Tổng tiền', render: (o) => new Intl.NumberFormat('vi-VN').format(o.total_amount), style: { width: 140 } },
    { title: 'Trạng thái', render: (o) => (
      <select value={o.status} onChange={(e) => onUpdateStatus(o, e.target.value)}>
        <option value="pending">pending</option>
        <option value="processing">processing</option>
        <option value="shipped">shipped</option>
        <option value="delivered">delivered</option>
        <option value="cancelled">cancelled</option>
      </select>
    ), style: { width: 160 } },
    { title: 'Ngày tạo', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : ''), style: { width: 180 } },
    { title: 'Thao tác', style: { width: 220 }, render: (o) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onViewDetail(o)}>Xem</button>
        {(o.status === 'pending' || o.status === 'processing') && (
          <button onClick={() => onCancelOrder(o)} style={{ color: '#b91c1c' }}>Hủy</button>
        )}
      </div>
    ) },
  ]), [onUpdateStatus, onViewDetail, onCancelOrder]);

  const applyFiltersToUrl = (nextFilters) => {
    const sp = new URLSearchParams();
    if (nextFilters.status) sp.set('status', nextFilters.status);
    if (nextFilters.q) sp.set('q', nextFilters.q);
    const search = sp.toString();
    navigate({ pathname: '/admin/orders', search: search ? `?${search}` : '' }, { replace: false });
  };

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <select value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
        <option value="">Tất cả trạng thái</option>
        <option value="pending">pending</option>
        <option value="processing">processing</option>
        <option value="shipped">shipped</option>
        <option value="delivered">delivered</option>
        <option value="cancelled">cancelled</option>
      </select>
      <input placeholder="Tìm kiếm (đang để trống)" value={filters.q} onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))} />
      <button onClick={() => { applyFiltersToUrl(filters); /* fetch will be triggered by URL change */ }}>Lọc</button>
      <button onClick={() => { const cleared = { status: '', q: '' }; setFilters(cleared); applyFiltersToUrl(cleared); /* fetch triggered by URL change */ }}>Xóa lọc</button>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Quản lý Đơn hàng" subtitle="Xem và cập nhật trạng thái đơn hàng" actions={filterBar} />

      <AdminCard title="Danh sách đơn hàng">
        {loading ? (
          <div style={{ padding: 12, color: '#666' }}>Đang tải...</div>
        ) : (
          <AdminTable columns={columns} data={items} emptyText="Chưa có đơn hàng." />
        )}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrev={() => fetchOrders(page - 1, filters)}
            onNext={() => fetchOrders(page + 1, filters)}
          />
        </div>
      </AdminCard>
    </div>
  );
}
