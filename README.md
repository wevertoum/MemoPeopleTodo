# MemoPeopleTodo

Aplicação web para **projetos colaborativos**, **quadro Kanban de tarefas**, **agenda pessoal de personas** (contatos com notas privadas) e **visão em calendário** dos prazos. Autenticação e dados usam **Firebase Authentication** e **Cloud Firestore**; há rotas de API no Next.js que usam **Firebase Admin** para listar/criar usuários no Authentication.

## Stack

- **Next.js** (App Router), **React**, **TypeScript**
- **Tailwind CSS**
- **TanStack React Query** (cache e listeners em tempo real onde aplicável)
- **Firebase** (cliente web + Admin no servidor)
- **date-fns** (datas e calendário em português)

## Como rodar localmente

1. Instale dependências: `npm install`
2. Copie `.env.local.example` para `.env.local` e preencha as variáveis `NEXT_PUBLIC_FIREBASE_*` com o config do projeto no Firebase Console.
3. Para a página **Usuários** e a busca de membros no projeto (integração com Authentication via servidor), configure `FIREBASE_SERVICE_ACCOUNT_JSON` conforme o exemplo no arquivo de ambiente.
4. Opcional: `ADMIN_UIDS` — lista de UIDs (separados por vírgula) autorizados a usar as rotas admin; se vazio, qualquer usuário autenticado pode chamar essas APIs (use com cuidado em produção).
5. Publique os índices do Firestore se ainda não estiverem no projeto: `npm run deploy:firestore` (inclui override de **collection group** em `members` / campo `userId`, usado pelo calendário).
6. Desenvolvimento: `npm run dev`

## Funcionalidades (o que está implementado)

### Autenticação e perfil

- **Cadastro** (`/register`): e-mail, senha (mínimo 6 caracteres) e nome; atualiza o perfil no Firebase Auth e cria documento em `users/{uid}` na primeira sessão (se ainda não existir), com `displayName`, `email`, `photoURL` e `createdAt`.
- **Login** (`/login`): e-mail e senha; mensagens de erro mapeadas para português.
- **Sessão**: `AuthProvider` escuta o estado de autenticação; rotas autenticadas ficam protegidas por `AuthGuard` (redireciona para `/login` se não houver usuário).
- **Logout** no cabeçalho da área logada.
- **Página inicial** (`/`): redireciona para `/projects` se logado, senão para `/login`.

### Navegação (área autenticada)

Cabeçalho com links: **Projetos**, **Agenda** (personas), **Calendário**, **Usuários**, além do e-mail do usuário e botão **Sair**.

### Projetos

- **Lista** (`/projects`): mostra projetos em que o usuário é **membro** (subcoleção `members`), com papel **Dono** ou **Membro** e, se houver, descrição e prazo do projeto.
- **Criar projeto**: título obrigatório; descrição e prazo opcionais; o criador vira **owner** no documento do projeto e recebe documento em `projects/{id}/members/{uid}` com papel `owner`.
- **Detalhe** (`/projects/[id]`): título, descrição, prazo; se o usuário não for membro, exibe aviso de sem acesso.

### Quadro Kanban e tarefas

No detalhe do projeto:

- Três colunas: **A fazer**, **Em andamento**, **Concluído** (`todo`, `in_progress`, `done`).
- **Nova tarefa** / **Editar** (modal): título, descrição, prazo opcional, status e **personas da sua agenda** (múltipla escolha). Ao salvar, grava **snapshots** das personas (nome, iniciais, `colorKey`) para os outros membros verem só o essencial nas tarefas.
- **Mover tarefa**: select na carta ou mudança implícita ao organizar por coluna; ao marcar como concluída, preenche `completedAt`.
- **Excluir tarefa** (com confirmação).

Nota de modelo: o tipo `Task` prevê `assigneeUserId`, mas a UI atual não expõe atribuição a usuário — fica `null` nas criações pela interface.

### Membros do projeto

- **Dono do projeto** (papel `owner` em `members`): bloco para **adicionar membro** via busca entre usuários do Firebase Authentication (componente que consome a API admin).
- Novo membro recebe papel em `projects/{id}/members/{uid}` com `role: member`, `invitedBy` e `joinedAt`.
- **Remoção de membros**: apenas o **dono registrado em `project.ownerId`** pode remover; não é possível remover o dono. Lista mostra nome/e-mail resolvido pela API quando possível, papel, data de entrada e botão para remover quando aplicável.

### Agenda (personas)

- Rota **`/personas`** (rótulo no menu: **Agenda**).
- Personas ficam em `users/{uid}/personas/{personaId}` — **privadas ao usuário**.
- **CRUD**: criar com nome e observações; ao criar, sorteia `colorKey` para avatar; editar e excluir (com confirmação).
- Uso nas tarefas: vínculo por checkboxes no formulário da tarefa; nos cards, **iniciais e cores**; clique abre modal com **notas completas** quem tem a persona na própria agenda, ou mensagem explicando visibilidade limitada para outros.

### Calendário

- Rota **`/calendar`**: grade mensal (semana começando no domingo).
- Agrega **tarefas com `dueDate`** de **todos os projetos** em que o usuário participa (via `collectionGroup` em `members` + listeners por projeto).
- Cada item linka para o projeto correspondente; navegação mês anterior/próximo.

### Usuários (administração de contas)

- Rota **`/users`**: destinada a **criar** usuários no Firebase Authentication (e-mail + senha) via `POST /api/admin/auth-users` e **listar** usuários existentes via `GET`.
- Requer **Firebase Admin** configurado no servidor; sem isso as chamadas retornam erro indicando falta de credencial.
- Lista exibe e-mail, nome (se houver) e UID.

### APIs de servidor relacionadas

- **`GET /api/admin/auth-users`**: lista usuários ou filtra por `q` (e-mail, nome ou UID).
- **`POST /api/admin/auth-users`**: cria usuário com e-mail e senha.
- **`POST /api/admin/auth-users/resolve`**: resolve perfis por lista de UIDs (usado para exibir membros no projeto).

Todas exigem header `Authorization: Bearer <ID token do Firebase>` e passam por `verifyAdminCaller` (token válido + opcionalmente `ADMIN_UIDS`).

## Modelo de dados (Firestore — visão resumida)

| Caminho                        | Conteúdo principal                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{uid}`                  | Perfil: `displayName`, `email`, `photoURL`, `createdAt`                                                                                        |
| `users/{uid}/personas/{id}`    | Persona: `displayName`, `notes`, `colorKey`, timestamps                                                                                        |
| `projects/{id}`                | Projeto: `title`, `description`, `ownerId`, `startDate`, `dueDate`, timestamps                                                                 |
| `projects/{id}/members/{uid}`  | `userId`, `role` (`owner` \| `member`), `joinedAt`, `invitedBy`                                                                                |
| `projects/{id}/tasks/{taskId}` | Tarefa: `title`, `description`, `status`, `dueDate`, `personaSnapshots`, `createdBy`, `assigneeUserId`, `sortOrder`, timestamps, `completedAt` |

## Scripts úteis

- `npm run dev` — desenvolvimento
- `npm run build` / `npm run start` — produção
- `npm run lint` — ESLint
- `npm run deploy:firestore` — regras e índices do Firestore no projeto configurado no Firebase CLI
