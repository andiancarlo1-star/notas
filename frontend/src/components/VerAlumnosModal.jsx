import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function VerAlumnosModal({ open, onClose, grado }) {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      if (!open || !grado) return;
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(
          `/api/maestros/grados/${grado.id_grado}/alumnos-tareas`
        );

        const alumnosMap = {};
        data.forEach(a => {
          if (!alumnosMap[a.id_alumno]) {
            alumnosMap[a.id_alumno] = {
              id_alumno: a.id_alumno,
              alumno_nombre: a.alumno_nombre,
              tareas: []
            };
          }
          if (a.id_tarea) {
            alumnosMap[a.id_alumno].tareas.push({
              id_tarea: a.id_tarea,
              tarea_titulo: a.tarea_titulo,
              fecha_entrega: a.fecha_entrega,
              estado_tarea: a.estado_tarea,
              nota: a.nota || "",
              guardada: !!a.nota
            });
          }
        });

        setAlumnos(Object.values(alumnosMap));
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al cargar alumnos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [open, grado?.id_grado]);

  if (!open || !grado) return null;

  const lista = alumnos.filter(a =>
    a.alumno_nombre.toLowerCase().includes(q.toLowerCase())
  );

  const actualizarNota = (alumnoId, tareaId, value) => {
    setAlumnos(prev =>
      prev.map(a => {
        if (a.id_alumno !== alumnoId) return a;
        return {
          ...a,
          tareas: a.tareas.map(t => {
            if (t.id_tarea !== tareaId) return t;
            return { ...t, nota: value, guardada: false };
          })
        };
      })
    );
  };

  const guardarNota = async (alumnoId, tareaId, nota) => {
    try {
      await apiFetch(`/api/maestros/tareas/${tareaId}/nota`, {
        method: "PUT",
        body: { alumnoId, nota: parseFloat(nota) || 0 }
      });

      setAlumnos(prev =>
        prev.map(a => {
          if (a.id_alumno !== alumnoId) return a;
          return {
            ...a,
            tareas: a.tareas.map(t => {
              if (t.id_tarea !== tareaId) return t;
              return { ...t, nota: parseFloat(nota) || 0, guardada: true };
            })
          };
        })
      );
    } catch (err) {
      console.error("Error al guardar nota:", err);
      alert("Error al guardar la nota. Revisa la consola.");
    }
  };

  return (
    <div className="modal-backdrop" style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div className="modal" style={{
        background: "#fff", borderRadius: 8, width: "80%", maxWidth: 1000,
        maxHeight: "90%", display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div className="modal__header" style={{
          padding: 16, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h3 style={{ margin: 0 }}>Alumnos — {grado.grado} {grado.seccion}</h3>
          <button className="btn btn--ghost" onClick={onClose} style={{
            fontSize: 20, border: "none", background: "none", cursor: "pointer"
          }}>✖</button>
        </div>

        <div className="modal__body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Panel lateral de alumnos */}
          <div style={{ width: 220, borderRight: "1px solid #ddd", padding: 12, overflowY: "auto" }}>
            <input
              className="input"
              placeholder="Buscar…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ width: "100%", padding: 6, marginBottom: 12, borderRadius: 4, border: "1px solid #ccc" }}
            />
            {loading && <p>Cargando...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {!loading && lista.map(alumno => (
              <button
                key={alumno.id_alumno}
                onClick={() => setAlumnoSeleccionado(
                  alumnoSeleccionado?.id_alumno === alumno.id_alumno ? null : alumno
                )}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  marginBottom: 6,
                  textAlign: "left",
                  borderRadius: 4,
                  border: alumnoSeleccionado?.id_alumno === alumno.id_alumno ? "2px solid #007bff" : "1px solid #ccc",
                  background: alumnoSeleccionado?.id_alumno === alumno.id_alumno ? "#e6f0ff" : "#fff",
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                {alumno.alumno_nombre}
              </button>
            ))}
          </div>

          {/* Panel de tareas */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
            {!alumnoSeleccionado && <p>Seleccione un alumno para ver sus tareas.</p>}
            {alumnoSeleccionado && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #ddd" }}>Tarea</th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #ddd" }}>Fecha entrega</th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #ddd" }}>Estado</th>
                    <th style={{ textAlign: "center", padding: 8, borderBottom: "2px solid #ddd" }}>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnoSeleccionado.tareas.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", color: "#555", padding: 12 }}>
                        Sin tareas
                      </td>
                    </tr>
                  )}
                  {alumnoSeleccionado.tareas.map(t => (
                    <tr key={t.id_tarea} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{t.tarea_titulo}</td>
                      <td style={{ padding: 8 }}>{t.fecha_entrega || "-"}</td>
                      <td style={{ padding: 8, color: t.estado_tarea === "ASIGNADO" ? "green" : "orange" }}>{t.estado_tarea}</td>
                      <td style={{ padding: 8, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          <input
                            type="number"
                            value={t.nota || ""}
                            disabled={t.guardada}
                            onChange={e => actualizarNota(alumnoSeleccionado.id_alumno, t.id_tarea, e.target.value)}
                            style={{
                              width: 60, padding: 4, textAlign: "center",
                              borderRadius: 4, border: "1px solid #ccc"
                            }}
                          />
                          {t.guardada ? (
                            <button
                              onClick={() => {
                                setAlumnos(prev => prev.map(a => {
                                  if (a.id_alumno !== alumnoSeleccionado.id_alumno) return a;
                                  return { ...a, tareas: a.tareas.map(x => x.id_tarea !== t.id_tarea ? x : { ...x, guardada: false }) };
                                }));
                              }}
                              style={{
                                padding: "4px 8px", border: "none", borderRadius: 4,
                                background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 12
                              }}
                            >
                              ✏️
                            </button>
                          ) : (
                            <button
                              onClick={() => guardarNota(alumnoSeleccionado.id_alumno, t.id_tarea, t.nota)}
                              style={{
                                padding: "4px 8px", border: "none", borderRadius: 4,
                                background: "#007bff", color: "#fff", cursor: "pointer"
                              }}
                            >
                              💾
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal__footer" style={{ padding: 12, borderTop: "1px solid #ddd", textAlign: "right" }}>
          <button onClick={onClose} style={{
            padding: "6px 16px", borderRadius: 4, border: "none", background: "#555", color: "#fff", cursor: "pointer"
          }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
