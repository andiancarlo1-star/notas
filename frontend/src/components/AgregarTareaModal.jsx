import { useState, useEffect } from "react";
import { API_BASE, apiFetch } from '../api';

export default function AgregarTareaModal({ open, onClose, materia, onCreated }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [bimestreId, setBimestreId] = useState("");
  const [puntajeMaximo, setPuntajeMaximo] = useState(10);
  const [ponderacion, setPonderacion] = useState(10);
  const [bimestres, setBimestres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      apiFetch("/api/academico/bimestres")
        .then(data => setBimestres(Array.isArray(data) ? data.filter(b => b.estado === 'ABIERTO') : []))
        .catch(() => setBimestres([]));
    }
  }, [open]);

  if (!open || !materia) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const body = {
        materia_id: materia.materia_id,
        titulo,
        descripcion: descripcion || null,
        fecha_entrega: fechaEntrega || null,
        bimestre_id: bimestreId ? Number(bimestreId) : null,
        puntaje_maximo: Number(puntajeMaximo) || 10,
        ponderacion: Number(ponderacion) || 10,
      };
      const res = await fetch(`${API_BASE}/api/tareas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al crear tarea");

      setMsg("Tarea creada y asignada a los alumnos del grado");
      onCreated?.();

      setTitulo("");
      setDescripcion("");
      setFechaEntrega("");
      setBimestreId("");
      setPuntajeMaximo(10);
      setPonderacion(10);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Nueva tarea - {materia.materia_nombre}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Titulo *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={styles.input}
              placeholder="Ej. Guia de ejercicios 1"
            />
          </div>

          <div>
            <label style={styles.label}>Descripcion</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              style={styles.textarea}
              placeholder="Instrucciones, recursos, criterios..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={styles.label}>Fecha de entrega</label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={styles.label}>Bimestre</label>
              <select
                value={bimestreId}
                onChange={(e) => setBimestreId(e.target.value)}
                style={styles.input}
              >
                <option value="">Sin bimestre</option>
                {bimestres.map(b => (
                  <option key={b.id_bimestre} value={b.id_bimestre}>{b.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={styles.label}>Puntaje maximo</label>
              <input
                type="number"
                min="1"
                value={puntajeMaximo}
                onChange={(e) => setPuntajeMaximo(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={styles.label}>Ponderacion (peso)</label>
              <input
                type="number"
                min="1"
                value={ponderacion}
                onChange={(e) => setPonderacion(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {msg && <div style={styles.success}>{msg}</div>}
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading} style={styles.secondaryBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? "Guardando..." : "Guardar tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    background: "#fff",
    borderRadius: 14,
    padding: "32px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    animation: "fadeIn 0.25s ease",
    fontFamily: "system-ui, sans-serif",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  title: { margin: 0, marginBottom: 22, fontSize: 20, fontWeight: 700, color: "#1f2937" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  label: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" },
  input: { width: "100%", padding: "10px 8px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 80, padding: "10px 8px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" },
  actions: { marginTop: 16, display: "flex", justifyContent: "flex-end", gap: "14px" },
  secondaryBtn: { padding: "10px 20px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" },
  primaryBtn: { padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  success: { fontSize: 14, color: "#16a34a", fontWeight: 500 },
  error: { fontSize: 14, color: "#dc2626", fontWeight: 500 },
};
