<br /><br />

## Disciplina

**Projeto Integrador III-B**

<br />

A Pontifícia Universidade Católica de Goiás apresenta o(s) estudante(s) abaixo relacionados, vinculados à Escola Politécnica e de Artes, ao curso **Tecnologia em Análise e Desenv. de Sistemas**,

<br />

**Aluno:** Weverton Ferreira Rodrigues

<br /><br />

**Título do trabalho:** _MemoPeopleTodo — Gestão simples de tarefas e personas_

<br />

Local: Goiânia · Data: abril de 2026

<div style="page-break-before: always;" />

# 1. Caracterização da organização parceira

A organização parceira deste projeto é a **Adobe Incorporadora**, empresa do setor de construção civil com atuação no estado de Goiás. A empresa se posiciona com foco em imóveis que integram design, funcionalidade e padrão de qualidade, mantendo presença institucional ativa em canais digitais e relacionamento direto com clientes e prestadores de serviço.

No contexto do projeto, o parceiro Wagner Wisley atua na gestão administrativa e no acompanhamento de atividades relacionadas ao andamento das obras. Essa rotina envolve comunicação constante com diferentes perfis profissionais, como empreiteiros, pedreiros, engenheiros e demais prestadores. A dinâmica de trabalho é intensa e depende de organização diária de tarefas, prazos e contatos.

Esse cenário caracteriza uma necessidade real de apoio tecnológico para organizar demandas de execução, reduzir retrabalho e consolidar informações relevantes para tomada de decisão no cotidiano operacional.

# 2. Contexto extensionista e problema identificado

O contexto extensionista deste trabalho está associado à melhoria de processos organizacionais em uma empresa parceira real, com impacto direto na eficiência do acompanhamento de projetos internos de obra. A proposta dialoga com a extensão universitária ao aplicar conhecimentos técnicos em uma demanda concreta da comunidade produtiva local.

Durante o levantamento inicial, foi identificado que parte significativa do controle operacional ocorre de forma manual, incluindo o registro de nomes e observações de pessoas envolvidas nas atividades. Atualmente, há uso de agenda em papel para anotar informações como identificação de profissionais, local de atuação e observações de contexto.

As principais dificuldades observadas foram:

- esquecimento recorrente de nomes de prestadores e perda de contexto sobre quem é cada pessoa;
- dispersão de informações entre anotações manuais e memória do gestor;
- dificuldade de acompanhar tarefas e prazos por projeto de maneira visual e centralizada;
- risco de atraso e retrabalho por falta de rastreabilidade das atividades.

Diante desse diagnóstico, o **MemoPeopleTodo** é proposto como solução de apoio à gestão cotidiana, centralizando tarefas e personas em ambiente digital único.

<div style="page-break-before: always;" />

# 3. Coleta de requisitos (entrevista semiestruturada)

A coleta de requisitos foi realizada por meio de entrevista semiestruturada com o parceiro **Wagner Wisley**, com foco em compreender rotinas, dores operacionais e expectativas de melhoria.

## 3.1 Identificação da entrevista

**Entrevistado:** Wagner Wisley  
**Perfil:** Administrador no contexto da Adobe Incorporadora  
**Objetivo da entrevista:** identificar requisitos do sistema para gestão de tarefas e personas, com ênfase em prazos, acompanhamento de obras e organização de contatos.

## 3.2 Roteiro aplicado

1. Como você organiza hoje as atividades e tarefas dos projetos?
2. Quais dificuldades mais impactam seu dia a dia de acompanhamento?
3. Como você registra os nomes e informações dos prestadores de serviço?
4. Quais problemas ocorrem por causa da organização atual?
5. Que funcionalidades seriam essenciais em uma ferramenta simples?
6. Como você gostaria de visualizar prazos e andamento das tarefas?
7. O que faria a solução realmente útil para sua rotina?

## 3.3 Respostas consolidadas da entrevista

**1) Organização atual**  
Controle majoritariamente manual, com anotações distribuídas e sem painel único de acompanhamento.

**2) Dificuldades principais**  
Perda de visão geral das atividades, dificuldade de priorização e de acompanhamento contínuo dos prazos.

**3) Registro de pessoas**  
Uso de agenda em papel para anotar nomes e observações (função, local de atuação e contexto).

**4) Problemas gerados**  
Esquecimento de nomes, retrabalho de comunicação, perda de contexto e atrasos por falta de rastreabilidade.

**5) Funcionalidades essenciais**  
Projetos, tarefas, prazos e visualização em Kanban simples com status claros.

**6) Visualização desejada**  
Quadro com colunas “A fazer”, “Em andamento” e “Concluído”, além de calendário de vencimentos.

**7) Critério de utilidade prática**  
Conseguir relacionar rapidamente pessoas às tarefas, inclusive por iniciais no card, para lembrar quem está envolvido.

<div style="page-break-before: always;" />

## 3.4 Requisitos levantados a partir da entrevista

- autenticação de usuário para acesso controlado;
- cadastro e manutenção de projetos com prazos;
- criação e acompanhamento de tarefas por projeto;
- quadro Kanban com colunas “A fazer”, “Em andamento” e “Concluído”;
- cadastro separado de personas (agenda pessoal) com observações;
- vínculo de personas em tarefas com exibição por iniciais;
- visão de calendário para acompanhamento de entregas e vencimentos.

# 4. Objetivos da solução proposta

## 4.1 Objetivo geral

Desenvolver uma solução digital simples para apoiar a gestão de projetos e tarefas da organização parceira, incorporando uma agenda de personas para reduzir esquecimentos de nomes e melhorar o contexto das interações operacionais.

## 4.2 Objetivos específicos

- centralizar projetos, tarefas e prazos em um único ambiente;
- oferecer visualização Kanban para acompanhamento do fluxo de trabalho;
- permitir registro estruturado de personas com observações relevantes;
- associar personas às tarefas para facilitar identificação dos envolvidos;
- fornecer visão de calendário para monitoramento de prazos e entregas.

<div style="page-break-before: always;" />

# 5. Público beneficiado e impactos esperados

O público beneficiado direto é composto por Wagner Wisley e demais colaboradores envolvidos na coordenação administrativa e operacional das obras. Indiretamente, prestadores de serviço e equipes de apoio também se beneficiam por meio de comunicação mais clara e melhor organização das demandas.

Impactos esperados:

- melhoria na organização das tarefas e redução de esquecimentos;
- ganho de produtividade na coordenação de atividades;
- maior clareza sobre responsáveis e envolvidos em cada entrega;
- diminuição de retrabalho por informação dispersa;
- aumento da previsibilidade no cumprimento de prazos.

# 6. Escopo funcional e não funcional (nível documental)

## 6.1 Requisitos funcionais mínimos

- cadastro e autenticação de usuários;
- criação de projetos com prazos e membros;
- criação, atribuição, acompanhamento e conclusão de tarefas;
- visualização de tarefas em quadro Kanban com 3 colunas fixas;
- integração com calendário para prazos e entregas;
- CRUD de personas como agenda pessoal;
- vínculo de personas às tarefas com exibição de iniciais.

## 6.2 Requisitos não funcionais (documentados)

- interface simples e objetiva para uso diário;
- usabilidade voltada para rápida identificação de tarefas e pessoas;
- armazenamento em nuvem para persistência dos dados;
- controle de acesso por autenticação;
- linguagem visual consistente para facilitar adoção pelo usuário final.

<div style="page-break-before: always;" />

# 7. Síntese estruturada de requisitos

## 7.1 Requisitos funcionais codificados

- RF01: Permitir cadastro e autenticação de usuários para acesso ao sistema.
- RF02: Permitir criação e gestão de projetos com definição de prazo.
- RF03: Permitir criação, edição, atribuição e conclusão de tarefas por projeto.
- RF04: Exibir tarefas em quadro Kanban com colunas “A fazer”, “Em andamento” e “Concluído”.
- RF05: Permitir cadastro, edição e exclusão de personas em agenda pessoal.
- RF06: Permitir vincular uma ou mais personas a cada tarefa.
- RF07: Exibir no card da tarefa as iniciais das personas vinculadas.
- RF08: Disponibilizar visualização em calendário para acompanhamento de prazos e entregas.

## 7.2 Requisitos não funcionais codificados

- RNF01: Interface simples, com foco em rapidez de uso no cotidiano operacional.
- RNF02: Fluxo de navegação objetivo, com baixa curva de aprendizado.
- RNF03: Persistência de dados em nuvem para acesso contínuo e organizado.
- RNF04: Controle de acesso por autenticação individual.
- RNF05: Clareza visual na identificação de status de tarefas e pessoas envolvidas.

## 7.3 Regras de negócio documentadas

- RN01: Toda tarefa deve pertencer a um projeto.
- RN02: Toda tarefa deve possuir status único entre “A fazer”, “Em andamento” e “Concluído”.
- RN03: Uma persona pode ser vinculada a várias tarefas.
- RN04: O cadastro de personas deve permitir observações contextuais (ex.: função e local).
- RN05: Prazos de projeto e tarefa devem ser apresentados em visualização de calendário.

## 7.4 Critérios de aceite documentais

- O relatório principal descreve o problema real da organização parceira.
- A entrevista com Wagner Wisley está registrada como evidência de coleta.
- Os requisitos mínimos obrigatórios estão mapeados de forma explícita.
- O material está preparado para exportação em PDF com paginação controlada.

<div style="page-break-before: always;" />

# 8. Organização do projeto no Trello

Para apoiar a organização das etapas e atividades do projeto, foi utilizado um quadro no Trello como ferramenta de acompanhamento.

Link do quadro: [MemoPeopleTodo no Trello](https://trello.com/invite/b/69d51cd6a0c63401523c831e/ATTI9587cf2779f1572c852f8e486f6cd3d1D2C4A662/memopeopletodo)

![Print do quadro Trello do projeto](./board_trello.png)

# 9. Acesso à aplicação em produção

O deploy da aplicação está disponível publicamente em:

[https://memo-people-todo.vercel.app/](https://memo-people-todo.vercel.app/)

Para fins de avaliação docente, pode ser utilizada a seguinte conta de demonstração:

- **E-mail:** thalles@pucgoias.edu.br
- **Senha:** 12345678
