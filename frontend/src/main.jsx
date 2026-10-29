import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialMatrix = '[[1, 2], [3, 4], [5, 6]]';

function Matrix({ title, data }) {
  return (
    <section className="matrix-card">
      <h3>{title}</h3>
      <div className="matrix-scroll">
        <table>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((value, j) => <td key={j}>{Number(value).toFixed(4)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function App() {
  const [input, setInput] = useState(initialMatrix);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function calculate(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    let matrix;
    try {
      matrix = JSON.parse(input);
    } catch {
      setError('El JSON no es válido. Introduce una matriz como [[1,2],[3,4]].');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/v1/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
      setResult(data);
    } catch (err) {
      setError(`${err.message}. Comprueba que Docker Compose esté levantado.`);
    } finally {
      setLoading(false);
    }
  }

  const stats = result?.statistics;
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark">I</div>
        <div><strong>INTERSEGURO</strong><span>DIVISIÓN TI · CODING CHALLENGE</span></div>
        <div className="status"><i /> Local lab</div>
      </header>

      <section className="hero">
        <div className="eyebrow">MATRIX COMPUTATION WORKBENCH</div>
        <h1>Factorización <em>QR</em></h1>
        <p>Una matriz de entrada, dos microservicios y resultados verificables.</p>
      </section>

      <section className="workspace">
        <form className="input-card" onSubmit={calculate}>
          <div className="card-heading"><div><span className="step">01</span><h2>Matriz de entrada</h2></div><span className="tag">JSON</span></div>
          <label htmlFor="matrix">Matriz rectangular (m ≥ n)</label>
          <textarea id="matrix" spellCheck="false" value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="hint">Ejemplo: [[1, 2], [3, 4], [5, 6]]</div>
          <button disabled={loading} type="submit">{loading ? 'Calculando…' : 'Calcular QR'} <span>→</span></button>
          {error && <div className="error" role="alert">{error}</div>}
        </form>

        <section className="results">
          <div className="card-heading"><div><span className="step">02</span><h2>Resultado</h2></div><span className="tag">GO + NODE</span></div>
          {!result ? (
            <div className="empty"><div className="empty-icon">∑</div><strong>Listo para calcular</strong><p>Envía una matriz para ver Q, R y las estadísticas.</p></div>
          ) : (
            <>
              <div className="matrix-grid"><Matrix title="Q · Ortonormal" data={result.q}/><Matrix title="R · Triangular superior" data={result.r}/></div>
              <h3 className="section-label">Estadísticas combinadas de Q y R</h3>
              <div className="stats-grid">
                <Stat label="Máximo" value={stats.max}/>
                <Stat label="Mínimo" value={stats.min}/>
                <Stat label="Suma total" value={stats.sum}/>
                <Stat label="Promedio" value={stats.average}/>
              </div>
              <div className="diagonal"><span>Matriz diagonal</span><strong>Q: {stats.diagonal.q ? 'Sí' : 'No'}</strong><strong>R: {stats.diagonal.r ? 'Sí' : 'No'}</strong></div>
            </>
          )}
        </section>
      </section>
      <footer><span>Interseguro · Technical exercise</span><span>Go / Fiber · Node / Express · React / Vite</span></footer>
    </main>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><span>{label}</span><strong>{Number(value).toLocaleString('es-PE', { maximumFractionDigits: 6 })}</strong></div>;
}

createRoot(document.getElementById('root')).render(<App />);
