import AdminDirectorPanel from "./AdminDirectorPanel";

export default function DirectorPanel({ usuario, onLogout, toast }) {
  return <AdminDirectorPanel usuario={usuario} onLogout={onLogout} toast={toast} esAdmin={false} />;
}
