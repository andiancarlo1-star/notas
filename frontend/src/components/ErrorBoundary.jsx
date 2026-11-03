import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', padding: 20,
        }}>
          <div className="fade-in" style={{
            maxWidth: 480, textAlign: 'center', background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)', padding: 48, boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💥</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Algo salió mal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            <pre style={{
              padding: 12, background: 'var(--danger-light)', borderRadius: 'var(--radius)',
              fontSize: 12, color: 'var(--danger)', textAlign: 'left', marginBottom: 24,
              overflow: 'auto', maxHeight: 120,
            }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              style={{ background: 'var(--primary)', color: '#fff', padding: '12px 28px', fontSize: 14, fontWeight: 700 }}
            >
              🔄 Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
