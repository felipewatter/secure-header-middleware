# Secure Header Middleware

[![CI](https://github.com/felipewatter/secure-header-middleware/actions/workflows/ci.yml/badge.svg)](https://github.com/felipewatter/secure-header-middleware/actions/workflows/ci.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%20%7C%2024-green.svg)](package.json)

Middleware HTTP em **TypeScript** compatível com Express 4/5. Configura cabeçalhos de proteção com opções claras, sem dependências de execução. O pacote expõe JavaScript CommonJS e definições de tipos.

> **Distribuição:** código público no GitHub. Este README não pressupõe que o nome esteja publicado ou disponível no registro npm.

## Requisitos

Node.js 22 ou 24, npm e Express (na sua aplicação). O middleware não precisa importar Express durante a execução.

## Instalação

Para integrar diretamente a partir deste repositório (o script `prepare` compila o código):

```bash
npm install github:felipewatter/secure-header-middleware
```

Para desenvolver o próprio projeto:

```bash
git clone https://github.com/felipewatter/secure-header-middleware.git
cd secure-header-middleware
npm ci
npm test
npm pack --dry-run
```

## Exemplo no Express

```ts
import express from 'express';
import secureHeaders from 'secure-header-middleware';

const app = express();

// Se houver proxy HTTPS, configure trust proxy SOMENTE para proxies conhecidos.
// Exemplo apenas para proxy na interface local:
// app.set('trust proxy', 'loopback');

app.use(secureHeaders({
  contentSecurityPolicy: "default-src 'self'; object-src 'none'; base-uri 'self'",
  permissionsPolicy: 'camera=(), microphone=()',
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.listen(3000);
```

O mesmo middleware funciona com `app.use(secureHeaders())`. A CSP é **opt-in** porque precisa ser específica para os recursos da sua aplicação.

## Padrões seguros

| Cabeçalho | Padrão | Observações |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Evita interpretação indevida de MIME |
| `X-Frame-Options` | `DENY` | Permite alterar para `SAMEORIGIN` |
| `X-XSS-Protection` | `0` | Desativa filtro legado, que pode introduzir problemas |
| `Referrer-Policy` | `no-referrer` | Restringe vazamento do referenciador |
| `Strict-Transport-Security` | `max-age=31536000` **em HTTPS** | Não habilita subdomínios nem preload automaticamente |
| `Content-Security-Policy` | Não definido | Configure para a aplicação |
| `Permissions-Policy` | Não definido | Disponível via opção |
| `Cross-Origin-Opener-Policy` | Não definido | Ative conforme integração de janelas |
| `Cross-Origin-Resource-Policy` | Não definido | Avalie efeitos sobre recursos de outras origens |

### HSTS sem ativação acidental de preload

```ts
app.use(secureHeaders({
  strictTransportSecurity: { maxAgeSeconds: 31536000, includeSubDomains: false },
}));
```

O middleware só envia HSTS quando `req.secure === true` ou quando a conexão do socket é TLS. Em aplicações atrás de proxy HTTPS, configure corretamente o `trust proxy` do Express para proxies específicos. **Nunca utilize valores de `X-Forwarded-Proto` de clientes não confiáveis.**

Somente se **todos** os subdomínios oferecerem HTTPS permanente e você compreender o impacto da lista preload:

```ts
app.use(secureHeaders({
  strictTransportSecurity: {
    maxAgeSeconds: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Todas as opções

```ts
app.use(secureHeaders({
  contentSecurityPolicy: "default-src 'self'",
  strictTransportSecurity: true,
  xContentTypeOptions: true,
  xFrameOptions: 'DENY',
  xXssProtection: '0',
  referrerPolicy: 'no-referrer',
  permissionsPolicy: 'camera=()',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-site',
}));
```

Defina `false` para não aplicar um cabeçalho opcional. Configurações inseguras são de responsabilidade do integrador. Valores CSP e Permissions Policy com caracteres de controle são rejeitados na criação do middleware.

## Validação e garantia

```bash
npm ci
npm test
npm pack --dry-run
```

Testes verificam o comportamento HTTP/HTTPS, cabeçalhos padrão, CSP, rejeição de entrada inválida, opções de desativação, configuração HSTS e chamada única a `next()`. A matriz CI executa Node 22 e 24 em Ubuntu, macOS e Windows.

**Limitações:** cabeçalhos não substituem TLS, autenticação, segurança de sessão ou CSP bem projetada. Compatibilidade tipada com Express não é certificação de segurança ou pentest.

## Responsabilidades e licença

MIT — consulte [LICENSE](LICENSE). Contribuições em [CONTRIBUTING.md](CONTRIBUTING.md) e comunicação privada de falhas em [SECURITY.md](SECURITY.md).
