import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export function AsignarMaterias() {
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [maestros, setMaestros] = useState([]);
  const [maestroSeleccionado, setMaestroSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeClase, setMensajeClase] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Cargar grados
    axios
      .get(`${API_BASE}/api/materias/grados`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGrados(res.data))
      .catch(() => {
        setMensaje("❌ Error cargando grados");
        setMensajeClase("bg-red-100 text-red-700");
      });

    // Cargar maestros
    axios
      .get(`${API_BASE}/api/usuarios?rol=maestro`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMaestros(res.data))
      .catch(() => {
        setMensaje("❌ Error cargando maestros");
        setMensajeClase("bg-red-100 text-red-700");
      });
  }, [token]);

  const cargarMaterias = (gradoId) => {
    setMateriaSeleccionada("");
    setMaterias([]);
    if (!gradoId) return;

    axios
      .get(`${API_BASE}/api/materias/por-grado/${gradoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMaterias(res.data))
      .catch(() => {
        setMensaje("❌ Error cargando materias");
        setMensajeClase("bg-red-100 text-red-700");
      });
  };

  const asignar = () => {
    if (!materiaSeleccionada || !maestroSeleccionado) {
      setMensaje("❌ Debes seleccionar materia y maestro");
      setMensajeClase("bg-red-100 text-red-700");
      return;
    }

    axios
      .post(
        `${API_BASE}/api/materias/asignar`,
        { maestroId: maestroSeleccionado, materiaId: materiaSeleccionada },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMensaje("✅ Maestro asignado correctamente");
        setMensajeClase("bg-green-100 text-green-700");
        setMateriaSeleccionada("");
        setMaestroSeleccionado("");
      })
      .catch(() => {
        setMensaje("❌ Error al asignar maestro");
        setMensajeClase("bg-red-100 text-red-700");
      });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        🎓 Asignar Materias a Maestros
      </h2>

      {mensaje && (
        <p
          className={`${mensajeClase} mb-6 p-3 rounded-lg text-center font-semibold shadow-md transition-all`}
        >
          {mensaje}
        </p>
      )}

      <div className="space-y-6">
        {/* Grado */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition">
          <label className="block font-semibold mb-2 text-blue-800">📘 Seleccionar Grado:</label>
          <select
            value={gradoSeleccionado}
            onChange={(e) => {
              setGradoSeleccionado(e.target.value);
              cargarMaterias(e.target.value);
            }}
            className="w-full border border-blue-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 bg-white transition"
          >
            <option value="">-- Selecciona un grado --</option>
            {grados.map((g) => (
              <option key={g.id_grado} value={g.id_grado}>
                {g.nombre} {g.seccion}
              </option>
            ))}
          </select>
        </div>

        {/* Materia */}
        {materias.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition">
            <label className="block font-semibold mb-2 text-green-800">📚 Seleccionar Materia:</label>
            <select
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              className="w-full border border-green-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 bg-white transition"
            >
              <option value="">-- Selecciona una materia --</option>
              {materias.map((m) => (
                <option key={m.id_materia} value={m.id_materia}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Maestro */}
        {materiaSeleccionada && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition">
            <label className="block font-semibold mb-2 text-purple-800">👩‍🏫 Seleccionar Maestro:</label>
            <select
              value={maestroSeleccionado}
              onChange={(e) => setMaestroSeleccionado(e.target.value)}
              className="w-full border border-purple-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 bg-white transition"
            >
              <option value="">-- Selecciona un maestro --</option>
              {maestros.map((m) => (
                <option key={m.id_usuario} value={m.id_usuario}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón asignar */}
        {maestroSeleccionado && (
          <button
            onClick={asignar}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            ✅ Asignar
          </button>
        )}
      </div>
    </div>
  );
}
