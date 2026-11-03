import { useState, useEffect } from "react";
import { API_BASE, apiFetch } from "../api";

export default function BoletasAlumno({ toast }) {
  const [bimestres, setBimestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/academico/mis-bimestres");
        setBimestres(Array.isArray(data) ? data : []);
      } catch (e) { toast?.(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const descargar = async (b) => {
    try {
      setDescargando(b.id_bimestre);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/academico/mi-tarjeta.pdf?bimestre_id=${b.id_bimestre}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo descargar la boleta");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boleta-${b.nombre.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast?.("Boleta descargada", "success");
    } catch (e) { toast?.(e.message, "error"); }
    finally { setDescargando(null); }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando boletas...</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📋</span> Mis Boletas
      </h2>
      {bimestres.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>No hay bimestres cerrados con calificaciones disponibles</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {bimestres.map(b => (
            <div key={b.id_bimestre} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow)",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{b.nombre}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{b.ciclo}</div>
              </div>
              <button
                onClick={() => descargar(b)}
                disabled={descargando === b.id_bimestre}
                style={{
                  padding: "8px 18px", fontWeight: 700, fontSize: 13, border: "none", borderRadius: "var(--radius-sm)", cursor: descargando === b.id_bimestre ? "default" : "pointer",
                  background: descargando === b.id_bimestre ? "var(--text-muted)" : "var(--primary)", color: "#fff",
                }}
              >
                {descargando === b.id_bimestre ? "Descargando..." : "📥 Descargar PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
