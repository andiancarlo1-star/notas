import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export function VerUsuarios({ rol }) {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("⏳ Cargando usuarios...");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/usuarios?rol=${rol}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setUsuarios(data);
          setMensaje("");
        } else {
          setMensaje(data.msg || "❌ Error al cargar usuarios");
        }
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error de conexión con el backend");
      }
    };

    fetchUsuarios();
  }, [rol]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h3 style={{ textAlign: "center", color: "#007bff", marginBottom: "20px" }}>
        {rol.charAt(0).toUpperCase() + rol.slice(1)}s
      </h3>
      {mensaje && <p style={{ textAlign: "center" }}>{mensaje}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {usuarios.map((u) => (
          <div
            key={u.id_usuario}
            style={{
              padding: "15px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#f9f9f9",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <h4 style={{ margin: 0, color: "#333" }}>{u.nombre}</h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Correo: {u.correo}</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Rol: {u.rol}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
