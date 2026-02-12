(function(){
  const toastEl = document.getElementById("toast");
  window.toast = function(msg){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>toastEl.classList.remove("show"), 3500);
  };

  // Config obrigatório
  if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY){
    toast("Config faltando: crie config.js baseado no config.example.js");
    throw new Error("Missing SUPABASE_URL / SUPABASE_ANON_KEY");
  }
  if(!window.supabase || !window.supabase.createClient){
    toast("Biblioteca do Supabase não carregou.");
    throw new Error("Supabase lib not loaded");
  }

  // Cliente global (reuso entre páginas)
  window.supabaseClient = window.sbClient || (window.sbClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  ));

  // Relógio (se existir)
  const clock = document.getElementById("clock");
  if(clock){
    const tick = ()=> clock.textContent = new Date().toLocaleString("pt-BR");
    tick();
    setInterval(tick, 1000);
  }
})();
