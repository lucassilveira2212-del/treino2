# CICLO — Painel de Treino

App de acompanhamento do bulking de 26 semanas (Upper A / Lower A / Upper B / Lower B),
com periodização automática de RPE/reps por mesociclo e controle de peso corporal.

100% estático (HTML/CSS/JS puro) — não precisa de servidor, banco de dados ou build.
Os dados ficam salvos no navegador (localStorage). Use "Ajustes → Exportar backup"
regularmente para não perder o histórico se trocar de navegador/celular.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser privado ou público).
2. Suba estes arquivos para a raiz do repositório:
   - `index.html`
   - `styles.css`
   - `data.js`
   - `storage.js`
   - `app.js`
3. No repositório, vá em **Settings → Pages**.
4. Em "Source", selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
5. Clique em **Save**. Em 1-2 minutos o GitHub te dá um link tipo:
   `https://seu-usuario.github.io/nome-do-repo/`
6. Abra esse link no celular e adicione à tela inicial (Safari/Chrome → "Adicionar à tela de início") para usar como se fosse um app.

## Primeira configuração

Ao abrir pela primeira vez, o app já assume que a "Semana 1" começou na segunda-feira mais
recente. Se quiser ajustar, vá em **Ajustes → Data de início** e defina a segunda-feira
exata em que você começou (ou vai começar) o ciclo.

Se algum dia você pular semanas (viagem, doença, etc.) e não quiser que o app avance
sozinho, use **Ajustes → Forçar semana manualmente**.

## Estrutura dos arquivos

- `data.js` — todos os exercícios, séries de descanso e a tabela de progressão de RPE/reps por semana do mesociclo (a mesma lógica da planilha original).
- `storage.js` — camada de persistência (localStorage) e exportação/importação de backup em JSON.
- `app.js` — renderização das telas e interações (a "lógica do app" propriamente dita).
- `styles.css` — identidade visual (dashboard escuro, trilho de semanas estilo anilhas de barra).
- `index.html` — estrutura da página e navegação.

## Limitações importantes (por ser 100% estático)

- **Sem login/nuvem**: os dados existem só no navegador onde você usa o app. Trocar de
  celular ou limpar o cache do navegador apaga tudo — por isso o backup em JSON existe.
- **Sem sincronização entre dispositivos** automaticamente. Se quiser usar no celular e
  no computador, exporte no um e importe no outro.
- Se no futuro você quiser sincronização real entre aparelhos, isso exigiria adicionar um
  backend (ex: Firebase, Supabase) — o GitHub Pages sozinho não hospeda banco de dados.
