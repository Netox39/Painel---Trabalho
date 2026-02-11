PAINEL (SEM GOOGLE SHEETS) — SUPABASE FREE

ARQUIVOS IMPORTANTES:
- index.html  -> login
- app.html    -> painel
- config.js   -> suas chaves (você cria a partir do config.example.js)
- supabase.sql-> cria as tabelas + segurança
- app.js      -> telas/abas (campos podem ser alterados aqui)

PASSO A PASSO:
1) Crie um projeto no Supabase (plano free).
2) No Supabase: SQL Editor -> rode supabase.sql.
3) Authentication -> Providers -> Email (habilitado).
   (Opcional) desative "Confirm email" para login imediato.
4) Usuários:
   - Se ALLOW_SIGNUP=true, cada pessoa cria conta pelo site.
   - Se ALLOW_SIGNUP=false, você cria os usuários no painel (Authentication -> Users).

5) Config:
   - Copie config.example.js -> config.js
   - Cole SUPABASE_URL e SUPABASE_ANON_KEY (Settings -> API)

6) Deploy GitHub Pages:
   - Suba TODOS os arquivos para o repositório
   - Settings -> Pages -> Branch main / root
   - Acesse o link do site

USO:
- Login com e-mail e senha
- Cada aba: pesquisar, filtrar por coluna, adicionar, clicar para editar/excluir, exportar CSV
