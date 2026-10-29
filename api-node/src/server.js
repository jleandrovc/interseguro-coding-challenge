import express from 'express';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3001', 10);
const tolerance = Number.parseFloat(process.env.DIAGONAL_TOLERANCE ?? '1e-9');

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb', strict: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-node' });
});

app.post('/api/v1/statistics', (req, res) => {
  const { q, r } = req.body ?? {};
  const qError = validateMatrix(q, 'q');
  const rError = validateMatrix(r, 'r');
  if (qError || rError) {
    return res.status(400).json({ error: qError ?? rError });
  }

  const values = [...q.flat(), ...r.flat()];
  if (values.length === 0 || values.some((n) => !Number.isFinite(n))) {
    return res.status(400).json({ error: 'matrices must contain finite numeric values' });
  }

  const sum = values.reduce((total, value) => total + value, 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const average = sum / values.length;
  const qDiagonal = isDiagonal(q, tolerance);
  const rDiagonal = isDiagonal(r, tolerance);

  return res.json({
    max,
    min,
    sum,
    average,
    diagonal: { q: qDiagonal, r: rDiagonal, any: qDiagonal || rDiagonal },
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'body must be valid JSON' });
  }
  return res.status(500).json({ error: 'internal server error' });
});

function validateMatrix(matrix, name) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return `${name} must be a non-empty matrix`;
  }
  if (!Array.isArray(matrix[0]) || matrix[0].length === 0) {
    return `${name} must contain at least one column`;
  }
  const columns = matrix[0].length;
  for (let i = 0; i < matrix.length; i += 1) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== columns) {
      return `${name} must be rectangular`;
    }
    if (matrix[i].some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      return `${name} must contain only finite numbers`;
    }
  }
  return null;
}

function isDiagonal(matrix, epsilon) {
  if (matrix.length !== matrix[0].length) return false;
  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (row !== col && Math.abs(matrix[row][col]) > epsilon) return false;
    }
  }
  return true;
}

if (process.env.NODE_ENV !== 'test' && !process.argv.some((arg) => arg.endsWith('.test.js'))) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Node statistics API listening on :${port}`);
  });
}

export { app, isDiagonal };
