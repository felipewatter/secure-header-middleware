# 🛡️ Secure Header Middleware

A lightweight and configurable Express middleware to automatically add secure HTTP headers to your APIs.

## 📋 Features

✅ Adds standard security headers out of the box:

- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy (optional)

✅ Configurable and easy to integrate  
✅ Helps prevent common web attacks

## ⚙️ Installation

```bash
npm install secure-header-middleware
```

## 💻 Usage

```ts
import express from 'express';
import secureHeaders from 'secure-header-middleware';

const app = express();

app.use(secureHeaders({
  contentSecurityPolicy: "default-src 'self'; img-src *; script-src 'self'"
}));

app.get('/', (req, res) => {
  res.send('Secure API is running 🚀');
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

## 🛠️ Configuration

| Option                 | Type   | Description                           | Default    |
|-------------------------|---------|---------------------------------------|-------------|
| contentSecurityPolicy  | string | Content-Security-Policy header value | Not set    |

## ✅ Best Practices

- Always use HTTPS
- Review your CSP carefully
- Update dependencies frequently

## 🧑‍💻 Contributing

Contributions are welcome! Please open an issue or pull request.

## 📄 License

MIT License