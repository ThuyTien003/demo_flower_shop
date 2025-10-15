// import { useCallback, useEffect, useMemo, useState } from 'react';
// import AdminHeader from '@/components/admin/AdminHeader';
// import AdminCard from '@/components/admin/AdminCard';
// import AdminTable from '@/components/admin/AdminTable';
// import AdminPagination from '@/components/admin/AdminPagination';
// import { listAdminCarts, getAdminCartByUser } from '@/services/api';

// export default function AdminCarts() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

//   const [selected, setSelected] = useState(null); // { cart_id, items: [], total: {} }
//   const [showModal, setShowModal] = useState(false);

//   const load = useCallback(async (pg = 1) => {
//     try {
//       setLoading(true);
//       const res = await listAdminCarts({ page: pg, limit });
//       const data = res.data?.data || [];
//       setItems(data);
//       const total = data.length;
//       setPagination({ total, page: pg, totalPages: Math.max(1, Math.ceil(total / limit)) });
//       setPage(pg);
//     } catch (e) {
//       console.error(e);
//       alert(e?.response?.data?.message || 'Tải danh sách giỏ hàng thất bại');
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   useEffect(() => { load(1); }, [load]);

//   const onViewCart = useCallback(async (row) => {
//     try {
//       const res = await getAdminCartByUser(row.user_id);
//       const data = res.data?.data;
//       setSelected(data);
//       setShowModal(true);
//     } catch (e) {
//       alert(e?.response?.data?.message || 'Lấy giỏ hàng thất bại');
//     }
//   }, []);

//   const columns = useMemo(() => ([
//     { title: 'Cart', dataIndex: 'cart_id', style: { width: 80 } },
//     { title: 'User', render: (r) => (
//       <div>
//         <div><strong>{r.full_name || r.username || `#${r.user_id}`}</strong></div>
//         <div style={{ color: '#6b7280', fontSize: 12 }}>User ID: {r.user_id}</div>
//       </div>
//     ) },
//     { title: 'Items', dataIndex: 'total_items', style: { width: 90 } },
//     { title: 'Số lượng', dataIndex: 'total_quantity', style: { width: 100 } },
//     { title: 'Tổng tiền', render: (r) => new Intl.NumberFormat('vi-VN').format(r.total_amount || 0), style: { width: 140 } },
//     { title: 'Cập nhật', render: (r) => (r.updated_at ? new Date(r.updated_at).toLocaleString('vi-VN') : ''), style: { width: 180 } },
//     { title: 'Thao tác', style: { width: 140 }, render: (r) => (
//       <div style={{ display: 'flex', gap: 8 }}>
//         <button onClick={() => onViewCart(r)}>Xem giỏ</button>
//       </div>
//     ) },
//   ]), [onViewCart]);

//   const filterBar = null;

//   const renderModal = () => {
//     if (!showModal) return null;
//     const data = selected || { items: [], total: {} };
//     return (
//       <div style={styles.modalWrap} onClick={() => setShowModal(false)}>
//         <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
//           <div style={styles.modalHeader}>
//             <div style={{ fontWeight: 800 }}>Giỏ hàng #{data.cart_id}</div>
//             <button onClick={() => setShowModal(false)} style={styles.closeBtn}>×</button>
//           </div>
//           <div style={{ padding: 12 }}>
//             {(!data.items || data.items.length === 0) ? (
//               <div style={{ color: '#666' }}>Giỏ hàng trống</div>
//             ) : (
//               <div style={{ display: 'grid', gap: 8 }}>
//                 {data.items.map((it) => (
//                   <div key={it.cart_item_id} style={styles.itemRow}>
//                     {it.image_url && <img src={it.image_url} alt="" style={styles.thumb} />}
//                     <div style={{ flex: 1 }}>
//                       <div style={{ fontWeight: 700 }}>{it.name}</div>
//                       <div style={{ color: '#6b7280', fontSize: 12 }}>x{it.quantity} × {new Intl.NumberFormat('vi-VN').format(it.unit_price)}</div>
//                     </div>
//                     <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(it.quantity * it.unit_price)}</div>
//                   </div>
//                 ))}
//                 <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
//                   <div style={{ color: '#6b7280' }}>Tổng</div>
//                   <div style={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(data.total?.total_amount || 0)}</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <AdminHeader title="Giỏ hàng người dùng" subtitle="Xem giỏ hàng của tất cả user (chỉ admin)" actions={filterBar} />

//       <AdminCard title="Danh sách giỏ hàng">
//         {loading ? (
//           <div style={{ padding: 12, color: '#666' }}>Đang tải...</div>
//         ) : (
//           <AdminTable columns={columns} data={items.slice((page-1)*limit, (page-1)*limit + limit)} emptyText="Chưa có giỏ hàng." />
//         )}
//         <div style={{ borderTop: '1px solid var(--border)' }}>
//           <AdminPagination
//             page={pagination.page}
//             totalPages={pagination.totalPages}
//             onPrev={() => load(page - 1)}
//             onNext={() => load(page + 1)}
//           />
//         </div>
//       </AdminCard>

//       {renderModal()}
//     </div>
//   );
// }

// const styles = {
//   modalWrap: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50 },
//   modalCard: { width: 'min(720px, 92vw)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 28px rgba(0,0,0,0.18)' },
//   modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' },
//   closeBtn: { border: '1px solid var(--border)', background: '#fff', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' },
//   itemRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--border)' },
//   thumb: { width: 54, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }
// };
