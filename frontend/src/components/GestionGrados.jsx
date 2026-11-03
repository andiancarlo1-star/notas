import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Paginacion from "./Paginacion";

export default function GestionGrados({ toast }) {
  const [grados, setGrados] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", seccion: "", maestro_guia_id: "" });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, m] = await Promise.all([apiFetch("/api/grados"), apiFetch("/api/usuarios?rol=maestro")]);
      setGrados(Array.isArray(g) ? g : []);
      setMaestros(Array.isArray(m) ? m : []);
    } catch (e) { toast?.(e.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/grados", { method: "POST", body: { ...form, maestro_guia_id: form.maestro_guia_id ? Number(form.maestro_guia_id) : null } });
      toast?.("Grado creado correctamente", "success");
      setForm({ nombre: "", seccion: "", maestro_guia_id: "" });
      setShowForm(false);
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/grados/${editando.id_grado}`, { method: "PUT", body: { ...form, maestro_guia_id: form.maestro_guia_id ? Number(form.maestro_guia_id) : null } });
      toast?.("Grado actualizado", "success");
      setEditando(null);
      setForm({ nombre: "", seccion: "", maestro_guia_id: "" });
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const eliminar = async (g) => {
    if (!window.confirm(`Eliminar grado "${g.nombre} - ${g.seccion}"?`)) return;
    try {
      await apiFetch(`/api/grados/${g.id_grado}`, { method: "DELETE" });
      toast?.("Grado eliminado", "success");
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const totalPaginas = Math.ceil(grados.length / porPagina);
  const paginados = grados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🏫</span> Gestionar Grados
        </h2>
        <button onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: "", seccion: "", maestro_guia_id: "" }); }}
          style={{ background: showForm ? 'var(--text-muted)' : 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>
          {showForm ? "✕ Cancelar" : "+ Crear Grado"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={crear} className="fade-in" style={formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Nuevo grado</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="Ej. Primero" />
            <InputField label="Sección" value={form.seccion} onChange={v => setForm({ ...form, seccion: v })} placeholder="Ej. A" />
            <div style={{ minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Maestro Guía (opcional)</label>
              <select value={form.maestro_guia_id} onChange={e => setForm({ ...form, maestro_guia_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {maestros.map(m => <option key={m.id_usuario} value={m.id_usuario}>{m.nombre}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--success)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Crear</button>
          </div>
        </form>
      )}

      {editando && (
        <form onSubmit={actualizar} className="fade-in" style={{ ...formCard, borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Editar grado</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} />
            <InputField label="Sección" value={form.seccion} onChange={v => setForm({ ...form, seccion: v })} />
            <div style={{ minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Maestro Guía</label>
              <select value={form.maestro_guia_id} onChange={e => setForm({ ...form, maestro_guia_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {maestros.map(m => <option key={m.id_usuario} value={m.id_usuario}>{m.nombre}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Actualizar</button>
            <button type="button" onClick={() => { setEditando(null); setForm({ nombre: "", seccion: "", maestro_guia_id: "" }); }} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '10px 20px', border: '1.5px solid var(--border)', fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={th}>Grado</th>
                <th style={th}>Sección</th>
                <th style={th}>Maestro Guía</th>
                <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map(g => (
                <tr key={g.id_grado} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>{g.nombre}</td>
                  <td style={td}>{g.seccion}</td>
                  <td style={td}>{g.guia_nombre || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button onClick={() => { setEditando(g); setForm({ nombre: g.nombre, seccion: g.seccion, maestro_guia_id: g.maestro_guia_id || "" }); setShowForm(false); }}
                      style={{ ...btnSm, background: 'var(--primary-light)', color: 'var(--primary)' }}>✏️ Editar</button>
                    <button onClick={() => eliminar(g)}
                      style={{ ...btnSm, background: 'var(--danger-light)', color: 'var(--danger)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {paginados.length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay grados registrados</td></tr>}
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

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ minWidth: 160 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{label}</label>
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
