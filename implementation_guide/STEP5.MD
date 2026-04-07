# STEP 5 — Projetos e home

## Objetivo
CRUD de projetos e listagem na página inicial (projetos onde o usuário é membro).

## Checklist

- [ ] Query de “meus projetos”: coleção group query ou lista de IDs (ver implementação: query por `members` com `collectionGroup` ou denormalização)
- [ ] Criar projeto: grava `projects` + `members/{owner}` como `owner`
- [ ] Cards com título, prazo do projeto, papel (owner/member)
- [ ] Adicionar membro por UID na tela do projeto (MVP)
- [ ] Navegação para `/projects/[id]`

## Critérios de pronto

- Novo projeto aparece na home para o criador.
- Membro adicionado vê o projeto na home após inclusão.

**Nota de implementação:** usar `collectionGroup('members')` com filtro `userId == auth.uid` exige índice composto; o app pode manter em paralelo `users/{uid}/projectIds` para listagem simples — escolha documentada no código.
