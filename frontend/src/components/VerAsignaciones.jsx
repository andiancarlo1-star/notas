import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api";

/* --------- helpers visuales --------- */
const PALETA = {
  primario: "#D4AF37",   // dorado
  secundario: "#8C2D2A", // vino
  texto: "#333333",
};

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

const hue = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
};

function Avatar({ name }) {
  const bg = `hsl(${hue(name)} 70% 45%)`;
  const ini =
    String(name).trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "?";
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-bold shadow"
      style={{
        width: 26,
        height: 26,
        background: bg,
        lineHeight: "26px",
        userSelect: "none",
        fontSize: 12,
      }}
    >
      {ini}
    </span>
  );
}

/* debounce */
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}

export function VerAsignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [maestroSeleccionado, setMaestroSeleccionado] = useState("");
  const [buscador, setBuscador] = useState("");
  const q = useDebounced(buscador, 250);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/materias/asignadas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAsignaciones(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setMensaje("❌ Error cargando asignaciones");
        setTimeout(() => setMensaje(""), 3500);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // maestro -> materias
  const maestrosMap = useMemo(() => {
    const map = new Map();
    for (const a of asignaciones) {
      if (!map.has(a.maestro)) map.set(a.maestro, []);
      map.get(a.maestro).push(a);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) =>
        collator.compare(`${a.grado} ${a.seccion} ${a.materia}`, `${b.grado} ${b.seccion} ${b.materia}`)
      );
      map.set(k, arr);
    }
    return map;
  }, [asignaciones]);

  const maestros = useMemo(
    () => Array.from(maestrosMap.keys()).sort(collator.compare),
    [maestrosMap]
  );

  const materiasDelMaestro = useMemo(() => {
    const base = maestroSeleccionado ? maestrosMap.get(maestroSeleccionado) ?? [] : [];
    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter(m =>
      `${m.materia} ${m.grado} ${m.seccion}`.toLowerCase().includes(term)
    );
  }, [maestroSeleccionado, maestrosMap, q]);

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Título */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-extrabold" style={{ color: PALETA.texto }}>
          <span role="img" aria-label="teacher">🧑‍🏫</span> Materias por Maestro
        </h2>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          Selecciona un maestro y filtra por materia, grado o sección.
        </p>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <p
          className="text-center font-semibold rounded-md py-2 mb-4"
          style={{ color: "#a61b1b", background: "#ffe6e6", border: "1px solid #f5b5b5" }}
        >
          {mensaje}
        </p>
      )}

      {/* Selector profesional */}
      <section
        className="rounded-2xl mb-6"
        style={{
          background: "linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(255,255,255,0.9) 100%)",
          border: "1px solid rgba(212,175,55,.2)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-5 flex flex-col items-center gap-4 w-full">
          <div className="w-full max-w-2xl">
            <label
              htmlFor="maestro"
              className="block text-sm font-semibold mb-1"
              style={{ color: "#333" }}
            >
              Maestro
            </label>

            <div className="relative">
              {/* Icono izquierda */}
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Zm7 10-5.2-5.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* SELECT */}
              <select
                id="maestro"
                value={maestroSeleccionado}
                onChange={(e) => { setMaestroSeleccionado(e.target.value); setBuscador(""); }}
                className="w-full shadow-sm"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundColor: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "12px 44px 12px 42px",
                  outline: "none",
                }}
              >
                <option value="">— Selecciona un maestro —</option>
                {maestros.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Chevron derecha */}
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </div>

            {/* Chip con avatar + nombre */}
            
          </div>

          {/* Buscador */}
          {maestroSeleccionado && (
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  value={buscador}
                  onChange={(e) => setBuscador(e.target.value)}
                  placeholder="Buscar materia, grado o sección…"
                  className="w-full"
                  style={{
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "12px 44px 12px 14px",
                    outline: "none",
                  }}
                />
                {buscador && (
                  <button
                    onClick={() => setBuscador("")}
                    title="Limpiar"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      border: "1px solid #e5e7eb", background: "#fafafa"
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Nombre maestro */}
      {maestroSeleccionado && (
        <div className="flex justify-center mb-4">
          <span style={{ color: PALETA.texto, fontWeight: 600, fontSize: "1.1rem" }}>
            {maestroSeleccionado}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}
              className="rounded-xl"
              style={{ height: 96, background: "#fff", border: "1px solid #eee", animation: "pulse 1.2s infinite" }}
            />
          ))}
        </div>
      )}

      {/* Grid de materias */}
      {!loading && maestroSeleccionado && materiasDelMaestro.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materiasDelMaestro.map((m, i) => (
            <article
              key={`${m.materia}-${m.grado}-${m.seccion}-${i}`}
              className="rounded-xl"
              style={{
                background: "linear-gradient(180deg, #f7fafc 0%, #ffffff 100%)",
                border: "1px solid #eaeaea",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                padding: 16,
                transition: "transform .15s ease, box-shadow .15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.09)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)"; }}
            >
              <div className="font-semibold" style={{ color: PALETA.texto }}>
                {m.materia}
              </div>
              <div className="text-sm" style={{ color: "#4a5568" }}>
                Grado {m.grado} {m.seccion}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Vacíos */}
      {!loading && maestroSeleccionado && materiasDelMaestro.length === 0 && (
        <p className="text-center mt-6" style={{ color: "#6b7280" }}>
          No hay materias asignadas{q ? " que coincidan con la búsqueda" : ""}.
        </p>
      )}

      {!loading && !maestroSeleccionado && asignaciones.length > 0 && (
        <p className="text-center mt-6" style={{ color: "#6b7280" }}>
          Selecciona un maestro para ver sus materias.
        </p>
      )}
    </div>
  );
}
