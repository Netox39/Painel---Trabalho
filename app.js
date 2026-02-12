const client = window.supabaseClient;

// ===== UI: inputs mais escuros + gaveta TI =====
(function injectUiTweaks(){
  const css = `
    .input{
      background: rgba(0,0,0,.35) !important;
      border-color: rgba(255,255,255,.12) !important;
      color: rgba(255,255,255,.92) !important;
    }
    .input::placeholder{ color: rgba(255,255,255,.55) !important; }
    select.input option{ background:#0b1220; color: rgba(255,255,255,.92); }

    .drawerWrap{ margin-top:10px; }
    .drawerToggle{
      width:100%;
      cursor:pointer;
      padding:10px 12px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.10);
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.92);
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      user-select:none;
    }
    .drawerBody{
      overflow:hidden;
      max-height:0;
      opacity:0;
      transform: translateY(-6px);
      transition: max-height .35s ease, opacity .25s ease, transform .35s ease;
      will-change: max-height, opacity, transform;
      margin-top:10px;
      display:flex;
      flex-direction:column;
      gap:10px;
    }
    .drawerWrap.open .drawerBody{
      opacity:1;
      transform: translateY(0);
    }

  `;
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
})();

// ===== FIX: ajusta a altura real da toolbar para o sticky do cabeçalho =====
function updateToolbarHeightVar(){
  try{
    const tb = document.querySelector("#panel .toolbar");
    if(!tb) return;
    const h = Math.ceil(tb.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--toolbar-h", h + "px");
  }catch(e){}
}
window.addEventListener("resize", ()=>{ updateToolbarHeightVar(); });

// chame após renderizar a toolbar/tabela

const TABS = [
  {
    key: "inventario",
    name: "Controle de Inventário",
    table: "inventario",
    badge: "Inventário",
    subtitle: "Cadastre equipamentos e filtre por andar, setor, patrimônio, responsável, observações e status.",
    columns: [
      { key:"codigo", label:"Código", type:"text", required:true },
      { key:"andar", label:"Andar", type:"select", options:["Térreo","1º Piso","2º Piso","3º Piso","4º Piso","5º Piso","—"] },
      { key:"equipamento", label:"Equipamento", type:"text", required:true },
      { key:"patrimonio", label:"Patrimônio", type:"text" },
      { key:"setor", label:"Setor", type:"text" },
      { key:"responsavel", label:"Responsável", type:"text" },
      { key:"observacoes", label:"Observações", type:"text" },
      { key:"status", label:"Status", type:"select", options:["Disponível","Em uso","Em manutenção","Baixado","Outro"] },
    ],
    list: { orderBy:"codigo", asc:true }
  },
  {
    key: "observacoes_diarias",
    name: "Observações Diárias",
    table: "observacoes_diarias",
    badge: "Diário",
    subtitle: "Registre atividades e ocorrências do dia a dia.",
    columns: [
      { key:"data", label:"Data", type:"date", required:true },
      { key:"ocorrencia", label:"Ocorrência", type:"text", required:true },
    ],
    list: { orderBy:"data", asc:false }
  },
  {
    key: "almoxarifado",
    name: "Almoxarifado",
    table: "almoxarifado",
    badge: "Estoque",
    subtitle: "Controle de equipamentos armazenados no almoxarifado.",
    columns: [
      { key:"item", label:"Item", type:"text", required:true },
      { key:"quantidade", label:"Quantidade", type:"text", required:true },
      { key:"observacoes", label:"Observações", type:"text" },
      { key:"ultima_atualizacao", label:"Última Atualização", type:"date" },
    ],
    list: { orderBy:"item", asc:true }
  },
  {
    key: "chromebooks",
    name: "Relação de Chromebooks",
    table: "chromebooks",
    badge: "Chrome",
    subtitle: "Controle de Chromebooks, número, série e situação.",
    columns: [
      { key:"numero", label:"Número", type:"text", required:true },
      { key:"serie", label:"Número de Série", type:"text" },
      { key:"observacoes", label:"Situação / Observações", type:"text" },
    ],
    list: { orderBy:"numero", asc:true }
  },
  {
    key: "envios",
    name: "Controle de Envios e Retornos",
    table: "envios_retornos",
    badge: "RMA",
    subtitle: "Registre equipamentos com defeito: envio, retorno, status e observações.",
    columns: [
      { key:"item", label:"Item/Equipamento", type:"text", required:true },
      { key:"patrimonio", label:"Patrimônio / Serial", type:"text" },
      { key:"marca_modelo", label:"Marca / Modelo", type:"text" },
      { key:"responsavel", label:"Responsável", type:"text" },
      { key:"data_envio", label:"Data Envio", type:"date" },
      { key:"data_retorno", label:"Data Retorno", type:"date" },
      { key:"status", label:"Status", type:"select", options:["Enviado","Recebido","Aguardando","Sem conserto","Outro"] },
      { key:"motivo", label:"Defeito / Motivo", type:"text" },
      { key:"observacoes", label:"Observações", type:"text" },
    ],
    list: { orderBy:"updated_at", asc:false }
  },
  {
    key: "ar",
    name: "Mapeamento Ar Condicionado",
    table: "ar_condicionado",
    badge: "Clima",
    subtitle: "Controle de equipamentos de ar condicionado por local, modelo, BTU e manutenção.",
    columns: [
      { key:"local", label:"Local", type:"text", required:true },
      { key:"andar", label:"Andar", type:"select", options:["Térreo","1º Piso","2º Piso","3º Piso","4º Piso","5º Piso","—"] },
      { key:"setor", label:"Setor", type:"text" },
      { key:"marca_modelo", label:"Marca / Modelo", type:"text" },
      { key:"btu", label:"BTU", type:"text" },
      { key:"status", label:"Status", type:"select", options:["OK","Com problema","Em manutenção","Desativado","Outro"] },
      { key:"ultima_manutencao", label:"Última manutenção", type:"date" },
      { key:"observacoes", label:"Observações", type:"text" },
    ],
    list: { orderBy:"local", asc:true }
  },
  {
    key: "agenda_lab",
    name: "Agenda Lab de Informática",
    table: "agenda_lab",
    badge: "Agenda",
    subtitle: "Agende uso dos laboratórios por dia e horário.",
    columns: [
      { key:"laboratorio", label:"Laboratório", type:"select", options:["Lab 01","Lab 02","Lab 03","Lab 04","Outro"], required:true },
      { key:"dia_semana", label:"Dia da semana", type:"select", options:["Segunda","Terça","Quarta","Quinta","Sexta","Sábado"], required:true },
      { key:"horario", label:"Horário", type:"select", options:["AB (07:40-09:20)","CD (09:40-11:20)","ABCD (07:40-11:20)","EF (11:20-13:00)"], required:true },
      { key:"turma", label:"Turma", type:"text" },
      { key:"professor", label:"Professor", type:"text" },
      { key:"disciplina", label:"Disciplina", type:"text" },
      { key:"observacoes", label:"Observações", type:"text" },
    ],
    list: { orderBy:"dia_semana", asc:true }
  }
];

const nav = document.getElementById("nav");
const panel = document.getElementById("panel");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const addBtn = document.getElementById("addBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFooter = document.getElementById("modalFooter");
const modalClose = document.getElementById("modalClose");

let current = null;
let currentRows = [];
let zoom = 1;

function openModal(title, bodyHtml, footerHtml){
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modalFooter.innerHTML = footerHtml;
  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden","false");
}
function closeModal(){
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden","true");
}
modalClose.onclick = closeModal;
modalBackdrop.addEventListener("click",(e)=>{ if(e.target===modalBackdrop) closeModal(); });

function setZoom(){
  const wrap = document.getElementById("zoomWrap");
  if(wrap) wrap.style.transform = `scale(${zoom})`;
  document.getElementById("zoomReset").textContent = Math.round(zoom*100) + "%";
}
document.getElementById("zoomIn").onclick = ()=>{ zoom = Math.min(1.4, +(zoom+0.1).toFixed(2)); setZoom(); };
document.getElementById("zoomOut").onclick = ()=>{ zoom = Math.max(0.7, +(zoom-0.1).toFixed(2)); setZoom(); };
document.getElementById("zoomReset").onclick = ()=>{ zoom = 1; setZoom(); };

document.getElementById("logoutBtn").onclick = async ()=>{
  await client.auth.signOut();
  location.href = "index.html";
};

async function requireAuth(){
  const { data: { session } } = await client.auth.getSession();
  if(!session){ location.href = "index.html"; return null; }
  document.getElementById("userBtn").textContent = session.user.email;
  return session;
}

function mkInput(col, value=""){
  const id = "f_" + col.key;
  if(col.type === "select"){
    const opts = (col.options || []).map(o => `<option value="${escapeHtml(o)}" ${o===value?"selected":""}>${escapeHtml(o)}</option>`).join("");
    return `<select class="input" id="${id}"><option value="">—</option>${opts}</select>`;
  }
  if(col.type === "date"){
    return `<input class="input" id="${id}" type="date" value="${escapeHtml(value || "")}" />`;
  }
  return `<input class="input" id="${id}" type="text" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(col.label)}" />`;
}

function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function readForm(cols){
  const obj = {};
  for(const c of cols){
    const el = document.getElementById("f_"+c.key);
    if(!el) continue;
    const v = (el.value ?? "").toString().trim();
    if(c.required && !v) throw new Error(`Campo obrigatório: ${c.label}`);
    obj[c.key] = v || null;
  }
  return obj;
}

function buildTable(tab, cols, rows){
  const head = cols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows.map(r=>{
    const tds = cols.map(c=>`<td>${escapeHtml(r[c.key] ?? "")}</td>`).join("");
    const pk = (tab && tab.pk) ? tab.pk : "id";
    const rid = r?.[pk];
    return `<tr data-id="${escapeHtml(rid ?? "")}">${tds}</tr>`;
  }).join("");
  return `
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function exportCSV(cols, rows, filename){
  const header = cols.map(c => `"${(c.label||"").replaceAll('"','""')}"`).join(",");
  const lines = [header];
  for(const r of rows){
    const row = cols.map(c => `"${(r[c.key] ?? "").toString().replaceAll('"','""')}"`).join(",");
    lines.push(row);
  }
  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function buildToolbar(){
  return `
    <div class="toolbar">
      <input class="input" id="q" placeholder="Pesquisar em todas as colunas..." style="max-width:320px" />
      <button class="btn primary" id="apply">Filtrar</button>
      <button class="btn" id="clear">Limpar</button>
      <button class="btn ok" id="export">Exportar CSV</button>
      <span class="kpi" id="kpi">—</span>
    </div>
    <div id="filtersHost" style="padding:10px 0 6px 0">
      <div class="note" style="margin-bottom:6px">Filtros por coluna (deixe em branco para ignorar):</div>
      <div id="filtersGrid" class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px"></div>
    </div>
  `;
}


function buildPanelShell(){
  return `<div id="zoomWrap" class="zoomWrap">${buildToolbar()}<div class="tableWrap"><div id="tableHost"></div></div></div>`;
}

async function loadRows(tab){
  let q = client.from(tab.table).select("*");
  if(tab.list?.orderBy){
    q = q.order(tab.list.orderBy, {ascending: !!tab.list.asc});
  }else{
    q = q.order("updated_at", {ascending:false});
  }
  const { data, error } = await q.limit(2000);
  if(error) throw error;
  return data || [];
}

function applyLocalFilter(tab, cols, rows){
  const q = (document.getElementById("q")?.value || "").trim().toLowerCase();

  // filtros por coluna
  const filters = {};
  for(const c of cols){
    const el = document.getElementById("filt_"+c.key);
    if(!el) continue;
    const v = (el.value ?? "").toString().trim();
    if(v) filters[c.key] = v.toLowerCase();
  }

  return rows.filter(r=>{
    if(q){
      const ok = cols.some(c => (r[c.key] ?? "").toString().toLowerCase().includes(q));
      if(!ok) return false;
    }
    for(const [k,v] of Object.entries(filters)){
      const cell = (r[k] ?? "").toString().toLowerCase();
      // para select/date, o "contains" também funciona (e é mais flexível)
      if(!cell.includes(v)) return false;
    }
    return true;
  });
}


function hookToolbar(tab){
  const cols = tab.columns;
  const kpi = document.getElementById("kpi");
  const host = document.getElementById("tableHost");
  const filtersGrid = document.getElementById("filtersGrid");

  const redraw = () => {
    const filtered = applyLocalFilter(tab, cols, currentRows);
    kpi.textContent = `${filtered.length} registro(s)`;
    host.innerHTML = buildTable(tab, cols, filtered);
    host.querySelectorAll("tbody tr").forEach(tr=>{
      tr.addEventListener("click", ()=>{
        const id = (tr.getAttribute("data-id") || "").toString();
        const pk = tab.pk || "id";
        const row = filtered.find(x => (x?.[pk] ?? "").toString() === id);
        if(row) openEdit(tab, row);
      });
    });
  };

  // monta filtros por coluna
  if(filtersGrid){
    filtersGrid.innerHTML = cols.map(c=>{
      const id = "filt_"+c.key;
      let inputHtml = "";
      if(c.type === "select"){
        const opts = (c.options || []).map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");
        inputHtml = `<select class="input" id="${id}"><option value="">—</option>${opts}</select>`;
      }else if(c.type === "date"){
        inputHtml = `<input class="input" id="${id}" type="date" />`;
      }else{
        inputHtml = `<input class="input" id="${id}" type="text" placeholder="Contém..." />`;
      }
      return `
        <div>
          <label class="note">${escapeHtml(c.label)}</label>
          ${inputHtml}
        </div>
      `;
    }).join("");

    // enter para aplicar
    cols.forEach(c=>{
      const el = document.getElementById("filt_"+c.key);
      if(el){
        el.addEventListener("keydown",(e)=>{ if(e.key==="Enter") redraw(); });
        // em select/date, aplicar ao mudar
        el.addEventListener("change", ()=>redraw());
      }
    });
  }

  document.getElementById("apply").onclick = redraw;
  document.getElementById("clear").onclick = ()=>{
    const qEl = document.getElementById("q");
    if(qEl) qEl.value = "";
    for(const c of cols){
      const el = document.getElementById("filt_"+c.key);
      if(el) el.value = "";
    }
    redraw();
  };
  document.getElementById("export").onclick = ()=>{
    const filtered = applyLocalFilter(tab, cols, currentRows);
    exportCSV(cols, filtered, `${tab.key}_export.csv`);
  };
  document.getElementById("q").addEventListener("keydown",(e)=>{ if(e.key==="Enter") redraw(); });

  redraw();
  updateToolbarHeightVar();
}



function openCreate(tab){
  const cols = tab.columns;
  const body = `
    <div class="note">Preencha os campos e clique em salvar.</div>
    <div class="grid two" style="margin-top:10px">
      ${cols.map(c=>`
        <div>
          <label class="note">${escapeHtml(c.label)}${c.required?" *":""}</label>
          ${mkInput(c,"")}
        </div>
      `).join("")}
    </div>
  `;
  const footer = `
    <button class="btn" id="cancel">Cancelar</button>
    <button class="btn primary" id="save">Salvar</button>
  `;
  openModal(`Adicionar — ${tab.name}`, body, footer);
  document.getElementById("cancel").onclick = closeModal;
  document.getElementById("save").onclick = async ()=>{
    try{
      const payload = readForm(cols);
      const { error } = await client.from(tab.table).insert(payload);
      if(error) throw error;
      toast("Salvo!");
      closeModal();
      await refresh();
    }catch(e){
      toast(e.message || "Erro ao salvar");
    }
  };
}

function openEdit(tab, row){
  const cols = tab.columns;
  const body = `
    <div class="note">Clique em <b>Salvar</b> para atualizar, ou <b>Excluir</b> para remover.</div>
    <div class="grid two" style="margin-top:10px">
      ${cols.map(c=>`
        <div>
          <label class="note">${escapeHtml(c.label)}${c.required?" *":""}</label>
          ${mkInput(c, (row[c.key] ?? ""))}
        </div>
      `).join("")}
    </div>
  `;
  const footer = `
    <button class="btn" id="cancel">Fechar</button>
    <button class="btn danger" id="del">Excluir</button>
    <button class="btn primary" id="save">Salvar</button>
  `;
  openModal(`Editar — ${tab.name}`, body, footer);
  document.getElementById("cancel").onclick = closeModal;
  document.getElementById("save").onclick = async ()=>{
    try{
      const payload = readForm(cols);
      const { error } = await client.from(tab.table).update(payload).eq((tab.pk || "id"), row[tab.pk || "id"]);
      if(error) throw error;
      toast("Atualizado!");
      closeModal();
      await refresh();
    }catch(e){
      toast(e.message || "Erro ao salvar");
    }
  };
  document.getElementById("del").onclick = async ()=>{
    if(!confirm("Tem certeza que deseja excluir este registro?")) return;
    const { error } = await client.from(tab.table).delete().eq((tab.pk || "id"), row[tab.pk || "id"]);
    if(error){ toast(error.message); return; }
    toast("Excluído!");
    closeModal();
    await refresh();
  };
}

async function refresh(){
  if(!current) return;
  panel.innerHTML = buildPanelShell();
  setZoom();
  currentRows = await loadRows(current);
  hookToolbar(current);
}


function showEmptyState(){
  current = null;

  document.querySelectorAll(".nav button[data-tab-idx]").forEach(b=>{
    b.classList.remove("active");
  });

  titleEl.textContent = "Painel de Trabalho";
  subtitleEl.textContent = "Selecione uma opção no menu T.I para começar.";

  panel.innerHTML = `
    <div style="padding:40px 20px; text-align:center; opacity:.6">
      <h2>Bem-vindo</h2>
      <p>Clique em uma aba no menu T.I para visualizar os dados.</p>
    </div>
  `;
}

function renderTab(i){
  current = TABS[i];
  titleEl.textContent = current.name;
  subtitleEl.textContent = current.subtitle;
  document.querySelectorAll(".nav button[data-tab-idx]").forEach((b) => b.classList.toggle("active", Number(b.dataset.tabIdx)===i));
  refresh();
}

addBtn.onclick = ()=>{ if(current) openCreate(current); };

(async function init(){
  // inicia dashboard vazio
  showEmptyState();
  await requireAuth();

  // NAV: comprime TODAS as abas dentro de uma gaveta "T.I" (com animação suave)
const mkNavBtn = (t,i)=>{
  const b = document.createElement("button");
  b.dataset.tabIdx = i;
  b.innerHTML = `<span>${t.name}</span><span class="badge">${t.badge}</span>`;
  b.onclick = ()=>renderTab(i);
  return b;
};

const drawerWrap = document.createElement("div");
drawerWrap.className = "drawerWrap open";

const toggle = document.createElement("button");
toggle.className = "drawerToggle";
toggle.type = "button";
toggle.innerHTML = `<span>T.I</span><span class="badge">Menu</span>`;

const body = document.createElement("div");
body.className = "drawerBody";

// adiciona todas as abas dentro da gaveta
TABS.forEach((t,i)=> body.appendChild(mkNavBtn(t,i)));

drawerWrap.appendChild(toggle);
drawerWrap.appendChild(body);

nav.appendChild(drawerWrap);

// força estado inicial: T.I recolhida
drawerWrap.classList.remove("open");
toggle.setAttribute("aria-expanded","false");
body.style.display = "none";
body.style.maxHeight = "0px";
const setDrawerHeight = ()=>{
  if(drawerWrap.classList.contains("open")){
    body.style.maxHeight = body.scrollHeight + "px";
  }else{
    body.style.maxHeight = "0px";
  }
};

// abre por padrão com animação suave
requestAnimationFrame(()=>{ setDrawerHeight(); });

toggle.onclick = ()=>{
  drawerWrap.classList.toggle("open");
  setDrawerHeight();
};

// garante que se o conteúdo mudar (ex.: badges/font), a altura fique correta
window.addEventListener("resize", setDrawerHeight);

// carrega a primeira aba automaticamente


  // realtime (best-effort)
  try{
    for(const t of TABS){
      client.channel("rt_"+t.table)
        .on("postgres_changes",{event:"*", schema:"public", table:t.table}, ()=>{
          if(current && current.table===t.table) refresh();
        })
        .subscribe();
    }
  }catch(e){}
})();
