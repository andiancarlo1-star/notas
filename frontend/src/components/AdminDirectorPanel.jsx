import { useState } from "react";
import GestionUsuarios from "./GestionUsuarios";
import GestionAlumnos from "./GestionAlumnos";
import GestionMaterias from "./GestionMaterias";
import GestionGrados from "./GestionGrados";
import GestionBimestres from "./GestionBimestres";
import { AsignarMaterias } from "./AsignarMaterias";
import { VerAsignaciones } from "./VerAsignaciones";
import Dashboard from "./Dashboard";
import PerfilUsuario from "./PerfilUsuario";
import ReportesPanel from "./ReportesPanel";

const ICONS = {
  dashboard: "📊", "directores": "👥",
  "maestros": "👨‍🏫", "crear-grado": "🏫",
  "crear-alumno": "🎓", "crear-materia": "📚", "asignar-materias": "🔗",
  "ver-asignaciones": "📖", bimestres: "📅", reportes: "📄", perfil: "⚙️",
};

export default function AdminDirectorPanel({ usuario, onLogout, toast, esAdmin = true }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const opciones = [
    { id: "dashboard", label: "Dashboard" },
    ...(esAdmin ? [{ id: "directores", label: "Gestionar Directores" }] : []),
    { id: "maestros", label: "Gestionar Maestros" },
    { id: "crear-grado", label: "Gestionar Grados" },
    { id: "crear-alumno", label: "Gestionar Alumnos" },
    { id: "crear-materia", label: "Gestionar Materias" },
    { id: "asignar-materias", label: "Asignar Materias" },
    { id: "ver-asignaciones", label: "Ver Asignaciones" },
    { id: "bimestres", label: "Ciclos y Bimestres" },
    { id: "reportes", label: "Reportes" },
    { id: "perfil", label: "Mi Perfil" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>📚</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Control Escolar</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {esAdmin ? 'Administrador' : 'Director'}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {opciones.map(op => (
            <div
              key={op.id}
              onClick={() => setActiveTab(op.id)}
              style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500,
                marginBottom: 2,
                background: activeTab === op.id ? 'var(--primary)' : 'transparent',
                color: activeTab === op.id ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (activeTab !== op.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (activeTab !== op.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{ICONS[op.id]}</span> {op.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              {usuario.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario.nombre}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '10px 14px', background: 'rgba(220,38,38,0.15)',
              color: '#fca5a5', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', background: 'var(--bg)' }}>
        <div className="fade-in" key={activeTab} style={{ maxWidth: 1100, margin: '0 auto' }}>
          {activeTab === "dashboard" && <Dashboard toast={toast} />}
          {activeTab === "directores" && esAdmin && <GestionUsuarios rol="director" toast={toast} />}
          {activeTab === "maestros" && <GestionUsuarios rol="maestro" toast={toast} />}
          {activeTab === "crear-grado" && <GestionGrados toast={toast} />}
          {activeTab === "crear-alumno" && <GestionAlumnos toast={toast} />}
          {activeTab === "crear-materia" && <GestionMaterias toast={toast} />}
          {activeTab === "asignar-materias" && <AsignarMaterias />}
          {activeTab === "ver-asignaciones" && <VerAsignaciones />}
          {activeTab === "bimestres" && <GestionBimestres toast={toast} />}
          {activeTab === "reportes" && <ReportesPanel toast={toast} />}
          {activeTab === "perfil" && <PerfilUsuario toast={toast} />}
        </div>
      </main>
    </div>
  );
}
