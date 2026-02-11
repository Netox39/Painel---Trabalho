# Painel (sem Google Sheets) — Supabase (Free)

Projeto simples de **painel web** com **login** e **abas** para organizar e gerenciar informações.  
Fiz este projeto para praticar **lógica de programação**, estruturação de dados e integração com **banco de dados** usando o plano free do Supabase.

## Estrutura do projeto

- `index.html` → tela de login  
- `app.html` → painel (telas/abas)  
- `config.js` → chaves do Supabase (criar a partir do `config.example.js`)  
- `supabase.sql` → criação das tabelas + regras de segurança  
- `app.js` → lógica das telas/abas (campos podem ser ajustados aqui)

## Como rodar (passo a passo)

1. Crie um projeto no **Supabase** (plano free).
2. No Supabase, vá em **SQL Editor** e execute o arquivo `supabase.sql`.
3. Em **Authentication → Providers**, deixe **Email** habilitado.  
   - (Opcional) desative **Confirm email** para login imediato.
4. Usuários:
   - Se `ALLOW_SIGNUP=true`, cada pessoa cria a conta pelo site.
   - Se `ALLOW_SIGNUP=false`, eu crio os usuários manualmente em **Authentication → Users**.
5. Configuração:
   - Copie `config.example.js` → `config.js`
   - Cole `SUPABASE_URL` e `SUPABASE_ANON_KEY` (em **Settings → API**)
6. Deploy no GitHub Pages:
   - Suba **todos os arquivos** para o repositório
   - Vá em **Settings → Pages** → selecione **Branch: main** / **root**
   - Acesse o link gerado

## Funcionalidades

- Login com e-mail e senha
- Abas com:
  - pesquisa e filtros por coluna
  - adicionar registros
  - editar/excluir com clique
  - exportação para CSV
