export default function Paginacion({ pagina, totalPaginas, onCambio }) {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  for (let i = Math.max(1, pagina - 2); i <= Math.min(totalPaginas, pagina + 2); i++) {
    paginas.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
      <button
        onClick={() => onCambio(pagina - 1)}
        disabled={pagina === 1}
        style={{
          padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13,
          opacity: pagina === 1 ? 0.4 : 1, cursor: pagina === 1 ? 'default' : 'pointer',
        }}
      >← Anterior</button>

      {paginas[0] > 1 && (
        <>
          <button onClick={() => onCambio(1)} style={numBtn(1 === pagina)}>1</button>
          {paginas[0] > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
        </>
      )}

      {paginas.map(p => (
        <button key={p} onClick={() => onCambio(p)} style={numBtn(p === pagina)}>{p}</button>
      ))}

      {paginas[paginas.length - 1] < totalPaginas && (
        <>
          {paginas[paginas.length - 1] < totalPaginas - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
          <button onClick={() => onCambio(totalPaginas)} style={numBtn(totalPaginas === pagina)}>{totalPaginas}</button>
        </>
      )}

      <button
        onClick={() => onCambio(pagina + 1)}
        disabled={pagina === totalPaginas}
        style={{
          padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13,
          opacity: pagina === totalPaginas ? 0.4 : 1, cursor: pagina === totalPaginas ? 'default' : 'pointer',
        }}
      >Siguiente →</button>
    </div>
  );
}

const numBtn = (active) => ({
  padding: '8px 12px', minWidth: 36,
  background: active ? 'var(--primary)' : 'var(--bg-card)',
  color: active ? '#fff' : 'var(--text)',
  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
});
