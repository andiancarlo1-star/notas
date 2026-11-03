import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Paginacion from "./Paginacion";

export default function GestionUsuarios({ rol, toast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ nombre: "", correo: "", contrasena: "" });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const cargar = async () => {
    try {
      setLoading(true);
      const params = rol ? `?rol=${rol}` : "";
      const data = await apiFetch(`/api/usuarios${params}`);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) { toast?.(e.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [rol]);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/usuarios", { method: "POST", body: { ...form, rol } });
      toast?.(`${rol === 'director' ? 'Director' : 'Maestro'} creado correctamente`, "success");
      setForm({ nombre: "", correo: "", contrasena: "" });
      setShowForm(false);
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/usuarios/${editando.id_usuario}`, { method: "PUT", body: form });
      toast?.("Usuario actualizado", "success");
      setEditando(null);
      setForm({ nombre: "", correo: "", contrasena: "" });
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const eliminar = async (u) => {
    if (!window.confirm(`Eliminar usuario "${u.nombre}"?`)) return;
    try {
      await apiFetch(`/api/usuarios/${u.id_usuario}`, { method: "DELETE" });
      toast?.("Usuario eliminado", "success");
      await cargar();
    } catch (e) { toast?.(e.message, "error"); }
  };

  const filtrados = usuarios.filter(u => !busqueda || u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || u.correo?.toLowerCase().includes(busqueda.toLowerCase()));
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
  const titulo = rol === "director" ? "Directores" : "Maestros";

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{rol === 'director' ? '👤' : '👨‍🏫'}</span> {titulo}
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="🔍 Buscar..." style={{ width: 220, padding: '10px 14px' }} />
          <button onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: "", correo: "", contrasena: "" }); }}
            style={{ background: showForm ? 'var(--text-muted)' : 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>
            {showForm ? "✕ Cancelar" : `+ Crear ${rol === 'director' ? 'Director' : 'Maestro'}`}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={crear} className="fade-in" style={formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Nuevo {rol === 'director' ? 'director' : 'maestro'}</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre completo" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="Ej. Juan Pérez" />
            <InputField label="Correo" type="email" value={form.correo} onChange={v => setForm({ ...form, correo: v })} placeholder="correo@ejemplo.com" />
            <InputField label="Contraseña" type="password" value={form.contrasena} onChange={v => setForm({ ...form, contrasena: v })} placeholder="Mín. 6 caracteres" />
            <button type="submit" style={{ background: 'var(--success)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Crear</button>
          </div>
        </form>
      )}

      {editando && (
        <form onSubmit={actualizar} className="fade-in" style={{ ...formCard, borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Editar usuario</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} />
            <InputField label="Correo" type="email" value={form.correo} onChange={v => setForm({ ...form, correo: v })} />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Contraseña (dejar vacío para no cambiar)</label>
              <input type="password" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} placeholder="Nueva contraseña" />
            </div>
            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}>Actualizar</button>
            <button type="button" onClick={() => { setEditando(null); setForm({ nombre: "", correo: "", contrasena: "" }); }} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '10px 20px', border: '1.5px solid var(--border)', fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={th}>Nombre</th>
                <th style={th}>Correo</th>
                <th style={th}>Rol</th>
                <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map(u => (
                <tr key={u.id_usuario} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                        {u.nombre?.charAt(0)?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={td}>{u.correo}</td>
                  <td style={td}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>{u.rol}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button onClick={() => { setEditando(u); setForm({ nombre: u.nombre, correo: u.correo, contrasena: "" }); setShowForm(false); }}
                      style={{ ...btnSm, background: 'var(--primary-light)', color: 'var(--primary)' }}>✏️ Editar</button>
                    <button onClick={() => eliminar(u)}
                      style={{ ...btnSm, background: 'var(--danger-light)', color: 'var(--danger)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {paginados.length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay {titulo.toLowerCase()} registrados</td></tr>}
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

function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ minWidth: 180 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />
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
