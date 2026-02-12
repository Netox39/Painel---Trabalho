(function () {
  const $ = (id) => document.getElementById(id);

  function toast(msg){
    const t = $("toast");
    if(!t) return alert(msg);
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 2800);
  }

  function setMsg(text, isError=false){
    const el = $("msg");
    if(!el) return;
    el.textContent = text || "";
    el.style.color = isError ? "rgba(255,160,160,.95)" : "rgba(180,220,255,.95)";
  }

  function getCfg(){
    // compatível com vários formatos de config.js
    const url = window.SUPABASE_URL || window.supabaseUrl || (window.CONFIG && window.CONFIG.SUPABASE_URL) || "";
    const key = window.SUPABASE_ANON_KEY || window.supabaseAnonKey || (window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY) || "";
    return { url, key };
  }

  const cfg = getCfg();
  if(!cfg.url || !cfg.key){
    setMsg("Configuração do Supabase não encontrada. Verifique o config.js (SUPABASE_URL e SUPABASE_ANON_KEY).", true);
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.key);
  window.supabaseClient = client; // o app.js usa isso

  // Modal helpers
  const backdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalBody = $("modalBody");
  const modalFoot = $("modalFoot");
  const closeBtn = $("modalClose");

  function openModal(title, bodyHtml, footHtml){
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFoot.innerHTML = footHtml;
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden","false");
  }
  function closeModal(){
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden","true");
  }
  closeBtn && (closeBtn.onclick = closeModal);
  backdrop && backdrop.addEventListener("click",(e)=>{ if(e.target===backdrop) closeModal(); });

  // Se já estiver logado
  client.auth.getSession().then(({data})=>{
    if(data?.session){ location.href = "app.html"; }
  });

  // Login (Enter via submit do form)
  $("loginForm")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      setMsg("");
      const email = ($("email").value || "").trim();
      const password = ($("password").value || "").trim();
      if(!email || !password) return setMsg("Informe e-mail e senha.", true);

      const { error } = await client.auth.signInWithPassword({ email, password });
      if(error) throw error;

      toast("Bem-vindo!");
      location.href = "app.html";
    }catch(err){
      setMsg(err?.message || "Erro ao entrar.", true);
    }
  });

  // Criar conta (modal)
  $("signupBtn")?.addEventListener("click", ()=>{
    openModal(
      "Criar conta",
      `
        <div class="note">Crie seu usuário para acessar o painel.</div>
        <div class="grid" style="margin-top:12px">
          <div>
            <label class="note">E-mail</label>
            <input class="input" id="su_email" type="email" placeholder="nome@exemplo.com" autocomplete="email" />
          </div>
          <div>
            <label class="note">Senha</label>
            <input class="input" id="su_pass" type="password" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <div>
            <label class="note">Confirmar senha</label>
            <input class="input" id="su_pass2" type="password" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <div class="note" id="su_msg" style="min-height:18px"></div>
        </div>
      `,
      `
        <button class="btn" id="su_cancel" type="button">Cancelar</button>
        <button class="btn primary" id="su_create" type="button">Criar conta</button>
      `
    );

    document.getElementById("su_cancel").onclick = closeModal;
    document.getElementById("su_create").onclick = async ()=>{
      const msg = document.getElementById("su_msg");
      const email = (document.getElementById("su_email").value || "").trim();
      const pass = (document.getElementById("su_pass").value || "").trim();
      const pass2 = (document.getElementById("su_pass2").value || "").trim();

      msg.textContent = "";
      msg.style.color = "rgba(180,220,255,.95)";

      if(!email || !pass) { msg.textContent = "Informe e-mail e senha."; msg.style.color="rgba(255,160,160,.95)"; return; }
      if(pass.length < 6) { msg.textContent = "A senha deve ter pelo menos 6 caracteres."; msg.style.color="rgba(255,160,160,.95)"; return; }
      if(pass !== pass2) { msg.textContent = "As senhas não conferem."; msg.style.color="rgba(255,160,160,.95)"; return; }

      try{
        const { error } = await client.auth.signUp({ email, password: pass });
        if(error) throw error;

        msg.textContent = "Conta criada! Se o Supabase exigir confirmação por e-mail, verifique sua caixa de entrada.";
        toast("Conta criada!");
      }catch(err){
        msg.textContent = err?.message || "Erro ao criar conta.";
        msg.style.color="rgba(255,160,160,.95)";
      }
    };
  });

  // Esqueci a senha (modal)
  $("resetBtn")?.addEventListener("click", ()=>{
    const redirectTo = location.origin + location.pathname.replace(/index\.html$/,'') + "reset.html";

    openModal(
      "Esqueci a senha",
      `
        <div class="note">Informe seu e-mail. Você receberá um link para redefinir a senha.</div>
        <div class="grid" style="margin-top:12px">
          <div>
            <label class="note">E-mail</label>
            <input class="input" id="rs_email" type="email" placeholder="nome@exemplo.com" autocomplete="email" />
          </div>
          <div class="note" id="rs_msg" style="min-height:18px"></div>
        </div>
      `,
      `
        <button class="btn" id="rs_cancel" type="button">Cancelar</button>
        <button class="btn primary" id="rs_send" type="button">Enviar link</button>
      `
    );

    document.getElementById("rs_cancel").onclick = closeModal;
    document.getElementById("rs_send").onclick = async ()=>{
      const msg = document.getElementById("rs_msg");
      const email = (document.getElementById("rs_email").value || "").trim();
      msg.textContent = "";
      msg.style.color = "rgba(180,220,255,.95)";

      if(!email) { msg.textContent = "Informe seu e-mail."; msg.style.color="rgba(255,160,160,.95)"; return; }

      try{
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if(error) throw error;

        msg.textContent = "Link enviado! Verifique seu e-mail (e spam).";
        toast("Link de reset enviado!");
      }catch(err){
        msg.textContent = err?.message || "Erro ao enviar link.";
        msg.style.color="rgba(255,160,160,.95)";
      }
    };
  });

})();
