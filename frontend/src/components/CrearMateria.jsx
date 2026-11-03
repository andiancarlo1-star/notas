import { useState, useEffect } from "react";
import { API_BASE } from "../api";

export function CrearMateria({ setMensaje }) {
  const [nombre, setNombre] = useState("");
  const [grado, setGrado] = useState("");
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/materias/grados`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => setGrados(data))
      .catch(() => setMensaje("❌ Error cargando grados"));
  }, [setMensaje]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setMensaje("⏳ Creando materia...");
    try {
      const res = await fetch(`${API_BASE}/api/materias`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ nombre, grado_id: parseInt(grado) }),
      });
      const data = await res.json();
      setMensaje(res.ok ? "✅ Materia creada" : "❌ " + (data.msg || "Error"));
      if (res.ok) { setNombre(""); setGrado(""); }
    } catch { setMensaje("❌ Error de conexión"); }
  };

  return (
    <form
      onSubmit={handleCrear}
      style={{
        maxWidth: 450,
        margin: "50px auto",
        padding: 30,
        background: "#ffffff",
        borderRadius: 15,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 25, color: "#333" }}>Crear Materia</h3>

      <input 
        placeholder="Nombre de la materia"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        required
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          transition: "0.3s",
        }}
      />

      <select
        value={grado}
        onChange={e => setGrado(e.target.value)}
        required
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 25,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          transition: "0.3s",
          backgroundColor: "#fefefe",
        }}
      >
        <option value="">Selecciona un grado</option>
        {grados.map(g => (
          <option key={g.id_grado} value={g.id_grado}>
            {g.nombre} - {g.seccion}
          </option>
        ))}
      </select>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: 14,
          backgroundColor: "#007bff",
          color: "#fff",
          fontSize: 16,
          fontWeight: "bold",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "0.3s",
        }}
        onMouseOver={e => e.target.style.backgroundColor = "#0056b3"}
        onMouseOut={e => e.target.style.backgroundColor = "#007bff"}
      >
        Crear Materia
      </button>

    </form>
  );
}
