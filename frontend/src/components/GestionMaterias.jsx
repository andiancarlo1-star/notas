import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Paginacion from "./Paginacion";

export default function GestionMaterias({ toast }) {
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradoFiltro, setGradoFiltro] = useState("");
  const [form, setForm] = useState({ nombre: "", grado_id: "" });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const cargar = async () => {
    try {
      setLoading(true);
      const [m, g] = await Promise.all([apiFetch("/api/materias/todas"), apiFetch("/api/materias/grados")]);
      setMaterias(Array.isArray(m) ? m : []);
      setGrados(Array.isArray(g) ? g : []);
    } catch (e) { toast?.(e.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/materias", { method: "POST", body: { ...form, grado_id: Number(form.grado_id) } });
      toast?.("Materia creada correctamente", "success");
      setForm({ nombre: "", grado_id: "" });
      setShowForm(false);
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/materias/${editando.id_materia}`, { method: "PUT", body: { ...form, grado_id: Number(form.grado_id) } });
      toast?.("Materia actualizada", "success");
      setEditando(null);
      setForm({ nombre: "", grado_id: "" });
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const eliminar = async (m) => {
    if (!window.confirm(`Eliminar materia "${m.nombre}"?`)) return;
    try {
      await apiFetch(`/api/materias/${m.id_materia}`, { method: "DELETE" });
      toast?.("Materia eliminada", "success");
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const filtrados = materias.filter(m => !gradoFiltro || String(m.grado_id) === gradoFiltro);
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>📚</span> Gestionar Materias
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={gradoFiltro} onChange={e => { setGradoFiltro(e.target.value); setPagina(1); }} style={{ padding: '10px 14px', width: 180 }}>
            <option value="">Todos los grados</option>
            {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
          </select>
          <button onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: "", grado_id: "" }); }}
            style={{ background: showForm ? 'var(--text-muted)' : 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>
            {showForm ? "✕ Cancelar" : "+ Crear Materia"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={crear} className="fade-in" style={formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Nueva materia</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="Ej. Matemáticas" />
            <div style={{ minWidth: 180 }}>
              <label style={labelStyle}>Grado</label>
              <select value={form.grado_id} onChange={e => setForm({ ...form, grado_id: e.target.value })} required>
                <option value="">Seleccionar grado</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--success)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Crear</button>
          </div>
        </form>
      )}

      {editando && (
        <form onSubmit={actualizar} className="fade-in" style={{ ...formCard, borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Editar materia</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} />
            <div style={{ minWidth: 180 }}>
              <label style={labelStyle}>Grado</label>
              <select value={form.grado_id} onChange={e => setForm({ ...form, grado_id: e.target.value })} required>
                <option value="">Seleccionar grado</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} {g.seccion}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Actualizar</button>
            <button type="button" onClick={() => { setEditando(null); setForm({ nombre: "", grado_id: "" }); }} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '10px 20px', border: '1.5px solid var(--border)', fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={th}>Materia</th>
                <th style={th}>Grado</th>
                <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map(m => (
                <tr key={m.id_materia} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📘</div>
                      <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                    </div>
                  </td>
                  <td style={td}>{m.grado_nombre} {m.seccion}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button onClick={() => { setEditando(m); setForm({ nombre: m.nombre, grado_id: m.grado_id }); setShowForm(false); }}
                      style={{ ...btnSm, background: 'var(--primary-light)', color: 'var(--primary)' }}>✏️ Editar</button>
                    <button onClick={() => eliminar(m)}
                      style={{ ...btnSm, background: 'var(--danger-light)', color: 'var(--danger)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {paginados.length === 0 && <tr><td colSpan={3} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay materias registradas</td></tr>}
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
