# STEP 3 — Firestore: modelo multi-usuário e regras

## Objetivo
Esquema de coleções, subcoleções `members` e `tasks`, regras de segurança e arquivo de índices sugeridos.

## Checklist

- [ ] Documentos `users/{uid}` criados/atualizados no primeiro login (perfil mínimo)
- [ ] `projects/{id}` com `ownerId`, prazos e metadados
- [ ] `projects/{id}/members/{userId}` com `role`: `owner` | `member`
- [ ] Fluxo mínimo de membro: adicionar por **UID** (MVP acadêmico)
- [ ] Arquivo `firestore.rules` versionado na raiz do app ou repo
- [ ] `firestore.indexes.json` se queries compostas forem necessárias
- [ ] Deploy ou instruções de colar regras no Console Firebase

## Critérios de pronto

- Usuário A cria projeto; aparece em `members` como `owner`.
- Usuário B (membro) lê projeto e tarefas; não lê `personas` de outro usuário.
- Tentativa de escrita fora das regras é rejeitada (teste manual no console ou emulator).
