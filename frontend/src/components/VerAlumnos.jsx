import { useEffect, useState } from "react";
import { API_BASE, apiFetch } from "../api";

export function VerAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const data = await apiFetch("/api/grados");
        setGrados(data);
      } catch (err) {
        console.error(err);
        setMensaje("Error al cargar grados");
      }
    };
    fetchGrados();
  }, []);

  useEffect(() => {
    if (!gradoSeleccionado) { setAlumnos([]); return; }
    const fetchAlumnos = async () => {
      try {
        const data = await apiFetch(`/api/alumnos/grado/${gradoSeleccionado}`);
        setAlumnos(data);
      } catch (err) {
        console.error(err);
        setMensaje("Error al obtener alumnos");
      }
    };
    fetchAlumnos();
  }, [gradoSeleccionado]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Alumnos del Colegio</h2>
      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {grados.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="gradoSelect" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Selecciona un grado:
          </label>
          <select
            id="gradoSelect"
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #007bff",
              backgroundColor: "#f0f8ff",
              cursor: "pointer",
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
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
        {alumnos.length > 0 ? (
          alumnos.map((alumno) => (
            <div
              key={alumno.id_alumno}
              style={{
                backgroundColor: "#e7f3ff",
                padding: "15px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#007bff" }}>
                {alumno.nombres} {alumno.apellidos}
              </h3>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>ID: {alumno.id_alumno}</p>
              <p style={{ margin: "5px 0" }}>Grado: {alumno.grado_nombre}</p>
            </div>
          ))
        ) : (
          gradoSeleccionado && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#555" }}>
              No hay alumnos en este grado
            </p>
          )
        )}
      </div>
    </div>
  );
}
