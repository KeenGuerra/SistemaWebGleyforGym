/**
 * Servidor Express minimalista para servir la SPA de Angular en Render.
 * Express ya es dependencia del proyecto (requerida por @angular/ssr).
 * Maneja el enrutamiento client-side devolviendo siempre index.html.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DIST = path.join(__dirname, 'dist', 'gleyforgym-frontend');

// Servir archivos estáticos con caché agresivo (excepto index.html)
app.use(
  express.static(DIST, {
    maxAge: '1y',
    index: false,
    setHeaders: (res, filePath) => {
      if (path.basename(filePath) === 'index.html') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// Cualquier ruta no encontrada → index.html (SPA client-side routing)
// Express 5: usar /{*path} en lugar de * como wildcard
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GleyforGym frontend corriendo en el puerto ${PORT}`);
});
