import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export function VerMaterias() {
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/materias/grados`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((data) => setGrados(data))
      .catch(() => setMensaje("❌ Error cargando grados"));
  }, []);

  const cargarMaterias = (gradoId) => {
    setGradoSeleccionado(gradoId);
    fetch(`${API_BASE}/api/materias/por-grado/${gradoId}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch(() => setMensaje("❌ Error cargando materias"));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#007bff" }}>📚 Materias por Grado</h2>

      {mensaje && (
        <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>{mensaje}</p>
      )}

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <select
          value={gradoSeleccionado}
          onChange={(e) => cargarMaterias(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "80%",
            fontSize: "16px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <option value="">-- Selecciona un grado --</option>
          {grados.map((g) => (
            <option key={g.id_grado} value={g.id_grado}>
              {g.nombre} {g.seccion}
            </option>
          ))}
        </select>
      </div>

      {materias.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {materias.map((m) => (
            <div
              key={m.id_materia}
              style={{
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "#e9f5ff",
                textAlign: "center",
                fontWeight: "bold",
                color: "#007bff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {m.nombre}
            </div>
          ))}
        </div>
      )}

      {gradoSeleccionado && materias.length === 0 && (
        <p style={{ textAlign: "center", color: "#555" }}>No hay materias asignadas a este grado.</p>
      )}
    </div>
  );
}
