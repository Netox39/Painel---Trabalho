# Painel — GitHub Pages (Painel---Trabalho)

## 1) Subir arquivos no GitHub
Suba TODOS os arquivos desta pasta na raiz do repositório.

**Importante:** no GitHub Pages, o `config.js` precisa existir no site.
Por isso este pacote já inclui `config.js` (você deve preencher as chaves e commitar).

## 2) Configurar GitHub Pages
GitHub > Settings > Pages:
- Source: Deploy from a branch
- Branch: `main` (ou `master`) / folder: `/ (root)`

A URL final ficará:
`https://netox39.github.io/Painel---Trabalho/`

## 3) Configurar Supabase
### Auth
Supabase > Authentication > Providers:
- habilite **Email** (Email/Password)

Supabase > Authentication > URL Configuration:
- Site URL: `https://netox39.github.io`
- Redirect URLs (adicione):
  - `https://netox39.github.io/Painel---Trabalho/reset.html`

### Banco
Rode o arquivo `supabase.sql` no Supabase > SQL Editor.

## 4) Como funciona
- `index.html`: login (Entrar) e botões que abrem em nova aba:
  - `signup.html` (Criar conta)
  - `forgot.html` (Esqueci a senha)
- `dashboard.html`: painel
- `reset.html`: redefine senha (aberto pelo link do e-mail)

## Dica de cache
Quando subir arquivos novos, teste em janela anônima ou usando Ctrl+F5.
