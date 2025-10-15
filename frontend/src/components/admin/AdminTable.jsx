export default function AdminTable({ columns = [], data = [], emptyText = 'Không có dữ liệu' }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ ...styles.th, ...(col.style || {}) }}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!data || data.length === 0) ? (
            <tr>
              <td colSpan={columns.length} style={styles.empty}>{emptyText}</td>
            </tr>
          ) : data.map((row, ridx) => (
            <tr key={ridx} style={{ ...styles.tr, ...(ridx % 2 === 1 ? styles.trAlt : {}) }}>
              {columns.map((col, cidx) => (
                <td key={cidx} style={{ ...styles.td, ...(col.cellStyle || {}) }}>
                  {col.render ? col.render(row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: 13, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: '#111' },
  tr: { background: '#fff' },
  trAlt: { background: '#fafafa' },
  td: { padding: '9px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', fontSize: 14, color: '#111' },
  empty: { padding: 16, textAlign: 'center', color: '#666' },
};
