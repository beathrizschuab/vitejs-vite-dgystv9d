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

const EXPENSE_CATS = ["Aluguel", "Marketing", "Fornecedores", "Produtos", "Impostos", "Equipamentos", "Funcionários", "Outros"];
const INIT_PROCEDURES = ["Toxina Botulínica", "Preenchimento Labial", "Bioestimulador", "Fio de PDO", "Avaliação Inicial"];
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
        if (!cancelled && rows && rows.length > 0) setDataRaw(rows);
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [table]);

  // FIX: setData agora aceita item único OU array, e garante user_id em todos
  const setData = useCallback((valOrFn) => {
    setDataRaw(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (uid.current) {
        const toUpsert = (Array.isArray(next) ? next : [next])
          .map(r => ({ ...r, user_id: uid.current }));
        if (toUpsert.length > 0) {
          supabase.from(table).upsert(toUpsert, { onConflict: "id" }).then(() => {});
        }
      }
      return Array.isArray(next) ? next : prev;
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
            whatsappMessages: row.whatsapp_messages || []
          });
        }
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, []);

  const setData = useCallback((valOrFn) => {
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
          // FIX: coluna correta no Supabase (snake_case)
          whatsapp_messages: next.whatsappMessages
        }, { onConflict: "user_id" }).then(() => {});
      }
      return next;
    });
  }, []);

  return [data, setData, loading];
}

// ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
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
    if (err) { setError("Acesso recusado. Verifique os dados."); setLoading(false); }
    // FIX: não chama setLoading(true) de novo em caso de sucesso — deixa onLogin redirecionar
    else onLogin();
  }

  return h("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: P.bg } },
    h("div", { style: { width: 360, padding: 40, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 16 } },
      h("div", { style: { textAlign: "center", marginBottom: 24 } },
        h("h2", { style: { color: P.accent3, fontSize: 28, fontFamily: "serif" } }, "HarmonizaPro")
      ),
      h("div", { style: { marginBottom: 16 } },
        h("input", { type: "email", placeholder: "E-mail", value: email, onChange: e => setEmail(e.target.value), style: { width: "100%", padding: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none", boxSizing: "border-box" } })
      ),
      h("div", { style: { marginBottom: 20 } },
        h("input", { type: "password", placeholder: "Senha", value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === "Enter" && handleLogin(), style: { width: "100%", padding: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none", boxSizing: "border-box" } })
      ),
      error && h("div", { style: { color: P.red, fontSize: 13, marginBottom: 12 } }, error),
      h("button", { onClick: handleLogin, disabled: loading, style: { width: "100%", padding: 12, background: P.rose, color: P.accent3, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" } }, loading ? "Entrando..." : "Acessar Sistema")
    )
  );
}

// ─── INTERFACE COMPONENTS ───────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  return createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: P.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: P.accent3, border: `1px solid ${P.border}`, flexShrink: 0 } }, initials(name));
}
function Card({ children, style: s, onClick }) {
  return createElement("div", { onClick, style: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20, ...s } }, children);
}
function Btn({ children, onClick, variant = "primary", style: s }) {
  const bg = variant === "primary" ? P.rose : variant === "danger" ? "rgba(192,112,112,.1)" : "transparent";
  const tc = variant === "danger" ? P.red : P.accent3;
  const bd = variant === "ghost" ? `1px solid ${P.border}` : "none";
  return createElement("button", { onClick, style: { padding: "9px 16px", background: bg, color: tc, border: bd, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", ...s } }, children);
}

// FIX: Modal reescrito sem position:fixed — usa overlay normal para não causar tela branca
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  const h = createElement;
  return h("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.75)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // Garante que o overlay tenha altura para renderizar no iframe/Stackblitz
      minHeight: "100vh",
    }
  },
    h("div", {
      onClick: e => e.stopPropagation(),
      style: { background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24, width: 480, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" }
    },
      h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } },
        h("h3", { style: { color: P.accent3, fontFamily: "serif", fontSize: 20, margin: 0 } }, title),
        h("button", { onClick: onClose, style: { background: "none", border: "none", color: P.text3, fontSize: 22, cursor: "pointer", lineHeight: 1 } }, "×")
      ),
      children
    )
  );
}

// ─── SIDEBAR (BUSCA CORRIGIDA) ──────────────────────────────────────────────
function Sidebar({ page, onNav, patients = [], onSelectPatient }) {
  const h = createElement;
  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const filtered = useMemo(() => {
    if (!q || q.length < 1) return [];
    return (patients || []).filter(p => p && p.name && p.name.toLowerCase().includes(q.toLowerCase()));
  }, [q, patients]);

  function handleSelect(p) {
    setQ("");
    setOpenSearch(false);
    onSelectPatient(p);
  }

  const menu = [
    { k: "dashboard", l: "Painel", e: "✦" },
    { k: "pacientes", l: "Pacientes", e: "👥" },
    { k: "financeiro", l: "Financeiro", e: "💰" },
    { k: "mensagens", l: "Mensagens WhatsApp", e: "💬" }
  ];

  return h("div", { style: { width: 240, minWidth: 240, background: P.bg2, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 } },
    h("div", { style: { padding: 20, borderBottom: `1px solid ${P.border}` } },
      h("button", {
        onClick: () => setOpenSearch(true),
        style: { width: "100%", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 12px", color: P.text2, fontSize: 13, textAlign: "left", cursor: "pointer" }
      }, "🔍 Buscar paciente..."),

      // FIX: Modal de busca com stopPropagation para não fechar ao digitar
      h(Modal, { open: openSearch, onClose: () => { setOpenSearch(false); setQ(""); }, title: "Localizar Ficha Clínica" },
        h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          h("input", {
            type: "text",
            placeholder: "Digite o nome da paciente...",
            value: q,
            autoFocus: true,
            onChange: e => setQ(e.target.value),
            style: { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none", boxSizing: "border-box" }
          }),
          h("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" } },
            q && filtered.length === 0 && h("div", { style: { color: P.text3, fontSize: 13, padding: 8 } }, "Nenhuma paciente encontrada."),
            filtered.map((p, i) => h("div", {
              key: p.id || i,
              onClick: () => handleSelect(p),
              style: { padding: 10, background: P.bg3, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${P.border}` }
            },
              h(Avatar, { name: p.name, size: 28 }),
              h("span", { style: { fontSize: 13.5, color: P.text } }, p.name)
            ))
          )
        )
      )
    ),
    h("div", { style: { flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" } },
      menu.map(m => h("button", {
        key: m.k,
        onClick: () => onNav(m.k),
        style: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", background: page === m.k ? P.rose : "transparent", color: P.accent3, border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", textAlign: "left" }
      }, h("span", null, m.e), m.l))
    ),
    h("div", { style: { padding: 16, borderTop: `1px solid ${P.border}` } },
      h(Btn, { variant: "ghost", onClick: () => { supabase.auth.signOut(); window.location.reload(); }, style: { width: "100%" } }, "Sair")
    )
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ patients = [], settings }) {
  const h = createElement;
  const totalSessions = useMemo(() => {
    let count = 0;
    patients.forEach(p => { if (p?.sessions) count += p.sessions.length; });
    return count;
  }, [patients]);

  return h("div", null,
    h("div", { style: { background: P.card, border: `1px solid ${P.border}`, padding: 24, borderRadius: 16, marginBottom: 20 } },
      h("h1", { style: { fontFamily: "serif", fontSize: 28, color: P.accent3, margin: 0 } }, `Bem-vinda, ${settings.doctorName}`),
      h("p", { style: { fontSize: 13, color: P.text3, marginTop: 6, marginBottom: 0 } }, `${settings.clinicName} · Painel de Gestão Estética`)
    ),
    h("div", { style: { display: "flex", gap: 16, flexWrap: "wrap" } },
      h(Card, { style: { flex: 1, minWidth: 140 } },
        h("div", { style: { fontSize: 12, color: P.text3 } }, "Total Pacientes"),
        h("div", { style: { fontSize: 28, color: P.accent2, marginTop: 4, fontWeight: 600 } }, patients.length)
      ),
      h(Card, { style: { flex: 1, minWidth: 140 } },
        h("div", { style: { fontSize: 12, color: P.text3 } }, "Atendimentos"),
        h("div", { style: { fontSize: 28, color: P.accent2, marginTop: 4, fontWeight: 600 } }, totalSessions)
      )
    )
  );
}

// ─── PACIENTES ───────────────────────────────────────────────────────────────
function Patients({ patients = [], onSelect, onAdd }) {
  const h = createElement;
  return h("div", null,
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
      h("h2", { style: { color: P.accent3, fontFamily: "serif", fontSize: 24, margin: 0 } }, "Fichas Clínicas"),
    ),
    patients.length === 0
      ? h(Card, null, h("p", { style: { color: P.text3, textAlign: "center", margin: 0 } }, "Nenhuma paciente cadastrada."))
      : h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          patients.map(p => h(Card, {
            key: p.id,
            onClick: () => onSelect(p),
            style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "background .15s" }
          },
            h(Avatar, { name: p.name }),
            h("div", null,
              h("div", { style: { color: P.text, fontWeight: 600 } }, p.name),
              h("div", { style: { color: P.text3, fontSize: 12, marginTop: 2 } }, p.phone || "Sem telefone")
            )
          ))
        )
  );
}

// ─── DETALHE DO PRONTUÁRIO (CORRIGIDO — não retorna null) ─────────────────────
function PatientDetail({ patient, onBack }) {
  const h = createElement;

  // FIX: guarda o paciente em estado local para nunca perder a referência
  const [p] = useState(patient);

  if (!p) {
    return h("div", null,
      h(Btn, { onClick: onBack, variant: "ghost", style: { marginBottom: 16 } }, "← Voltar para Lista"),
      h(Card, null, h("p", { style: { color: P.text3 } }, "Paciente não encontrada."))
    );
  }

  const sessions = p.sessions || [];

  return h("div", null,
    h(Btn, { onClick: onBack, variant: "ghost", style: { marginBottom: 16 } }, "← Voltar para Lista"),
    h(Card, { style: { marginBottom: 16 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 } },
        h(Avatar, { name: p.name, size: 52 }),
        h("div", null,
          h("h3", { style: { color: P.accent3, fontFamily: "serif", fontSize: 22, margin: 0 } }, p.name),
          h("p", { style: { color: P.text2, fontSize: 14, margin: "4px 0 0" } }, p.phone || "Telefone não informado"),
          p.email && h("p", { style: { color: P.text3, fontSize: 13, margin: "2px 0 0" } }, p.email)
        )
      ),
      h("div", { style: { borderTop: `1px solid ${P.border}`, paddingTop: 16 } },
        h("div", { style: { fontSize: 13, color: P.text3, marginBottom: 8 } }, "Histórico de Sessões"),
        sessions.length === 0
          ? h("p", { style: { color: P.text3, fontSize: 13 } }, "Nenhuma sessão registrada.")
          : h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
              sessions.map((s, i) => h("div", {
                key: s.id || i,
                style: { background: P.bg3, borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }
              },
                h("div", null,
                  h("div", { style: { color: P.text, fontWeight: 600, fontSize: 14 } }, s.procedure || "Procedimento"),
                  h("div", { style: { color: P.text3, fontSize: 12, marginTop: 2 } }, s.date || "")
                ),
                s.value && h("div", { style: { color: P.green, fontWeight: 600 } }, fmtCurr(s.value))
              ))
            )
      )
    )
  );
}

// ─── FINANCEIRO (SALVAMENTO CORRIGIDO) ───────────────────────────────────────
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
      if (p?.sessions) p.sessions.forEach(s => { if (s?.value) sum += Number(s.value); });
    });
    return sum;
  }, [patients]);

  const saidas = useMemo(() => (expenses || []).reduce((acc, c) => acc + Number(c?.value || 0), 0), [expenses]);

  // FIX: gera id único e passa array novo completo para setExpenses
  function handleSave() {
    if (!desc.trim() || !val) { alert("Informe descrição e valor."); return; }
    const nova = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      desc: desc.trim(),
      value: Number(val),
      date,
      cat
    };
    setExpenses(prev => {
      const updated = [...(prev || []), nova];
      return updated;
    });
    setM(false);
    setDesc(""); setVal(""); setDate(todayISO()); setCat(EXPENSE_CATS[0]);
  }

  const inputStyle = { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none", boxSizing: "border-box" };

  return h("div", null,
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
      h("h2", { style: { fontFamily: "serif", color: P.accent3, fontSize: 24, margin: 0 } }, "Controle Financeiro"),
      h(Btn, { onClick: () => setM(true) }, "+ Lançar Despesa")
    ),
    h("div", { style: { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" } },
      h(Card, { style: { flex: 1, minWidth: 140 } },
        h("div", { style: { fontSize: 12, color: P.text3 } }, "Entradas"),
        h("div", { style: { fontSize: 22, color: P.green, marginTop: 4, fontWeight: 600 } }, fmtCurr(faturamento))
      ),
      h(Card, { style: { flex: 1, minWidth: 140 } },
        h("div", { style: { fontSize: 12, color: P.text3 } }, "Saídas"),
        h("div", { style: { fontSize: 22, color: P.red, marginTop: 4, fontWeight: 600 } }, fmtCurr(saidas))
      ),
      h(Card, { style: { flex: 1, minWidth: 140 } },
        h("div", { style: { fontSize: 12, color: P.text3 } }, "Balanço"),
        h("div", { style: { fontSize: 22, color: faturamento - saidas >= 0 ? P.green : P.red, marginTop: 4, fontWeight: 600 } }, fmtCurr(faturamento - saidas))
      )
    ),

    expenses.length === 0
      ? h(Card, null, h("p", { style: { color: P.text3, textAlign: "center", margin: 0 } }, "Nenhuma despesa lançada."))
      : h(Card, { style: { padding: 0, overflow: "hidden" } },
          h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 } },
            h("thead", { style: { background: P.bg2 } },
              h("tr", null,
                h("th", { style: { padding: 12, textAlign: "left", color: P.text3, fontWeight: 500 } }, "Descrição"),
                h("th", { style: { padding: 8, textAlign: "left", color: P.text3, fontWeight: 500 } }, "Data"),
                h("th", { style: { padding: 8, textAlign: "left", color: P.text3, fontWeight: 500 } }, "Categoria"),
                h("th", { style: { padding: 12, textAlign: "right", color: P.text3, fontWeight: 500 } }, "Valor")
              )
            ),
            h("tbody", null,
              (expenses || []).map((e, i) => h("tr", { key: e.id || i, style: { borderBottom: `1px solid ${P.border}` } },
                h("td", { style: { padding: 12, color: P.text } }, e.desc),
                h("td", { style: { padding: 8, color: P.text2 } }, e.date),
                h("td", { style: { padding: 8, color: P.text2 } }, e.cat),
                h("td", { style: { padding: 12, textAlign: "right", color: P.red, fontWeight: 600 } }, fmtCurr(e.value))
              ))
            )
          )
        ),

    h(Modal, { open: m, onClose: () => setM(false), title: "Adicionar Despesa" },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        h("input", { placeholder: "Descrição do gasto", value: desc, onChange: e => setDesc(e.target.value), style: inputStyle }),
        h("input", { type: "number", placeholder: "Valor (ex: 150.00)", value: val, onChange: e => setVal(e.target.value), style: inputStyle }),
        h("input", { type: "date", value: date, onChange: e => setDate(e.target.value), style: inputStyle }),
        h("select", { value: cat, onChange: e => setCat(e.target.value), style: { ...inputStyle, appearance: "auto" } },
          EXPENSE_CATS.map(c => h("option", { key: c, value: c }, c))
        ),
        h(Btn, { onClick: handleSave, style: { marginTop: 4, width: "100%" } }, "Confirmar Lançamento")
      )
    )
  );
}

// ─── MENSAGENS WHATSAPP (SALVAR CORRIGIDO) ────────────────────────────────────
function MensagensWhatsApp({ settings, setSettings }) {
  const h = createElement;
  const [open, setOpen] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tText, setTText] = useState("");

  // FIX: lê de whatsappMessages com fallback seguro
  const listaMsg = useMemo(() =>
    Array.isArray(settings?.whatsappMessages) ? settings.whatsappMessages : [],
    [settings]
  );

  function handleAddMessage() {
    if (!tTitle.trim() || !tText.trim()) { alert("Insira o título e a mensagem."); return; }
    const novaMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: tTitle.trim(),
      text: tText.trim()
    };
    // FIX: usa setSettings como função para garantir merge com estado atual
    setSettings(prev => ({
      ...prev,
      whatsappMessages: [...(prev.whatsappMessages || []), novaMsg]
    }));
    setOpen(false);
    setTTitle(""); setTText("");
  }

  function handleDelete(id) {
    if (!confirm("Deseja apagar esse template?")) return;
    setSettings(prev => ({
      ...prev,
      whatsappMessages: (prev.whatsappMessages || []).filter(m => m.id !== id)
    }));
  }

  const inputStyle = { width: "100%", padding: 10, background: P.bg3, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, outline: "none", boxSizing: "border-box" };

  return h("div", null,
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
      h("h2", { style: { fontFamily: "serif", color: P.accent3, fontSize: 24, margin: 0 } }, "Modelos de Mensagens Pós-Procedimento"),
      h(Btn, { onClick: () => setOpen(true) }, "+ Novo Template")
    ),

    listaMsg.length === 0
      ? h(Card, null, h("p", { style: { color: P.text3, textAlign: "center", margin: 0 } }, "Nenhum modelo cadastrado. Crie o primeiro!"))
      : h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          listaMsg.map((m, i) => h(Card, { key: m.id || i },
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
              h("div", { style: { fontWeight: 600, color: P.accent2, fontSize: 15 } }, m.title),
              h(Btn, { variant: "danger", onClick: () => handleDelete(m.id), style: { padding: "4px 10px", fontSize: 11 } }, "Excluir")
            ),
            h("div", { style: { background: P.bg3, padding: 12, borderRadius: 8, color: P.text, fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 } }, m.text)
          ))
        ),

    h(Modal, { open, onClose: () => { setOpen(false); setTTitle(""); setTText(""); }, title: "Adicionar Modelo de Mensagem" },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        h("input", { placeholder: "Título (ex: Pós Preenchimento Labial)", value: tTitle, onChange: e => setTTitle(e.target.value), style: inputStyle }),
        h("textarea", { placeholder: "Texto da mensagem que será enviada via WhatsApp...", rows: 6, value: tText, onChange: e => setTText(e.target.value), style: { ...inputStyle, resize: "vertical", fontFamily: "inherit" } }),
        h(Btn, { onClick: handleAddMessage, style: { width: "100%" } }, "Salvar Template")
      )
    )
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const h = createElement;
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [currentPatient, setCurrentPatient] = useState(null);

  const [patients, setPatients] = useSupaTable("patients", [
    { id: "1", name: "Ana Beatriz Martins", phone: "(11) 99234-5678", email: "ana@email.com", status: "vip", sessions: [] }
  ]);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleNav(newPage) {
    // FIX: ao navegar para outra aba, limpa paciente selecionado para evitar prontuário órfão
    if (newPage !== "prontuario") setCurrentPatient(null);
    setPage(newPage);
  }

  function handleSelectPatient(p) {
    setCurrentPatient(p);
    setPage("prontuario");
  }

  if (authLoading) {
    return h("div", { style: { minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", color: P.text, fontFamily: "serif", fontSize: 18 } }, "Iniciando HarmonizaPro...");
  }

  if (!session) {
    return h(LoginScreen, { onLogin: () => window.location.reload() });
  }

  return h("div", { style: { display: "flex", background: P.bg, color: P.text, minHeight: "100vh", fontFamily: "system-ui, sans-serif" } },
    h(Sidebar, {
      page,
      onNav: handleNav,
      patients,
      onSelectPatient: handleSelectPatient
    }),
    h("div", { style: { flex: 1, padding: 24, overflowY: "auto" } },
      page === "dashboard" && h(Dashboard, { patients, settings }),
      page === "pacientes" && h(Patients, { patients, onSelect: handleSelectPatient }),
      // FIX: verifica currentPatient antes de renderizar PatientDetail
      page === "prontuario" && currentPatient
        ? h(PatientDetail, { patient: currentPatient, onBack: () => { setCurrentPatient(null); setPage("pacientes"); } })
        : page === "prontuario" && h("div", null,
            h(Btn, { onClick: () => setPage("pacientes"), variant: "ghost", style: { marginBottom: 16 } }, "← Voltar para Lista"),
            h(Card, null, h("p", { style: { color: P.text3 } }, "Selecione uma paciente na lista."))
          ),
      page === "financeiro" && h(Financeiro, { patients, expenses, setExpenses }),
      page === "mensagens" && h(MensagensWhatsApp, { settings, setSettings })
    )
  );
}
