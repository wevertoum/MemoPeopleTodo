# STEP 6 — Tarefas e Kanban

## Objetivo
Tarefas por projeto com três colunas e vínculo a personas via snapshot denormalizado.

## Checklist

- [ ] `projects/{id}/tasks/{taskId}` com `status`: `todo` | `in_progress` | `done`
- [ ] `personaSnapshots: { personaId?, displayName, initials }[]` ao salvar vínculo
- [ ] UI Kanban: **A fazer**, **Em andamento**, **Concluído**
- [ ] Cartão: título, prazo, avatares (iniciais)
- [ ] Criar/editar/excluir tarefa; mudar status (select ou botão; DnD opcional)

## Critérios de pronto

- Membros do projeto veem as mesmas iniciais no cartão sem acessar a agenda de outrem.
- Mudança de coluna persiste e sincroniza entre clientes.
