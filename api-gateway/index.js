const express = require('express');
const app = express();
app.use(express.json());

// Registration runs in the SAME pod -> localhost
const REGISTRATION_URL = process.env.REGISTRATION_URL || 'http://localhost:3001';
// Search runs in the 2nd pod -> reached through its Kubernetes Service
const SEARCH_URL = process.env.SEARCH_URL || 'http://search-service:3002';

async function forward(req, res, baseUrl, prefix) {
  const target = baseUrl + req.originalUrl.replace(prefix, '');
  try {
    const hasBody = !['GET', 'DELETE'].includes(req.method);
    const r = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: hasBody ? JSON.stringify(req.body) : undefined
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ error: 'Service unavailable', target, details: err.message });
  }
}

app.get('/health', (req, res) => res.json({ service: 'api-gateway', status: 'ok' }));

// All requests go through the gateway
app.use('/api/registration', (req, res) => forward(req, res, REGISTRATION_URL, '/api/registration'));
app.use('/api/search', (req, res) => forward(req, res, SEARCH_URL, '/api/search'));

app.listen(3000, () => console.log('API Gateway running on port 3000'));
