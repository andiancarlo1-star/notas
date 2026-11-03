import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function GestionBimestres({ toast }) {
  const [ciclos, setCiclos] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const [c, b] = await Promise.all([apiFetch('/api/academico/ciclos'), apiFetch('/api/academico/bimestres')]);
      setCiclos(Array.isArray(c) ? c : []);
      setBimestres(Array.isArray(b) ? b : []);
    } catch (e) { setError(e.message); toast?.(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const crearCiclo = async (e) => {
    e.preventDefault(); setError('');
    try {
      await apiFetch('/api/academico/ciclos', { method: 'POST', body: Object.fromEntries(new FormData(e.currentTarget)) });
      e.currentTarget.reset();
      toast?.('Ciclo creado correctamente', 'success');
      await cargar();
    } catch (err) { const msg = parseError(err.message); setError(msg); toast?.(msg, 'error'); }
  };

  const crearBimestre = async (e) => {
    e.preventDefault(); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await apiFetch('/api/academico/bimestres', { method: 'POST', body: { ...f, ciclo_id: Number(f.ciclo_id), numero: Number(f.numero) } });
      e.currentTarget.reset();
      toast?.('Bimestre creado correctamente', 'success');
      await cargar();
    } catch (err) { const msg = parseError(err.message); setError(msg); toast?.(msg, 'error'); }
  };

  const cerrar = async (id) => {
    if (!window.confirm('¿Cerrar el bimestre? Se consolidarán las notas y se bloquearán sus tareas.')) return;
    setError('');
    try {
      await apiFetch(`/api/academico/bimestres/${id}/cerrar`, { method: 'POST' });
      toast?.('Bimestre cerrado correctamente', 'success');
      await cargar();
    } catch (err) { const msg = parseError(err.message); setError(msg); toast?.(msg, 'error'); }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>📅</span> Ciclos y Bimestres
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '-16px 0 20px' }}>El cierre genera el consolidado necesario para las tarjetas de calificaciones.</p>

      {error && (
        <div className="fade-in" style={{
          padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #fca5a5',
          borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: 14, fontWeight: 500, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <form onSubmit={crearCiclo} className="slide-up" style={formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🔄 Nuevo ciclo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={labelStyle}>Nombre</label><input name="nombre" required placeholder="Ej. Ciclo 2026" /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Inicio</label><input name="fecha_inicio" type="date" required /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Fin</label><input name="fecha_fin" type="date" required /></div>
            </div>
            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700, padding: '12px 20px' }}>Crear ciclo</button>
          </div>
        </form>

        <form onSubmit={crearBimestre} className="slide-up" style={{ ...formCard, animationDelay: '100ms' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📆 Nuevo bimestre</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ciclo</label>
                <select name="ciclo_id" required>
                  <option value="">Seleccionar ciclo</option>
                  {ciclos.map(c => <option key={c.id_ciclo} value={c.id_ciclo}>{c.nombre}</option>)}
                </select>
              </div>
              <div style={{ width: 100 }}>
                <label style={labelStyle}>Número</label>
                <select name="numero" required>
                  <option value="">Nº</option>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}º</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Nombre</label><input name="nombre" required placeholder="Ej. Primer bimestre" /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Inicio</label><input name="fecha_inicio" type="date" required /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Fin</label><input name="fecha_fin" type="date" required /></div>
            </div>
            <button type="submit" style={{ background: 'var(--success)', color: '#fff', fontWeight: 700, padding: '12px 20px' }}>Crear bimestre</button>
          </div>
        </form>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={th}>Periodo</th>
                <th style={th}>Ciclo</th>
                <th style={th}>Fechas</th>
                <th style={th}>Estado</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {bimestres.map(b => (
                <tr key={b.id_bimestre} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}><span style={{ fontWeight: 600 }}>{b.nombre}</span></td>
                  <td style={td}>{b.ciclo}</td>
                  <td style={td}>{b.fecha_inicio?.slice(0, 10)} — {b.fecha_fin?.slice(0, 10)}</td>
                  <td style={td}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: b.estado === 'ABIERTO' ? 'var(--success-light)' : 'var(--danger-light)',
                      color: b.estado === 'ABIERTO' ? 'var(--success)' : 'var(--danger)',
                    }}>{b.estado}</span>
                  </td>
                  <td style={td}>
                    {b.estado === 'ABIERTO' && (
                      <button onClick={() => cerrar(b.id_bimestre)}
                        style={{ padding: '6px 14px', background: 'var(--danger)', color: '#fff', fontSize: 12, fontWeight: 700 }}>🔒 Cerrar</button>
                    )}
                  </td>
                </tr>
              ))}
              {bimestres.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay bimestres creados</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function parseError(msg) { try { return JSON.parse(msg).msg || msg; } catch { return msg; } }

const formCard = { padding: 24, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' };
const th = { padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '2px solid var(--border)' };
const td = { padding: '12px 16px', fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 };

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando...</p>
    </div>
  );
}
