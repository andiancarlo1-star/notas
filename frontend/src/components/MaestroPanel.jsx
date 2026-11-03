import { useState } from "react";
import MateriasAsignadas from "./MateriasAsignadas";
import MisGrados from "./MisGrados";
import BoletasGuia from "./BoletasGuia";
import PerfilUsuario from "./PerfilUsuario";

const TABS = [
  { id: "materias", label: "Mis Materias", icon: "📖" },
  { id: "grados", label: "Mis Grados", icon: "👥" },
  { id: "boletas", label: "Boletas", icon: "📋" },
  { id: "perfil", label: "Mi Perfil", icon: "⚙️" },
];

export default function MaestroPanel({ usuario, onLogout, toast }) {
  const [activeTab, setActiveTab] = useState("materias");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>👨‍🏫</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Control Escolar</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Maestro</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {TABS.map(tab => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, marginBottom: 2,
                background: activeTab === tab.id ? '#059669' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span> {tab.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              {usuario.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario.nombre}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', padding: '10px 14px', background: 'rgba(220,38,38,0.15)',
            color: '#fca5a5', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
          }}>🚪 Cerrar sesión</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: 'auto', background: 'var(--bg)' }}>
        <div className="fade-in" key={activeTab} style={{ maxWidth: 1100, margin: '0 auto' }}>
          {activeTab === "materias" && <MateriasAsignadas />}
          {activeTab === "grados" && <MisGrados titulo="Mis grados y secciones" />}
          {activeTab === "boletas" && <BoletasGuia toast={toast} />}
          {activeTab === "perfil" && <PerfilUsuario toast={toast} />}
        </div>
      </main>
    </div>
  );
}
