import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import AgregarTareaModal from "./AgregarTareaModal";
import VerTareasModal from "./VerTareasModal";

export default function MateriasAsignadas() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCrear, setOpenCrear] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await apiFetch("/api/materias/asignadas/mias");
        if (!cancel) setMaterias(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancel) setError(e.message || "Error al cargar materias");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const abrirCrear = (m) => {
    setMateriaSeleccionada(m);
    setOpenCrear(true);
  };

  const abrirVer = (m) => {
    setMateriaSeleccionada(m);
    setOpenVer(true);
  };

  if (loading) return <p>Cargando materias...</p>;
  if (error) return <p>Error: {error}</p>;
  if (materias.length === 0) return <p>No tienes materias asignadas.</p>;

  return (
    <>
      {/* Tabla mejorada */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>📘 Materia</th>
              <th style={styles.th}>🎓 Grado</th>
              <th style={styles.th}>🏫 Sección</th>
              <th style={{ ...styles.th, textAlign: "center" }}>⚙ Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m, index) => (
              <tr
                key={m.materia_id}
                style={index % 2 ? styles.rowAlt : styles.row}
              >
                <td style={styles.td}>{m.materia_nombre}</td>
                <td style={styles.td}>{m.grado}</td>
                <td style={styles.td}>{m.seccion}</td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button
                    style={{ ...styles.button, ...styles.viewBtn }}
                    onClick={() => abrirVer(m)}
                  >
                    📄 Ver tareas
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.addBtn }}
                    onClick={() => abrirCrear(m)}
                  >
                    ➕ Agregar tarea
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <AgregarTareaModal
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        materia={materiaSeleccionada}
      />
      <VerTareasModal
        open={openVer}
        onClose={() => setOpenVer(false)}
        materia={materiaSeleccionada}
      />
    </>
  );
}

// 🎨 Estilos
const styles = {
  tableWrapper: {
    marginTop: "20px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif",
  },
  th: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "14px",
    fontSize: "15px",
    textAlign: "left",
  },
  row: {
    backgroundColor: "#fff",
  },
  rowAlt: {
    backgroundColor: "#f8f9fa",
  },
  td: {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#333",
  },
  button: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "8px",
    transition: "all 0.2s",
  },
  viewBtn: {
    backgroundColor: "#17a2b8",
    color: "#fff",
  },
  addBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
};
