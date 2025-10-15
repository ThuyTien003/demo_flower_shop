export default function AdminCard({ title, extra, children, footer, style, ...props }) {
  return (
    <div style={{ ...styles.card, ...(style || {}) }} {...props}>
      {(title || extra) && (
        <div style={styles.header}>
          {title && <div style={styles.headerTitle}>{title}</div>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={styles.body}>{children}</div>
      {footer && <div style={styles.footer}>{footer}</div>}
    </div>
  );
}

const styles = {
  card: { border: '1px solid var(--border)', borderRadius: 14, background: '#fff', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--surface-2), #fff)' },
  headerTitle: { fontWeight: 800, fontSize: 16 },
  body: { padding: 14 },
  footer: { padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between' }
};
