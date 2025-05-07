const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express(); // <- THIS LINE IS CRITICAL

app.use(cors());
app.use(express.json());
app.post('/proxy', async (req, res) => {
  const { url, method, token, body } = req.body;

  if (!url || !method || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
    });

    const raw = await response.text();
    console.log(`🔍 Gigaverse [${method}] ${url}`);
    console.log('📦 Raw response:', raw.slice(0, 300));

    try {
      const data = JSON.parse(raw);
      res.status(response.status).json(data);
    } catch (err) {
      console.error('❌ Invalid JSON:', err.message);
      res.status(500).json({ error: 'Invalid JSON from Gigaverse', raw: raw.slice(0, 200) });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});
