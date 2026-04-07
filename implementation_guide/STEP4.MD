# STEP 4 — Personas (agenda pessoal)

## Objetivo
CRUD em `users/{uid}/personas/{personaId}` com UI dedicada.

## Checklist

- [ ] Listagem com trecho das observações
- [ ] Criar / editar / excluir
- [ ] Campos: `displayName`, `notes`, timestamps, `colorKey` opcional
- [ ] Hook com `onSnapshot` + TanStack Query (chave `['personas', uid]`)
- [ ] Função utilitária para calcular `initials` a partir de `displayName`

## Critérios de pronto

- Dados isolados por usuário (outro login não vê a agenda).
- Operações refletem em tempo real entre abas.
