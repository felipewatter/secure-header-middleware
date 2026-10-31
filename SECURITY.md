# Política de Segurança

Se identificar um problema de segurança, **não publique detalhes exploráveis em uma issue**. Abra uma orientação privada no GitHub em **Security > Advisories > Report a vulnerability**, quando habilitada, ou entre em contato de maneira privada com o mantenedor.

## Escopo e limites

O projeto configura cabeçalhos HTTP; não substitui validação de entradas, autenticação, controle de acesso, TLS, gestão de sessões ou uma CSP ajustada à aplicação.

O HSTS `preload` envolve compromisso de longo prazo para todos os subdomínios e só é habilitado por opt-in. Atrás de proxy TLS, configure `trust proxy` apenas com endereços confiáveis e nunca confie diretamente em `X-Forwarded-Proto` fornecido pelo cliente.

Não abra issues públicas com segredos, tokens, dados pessoais ou material sensível.
