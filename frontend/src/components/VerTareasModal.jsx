import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import AgregarTareaModal from "./AgregarTareaModal";
import EditarTareaModal from "./EditarTareaModal";
import CalificarTareaModal from "./CalificarTareaModal";

export default function VerTareasModal({ open, onClose, materia }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCrear, setOpenCrear] = useState(false);
  const [editId, setEditId] = useState(null);
  const [calificarTarea, setCalificarTarea] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(`/api/tareas/por-materia/${materia.materia_id}`);
      setTareas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && materia) cargar();
  }, [open, materia?.materia_id]);

  if (!open || !materia) return null;

  const toggleEstado = async (tarea) => {
    const nuevo = tarea.estado === "ACTIVA" ? "CERRADA" : "ACTIVA";
    try {
      await apiFetch(`/api/tareas/${tarea.id_tarea}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevo }),
      });
      await cargar();
    } catch (e) {
      alert(e.message || "Error al cambiar estado");
    }
  };

  const eliminar = async (tarea) => {
    if (!confirm(`¿Eliminar la tarea "${tarea.titulo}"?`)) return;
    try {
      await apiFetch(`/api/tareas/${tarea.id_tarea}`, { method: "DELETE" });
      await cargar();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            📘 Tareas – {materia.materia_nombre} ({materia.grado} {materia.seccion})
          </h2>
          <div style={styles.actions}>
            <button style={styles.secondaryBtn} onClick={cargar} disabled={loading}>
              🔄 Refrescar
            </button>
            <button style={styles.primaryBtn} onClick={() => setOpenCrear(true)}>
              ➕ Agregar tarea
            </button>
            <button style={styles.dangerBtn} onClick={onClose}>
              ✖ Cerrar
            </button>
          </div>
        </div>

        {/* content */}
        <div style={{ marginTop: 16 }}>
          {loading && <p style={{ margin: 12 }}>Cargando…</p>}
          {error && <p style={{ color: "red", margin: 12 }}>⚠ Error: {error}</p>}
          {!loading && !error && (tareas.length === 0 ? (
            <p style={{ margin: 12 }}>No hay tareas registradas.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Puntaje</th>
                  <th style={styles.th}>Peso</th>
                  <th style={styles.th}>Entrega</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((t, i) => (
                  <tr key={t.id_tarea} style={i % 2 ? styles.rowAlt : {}}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{t.titulo}</div>
                      {t.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{t.descripcion}</div>}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>{t.puntaje_maximo ?? 10}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>{t.ponderacion ?? 10}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>{t.fecha_entrega || "—"}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: t.estado === "ACTIVA" ? "#e1f7d5" : "#ffe0e0",
                        color: t.estado === "ACTIVA" ? "#228B22" : "#B22222",
                        fontWeight: "bold"
                      }}>{t.estado}</span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button style={styles.primaryBtn} onClick={() => setCalificarTarea(t)}>📝 Calificar</button>
                        <button style={styles.secondaryBtn} onClick={() => setEditId(t.id_tarea)}>✏ Editar</button>
                        <button style={styles.secondaryBtn} onClick={() => toggleEstado(t)}>
                          {t.estado === "ACTIVA" ? "Cerrar" : "Reabrir"}
                        </button>
                        <button style={styles.dangerBtn} onClick={() => eliminar(t)}>🗑 Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>

        {/* modals */}
        <AgregarTareaModal open={openCrear} onClose={() => setOpenCrear(false)} materia={materia} onCreated={cargar} />
        <EditarTareaModal open={!!editId} onClose={() => setEditId(null)} tareaId={editId} onSaved={cargar} />
        {calificarTarea && <CalificarTareaModal tarea={calificarTarea} onClose={() => setCalificarTarea(null)} />}
      </div>
    </div>
  );
}

/* estilos */
const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal: { background: "#fff", padding: 24, borderRadius: 12, minWidth: 720, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 12 },
  title: { margin: 0, fontSize: 20, color: "#333" },
  actions: { display: "flex", gap: 14 },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" },
  secondaryBtn: { background: "#e5e7eb", color: "#111", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" },
  dangerBtn: { background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" },
  table: { borderCollapse: "collapse", width: "100%", marginTop: 12, fontSize: 14 },
  th: { background: "#f3f4f6", textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #e5e7eb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #e5e7eb", verticalAlign: "top" },
  rowAlt: { background: "#f9fafb" },
  actionGroup: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  inputNota: { width: "70px", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6, textAlign: "center" },
};
