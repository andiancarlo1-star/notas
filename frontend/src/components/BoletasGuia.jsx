import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function BoletasGuia({ toast }) {
  const [grados, setGrados] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [gradoSel, setGradoSel] = useState(null);
  const [bimestreSel, setBimestreSel] = useState(null);
  const [boleta, setBoleta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBoleta, setLoadingBoleta] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, b] = await Promise.all([
          apiFetch("/api/grados/mios"),
          apiFetch("/api/academico/bimestres")
        ]);
        setGrados(Array.isArray(g) ? g : []);
        setBimestres(Array.isArray(b) ? b.filter(x => x.estado === "CERRADO") : []);
      } catch (e) { toast?.(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const cargarBoleta = async () => {
    if (!gradoSel || !bimestreSel) return;
    try {
      setLoadingBoleta(true);
      const data = await apiFetch(`/api/grados/${gradoSel.id_grado}/boleta?bimestre_id=${bimestreSel}`);
      setBoleta(Array.isArray(data) ? data : []);
    } catch (e) { toast?.(e.message, "error"); setBoleta([]); }
    finally { setLoadingBoleta(false); }
  };

  useEffect(() => { cargarBoleta(); }, [gradoSel, bimestreSel]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando...</p>
    </div>
  );

  if (grados.length === 0) return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <p>No eres maestro guía de ningún grado</p>
    </div>
  );

  const promedioGeneral = boleta.length
    ? (boleta.reduce((s, r) => s + Number(r.promedio), 0) / boleta.length).toFixed(2)
    : null;

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📋</span> Boletas de mi Grado
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Grado</label>
          <select value={gradoSel?.id_grado || ""} onChange={e => {
            const g = grados.find(x => x.id_grado === Number(e.target.value));
            setGradoSel(g || null);
            setBoleta([]);
          }}>
            <option value="">Seleccionar grado</option>
            {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.grado} - {g.seccion}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Bimestre</label>
          <select value={bimestreSel || ""} onChange={e => { setBimestreSel(Number(e.target.value) || null); setBoleta([]); }}>
            <option value="">Seleccionar bimestre</option>
            {bimestres.map(b => <option key={b.id_bimestre} value={b.id_bimestre}>{b.nombre} ({b.ciclo})</option>)}
          </select>
        </div>
      </div>

      {loadingBoleta ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        </div>
      ) : boleta.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          {gradoSel && bimestreSel ? "No hay calificaciones registradas para este grado y bimestre" : "Selecciona un grado y bimestre para ver las boletas"}
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                <th style={th}>Alumno</th>
                <th style={th}>Materia</th>
                <th style={{ ...th, textAlign: "right" }}>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {boleta.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={td}>{r.apellidos} {r.nombres}</td>
                  <td style={td}>{r.materia}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{Number(r.promedio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            {promedioGeneral && (
              <tfoot>
                <tr style={{ background: "var(--bg)" }}>
                  <td style={{ ...td, fontWeight: 700 }} colSpan={2}>Promedio General</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800, fontSize: 16, color: "var(--primary)" }}>{promedioGeneral}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

const th = { padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textAlign: "left", borderBottom: "2px solid var(--border)" };
const td = { padding: "12px 16px", fontSize: 14 };
