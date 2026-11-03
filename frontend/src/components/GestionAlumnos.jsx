import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Paginacion from "./Paginacion";

export default function GestionAlumnos({ toast }) {
  const [alumnos, setAlumnos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradoFiltro, setGradoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ nombres: "", apellidos: "", grado_id: "", usuario_id: "" });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const cargar = async () => {
    try {
      setLoading(true);
      const [a, g] = await Promise.all([apiFetch("/api/alumnos"), apiFetch("/api/grados")]);
      setAlumnos(Array.isArray(a) ? a : []);
      setGrados(Array.isArray(g) ? g : []);
    } catch (e) { toast?.(e.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/alumnos", { method: "POST", body: { ...form, grado_id: Number(form.grado_id), usuario_id: form.usuario_id ? Number(form.usuario_id) : undefined } });
      toast?.("Alumno creado correctamente", "success");
      setForm({ nombres: "", apellidos: "", grado_id: "", usuario_id: "" });
      setShowForm(false);
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/alumnos/${editando.id_alumno}`, { method: "PUT", body: { ...form, grado_id: Number(form.grado_id) } });
      toast?.("Alumno actualizado", "success");
      setEditando(null);
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const eliminar = async (a) => {
    if (!window.confirm(`Eliminar alumno "${a.nombres} ${a.apellidos}"?`)) return;
    try {
      await apiFetch(`/api/alumnos/${a.id_alumno}`, { method: "DELETE" });
      toast?.("Alumno eliminado", "success");
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const filtrados = alumnos.filter(a => {
    const matchGrado = !gradoFiltro || String(a.grado_id) === gradoFiltro;
    const matchBusq = !busqueda || `${a.nombres} ${a.apellidos}`.toLowerCase().includes(busqueda.toLowerCase());
    return matchGrado && matchBusq;
  });
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span> Gestionar Alumnos
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={gradoFiltro} onChange={e => { setGradoFiltro(e.target.value); setPagina(1); }}
            style={{ padding: '10px 14px', width: 180 }}>
            <option value="">Todos los grados</option>
            {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
          </select>
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="🔍 Buscar..." style={{ width: 200, padding: '10px 14px' }} />
          <button onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombres: "", apellidos: "", grado_id: "", usuario_id: "" }); }}
            style={{ background: showForm ? 'var(--text-muted)' : 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>
            {showForm ? "✕ Cancelar" : "+ Crear Alumno"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={crear} className="fade-in" style={formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Nuevo alumno</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombres" value={form.nombres} onChange={v => setForm({ ...form, nombres: v })} placeholder="Ej. Juan Carlos" />
            <InputField label="Apellidos" value={form.apellidos} onChange={v => setForm({ ...form, apellidos: v })} placeholder="Ej. Pérez López" />
            <div style={{ minWidth: 180 }}>
              <label style={labelStyle}>Grado</label>
              <select value={form.grado_id} onChange={e => setForm({ ...form, grado_id: e.target.value })} required>
                <option value="">Seleccionar grado</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
              </select>
            </div>
            <InputField label="ID Usuario (opcional)" value={form.usuario_id} onChange={v => setForm({ ...form, usuario_id: v })} placeholder="Vincular cuenta" />
            <button type="submit" style={{ background: 'var(--success)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Crear</button>
          </div>
        </form>
      )}

      {editando && (
        <form onSubmit={actualizar} className="fade-in" style={{ ...formCard, borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Editar alumno</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombres" value={form.nombres} onChange={v => setForm({ ...form, nombres: v })} />
            <InputField label="Apellidos" value={form.apellidos} onChange={v => setForm({ ...form, apellidos: v })} />
            <div style={{ minWidth: 180 }}>
              <label style={labelStyle}>Grado</label>
              <select value={form.grado_id} onChange={e => setForm({ ...form, grado_id: e.target.value })} required>
                <option value="">Seleccionar grado</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Actualizar</button>
            <button type="button" onClick={() => { setEditando(null); }} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '10px 20px', border: '1.5px solid var(--border)', fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={th}>Alumno</th>
                <th style={th}>Grado</th>
                <th style={th}>Sección</th>
                <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map(a => (
                <tr key={a.id_alumno} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                        {a.nombres?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.nombres} {a.apellidos}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{a.grado_nombre || '—'}</td>
                  <td style={td}>{a.seccion || '—'}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button onClick={() => { setEditando(a); setForm({ nombres: a.nombres, apellidos: a.apellidos, grado_id: a.grado_id, usuario_id: a.usuario_id || "" }); setShowForm(false); }}
                      style={{ ...btnSm, background: 'var(--primary-light)', color: 'var(--primary)' }}>✏️ Editar</button>
                    <button onClick={() => eliminar(a)}
                      style={{ ...btnSm, background: 'var(--danger-light)', color: 'var(--danger)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {paginados.length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay alumnos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambio={setPagina} />
    </div>
  );
}

const formCard = { padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1.5px solid var(--border)', marginBottom: 20 };
const th = { padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '2px solid var(--border)' };
const td = { padding: '12px 16px', fontSize: 14 };
const btnSm = { padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', marginRight: 6 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 };

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ minWidth: 180 }}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando...</p>
    </div>
  );
}
