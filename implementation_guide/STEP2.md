# STEP 2 — Autenticação Firebase

## Objetivo
Login e cadastro com e-mail/senha; sessão no cliente; rotas protegidas.

## Checklist

- [ ] Cliente Firebase (`lib/firebase.ts`) com Auth
- [ ] Provedor de contexto `AuthProvider` + `useAuth()` (listener `onAuthStateChanged`)
- [ ] Páginas `/login` e `/register` com mensagens de erro em português
- [ ] Layout autenticado redireciona anônimos para `/login`
- [ ] Páginas públicas redirecionam usuários logados para `/projects`

## Critérios de pronto

- Criar conta e entrar funciona contra o projeto Firebase real (variáveis corretas).
- Atualizar a página mantém sessão.
- Acesso direto a `/projects` sem login → `/login`.
