import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function PerfilUsuario({ toast, onActualizado }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", correo: "" });
  const [passForm, setPassForm] = useState({ actual: "", nueva: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/perfil/me");
        setPerfil(data);
        setForm({ nombre: data.nombre, correo: data.correo });
      } catch (e) { toast?.(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      await apiFetch("/api/perfil/me", { method: "PUT", body: form });
      setSuccess("Perfil actualizado correctamente");
      toast?.("Perfil actualizado", "success");
      onActualizado?.();
    } catch (e) { toast?.(e.message, "error"); }
    finally { setSaving(false); }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (passForm.nueva.length < 6) { toast?.("La nueva contraseña debe tener al menos 6 caracteres", "warning"); return; }
    setSaving(true);
    setSuccess("");
    try {
      await apiFetch("/api/perfil/me/password", { method: "PUT", body: passForm });
      setSuccess("Contraseña actualizada correctamente");
      toast?.("Contraseña actualizada", "success");
      setPassForm({ actual: "", nueva: "" });
    } catch (e) { toast?.(e.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando perfil...</p>
    </div>
  );
  if (!perfil) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No se pudo cargar el perfil</p>;

  return (
    <div style={{ maxWidth: 540 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>👤</span> Mi Perfil
      </h2>

      {success && (
        <div className="fade-in" style={{
          padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius)', color: 'var(--success)', fontSize: 14, fontWeight: 500, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>✓ {success}</div>
      )}

      <form onSubmit={actualizarPerfil} style={{ ...cardStyle, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📋</span> Información personal
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
          <Field label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} required />
          <Field label="Correo" type="email" value={form.correo} onChange={v => setForm({ ...form, correo: v })} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Rol" value={perfil.rol} disabled />
          <Field label="Miembro desde" value={perfil.created_at ? new Date(perfil.created_at).toLocaleDateString() : '—'} disabled />
        </div>
        <button type="submit" disabled={saving} style={{
          marginTop: 20, padding: '12px 24px', background: 'var(--primary)', color: '#fff', fontWeight: 700,
        }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
      </form>

      <form onSubmit={cambiarPassword} style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span> Cambiar contraseña
        </h3>
        <Field label="Contraseña actual" type="password" value={passForm.actual} onChange={v => setPassForm({ ...passForm, actual: v })} required />
        <Field label="Nueva contraseña (mín. 6 caracteres)" type="password" value={passForm.nueva} onChange={v => setPassForm({ ...passForm, nueva: v })} required minLength={6} />
        <button type="submit" disabled={saving} style={{
          marginTop: 20, padding: '12px 24px', background: 'var(--primary)', color: '#fff', fontWeight: 700,
        }}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</button>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required, disabled, minLength }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} required={required} disabled={disabled} minLength={minLength}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        style={{
          background: disabled ? 'var(--bg)' : 'var(--bg-card)',
          opacity: disabled ? 0.7 : 1, cursor: disabled ? 'default' : 'text',
        }}
      />
    </div>
  );
}

const cardStyle = { background: 'var(--bg-card)', padding: 28, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' };
