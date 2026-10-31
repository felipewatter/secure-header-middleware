import express from 'express';
import secureHeaders from '../src';

const app = express();

// Enable trust proxy ONLY for known TLS reverse proxies.
// app.set('trust proxy', 'loopback');
app.use(secureHeaders({
  contentSecurityPolicy: "default-src 'self'; object-src 'none'",
  permissionsPolicy: 'camera=(), microphone=()',
}));

app.get('/', (_req, res) => res.send('Secure headers enabled'));
app.listen(3000, () => console.log('Example on http://localhost:3000'));
