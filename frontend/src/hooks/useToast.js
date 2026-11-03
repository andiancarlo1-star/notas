import { useState, useCallback } from "react";

let nextId = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, tipo = "info", duracion = 3500) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duracion);
  }, []);
  return { toasts, toast };
}
