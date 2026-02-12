(function(){
  const $=(id)=>document.getElementById(id);

  function setMsg(text,isErr=false){
    const el=$("msg"); if(!el) return;
    el.textContent=text||"";
    el.style.color=isErr?"rgba(255,160,160,.95)":"rgba(180,220,255,.95)";
  }

  function getCfg(){
    const url = window.SUPABASE_URL || window.supabaseUrl || (window.CONFIG && window.CONFIG.SUPABASE_URL) || "";
    const key = window.SUPABASE_ANON_KEY || window.supabaseAnonKey || (window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY) || "";
    return { url, key };
  }

  const cfg=getCfg();
  if(!cfg.url || !cfg.key){
    setMsg("config.js não encontrado / sem SUPABASE_URL e SUPABASE_ANON_KEY.", true);
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.key);
  window.supabaseClient = client;

  // Modal helpers
  const backdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalBody  = $("modalBody");
  const modalFoot  = $("modalFoot");

  function openModal(title, bodyHtml, footHtml){
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFoot.innerHTML = footHtml;
    backdrop.style.display="flex";
  }
  function closeModal(){ backdrop.style.display="none"; }

  $("modalClose")?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click",(e)=>{ if(e.target===backdrop) closeModal(); });

  // ENTER funciona via submit do form
  $("loginForm")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      setMsg("");
      const email=($("email").value||"").trim();
      const password=($("password").value||"").trim();
      if(!email||!password) return setMsg("Informe e-mail e senha.", true);

      const { error } = await client.auth.signInWithPassword({ email, password });
      if(error) throw error;

      location.href="app.html";
    }catch(err){
      setMsg(err?.message || "Erro ao entrar.", true);
    }
  });

  // Criar conta
  $("signupBtn")?.addEventListener("click", ()=>{
    openModal("Criar conta",
      `
      <div class="note">Crie seu usuário para acessar o painel.</div>
      <div class="grid" style="margin-top:12px">
        <div><label class="note">E-mail</label><input class="input" id="su_email" type="email"></div>
        <div><label class="note">Senha</label><input class="input" id="su_pass" type="password"></div>
        <div><label class="note">Confirmar senha</label><input class="input" id="su_pass2" type="password"></div>
        <div class="note" id="su_msg" style="min-height:18px"></div>
      </div>
      `,
      `
      <button class="btn" id="su_cancel" type="button">Cancelar</button>
      <button class="btn primary" id="su_create" type="button">Criar conta</button>
      `
    );

    $("su_cancel").onclick = closeModal;
    $("su_create").onclick = async ()=>{
      const msg=$("su_msg");
      const email=($("su_email").value||"").trim();
      const pass=($("su_pass").value||"").trim();
      const pass2=($("su_pass2").value||"").trim();
      msg.textContent="";

      if(!email||!pass){ msg.textContent="Informe e-mail e senha."; return; }
      if(pass.length<6){ msg.textContent="Senha mínimo 6 caracteres."; return; }
      if(pass!==pass2){ msg.textContent="As senhas não conferem."; return; }

      const { error } = await client.auth.signUp({ email, password: pass });
      msg.textContent = error ? error.message : "Conta criada! (se exigir confirmação, verifique seu e-mail)";
    };
  });

  // Esqueci a senha (envia e-mail)
  $("resetBtn")?.addEventListener("click", ()=>{
    const base = location.href.replace(/index\.html.*$/,"");
    const redirectTo = base + "reset.html";

    openModal("Esqueci a senha",
      `
      <div class="note">Informe seu e-mail. Você receberá um link para redefinir a senha.</div>
      <div class="grid" style="margin-top:12px">
        <div><label class="note">E-mail</label><input class="input" id="rs_email" type="email"></div>
        <div class="note" id="rs_msg" style="min-height:18px"></div>
      </div>
      `,
      `
      <button class="btn" id="rs_cancel" type="button">Cancelar</button>
      <button class="btn primary" id="rs_send" type="button">Enviar link</button>
      `
    );

    $("rs_cancel").onclick = closeModal;
    $("rs_send").onclick = async ()=>{
      const msg=$("rs_msg");
      const email=($("rs_email").value||"").trim();
      if(!email){ msg.textContent="Informe seu e-mail."; return; }

      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      msg.textContent = error ? error.message : "Link enviado! Verifique seu e-mail (e spam).";
    };
  });
})();
