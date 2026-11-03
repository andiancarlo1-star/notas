import { useState, useEffect } from "react";
import { API_BASE, apiFetch } from "../api";

export default function ReportesPanel({ toast }) {
  const [bimestres, setBimestres] = useState([]);
  const [bimestreSel, setBimestreSel] = useState("");
  const [materias, setMaterias] = useState([]);
  const [materiaSel, setMateriaSel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const b = await apiFetch("/api/academico/bimestres");
        setBimestres(Array.isArray(b) ? b : []);
      } catch (e) { toast?.(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!bimestreSel) { setMaterias([]); return; }
    (async () => {
      try {
        const data = await apiFetch("/api/materias/todas");
        setMaterias(Array.isArray(data) ? data : []);
      } catch (e) { toast?.(e.message, "error"); }
    })();
  }, [bimestreSel]);

  const token = localStorage.getItem("token");
  const descargar = (url, filename) => {
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error("Error al descargar"); return r.blob(); })
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        toast?.("Descarga completada", "success");
      })
      .catch(e => toast?.(e.message, "error"));
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando reportes...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>📄</span> Reportes
      </h2>

      <ReportCard title="Boletas masivas (PDF)" desc="Descarga un PDF con todas las boletas del bimestre seleccionado." icon="📥">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <SelectBimestre value={bimestreSel} onChange={setBimestreSel} bimestres={bimestres} />
          <button
            disabled={!bimestreSel}
            onClick={() => descargar(`${API_BASE}/api/reportes/boletas/${bimestreSel}`, `boletas-bimestre-${bimestreSel}.pdf`)}
            style={btnPrimary(!bimestreSel)}
          >
            📥 Descargar boletas
          </button>
        </div>
      </ReportCard>

      <ReportCard title="Acta por materia" desc="Genera el acta de calificaciones de una materia específica." icon="📋">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <SelectBimestre value={bimestreSel} onChange={setBimestreSel} bimestres={bimestres} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Materia</label>
            <select value={materiaSel} onChange={e => setMateriaSel(e.target.value)} style={{ width: '100%' }}>
              <option value="">Selecciona materia</option>
              {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre} ({m.grado_nombre} {m.seccion})</option>)}
            </select>
          </div>
          <button
            disabled={!bimestreSel || !materiaSel}
            onClick={() => descargar(`${API_BASE}/api/reportes/acta/${bimestreSel}/${materiaSel}`, `acta-materia-${materiaSel}.pdf`)}
            style={btnPrimary(!bimestreSel || !materiaSel)}
          >
            📋 Generar acta
          </button>
        </div>
      </ReportCard>

      <ReportCard title="Alumnos por grado" desc="Reporte completo de alumnos organizados por grado y sección." icon="🎓">
        <button onClick={() => descargar(`${API_BASE}/api/reportes/alumnos-por-grado`, "alumnos-por-grado.json")} style={btnPrimary(false)}>
          📥 Descargar reporte
        </button>
      </ReportCard>
    </div>
  );
}

function ReportCard({ title, desc, icon, children }) {
  return (
    <div className="slide-up" style={{
      background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 16,
    }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span> {title}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{desc}</p>
      {children}
    </div>
  );
}

function SelectBimestre({ value, onChange, bimestres }) {
  return (
    <div style={{ minWidth: 220 }}>
      <label style={labelStyle}>Bimestre</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%' }}>
        <option value="">Selecciona bimestre</option>
        {bimestres.map(b => <option key={b.id_bimestre} value={b.id_bimestre}>{b.nombre} ({b.ciclo})</option>)}
      </select>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 };
const btnPrimary = (disabled) => ({
  padding: '12px 20px', background: disabled ? 'var(--text-muted)' : 'var(--primary)',
  color: '#fff', fontWeight: 700, fontSize: 14, opacity: disabled ? 0.5 : 1,
  cursor: disabled ? 'default' : 'pointer',
});
