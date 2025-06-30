import express from 'express';
import secureHeaders from '../src';

const app = express();

app.use(secureHeaders({
  contentSecurityPolicy: "default-src 'self';"
}));

app.get('/', (req, res) => {
  res.send('Hello from a secure API! 🔒');
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});