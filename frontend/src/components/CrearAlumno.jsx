import { useState, useEffect } from "react";
import { API_BASE } from "../api";

export function CrearAlumno({ setMensaje }) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [gradoId, setGradoId] = useState("");
  const [grados, setGrados] = useState([]);

  // Traer los grados del backend al cargar el componente
  useEffect(() => {
    fetch(`${API_BASE}/api/grados`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    }) // Ajusta la ruta si es distinta
      .then((res) => res.json())
      .then((data) => setGrados(data))
      .catch((err) => console.error("Error al cargar grados:", err));
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setMensaje("⏳ Creando alumno...");

    try {
      const token = localStorage.getItem("token"); // ✅ traer token
      if (!token) {
        setMensaje("❌ No hay token, inicia sesión de nuevo");
        return;
      }

      const res = await fetch(`${API_BASE}/api/alumnos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ enviar token
        },
        body: JSON.stringify({ nombres, apellidos, grado_id: gradoId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Alumno creado correctamente");
        setNombres("");
        setApellidos("");
        setGradoId("");
      } else {
        setMensaje(`❌ ${data.msg || "Error al crear alumno"}`);
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error de conexión con el backend");
    }
  };

  return (
    <form
      onSubmit={handleCrear}
      style={{
        maxWidth: "400px",
        margin: "auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        backgroundColor: "#f9f9f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Crear Alumno</h3>

      <input
        placeholder="Nombres"
        value={nombres}
        onChange={(e) => setNombres(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <input
        placeholder="Apellidos"
        value={apellidos}
        onChange={(e) => setApellidos(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <select
        value={gradoId}
        onChange={(e) => setGradoId(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      >
        <option value="">Selecciona un grado</option>
        {grados.map((g) => (
          <option key={g.id_grado} value={g.id_grado}>
            {g.nombre} - {g.seccion}
          </option>
        ))}
      </select>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#007bff",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.3s",
        }}
      >
        Crear Alumno
      </button>
    </form>
  );
}
