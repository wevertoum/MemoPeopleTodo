# STEP 7 — Calendário in-app

## Objetivo
Visão de calendário com prazos das tarefas (e opcionalmente do projeto).

## Checklist

- [ ] Agregar tarefas com `dueDate` de todos os projetos do usuário (membro)
- [ ] Página `/calendar` com visão mensal (grade por dia + links para o projeto; implementação atual sem dependência externa de calendário)
- [ ] Clique em evento navega para o projeto/tarefa quando possível
- [ ] TanStack Query + snapshots ou fetch agregado

## Critérios de pronto

- Tarefa com prazo aparece na data correta após criar/editar.
- Nenhuma fuga de dados: só projetos onde o usuário é `member`.
