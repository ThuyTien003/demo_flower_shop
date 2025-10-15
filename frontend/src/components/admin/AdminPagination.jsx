export default function AdminPagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div style={styles.wrap}>
      <button style={styles.btn} disabled={page <= 1} onClick={onPrev}>Trước</button>
      <div style={styles.page}>Trang {page} / {totalPages || 1}</div>
      <button style={styles.btn} disabled={page >= (totalPages || 1)} onClick={onNext}>Sau</button>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  btn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: '#fff',
    cursor: 'pointer',
    color: '#111',
    fontSize: 14,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
  },
  page: { fontWeight: 700 },
};
