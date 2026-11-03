import { useState } from "react";
import { API_BASE } from "../api";

export function CrearUsuario({ rol, setMensaje }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleCrear = async (e) => {
    e.preventDefault();
    setMensaje(`⏳ Creando ${rol}...`);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("❌ No hay token de sesión. Inicia sesión de nuevo.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, correo, contraseña, rol }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje(`✅ ${rol} creado correctamente`);
        setNombre("");
        setCorreo("");
        setContraseña("");
      } else {
        setMensaje(`❌ ${data.msg || "Error al crear usuario"}`);
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
        margin: "20px auto",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#007bff" }}>Crear {rol}</h3>

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        style={{
          padding: "12px 15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        style={{
          padding: "12px 15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}
        required
        style={{
          padding: "12px 15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <button
        type="submit"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "15px",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
      >
        Crear
      </button>
    </form>
  );
}
