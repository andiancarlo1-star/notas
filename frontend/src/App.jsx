import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/Toast'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import DirectorPanel from './components/DirectorPanel'
import MaestroPanel from './components/MaestroPanel'
import AlumnoPanel from './components/AlumnoPanel'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const { toasts, toast } = useToast()

  const handleLogout = () => {
    setUsuario(null)
    localStorage.removeItem('token')
    toast("Sesión cerrada", "info")
  }

  const renderPanel = () => {
    if (!usuario) return <Login onLogin={(u) => { setUsuario(u); toast(`Bienvenido, ${u.nombre}`, "success") }} />

    switch (usuario.rol) {
      case 'admin':
        return <AdminPanel usuario={usuario} onLogout={handleLogout} toast={toast} />
      case 'director':
        return <DirectorPanel usuario={usuario} onLogout={handleLogout} toast={toast} />
      case 'maestro':
        return <MaestroPanel usuario={usuario} onLogout={handleLogout} toast={toast} />
      case 'alumno':
        return <AlumnoPanel usuario={usuario} onLogout={handleLogout} toast={toast} />
      default:
        return (
          <div className="fade-in" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
            <h2>Bienvenido, {usuario.nombre}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Rol desconocido: {usuario.rol}</p>
            <button onClick={handleLogout} style={{ marginTop: 16, background: 'var(--danger)', color: '#fff' }}>Cerrar sesión</button>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} />
      {renderPanel()}
    </ErrorBoundary>
  )
}
