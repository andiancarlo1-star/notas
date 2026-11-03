import { useState } from 'react'
import { API_BASE } from '../api'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      })
      const data = await res.json()

      if (res.ok) {
        onLogin(data.usuario)
        localStorage.setItem('token', data.token)
      } else {
        setMensaje(data.msg || 'Error en login')
      }
    } catch {
      setMensaje('Error de conexión con el backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
      padding: 20,
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        padding: '48px 40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}>📚</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Control Escolar</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Correo electrónico</label>
            <input
              type="email"
              placeholder="admin@demo.local"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={{ padding: '12px 14px' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              style={{ padding: '12px 14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: loading ? 'var(--primary-hover)' : 'var(--primary)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 'var(--radius)',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Iniciando sesión...
              </span>
            ) : 'Iniciar sesión'}
          </button>
        </form>

        {mensaje && (
          <div className="fade-in" style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'var(--danger-light)',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius)',
            color: 'var(--danger)',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
          }}>
            {mensaje}
          </div>
        )}

        <div style={{ marginTop: 28, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Cuentas demo (contraseña: Demo2026!)</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>admin@demo.local</span> → Administrador<br/>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>maestro@demo.local</span> → Maestro<br/>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>alumno@demo.local</span> → Alumno
          </p>
        </div>
      </div>
    </div>
  )
}
