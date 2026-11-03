import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function VerAlumnosPorGrado() {
  const [grados, setGrados] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar todos los grados al inicio
  useEffect(() => {
    const cargarGrados = async () => {
      try {
        const data = await apiFetch("/api/grados");
        setGrados(data);
      } catch (err) {
        console.error("Error cargando grados:", err);
        setError("No se pudieron cargar los grados.");
      }
    };
    cargarGrados();
  }, []);

  // Cargar alumnos de un grado específico
  const verAlumnos = async (id_grado) => {
    if (!id_grado) {
      setAlumnos([]);
      return;
    }
    setLoading(true);
    setError("");
    setAlumnos([]);
    setGradoSeleccionado(id_grado);
    try {
      const data = await apiFetch(`/api/alumnos/grado/${id_grado}`);
      if (data.length === 0) setError("No hay alumnos en este grado.");
      setAlumnos(data);
    } catch (err) {
      console.error("Error cargando alumnos:", err);
      setError("Error al cargar los alumnos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>📚 Ver Alumnos por Grado</h2>

      {/* Selector de grado */}
      <div style={{ marginBottom: 30 }}>
        <h3>Selecciona un grado:</h3>
        <select
          value={gradoSeleccionado}
          onChange={(e) => verAlumnos(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #007bff",
            cursor: "pointer",
          }}
        >
          <option value="">-- Selecciona un grado --</option>
          {grados.map((grado) => (
            <option key={grado.id_grado} value={grado.id_grado}>
              {grado.nombre} {grado.seccion}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de alumnos */}
      <div>
        <h3>👦 Alumnos</h3>
        {loading && <p>Cargando alumnos...</p>}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && alumnos.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {alumnos.map((alumno) => (
              <li
                key={alumno.id_alumno}
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #ddd",
                  borderRadius: 4,
                  marginBottom: 4,
                  background: "#f9f9f9",
                }}
              >
                {alumno.nombres} {alumno.apellidos}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
