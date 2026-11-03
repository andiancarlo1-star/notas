import { useEffect, useState } from 'react';
import { API_BASE, apiDownload, apiFetch } from '../api';
import PerfilUsuario from './PerfilUsuario';
import BoletasAlumno from './BoletasAlumno';

const TABS = [
  { id: 'tareas', label: 'Mis Tareas', icon: '📝' },
  { id: 'boletas', label: 'Mis Boletas', icon: '📋' },
  { id: 'perfil', label: 'Mi Perfil', icon: '⚙️' },
];

export default function AlumnoPanel({ usuario, onLogout, toast }) {
  const [tareas, setTareas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tareas');

  const cargar = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([apiFetch('/api/alumnos/mi-perfil'), apiFetch('/api/entregas/mis-tareas')]);
      setPerfil(p);
      setTareas(t);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const entregar = async (id, file, comentario) => {
    const data = new FormData();
    if (file) data.append('archivo', file);
    if (comentario) data.append('comentario', comentario);
    const response = await fetch(`${API_BASE}/api/entregas/tareas/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: data
    });
    if (!response.ok) throw new Error((await response.json()).msg || 'No se pudo entregar');
    await cargar();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🎓</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Control Escolar</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Alumno</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {TABS.map(tab => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, marginBottom: 2,
                background: activeTab === tab.id ? '#d97706' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span> {tab.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              {usuario.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: '#fff' }}>{usuario.nombre}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{perfil?.grado} {perfil?.seccion}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', padding: '10px 14px', background: 'rgba(220,38,38,0.15)',
            color: '#fca5a5', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
          }}>🚪 Cerrar sesión</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: 'auto', background: 'var(--bg)' }}>
        <div className="fade-in" key={activeTab} style={{ maxWidth: 1000, margin: '0 auto' }}>
          {activeTab === 'tareas' && (
            <>
              {error && (
                <div style={{ padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: 14, marginBottom: 16 }}>
                  {error}
                </div>
              )}
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando tareas...</p>
                </div>
              ) : tareas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <p>No tienes tareas asignadas</p>
                </div>
              ) : (
                <section style={{ display: 'grid', gap: 16 }}>
                  {tareas.map(t => <Tarea key={t.id_tarea} tarea={t} onSubmit={entregar} toast={toast} />)}
                </section>
              )}
            </>
          )}
          {activeTab === 'perfil' && <PerfilUsuario toast={toast} />}
          {activeTab === 'boletas' && <BoletasAlumno toast={toast} />}
        </div>
      </main>
    </div>
  );
}

function Tarea({ tarea, onSubmit, toast }) {
  const [descargaError, setDescargaError] = useState('');
  const [file, setFile] = useState();
  const [comentario, setComentario] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    try {
      setEnviando(true);
      await onSubmit(tarea.id_tarea, file, comentario);
      setMsg('Entrega guardada');
      toast?.('Tarea entregada correctamente', 'success');
    } catch (err) { setMsg(err.message); toast?.(err.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <article className="slide-up" style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 24,
      background: 'var(--bg-card)', boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)' }}>{tarea.materia}</span>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: tarea.estado === 'ACTIVA' ? 'var(--success-light)' : 'var(--danger-light)', color: tarea.estado === 'ACTIVA' ? 'var(--success)' : 'var(--danger)' }}>{tarea.estado}</span>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>{tarea.titulo}</h3>
      <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: 14 }}>{tarea.descripcion}</p>
      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, flexWrap: 'wrap' }}>
        <span>📅 {tarea.fecha_entrega ? new Date(tarea.fecha_entrega).toLocaleDateString() : 'Sin fecha'}</span>
        <span>📊 Nota: {tarea.punteo ?? 'Pendiente'} / {tarea.puntaje_maximo}</span>
        <span>⚖️ Peso: {tarea.ponderacion ?? 10}</span>
      </div>

      {tarea.archivo_nombre && (
        <p style={{ fontSize: 13 }}>📄 Entregado: <a href="#descargar" onClick={event => { event.preventDefault(); apiDownload(tarea.archivo_url, tarea.archivo_nombre).catch(error => setDescargaError(error.message)); }}>{tarea.archivo_nombre}</a>{descargaError && <span role="alert"> {descargaError}</span>}</p>
      )}

      {tarea.estado === 'ACTIVA' && (
        <form onSubmit={enviar} style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
          <input type="file" accept=".pdf,.docx,.pptx,image/png,image/jpeg" onChange={e => setFile(e.target.files[0])} style={{ flex: 1, minWidth: 200 }} />
          <input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentario opcional"
            style={{ flex: 1, minWidth: 180 }} />
          <button disabled={enviando} style={{
            background: enviando ? 'var(--text-muted)' : 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700,
            cursor: enviando ? 'default' : 'pointer',
          }}>{enviando ? 'Enviando...' : '📤 Entregar'}</button>
        </form>
      )}

      {msg && (
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, background: msg.includes('guardada') ? 'var(--success-light)' : 'var(--danger-light)', color: msg.includes('guardada') ? 'var(--success)' : 'var(--danger)' }}>
          {msg}
        </div>
      )}
    </article>
  );
}
