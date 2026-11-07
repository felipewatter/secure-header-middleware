# Política de versionamento e releases

## Divergência histórica (não reescrever)
A [release `v1.2.0`](https://github.com/felipewatter/secure-header-middleware/releases/tag/v1.2.0), publicada em 31/10/2026, aponta para um commit com `package.json.version = 0.2.0`. A divergência foi descoberta posteriormente, é histórica e **não deve ser corrigida por exclusão/movimentação de tags ou reescrita do release existente**. O número da tag não comprova a versão de um pacote distribuído via npm.

## Regras para releases futuros
1. Escolher uma versão SemVer para o pacote e atualizá-la em `package.json` via PR próprio. Confirmar, no mesmo PR, documentação e changelog; não criar tag antes da aprovação.
2. Executar CI, testes de segurança, compatibilidade e `npm pack --dry-run`, sem publicar.
3. Criar a tag **somente** sobre o commit validado, com prefixo `v` e número **idêntico** à propriedade `version` do `package.json`.
4. A verificação `release-version-guard.yml` sinaliza erro na Action se tag e pacote divergirem. Ela **não impede** que alguém crie manualmente uma tag/release via GitHub, portanto a revisão humana continua obrigatória.
5. Não alterar as tags antigas. Para a próxima release, escolher uma versão nova, única e documentada depois de analisar o histórico.

## Validação local
```bash
node scripts/check-release-version.cjs v0.2.0  # aceita na versão atual
node scripts/check-release-version.cjs v1.2.0  # rejeita (divergência)
```

Este projeto não afirma estar publicado no registro npm. Publicar ou alterar um release exige autorização explícita.
