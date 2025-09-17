const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Referer');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', async (req, res) => {
  const target = req.query.url;
  const ref = req.query.ref || 'https://www.emonl.com/';
  if (!target || !target.startsWith('http')) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'Referer': ref,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': req.headers['accept'] || 'image/*,*/*;q=0.8',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Upstream error');
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Length', response.headers.get('content-length'));
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
});

app.listen(port, () => console.log(`Proxy running on port ${port}`));
