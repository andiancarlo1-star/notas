const COLORS = {
  success: { bg: '#059669', icon: '✓' },
  error: { bg: '#dc2626', icon: '✕' },
  warning: { bg: '#d97706', icon: '⚠' },
  info: { bg: '#2563eb', icon: 'ℹ' },
};

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => {
        const c = COLORS[t.tipo] || COLORS.info;
        return (
          <div key={t.id} style={{
            padding: '14px 20px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 600, fontSize: 14,
            background: c.bg, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10,
            animation: 'slideInRight 0.3s ease', minWidth: 280,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>{c.icon}</span>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
