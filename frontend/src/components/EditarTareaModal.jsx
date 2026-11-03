import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function EditarTareaModal({ open, onClose, tareaId, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  // 🔄 Cargar datos de la tarea
  useEffect(() => {
    const cargar = async () => {
      if (!open || !tareaId) return;
      setCargando(true);
      setError(null);
      try {
        const t = await apiFetch(`/api/tareas/${tareaId}`);
        setTitulo(t.titulo || "");
        setDescripcion(t.descripcion || "");
        setFechaEntrega(t.fecha_entrega || "");
      } catch (e) {
        setError(e.message || "Error al cargar tarea");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [open, tareaId]);

  // 🔄 Limpiar mensajes cuando cambia tarea o abre/cierra
  useEffect(() => {
    setMsg(null);
    setError(null);
  }, [open, tareaId]);

  // 🚪 Cerrar con tecla ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      await apiFetch(`/api/tareas/${tareaId}`, {
        method: "PUT",
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          fecha_entrega: fechaEntrega || null,
        }),
      });

      setMsg("✅ Tarea actualizada");
      onSaved?.();

      // pequeño delay para que el usuario vea el mensaje
      setTimeout(() => onClose?.(), 800);
    } catch (e) {
      setError(e.message || "Error al actualizar tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose?.();
      }}
    >
      <div style={styles.modal}>
        <h3 style={styles.title}>✏ Editar tarea</h3>

        {cargando ? (
          <p>Cargando…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Campos */}
            <div style={styles.field}>
              <label>Título *</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                disabled={loading}
                style={styles.textarea}
              />
            </div>

            <div style={styles.field}>
              <label>Fecha de entrega</label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                disabled={loading}
                style={styles.input}
              />
            </div>

            {/* Mensajes */}
            {msg && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}

            {/* Botones */}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !titulo.trim()}
                style={styles.saveBtn}
              >
                {loading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* 🎨 estilos */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    minWidth: 420,
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
  },
  title: { marginTop: 0, marginBottom: 16 },
  field: { textAlign: "left", marginBottom: 12, display: "flex", flexDirection: "column" },
  input: { width: "95%", padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  textarea: { width: "95%", padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  success: { color: "green", marginBottom: 8 },
  error: { color: "red", marginBottom: 8 },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 },
  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#e5e7eb",
    color: "#111",
    border: "none",
    borderRadius: 6,
    padding: "6px 14px",
    cursor: "pointer",
  },
};
