(function(){
  const toastEl = document.getElementById("toast");
  window.toast = function(msg){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>toastEl.classList.remove("show"), 3800);
  };

  if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY){
    toast("Config faltando: crie config.js baseado no config.example.js");
    throw new Error("Missing SUPABASE_URL / SUPABASE_ANON_KEY");
  }
  window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();

(async function(){
  if(!document.getElementById("loginBtn")) return;
  const client = window.supabaseClient;
  const msg = document.getElementById("msg");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const resetBtn = document.getElementById("resetBtn");

  const allow = window.ALLOW_SIGNUP !== false;
  signupBtn.style.display = allow ? "inline-block" : "none";

  const { data: { session } } = await client.auth.getSession();
  if(session){ location.href = "app.html"; return; }

  loginBtn.onclick = async () => {
    msg.textContent = "";
    const { error } = await client.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    });
    if(error){ msg.textContent = error.message; toast(error.message); return; }
    toast("Login OK!");
    location.href = "app.html";
  };

  signupBtn.onclick = async () => {
    msg.textContent = "";
    const { error } = await client.auth.signUp({
      email: email.value.trim(),
      password: password.value
    });
    if(error){ msg.textContent = error.message; toast(error.message); return; }
    msg.textContent = "Conta criada. Se a confirmação por e-mail estiver ligada, verifique sua caixa de entrada.";
    toast("Conta criada!");
  };

  resetBtn.onclick = async () => {
    msg.textContent = "";
    const em = email.value.trim();
    if(!em){ msg.textContent = "Digite seu e-mail para receber o link de recuperação."; return; }
    const { error } = await client.auth.resetPasswordForEmail(em, { redirectTo: location.href });
    if(error){ msg.textContent = error.message; toast(error.message); return; }
    msg.textContent = "Se o e-mail existir, você receberá um link de recuperação.";
    toast("Pedido enviado");
  };
})();
