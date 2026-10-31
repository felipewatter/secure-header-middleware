# Contribuindo

1. Crie uma branch e proponha alterações pequenas por pull request.
2. Utilize Node.js 22 ou 24.
3. Execute `npm ci && npm test` e confira `npm pack --dry-run`.
4. Mantenha a API `secureHeaders({ contentSecurityPolicy })` compatível.
5. Para mudança de comportamento, inclua teste e documentação.
6. Não envie segredos, arquivos `.env` ou código proprietário.

Discussões sobre vulnerabilidades devem seguir a política em SECURITY.md.
