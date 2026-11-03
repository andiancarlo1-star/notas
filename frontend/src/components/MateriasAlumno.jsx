import { useState, useEffect } from "react";
import { API_BASE } from "../api";

export function MateriasAlumno({ setMensaje }) {
  const [grados, setGrados] = useState([]);
  const [gradoId, setGradoId] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/api/grados`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => setGrados(data))
      .catch(() => setMensaje("❌ Error cargando grados"));
  }, [setMensaje]);

  useEffect(() => {
    if (!gradoId) return;
    fetch(`${API_BASE}/api/alumnos/grado/${gradoId}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => {
        setAlumnos(data);
        const token = localStorage.getItem("token");
        fetch(`${API_BASE}/api/materias/por-grado/${gradoId}`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then(res => res.json())
          .then(mats => {
            const matsMap = {};
            data.forEach(al => { matsMap[al.id_alumno] = mats; });
            setMaterias(matsMap);
          });
      })
      .catch(() => setMensaje("❌ Error cargando alumnos"));
  }, [gradoId]);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h3 style={{ textAlign: "center" }}>Materias de Alumnos por Grado</h3>
      <select value={gradoId} onChange={e => setGradoId(e.target.value)} required style={{ width: "100%", padding: 10, marginBottom: 20 }}>
        <option value="">Selecciona un grado</option>
        {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre} - {g.seccion}</option>)}
      </select>

      {alumnos.map(al => (
        <div key={al.id_alumno} style={{ padding: 15, marginBottom: 10, border: "1px solid #ccc", borderRadius: 5 }}>
          <strong>{al.nombres} {al.apellidos}</strong>
          <ul>
            {(materias[al.id_alumno] || []).map(mat => <li key={mat.id_materia}>{mat.nombre}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
