import AdminDirectorPanel from "./AdminDirectorPanel";

export default function AdminPanel({ usuario, onLogout, toast }) {
  return <AdminDirectorPanel usuario={usuario} onLogout={onLogout} toast={toast} esAdmin={true} />;
}
