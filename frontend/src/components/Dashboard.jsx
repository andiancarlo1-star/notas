import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function Dashboard({ toast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/dashboard");
        setStats(data);
      } catch (e) { toast?.(e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando estadísticas...</p>
    </div>
  );
  if (!stats) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No se pudieron cargar las estadísticas</p>;

  const { totales, porRol, topMaestros, materiasPorGrado } = stats;

  const cards = [
    { label: "Usuarios", value: totales.usuarios, icon: "👥", color: "#2563eb" },
    { label: "Alumnos", value: totales.alumnos, icon: "🎓", color: "#059669" },
    { label: "Materias", value: totales.materias, icon: "📚", color: "#d97706" },
    { label: "Tareas", value: totales.tareas, icon: "📝", color: "#7c3aed" },
    { label: "Tareas Activas", value: totales.tareasActivas, icon: "⚡", color: "#0891b2" },
    { label: "Entregas", value: totales.entregas, icon: "📋", color: "#dc2626" },
    { label: "Ciclos", value: totales.ciclos, icon: "📅", color: "#ea580c" },
    { label: "Bimestres Abiertos", value: totales.bimestresAbiertos, icon: "📆", color: "#16a34a" },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800 }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map((c, i) => (
          <div key={c.label} className="fade-in" style={{
            padding: 20, borderRadius: 'var(--radius-md)', background: 'var(--bg-card)',
            boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 14,
            animationDelay: `${i * 50}ms`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: `${c.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="slide-up" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>👥</span> Usuarios por rol
          </h3>
          {porRol.map(r => (
            <div key={r.rol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ textTransform: 'capitalize', fontSize: 14, color: 'var(--text)' }}>{r.rol}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 20 }}>{r.total}</span>
            </div>
          ))}
        </div>

        <div className="slide-up" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', animationDelay: '100ms' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏆</span> Top Maestros
          </h3>
          {topMaestros.length ? topMaestros.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)',
                }}>{i + 1}</div>
                <span style={{ fontSize: 14 }}>{m.nombre}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.materias} materias</span>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>Sin datos disponibles</p>}
        </div>
      </div>

      {materiasPorGrado.length > 0 && (
        <div className="slide-up" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏫</span> Materias por Grado
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {materiasPorGrado.map((g, i) => (
              <div key={i} style={{
                padding: 16, borderRadius: 'var(--radius)', background: 'var(--bg)',
                textAlign: 'center', border: '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{g.grado} {g.seccion}</div>
                <div style={{ fontSize: 28, color: 'var(--primary)', fontWeight: 800, margin: '4px 0' }}>{g.materias}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>materias</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
