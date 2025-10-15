export default function AdminHeader({ title, subtitle, actions }) {
  return (
    <div style={styles.wrap}>
      <div>
        <h2 style={styles.title}>{title}</h2>
        {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
      </div>
      <div style={styles.actions}>{actions}</div>
    </div>
  );
}

const styles = {
  wrap: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid var(--border)'
  },
  title: { margin: 0, fontSize: 22, lineHeight: 1.2 },
  subtitle: { color: '#6b7280', marginTop: 6, fontSize: 14 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
};
