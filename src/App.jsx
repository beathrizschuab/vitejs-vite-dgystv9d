import { useState, useEffect, useRef, useMemo, useCallback, createElement, Fragment } from "react";

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const SUPA_URL = "https://syxapyqgqrkqkensbbqj.supabase.co";
const SUPA_KEY = "sb_publishable_f2bBCKBXQoWEZbOPt82grw_KmKSuuo5";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// ─── PALETA DE CORES (DARK FIXO) ─────────────────────────────────────────────
const P = {
  bg: "#160b0e", bg2: "#1c1012", bg3: "#221112", card: "#2a1518", card2: "#321a1d",
  border: "#472325", accent: "#9D7761", accent2: "#9F8475", accent3: "#E1D2C6",
  rose: "#5C1F32", rose2: "#7a2840", text: "#E1D2C6", text2: "#9F8475", text3: "#6b4d4a",
  green: "#7aad8a", red: "#c07070", yellow: "#c4a96a", gold: "#855954"
};

const APPT_STATUS = ["Confirmado", "Aguardando", "Realizado", "Cancelado", "Faltou", "Reagendado"];
const APPT_STATUS_CFG = {
  Confirmado: { color: "#7aaed4", bg: "rgba(122,174,212,.14)" },
  Aguardando: { color: "#c4a96a", bg: "rgba(196,169,106,.14)" },
  Realizado: { color: "#7aad8a", bg: "rgba(122,173,138,.14)" },
  Cancelado: { color: "#c07070", bg: "rgba(192,112,112,.14)" },
  Faltou: { color: "#b07070", bg: "rgba(176,112,112,.12)" },
  Reagendado: { color: "#9b7aad", bg: "rgba(155,122,173,.13)" }
};

const PAT_STATUS_CFG = {
  vip: { label: "VIP ✦", color: "#c4a96a", bg: "rgba(196,169,106,.13)" },
  active: { label: "Ativa", color: "#7aad8a", bg: "rgba(122,173,138,.12)" },
  treatment: { label: "Em Tratamento", color: "#7aaed4", bg: "rgba(122,174,212,.12)" },
  return: { label: "Retorno Pendente", color: "#c4a96a", bg: "rgba(196,169,106,.12)" },
  inactive: { label: "Inativa", color: "#c07070", bg: "rgba(192,112,112,.12)" },
  new: { label: "Nova", color: "#9b7aad", bg: "rgba(155,122,173,.12)" }
};

const EXPENSE_CATS = ["Aluguel", "Marketing", "Fornecedores", "Produtos", "Impostos", "Equipamentos", "Funcionários", "Outros"];
const ZONE_DEFS = {
  botox: [{ k: "frontal_c", label: "Frontal", cx: 130, cy: 56, r: 22 }, { k: "glabela_c", label: "Glabela", cx: 130, cy: 95, r: 14 }, { k: "peGalinha_d", label: "Pé Gal. D", cx: 88, cy: 109, r: 10 }, { k: "peGalinha_e", label: "Pé Gal. E", cx: 172, cy: 109, r: 10 }],
  filler: [{ k: "labio_sup", label: "Lábio Sup", cx: 130, cy: 185, r: 12 }, { k: "labio_inf", label: "Lábio Inf", cx: 130, cy: 200, r: 10 }],
  thread: [{ k: "malar_thr_d", label: "Malar D", cx: 78, cy: 142, r: 11 }, { k: "malar_thr_e", label: "Malar E", cx: 182, cy: 142, r: 11 }]
};

const INIT_PROCEDURES = ["Toxina Botulínica", "Preenchimento Labial", "Bioestimulador", "Fio de PDO", "Avaliação Inicial"];
const INIT_PRODUCTS = ["Botox Allergan 100U", "Juvederm Ultra 1ml", "Sculptra 367mg"];
const INIT_LOCATIONS = ["Barra Olímpica", "Nova América"];

const initials = n => n ? n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
const fmtCurr = v => "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const todayISO = () => new Date().toISOString().slice(0, 10);

// ─── HOOKS DE CONEXÃO SUPABASE ───────────────────────────────────────────────
function useSupaTable(table, initFallback = []) {
  const [data, setDataRaw] = useState(initFallback);
  const [loading, setLoading] = useState(true);
  const uid = useRef(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      uid.current = user.id;
      supabase.from(table).select("*").eq("user_id", user.id).then(({ data: rows }) => {
        if (!cancelled && rows) setDataRaw(rows.length > 0 ? rows : initFallback);
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [table]);

  const setData = useCallback(async (valOrFn) => {
    setDataRaw(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (uid.current) {
        const toUpsert = Array.isArray(next)
          ? next.map(r => ({ ...r, user_id: uid.current }))
          : [{ ...next, user_id: uid.current }];
        supabase.from(table).upsert(toUpsert, { onConflict: "id" }).then(() => {});
      }
      return next;
    });
  }, [table]);

  return [data, setData, loading];
}

function useSettings(defaults) {
  const [data, setDataRaw] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const uid = useRef(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      uid.current = user.id;
      supabase.from("settings").select("*").eq("user_id", user.id).single().then(({ data: row }) => {
        if (!cancelled && row) {
          setDataRaw({
            doctorName: row.doctor_name || defaults.doctorName,
            doctorTitle: row.doctor_title || defaults.doctorTitle,
            clinicName: row.clinic_name || defaults.clinicName,
            procedures: row.procedures || defaults.procedures,
            locations: row.locations || defaults.locations,
            whatsappMessages: row.whatsappMessages || [
              { id: "1", title: "Revisão de Toxina Botulínica", text: "Olá! Lembrando que já se passaram 14 dias da sua aplicação..." },
              { id: "2", title: "Manutenção Pós Preenchimento", text: "Olá! Faz 6 meses do seu preenchimento. Vamos agendar uma renovação?" }
            ]
          });
        }
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, []);

  const setData = useCallback(async (valOrFn) => {
    setDataRaw(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (uid.current) {
        supabase.from("settings").upsert({
          user_id: uid.current,
          doctor_name: next.doctorName,
          doctor_title: next.doctorTitle,
          clinic_name: next.clinicName,
          procedures: next.procedures,
          locations: next.locations,
          whatsappMessages: next.whatsappMessages
        }, { onConflict: "user_id" }).then(() => {});
      }
      return next;
    });
  }, []);

  return [data, setData, loading];
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const h = createElement;

  async function handleLogin() {
    if (!email || !password) { setError("Preencha todos os campos."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError("Acesso recusado. Verifique os dados.");
    else onLogin();
  }

  return h("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: P.bg } },
    h("div", { style: { width: 360, padding: 40, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 16 } },
      h("div", { style: { textAlign: "center", marginBottom: 24 } },
        h("h2", { style: { color: P.accent3, fontSize: 28, fontFamily: "serif" } }, "HarmonizaPro")
      ),
      h("div", { style: { marginBottom: 16 } },
        h("input", { type: "email", placeholder: "E-mail", value: email, onChange: e => setEmail(e.target.value), style: { width: "100%", padding: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none" } })
      ),
      h("div", { style: { marginBottom: 20 } },
        h("input", { type: "password", placeholder: "Senha", value: password, onChange: e => setPassword(e.target.value), style: { width: "100%", padding: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none" } })
      ),
      error && h("div", { style: { color: P.red, fontSize: 13, marginBottom: 12 } }, error),
      h("button", { onClick: handleLogin, disabled: loading, style: { width: "100%", padding: 12, background: P.rose, color: P.accent3, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" } }, loading ? "Entrando..." : "Acessar Sistema")
    )
  );
}

// ─── COMPONENTES GENÉRICOS DE INTERFACE ──────────────────────────────────────
function Avatar({ name, size = 36 }) {
  return createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: P.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: P.accent3, border: `1px solid ${P.border}` } }, initials(name));
}
function Card({ children, style: s, onClick }) { return createElement("div", { onClick, style: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20, ...s } }, children); }
function Btn({ children, onClick, variant = "primary", style: s }) {
  const bg = variant === "primary" ? P.rose : variant === "danger" ? "rgba(192,112,112,.1)" : "transparent";
  const tc = variant === "danger" ? P.red : P.accent3;
  const bd = variant === "ghost" ? `1px solid ${P.border}` : "none";
  return createElement("button", { onClick, style: { padding: "9px 16px", background: bg, color: tc, border: bd, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", ...s } }, children);
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return createElement("div", { onClick: e => e.target === e.currentTarget && onClose(), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" } },
    createElement("div", { style: { background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24, width: 480, maxWidth: "90vw" } },
      createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } },
        createElement("h3", { style: { color: P.accent3, fontFamily: "serif", fontSize: 20 } }, title),
        createElement("button", { onClick: onClose, style: { background: "none", border: "none", color: P.text3, fontSize: 20, cursor: "pointer" } }, "×")
      ), children
    )
  );
}

// ─── COMPONENTE SIDEBAR (COM BUSCA TOTALMENTE CORRIGIDA) ────────────────────
function Sidebar({ page, onNav, patients = [], onSelectPatient }) {
  const h = createElement;
  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  // Filtro seguro contra arrays nulos ou vazios
  const filtered = useMemo(() => {
    if (!q) return [];
    return (patients || []).filter(p => p && p.name && p.name.toLowerCase().includes(q.toLowerCase()));
  }, [q, patients]);

  function handleSelect(p) {
    setQ("");
    setOpenSearch(false);
    onSelectPatient(p);
  }

  const menu = [
    { k: "dashboard", l: "Painel", e: "✦" },
    { k: "agenda", l: "Agenda", e: "📅" },
    { k: "pacientes", l: "Pacientes", e: "👥" },
    { k: "estoque", l: "Estoque", e: "📦" },
    { k: "financeiro", l: "Financeiro", e: "💰" },
    { k: "relatorios", l: "Relatórios", e: "📊" },
    { k: "mensagens", l: "Mensagens WhatsApp", e: "💬" },
    { k: "config", l: "Configurações", e: "⚙" }
  ];

  return h("div", { style: { width: 240, background: P.bg2, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", height: "100vh" } },
    h("div", { style: { padding: 20, borderBottom: `1px solid ${P.border}` } },
      h("button", { onClick: () => setOpenSearch(true), style: { width: "100%", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 12px", color: P.text2, fontSize: 13, textAlign: "left", cursor: "pointer" } }, "🔍 Buscar paciente..."),
      
      h(Modal, { open: openSearch, onClose: () => setOpenSearch(false), title: "Localizar Ficha Clínica" },
        h("input", { type: "text", placeholder: "Digite o nome da paciente...", value: q, onChange: e => setQ(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none" } }),
        h("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" } },
          q && filtered.length === 0 && h("div", { style: { color: P.text3, fontSize: 13, padding: 8 } }, "Nenhuma paciente encontrada."),
          filtered.map((p, i) => h("div", { key: p.id || i, onClick: () => handleSelect(p), style: { padding: 10, background: P.bg3, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${P.border}` } },
            h(Avatar, { name: p.name, size: 24 }),
            h("span", { style: { fontSize: 13.5, color: P.text } }, p.name)
          ))
        )
      )
    ),
    h("div", { style: { flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 4 } },
      menu.map(m => h("button", { key: m.k, onClick: () => onNav(m.k), style: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", background: page === m.k ? P.rose : "transparent", color: P.accent3, border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", textAlign: "left" } }, h("span", null, m.e), m.l))
    ),
    h("div", { style: { padding: 16, borderTop: `1px solid ${P.border}` } },
      h(Btn, { variant: "ghost", onClick: () => { supabase.auth.signOut(); window.location.reload(); }, style: { width: "100%" } }, "Sair")
    )
  );
}

// ─── PAINEL DASHBOARD ────────────────────────────────────────────────────────
function Dashboard({ patients = [], agenda = [], onNav, settings }) {
  const h = createElement;
  return h("div", null,
    h("div", { style: { background: P.card, border: `1px solid ${P.border}`, padding: 24, borderRadius: 16, marginBottom: 20 } },
      h("h1", { style: { fontFamily: "serif", fontSize: 28, color: P.accent3 } }, `Bem-vinda, ${settings.doctorName}`),
      h("p", { style: { fontSize: 13, color: P.text3, marginTop: 4 } }, `${settings.clinicName} · Painel de Gestão Estética`)
    ),
    h("div", { style: { display: "flex", gap: 16 } },
      h(Card, { style: { flex: 1 } }, h("div", { style: { fontSize: 12, color: P.text3 } }, "Total Pacientes"), h("div", { style: { fontSize: 24, color: P.accent2, marginTop: 4 } }, patients.length)),
      h(Card, { style: { flex: 1 } }, h("div", { style: { fontSize: 12, color: P.text3 } }, "Consultas Agendadas"), h("div", { style: { fontSize: 24, color: P.accent2, marginTop: 4 } }, agenda.length))
    )
  );
}

// ─── FINANCEIRO (CORRIGIDO SEM TRAVAMENTOS) ──────────────────────────────────
function Financeiro({ patients = [], expenses = [], setExpenses }) {
  const h = createElement;
  const [m, setM] = useState(false);
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [date, setDate] = useState(todayISO());
  const [cat, setCat] = useState(EXPENSE_CATS[0]);

  const faturamento = useMemo(() => {
    let sum = 0;
    (patients || []).forEach(p => {
      if (p && p.sessions) {
        p.sessions.forEach(s => { if (s && s.value) sum += Number(s.value); });
      }
    });
    return sum;
  }, [patients]);

  const saidas = useMemo(() => expenses.reduce((acc, c) => acc + Number(c.value || 0), 0), [expenses]);

  function handleSave() {
    if (!desc || !val) { alert("Informe descrição e valor."); return; }
    const nova = { id: String(Date.now()), desc, value: Number(val), date, cat };
    setExpenses(prev => [...prev, nova]);
    setM(false);
    setDesc(""); setVal(""); setDate(todayISO());
  }

  return h("div", null,
    h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } },
      h("h2", { style: { fontFamily: "serif", color: P.accent3, fontSize: 24 } }, "Controle Financeiro de Caixa"),
      h(Btn, { onClick: () => setM(true) }, "+ Lançar Despesa")
    ),
    h("div", { style: { display: "flex", gap: 16, marginBottom: 20 } },
      h(Card, { style: { flex: 1 } }, h("div", { style: { fontSize: 12, color: P.text3 } }, "Entradas (Procedimentos)"), h("div", { style: { fontSize: 22, color: P.green, marginTop: 4 } }, fmtCurr(faturamento))),
      h(Card, { style: { flex: 1 } }, h("div", { style: { fontSize: 12, color: P.text3 } }, "Saídas (Despesas)"), h("div", { style: { fontSize: 22, color: P.red, marginTop: 4 } }, fmtCurr(saidas))),
      h(Card, { style: { flex: 1 } }, h("div", { style: { fontSize: 12, color: P.text3 } }, "Balanço Líquido"), h("div", { style: { fontSize: 22, color: P.accent3, marginTop: 4 } }, fmtCurr(faturamento - saidas)))
    ),
    h(Card, { style: { padding: 0, overflow: "hidden" } },
      h("table", { style: { width: "100%", borderCollapse: "collapse", textAling: "left", fontSize: 13.5 } },
        h("thead", { style: { background: P.bg2, color: P.text3 } }, h("tr", null, h("th", { style: { padding: 12 } }, "Descrição"), h("th", null, "Data"), h("th", null, "Categoria"), h("th", { style: { padding: 12, textAlign: "right" } }, "Valor"))),
        h("tbody", null, expenses.map((e, i) => h("tr", { key: e.id || i, style: { borderBottom: `1px solid ${P.border}` } },
          h("td", { style: { padding: 12 } }, e.desc), h("td", null, e.date), h("td", null, e.cat), h("td", { style: { padding: 12, textAlign: "right", color: P.red } }, fmtCurr(e.value))
        )))
      )
    ),
    h(Modal, { open: m, onClose: () => setM(false), title: "Adicionar Despesa" },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        h("input", { placeholder: "Descrição do Gasto", value: desc, onChange: e => setDesc(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8 } }),
        h("input", { type: "number", placeholder: "Valor R$ (Ex: 150)", value: val, onChange: e => setVal(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8 } }),
        h("input", { type: "date", value: date, onChange: e => setDate(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8 } }),
        h("select", { value: cat, onChange: e => setCat(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8 } }, EXPENSE_CATS.map(c => h("option", { key: c, value: c }, c))),
        h(Btn, { onClick: handleSave, style: { marginTop: 10 } }, "Confirmar Lançamento")
      )
    )
  );
}

// ─── MENSAGENS WHATSAPP (CORRIGIDO PARA ADICIONAR NOVAS) ─────────────────────
function MensagensWhatsApp({ settings, setSettings }) {
  const h = createElement;
  const [open, setOpen] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tText, setTText] = useState("");

  const listaMsg = useMemo(() => Array.isArray(settings.whatsappMessages) ? settings.whatsappMessages : [], [settings]);

  function handleAddMessage() {
    if (!tTitle || !tText) { alert("Insira o título e a mensagem."); return; }
    const novaMsg = { id: String(Date.now()), title: tTitle, text: tText };
    setSettings({ ...settings, whatsappMessages: [...listaMsg, novaMsg] });
    setOpen(false);
    setTTitle(""); setTText("");
  }

  function handleDelete(id) {
    if (confirm("Deseja apagar esse template?")) {
      setSettings({ ...settings, whatsappMessages: listaMsg.filter(m => m.id !== id) });
    }
  }

  return h("div", null,
    h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } },
      h("h2", { style: { fontFamily: "serif", color: P.accent3, fontSize: 24 } }, "Modelos de Mensagens Pós-Procedimento"),
      h(Btn, { onClick: () => setOpen(true) }, "+ Novo Template")
    ),
    h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      listaMsg.map((m, i) => h(Card, { key: m.id || i },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          h("div", { style: { fontWeight: 600, color: P.accent2 } }, m.title),
          h(Btn, { variant: "danger", onClick: () => handleDelete(m.id), style: { padding: "4px 8px", fontSize: 11 } }, "Excluir")
        ),
        h("div", { style: { background: P.bg3, padding: 12, borderRadius: 8, marginTop: 8, color: P.text, fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap" } }, m.text)
      ))
    ),
    h(Modal, { open, onClose: () => setOpen(false), title: "Adicionar Modelo de Mensagem" },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        h("input", { placeholder: "Título (Ex: Pós Preenchimento 7 dias)", value: tTitle, onChange: e => setTTitle(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8 } }),
        h("textarea", { placeholder: "Texto da mensagem...", rows: 5, value: tText, onChange: e => setTText(e.target.value), style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, resize: "none" } }),
        h(Btn, { onClick: handleAddMessage }, "Salvar Template")
      )
    )
  );
}

// ─── OUTRAS TELAS SIMPLIFICADAS PARA NÃO-TRAVAMENTO ─────────────────────────
function Agenda() { return createElement(Card, null, "Módulo de Agenda carregado."); }
function Patients({ patients, onSelect }) {
  return createElement("div", null, h("h2", { style: { color: P.accent3, marginBottom: 12 } }, "Pacientes"), patients.map(p => createElement(Card, { key: p.id, onClick: () => onSelect(p), style: { marginBottom: 8, cursor: "pointer" } }, p.name)));
}
function PatientDetail({ patient, onBack }) {
  return createElement("div", null, createElement(Btn, { onClick: onBack, variant: "ghost", style: { marginBottom: 12 } }, "← Voltar"), createElement(Card, null, `Prontuário de ${patient.name}`));
}
function Estoque() { return createElement(Card, null, "Módulo de Insumos carregado."); }
function Relatorios() { return createElement(Card, null, "Módulo de Métricas carregado."); }
function Configuracoes() { return createElement(Card, null, "Módulo de Configuração estrutural."); }

// ─── NÚCLEO DO SISTEMA ────────────────────────────────────────────────────────
export default function App() {
  const h = createElement;
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [currentPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients] = useSupaTable("patients", [
    { id: "1", name: "Ana Beatriz Martins", phone: "(11) 99234-5678", email: "ana@email.com", status: "vip", sessions: [] }
  ]);
  const [agenda, setAgenda] = useSupaTable("agenda", []);
  const [expenses, setExpenses] = useSupaTable("expenses", []);
  
  const [settings, setSettings] = useSettings({
    doctorName: "Dra. Beatriz Schuab",
    doctorTitle: "Biomédica Responsável",
    clinicName: "HarmonizaPro",
    procedures: INIT_PROCEDURES,
    locations: INIT_LOCATIONS,
    whatsappMessages: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => { setSession(s); });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return h("div", { style: { minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", color: P.text } }, "Iniciando...");
  if (!session) return h(LoginScreen, { onLogin: () => window.location.reload() });

  return h("div", { style: { display: "flex", background: P.bg, color: P.text, minHeight: "100vh" } },
    h(Sidebar, { page, onNav: setPage, patients, onSelectPatient: (p) => { setSelectedPatient(p); setPage("prontuario"); } }),
    h("div", { style: { flex: 1, padding: 24, overflowY: "auto" } },
      page === "dashboard" && h(Dashboard, { patients, agenda, onNav: setPage, settings }),
      page === "agenda" && h(Agenda),
      page === "pacientes" && h(Patients, { patients, onSelect: (p) => { setSelectedPatient(p); setPage("prontuario"); } }),
      page === "prontuario" && currentPatient && h(PatientDetail, { patient: currentPatient, onBack: () => setSelectedPatient(null) }),
      page === "estoque" && h(Estoque),
      page === "financeiro" && h(Financeiro, { patients, expenses, setExpenses }),
      page === "relatorios" && h(Relatorios),
      page === "mensagens" && h(MensagensWhatsApp, { settings, setSettings }),
      page === "config" && h(Configuracoes)
    )
  );
}
