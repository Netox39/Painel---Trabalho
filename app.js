const client = window.supabaseClient;

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
  },
  {
    key: "ramais",
    name: "Ramais Internos",
    table: "ramais",
    badge: "Contato",
    subtitle: "Lista de ramais por setor, responsável e observações.",
    columns: [
      { key:"setor", label:"Setor", type:"text", required:true },
      { key:"responsavel", label:"Responsável", type:"text" },
      { key:"ramal", label:"Ramal", type:"text", required:true },
      { key:"observacoes", label:"Observações", type:"text" },
    ],
    list: { orderBy:"setor", asc:true }
  },
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

function buildTable(cols, rows){
  const head = cols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows.map(r=>{
    const tds = cols.map(c=>`<td>${escapeHtml(r[c.key] ?? "")}</td>`).join("");
    return `<tr data-id="${r.id}">${tds}</tr>`;
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
      <select id="col" class="input" style="max-width:220px"><option value="">Coluna (todas)</option></select>
      <input class="input" id="val" placeholder="Valor (contém)..." style="max-width:240px" />
      <button class="btn primary" id="apply">Filtrar</button>
      <button class="btn" id="clear">Limpar</button>
      <button class="btn ok" id="export">Exportar CSV</button>
      <span class="kpi" id="kpi">—</span>
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

function applyLocalFilter(cols, rows){
  const q = (document.getElementById("q").value || "").trim().toLowerCase();
  const col = document.getElementById("col").value;
  const val = (document.getElementById("val").value || "").trim().toLowerCase();

  return rows.filter(r=>{
    if(q){
      const ok = cols.some(c => (r[c.key] ?? "").toString().toLowerCase().includes(q));
      if(!ok) return false;
    }
    if(val){
      if(col){
        const c = cols.find(x=>x.key===col);
        if(!c) return true;
        return (r[c.key] ?? "").toString().toLowerCase().includes(val);
      }else{
        return cols.some(c => (r[c.key] ?? "").toString().toLowerCase().includes(val));
      }
    }
    return true;
  });
}

function hookToolbar(tab){
  const cols = tab.columns;
  const colSel = document.getElementById("col");
  cols.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c.key;
    opt.textContent = c.label;
    colSel.appendChild(opt);
  });

  const kpi = document.getElementById("kpi");
  const host = document.getElementById("tableHost");

  const redraw = () => {
    const filtered = applyLocalFilter(cols, currentRows);
    kpi.textContent = `${filtered.length} registro(s)`;
    host.innerHTML = buildTable(cols, filtered);
    host.querySelectorAll("tbody tr").forEach(tr=>{
      tr.addEventListener("click", ()=>{
        const id = tr.getAttribute("data-id");
        const row = filtered.find(x=>x.id===id);
        if(row) openEdit(tab, row);
      });
    });
  };

  document.getElementById("apply").onclick = redraw;
  document.getElementById("clear").onclick = ()=>{
    document.getElementById("q").value = "";
    document.getElementById("col").value = "";
    document.getElementById("val").value = "";
    redraw();
  };
  document.getElementById("export").onclick = ()=>{
    const filtered = applyLocalFilter(cols, currentRows);
    exportCSV(cols, filtered, `${tab.key}_export.csv`);
  };
  ["q","val"].forEach(id=>{
    document.getElementById(id).addEventListener("keydown",(e)=>{ if(e.key==="Enter") redraw(); });
  });

  redraw();
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
      const { error } = await client.from(tab.table).update(payload).eq("id", row.id);
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
    const { error } = await client.from(tab.table).delete().eq("id", row.id);
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

function renderTab(i){
  current = TABS[i];
  titleEl.textContent = current.name;
  subtitleEl.textContent = current.subtitle;
  document.querySelectorAll(".nav button").forEach((b, idx) => b.classList.toggle("active", idx===i));
  refresh();
}

addBtn.onclick = ()=>{ if(current) openCreate(current); };

(async function init(){
  await requireAuth();

  TABS.forEach((t,i)=>{
    const b = document.createElement("button");
    b.innerHTML = `<span>${t.name}</span><span class="badge">${t.badge}</span>`;
    b.onclick = ()=>renderTab(i);
    nav.appendChild(b);
  });

  renderTab(0);

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
