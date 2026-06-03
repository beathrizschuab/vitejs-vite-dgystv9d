import { useState, useEffect, useRef, useMemo, useCallback, createElement, Fragment } from "react";

// ─── SUPABASE CLIENT (via CDN — sem npm install) ──────────────────────────────
const SUPA_URL = "https://syxapyqgqrkqkensbbqj.supabase.co";
const SUPA_KEY = "sb_publishable_f2bBCKBXQoWEZbOPt82grw_KmKSuuo5";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(SUPA_URL, SUPA_KEY);
// ─── CONSTANTS & PALETTE ─────────────────────────────────────────────────────
const DARK_P={bg:"#160b0e",bg2:"#1c1012",bg3:"#221112",card:"#2a1518",card2:"#321a1d",border:"#472325",accent:"#9D7761",accent2:"#9F8475",accent3:"#E1D2C6",rose:"#5C1F32",rose2:"#7a2840",text:"#E1D2C6",text2:"#9F8475",text3:"#6b4d4a",green:"#7aad8a",red:"#c07070",yellow:"#c4a96a",gold:"#855954"};
const LIGHT_P={bg:"#fdf8f6",bg2:"#fff",bg3:"#f5ede8",card:"#fdf2ee",card2:"#f8e8e0",border:"#e8d0c8",accent:"#7a5540",accent2:"#9F8475",accent3:"#3a1a0e",rose:"#8B3252",rose2:"#a04068",text:"#2a1008",text2:"#6b3a28",text3:"#b08070",green:"#3a7a4a",red:"#a04040",yellow:"#8a6020",gold:"#6b3a28"};
let P=DARK_P;
function setTheme(dark){P=dark?DARK_P:LIGHT_P;}
const MONTH_NAMES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const APPT_STATUS=["Confirmado","Aguardando","Realizado","Cancelado","Faltou","Reagendado"];
const APPT_STATUS_CFG={Confirmado:{color:"#7aaed4",bg:"rgba(122,174,212,.14)"},Aguardando:{color:"#c4a96a",bg:"rgba(196,169,106,.14)"},Realizado:{color:"#7aad8a",bg:"rgba(122,173,138,.14)"},Cancelado:{color:"#c07070",bg:"rgba(192,112,112,.14)"},Faltou:{color:"#b07070",bg:"rgba(176,112,112,.12)"},Reagendado:{color:"#9b7aad",bg:"rgba(155,122,173,.13)"}};
const PAT_STATUS_CFG={vip:{label:"VIP ✦",color:"#c4a96a",bg:"rgba(196,169,106,.13)"},active:{label:"Ativa",color:"#7aad8a",bg:"rgba(122,173,138,.12)"},treatment:{label:"Em Tratamento",color:"#7aaed4",bg:"rgba(122,174,212,.12)"},return:{label:"Retorno Pendente",color:"#c4a96a",bg:"rgba(196,169,106,.12)"},inactive:{label:"Inativa",color:"#c07070",bg:"rgba(192,112,112,.12)"},new:{label:"Nova",color:"#9b7aad",bg:"rgba(155,122,173,.12)"}};
const BLOOD_TYPES=["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const SKIN_TYPES=["Normal","Seca","Oleosa","Mista","Sensível"];
const FITZPATRICK=["I","II","III","IV","V","VI"];
const MUSIC_STYLES=["Pop","Rock","Sertanejo","MPB","Eletrônico","Clássica","Jazz","Funk","Gospel","Outro"];
const INTERCORRENCIA_TYPES=["Edema","Hematoma","Assimetria","Dor","Infecção","Nódulo","Alergia","Necrose","Migração","Outro"];
const EXPENSE_CATS=["Aluguel","Marketing","Fornecedores","Produtos","Impostos","Equipamentos","Funcionários","Outros"];
const PAY_METHODS=["Pix","Cartão Crédito","Cartão Débito","Dinheiro","Transferência","Pendente"];

const PROC_SAFETY={
  "Toxina Botulínica":{days:90,label:"3 meses"},
  "Preenchimento Labial":{days:180,label:"6 meses"},
  "Preenchimento Malar":{days:180,label:"6 meses"},
  "Preenchimento Facial":{days:180,label:"6 meses"},
  "Preenchimento Mandíbula":{days:180,label:"6 meses"},
  "Preenchimento Têmpora":{days:180,label:"6 meses"},
  "Preenchimento Jowls":{days:180,label:"6 meses"},
  "Preenchimento Marionete":{days:180,label:"6 meses"},
  "Preenchimento Olheira":{days:180,label:"6 meses"},
  "Preenchimento Bigode Chinês":{days:180,label:"6 meses"},
  "Preenchimento Queixo":{days:180,label:"6 meses"},
  "Bioestimulador de Colágeno":{days:120,label:"4 meses"},
  "Fio de PDO":{days:365,label:"12 meses"},
  "Profhilo":{days:30,label:"30 dias"},
  "Microagulhamento":{days:30,label:"30 dias"},
};

const FIN_STATUS=["Pago","Pendente","Parcial","Cancelado"];
const avColors=["linear-gradient(135deg,#5C1F32,#855954)","linear-gradient(135deg,#855954,#9D7761)","linear-gradient(135deg,#9D7761,#7a2840)","linear-gradient(135deg,#7a2840,#855954)","linear-gradient(135deg,#6b3a4a,#9F8475)"];
const ZONE_DEFS={
  botox:[
    {k:"frontal_c",label:"Frontal",cx:130,cy:56,r:22},{k:"sorrisoGeng_c",label:"Sorr. Gengival",cx:130,cy:73,r:10},{k:"glabela_c",label:"Glabela",cx:130,cy:95,r:14},
    {k:"orbicular_d",label:"Orbicular D",cx:88,cy:109,r:10},{k:"orbicular_e",label:"Orbicular E",cx:172,cy:109,r:10},
    {k:"peGalinha_d",label:"Pé Gal. D",cx:72,cy:120,r:12},{k:"peGalinha_e",label:"Pé Gal. E",cx:188,cy:120,r:12},
    {k:"malar_d",label:"Malar D",cx:80,cy:148,r:12},{k:"malar_e",label:"Malar E",cx:180,cy:148,r:12},
    {k:"buddyLine_d",label:"Buddy Line D",cx:88,cy:167,r:10},{k:"buddyLine_e",label:"Buddy Line E",cx:172,cy:167,r:10},
    {k:"sorrisoTriste_d",label:"Sorr. Triste D",cx:94,cy:185,r:10},{k:"sorrisoTriste_e",label:"Sorr. Triste E",cx:166,cy:185,r:10},
    {k:"masseteres_d",label:"Masseteres D",cx:74,cy:178,r:14},{k:"masseteres_e",label:"Masseteres E",cx:186,cy:178,r:14},
    {k:"mentual_c",label:"Mentual",cx:130,cy:210,r:12},{k:"platisma_d",label:"Platisma D",cx:100,cy:248,r:11},{k:"platisma_e",label:"Platisma E",cx:160,cy:248,r:11},
  ],
  filler:[
    {k:"tempora_d",label:"Têmpora D",cx:68,cy:78,r:13},{k:"tempora_e",label:"Têmpora E",cx:192,cy:78,r:13},
    {k:"olheira_d",label:"Olheira D",cx:94,cy:118,r:11},{k:"olheira_e",label:"Olheira E",cx:166,cy:118,r:11},
    {k:"malar_fill_d",label:"Malar D",cx:80,cy:140,r:14},{k:"malar_fill_e",label:"Malar E",cx:180,cy:140,r:14},
    {k:"sulco_d",label:"Sulco NL D",cx:100,cy:165,r:11},{k:"sulco_e",label:"Sulco NL E",cx:160,cy:165,r:11},
    {k:"bigodeCh_d",label:"Big. Chinês D",cx:106,cy:178,r:10},{k:"bigodeCh_e",label:"Big. Chinês E",cx:154,cy:178,r:10},
    {k:"marionete_d",label:"Marionete D",cx:96,cy:190,r:10},{k:"marionete_e",label:"Marionete E",cx:164,cy:190,r:10},
    {k:"labio_sup",label:"Lábio Sup",cx:130,cy:185,r:12},{k:"labio_inf",label:"Lábio Inf",cx:130,cy:200,r:10},
    {k:"queixo_c",label:"Queixo",cx:130,cy:216,r:12},{k:"mandibula_d",label:"Mandíbula D",cx:82,cy:200,r:12},{k:"mandibula_e",label:"Mandíbula E",cx:178,cy:200,r:12},
    {k:"jowls_d",label:"Jowls D",cx:80,cy:215,r:11},{k:"jowls_e",label:"Jowls E",cx:180,cy:215,r:11},
  ],
  thread:[
    {k:"glabela_thr_c",label:"Glabela",cx:130,cy:95,r:11},{k:"tempora_thr_d",label:"Temporal D",cx:68,cy:78,r:11},{k:"tempora_thr_e",label:"Temporal E",cx:192,cy:78,r:11},
    {k:"olheira_thr_d",label:"Olheira D",cx:94,cy:118,r:10},{k:"olheira_thr_e",label:"Olheira E",cx:166,cy:118,r:10},
    {k:"malar_thr_d",label:"Malar D",cx:78,cy:142,r:11},{k:"malar_thr_e",label:"Malar E",cx:182,cy:142,r:11},
    {k:"bigodeCh_thr_d",label:"Big. Chinês D",cx:104,cy:175,r:10},{k:"bigodeCh_thr_e",label:"Big. Chinês E",cx:156,cy:175,r:10},
    {k:"mandibula_thr_d",label:"Mandíbula D",cx:80,cy:200,r:12},{k:"mandibula_thr_e",label:"Mandíbula E",cx:180,cy:200,r:12},
    {k:"neck_d",label:"Pescoço D",cx:100,cy:248,r:11},{k:"neck_e",label:"Pescoço E",cx:160,cy:248,r:11},
  ]
};

const INIT_PROCEDURES=["Toxina Botulínica","Preenchimento Labial","Preenchimento Malar","Preenchimento Mandíbula","Preenchimento Têmpora","Preenchimento Jowls","Preenchimento Marionete","Preenchimento Olheira","Preenchimento Bigode Chinês","Preenchimento Queixo","Preenchimento Facial","Bioestimulador de Colágeno","Fio de PDO","Microagulhamento","Nano Hidrox","PDRN","Profhilo","Peeling Químico","Exossomos","Skinbooster","Avaliação Inicial","Harmonização Completa","Consultoria","Revisão / Retoque"];
const INIT_PRODUCTS=["Botox Allergan 100U","Dysport 500U","Xeomin 100U","Juvederm Ultra 1ml","Juvederm Volbella 1ml","Restylane 1ml","Sculptra 367mg","Radiesse 1,5ml","Profhilo 2ml","Ellansé M 1ml","Silhouette Soft 8 cones","Aptos Thread","Belotero 1ml"];
const INIT_LOCATIONS=["Barra Olímpica","Nova América"];
const INIT_RETURN_RULES=[
  {id:1,procedure:"Toxina Botulínica",revisionDays:14,maintenanceDays:120,label:"Revisão 14d · Manutenção 4m"},
  {id:2,procedure:"Preenchimento Labial",revisionDays:21,maintenanceDays:180,label:"Revisão 21d · Manutenção 6m"},
  {id:3,procedure:"Preenchimento Malar",revisionDays:21,maintenanceDays:180,label:"Revisão 21d · Manutenção 6m"},
  {id:4,procedure:"Preenchimento Mandíbula",revisionDays:21,maintenanceDays:180,label:""},
  {id:5,procedure:"Preenchimento Têmpora",revisionDays:21,maintenanceDays:180,label:""},
  {id:6,procedure:"Preenchimento Jowls",revisionDays:21,maintenanceDays:180,label:""},
  {id:7,procedure:"Preenchimento Marionete",revisionDays:21,maintenanceDays:180,label:""},
  {id:8,procedure:"Preenchimento Olheira",revisionDays:21,maintenanceDays:180,label:""},
  {id:9,procedure:"Preenchimento Bigode Chinês",revisionDays:21,maintenanceDays:180,label:""},
  {id:10,procedure:"Preenchimento Queixo",revisionDays:21,maintenanceDays:180,label:""},
  {id:11,procedure:"Preenchimento Facial",revisionDays:21,maintenanceDays:180,label:""},
  {id:12,procedure:"Bioestimulador de Colágeno",revisionDays:30,maintenanceDays:180,label:""},
  {id:13,procedure:"Fio de PDO",revisionDays:30,maintenanceDays:365,label:""},
  {id:14,procedure:"Microagulhamento",revisionDays:30,maintenanceDays:90,label:""},
  {id:15,procedure:"Profhilo",revisionDays:30,maintenanceDays:180,label:""},
  {id:16,procedure:"Peeling Químico",revisionDays:21,maintenanceDays:90,label:""},
  {id:17,procedure:"Revisão / Retoque",revisionDays:0,maintenanceDays:90,label:""},
];
const INIT_PATIENTS=[
  {id:"1",name:"Ana Beatriz Martins",age:32,birthDate:"1993-05-28",phone:"(11) 99234-5678",email:"ana@email.com",cpf:"123.456.789-00",bloodType:"O+",allergies:"Nenhuma",since:"03/11/2025",status:"vip",tags:["VIP","Alta frequência"],profilePhoto:null,lastVisit:"28/05/2026",nextReturn:"28/08/2026",complaints:["Linhas de expressão","Volume labial"],
   sessions:[{id:"1",date:"28/05/2026",procedure:"Toxina Botulínica",doctor:"Dra. Sofia",product:"Botox Allergan 100U",dose:"40U",region:"Glabela + Testa",location:"Barra Olímpica",value:850,paid:true,finStatus:"Pago",payMethod:"Pix",notes:"40U total. Glabela (20U), frontal (12U), pé de galinha D/E.",evolution:"Retorno em 14 dias.",faceMap:{type:"botox",points:{glabela_c:20,frontal_c:12,peGalinha_d:8,peGalinha_e:6}},photos:[],docs:[],intercorrencias:[],returnReminderDays:90}],
   sessions_packages:[],intercorrencias:[],planejamento:[],
   anamnese:{healthHistory:"Sem doenças crônicas",medications:"Anticoncepcional",smoking:"Não",pregnancy:"Não",previousProcedures:"Nenhum",skinType:"Mista",fitzpatrick:"III",allergiesDetail:"Sem alergias conhecidas.",contraindications:"Nenhuma",musicStyle:"Pop",importantAlerts:[]}},
];
const INIT_AGENDA=[
  {id:"1",patientName:"Ana Beatriz Martins",date:"2026-05-28",time:"09:00",procedure:"Toxina Botulínica",location:"Barra Olímpica",duration:"1 hora",value:850,status:"Realizado",obs:""},
];
const INIT_EXPENSES=[
  {id:"1",desc:"Aluguel Barra Olímpica",date:"2026-05-05",cat:"Aluguel",value:4800,status:"Pago",notes:""},
];

const safeList = arr => Array.isArray(arr) ? arr : [];
const initials=n=>n?n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase():"";
const fmtCurr=v=>"R$"+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:0});
const parseDMY=s=>{if(!s)return null;const[d,m,y]=s.split("/");return new Date(`${y}-${m}-${d}`);};
const daysBetween=(a,b)=>Math.floor((b-a)/(1000*60*60*24));
const todayISO=()=>new Date().toISOString().slice(0,10);

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
      (async () => {
        if (!uid.current) return;
        const toUpsert = Array.isArray(next)
          ? next.map(r => ({ ...r, user_id: uid.current }))
          : [{ ...next, user_id: uid.current }];
        await supabase.from(table).upsert(toUpsert, { onConflict: "id" });
        if (Array.isArray(prev) && Array.isArray(next)) {
          const nextIds = new Set(next.map(r => r.id));
          const removed = prev.filter(r => r.id && !nextIds.has(r.id));
          for (const r of removed) {
            await supabase.from(table).delete().eq("id", r.id);
          }
        }
      })();
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
            doctorName: row.doctor_name || row.name || defaults.doctorName,
            doctorTitle: row.doctor_title || row.profession || defaults.doctorTitle,
            clinicName: row.clinic_name || row.clinicname || defaults.clinicName,
            procedures: row.procedures || [],
            locations: row.locations || [],
            whatsappMessages: row.whatsappMessages || row.whatsappmessages || [],
          });
        }
        if (!cancelled) setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, []);

  const setData = useCallback(async (valOrFn) => {
    setDataRaw(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      (async () => {
        if (!uid.current) return;
        await supabase.from("settings").upsert({
          user_id: uid.current,
          doctor_name: next.doctorName,
          doctor_title: next.doctorTitle,
          clinic_name: next.clinicName,
          procedures: next.procedures,
          locations: next.locations,
          whatsappMessages: next.whatsappMessages,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      })();
      return next;
    });
  }, []);

  return [data, setData, loading];
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const h = createElement;

  async function handleLogin() {
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError("E-mail ou senha incorretos.");
    else onLogin();
  }

  return h(Fragment, null,
    h("style", null, `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:${P.bg};color:${P.text};font-family:'DM Sans',sans-serif;}`),
    h("div", {
      style: {
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 0%, rgba(92,31,50,.35) 0%, ${P.bg} 65%)`,
      }
    },
      h("div", { style: { width: 380, padding: "48px 40px", background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.6)" } },
        h("div", { style: { textAlign: "center", marginBottom: 36 } },
          h("div", { style: { fontFamily: "'Cormorant Garamond',serif", fontSize: 34, color: P.accent3, letterSpacing: ".04em", lineHeight: 1.1 } }, "HarmonizaPro"),
          h("div", { style: { fontSize: 11, color: P.text3, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 6 } }, "Gestão de Clínica")
        ),
        h("div", { style: { marginBottom: 16 } },
          h("label", { style: { display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: P.text3, marginBottom: 7, fontWeight: 500 } }, "E-mail"),
          h("input", {
            type: "email", value: email,
            onChange: e => setEmail(e.target.value),
            onKeyDown: e => e.key === "Enter" && handleLogin(),
            placeholder: "seu@email.com",
            style: { width: "100%", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, padding: "11px 14px", color: P.text, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none" }
          })
        ),
        h("div", { style: { marginBottom: 24 } },
          h("label", { style: { display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: P.text3, marginBottom: 7, fontWeight: 500 } }, "Senha"),
          h("input", {
            type: "password", value: password,
            onChange: e => setPassword(e.target.value),
            onKeyDown: e => e.key === "Enter" && handleLogin(),
            placeholder: "••••••••",
            style: { width: "100%", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, padding: "11px 14px", color: P.text, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none" }
          })
        ),
        error && h("div", { style: { marginBottom: 16, padding: "10px 14px", background: "rgba(192,112,112,.12)", border: "1px solid rgba(192,112,112,.3)", borderRadius: 8, fontSize: 13, color: P.red } }, error),
        h("button", {
          onClick: handleLogin, disabled: loading,
          style: { width: "100%", padding: "13px", background: `linear-gradient(135deg,${P.rose},${P.gold})`, color: P.accent3, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: loading ? .7 : 1, letterSpacing: ".04em" }
        }, loading ? "Entrando..." : "Entrar"),
        h("div", { style: { marginTop: 24, textAlign: "center", fontSize: 12, color: P.text3 } }, "Acesso restrito — somente usuários autorizados.")
      )
    )
  );
}

function Avatar({name,size=40,idx=0,src=null}){
  if(src)return createElement("img",{src,alt:name,style:{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${P.border}`}});
  return createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:avColors[idx%avColors.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.32,fontWeight:700,color:P.text3,flexShrink:0,border:`1px solid ${P.border}`}},initials(name));
}
function Card({children,style:s,onClick}){return createElement("div",{onClick,style:{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:20,transition:"all .18s",cursor:onClick?"pointer":"default",...s}},children);}
function Modal({open,onClose,title,children,width=520}){
  if(!open)return null;
  return createElement("div",{onClick:e=>{if(e.target===e.currentTarget)onClose();},style:{position:"fixed",inset:0,background:"rgba(10,5,7,.9)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}},
    createElement("div",{style:{background:P.bg2,border:`1px solid ${P.border}`,borderRadius:16,padding:28,width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto"}},
      createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}},
        createElement("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:P.accent3}},title),
        createElement("button",{onClick:onClose,style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:22}},"\u00d7")
      ),children
    )
  );
}
const IS={width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"9px 12px",color:P.text,fontSize:13.5,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};
function Inp({value,onChange,placeholder,type="text",style:s}){return createElement("input",{value,onChange:e=>onChange(e.target.value),placeholder,type,style:{...IS,...s}});}
function Sel({value,onChange,options}){return createElement("select",{value,onChange:e=>onChange(e.target.value),style:IS},options.map(o=>createElement("option",{key:o,value:o},o)));}
function TA({value,onChange,placeholder,rows=3}){return createElement("textarea",{value,onChange:e=>onChange(e.target.value),placeholder,rows,style:{...IS,resize:"vertical"}});}
function Btn({children,onClick,variant="primary",style:s,disabled=false}){
  const vs={primary:{background:`linear-gradient(135deg,${P.rose},${P.gold})`,color:P.accent3,border:"none"},ghost:{background:"transparent",color:P.text2,border:`1px solid ${P.border}`},danger:{background:"rgba(192,112,112,.1)",color:P.red,border:"1px solid rgba(192,112,112,.2)"},sm:{background:`linear-gradient(135deg,${P.rose},${P.gold})`,color:P.accent3,border:"none",padding:"5px 10px",fontSize:11}};
  return createElement("button",{onClick,disabled,style:{padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s",opacity:disabled?.5:1,...vs[variant],...s}},children);
}
function Field({label,children,half,third}){
  return createElement("div",{style:{marginBottom:14,flex:third?"0 0 calc(33% - 8px)":half?"0 0 calc(50% - 6px)":"1 1 100%"}},
    createElement("label",{style:{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:".12em",color:P.text3,marginBottom:6,fontWeight:500}},label),children);
}
function TabBar({tabs,active,onChange}){
  return createElement("div",{style:{display:"flex",gap:2,marginBottom:20,background:P.bg2,padding:4,borderRadius:10,border:`1px solid ${P.border}`,width:"fit-content",flexWrap:"wrap"}},
    tabs.map(t=>createElement("button",{key:t.k,onClick:()=>onChange(t.k),style:{padding:"7px 14px",borderRadius:7,fontSize:12.5,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",border:"none",transition:"all .15s",background:active===t.k?P.rose:"transparent",color:active===t.k?P.accent3:P.text3}},t.l)));
}
function SectionHeader({title,sub,action}){
  return createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
    createElement("div",null,createElement("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:P.text,letterSpacing:".02em",lineHeight:1.1}},title),sub&&createElement("div",{style:{fontSize:13,color:P.text3,marginTop:5}},sub)),action);
}
function StatusBadge({status,cfg=PAT_STATUS_CFG}){const c=cfg[status]||cfg.active;return createElement("span",{style:{display:"inline-block",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,color:c.color,background:c.bg}},c.label);}
function AlertBadge({text,color=P.red}){return createElement("span",{style:{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,color,background:color+"18",border:`1px solid ${color}44`,marginRight:6,marginBottom:4}},`⚠ ${text}`);}
function UploadZone({onFiles,accept="image/*",label,multiple=true}){
  const ref=useRef();
  const[drag,setDrag]=useState(false);
  return createElement("div",{onDragOver:e=>{e.preventDefault();setDrag(true);},onDragLeave:()=>setDrag(false),onDrop:e=>{e.preventDefault();setDrag(false);onFiles([...e.dataTransfer.files]);},onClick:()=>ref.current.click(),style:{border:`2px dashed ${drag?P.accent:P.border}`,borderRadius:10,padding:"14px",textAlign:"center",cursor:"pointer",background:drag?"rgba(157,119,97,.06)":P.bg3}},
    createElement("div",{style:{fontSize:18,marginBottom:4}},"📎"),
    createElement("div",{style:{fontSize:12,color:P.text3}},label||"Clique ou arraste"),
    createElement("input",{ref,type:"file",accept,multiple,onChange:e=>onFiles([...e.target.files]),style:{display:"none"}}));
}

function FaceMap({mapType="botox",points={},onChange,readOnly=false}){
  const[active,setActive]=useState(null);
  const[inp,setInp]=useState("");
  const zones=ZONE_DEFS[mapType]||ZONE_DEFS.botox;
  const unit=mapType==="botox"?"U":"ml";
  const zColor=mapType==="botox"?P.rose:mapType==="filler"?"#7a5590":P.gold;
  function click(k){if(readOnly)return;setActive(k);setInp(String(points[k]||""));}
  function confirm(){if(!active)return;onChange({...points,[active]:Number(inp)||0});setActive(null);}
  const h=createElement;
  return h("div",{style:{position:"relative",display:"inline-block",userSelect:"none"}},
    h("svg",{width:260,height:280,viewBox:"0 0 260 280"},
      h("path",{d:"M108 235 Q108 268 130 272 Q152 268 152 235",fill:P.bg3,stroke:P.border,strokeWidth:"1"}),
      h("ellipse",{cx:130,cy:148,rx:82,ry:110,fill:P.bg3,stroke:P.border,strokeWidth:"1.5"}),
      h("ellipse",{cx:130,cy:40,rx:82,ry:32,fill:P.card2,stroke:P.border,strokeWidth:"1"}),
      h("path",{d:"M95 100 Q105 95 118 98",fill:"none",stroke:P.text3,strokeWidth:"1.5",strokeLinecap:"round"}),
      h("path",{d:"M142 98 Q155 95 165 100",fill:"none",stroke:P.text3,strokeWidth:"1.5",strokeLinecap:"round"}),
      h("ellipse",{cx:107,cy:110,rx:13,ry:6,fill:"none",stroke:P.accent2,strokeWidth:"1.2"}),
      h("circle",{cx:107,cy:110,r:3.5,fill:P.border}),
      h("ellipse",{cx:153,cy:110,rx:13,ry:6,fill:"none",stroke:P.accent2,strokeWidth:"1.2"}),
      h("circle",{cx:153,cy:110,r:3.5,fill:P.border}),
      h("path",{d:"M122 128 L117 155 Q130 160 143 155 L138 128",fill:"none",stroke:P.text3,strokeWidth:"1"}),
      h("path",{d:"M112 182 Q122 177 130 178 Q138 177 148 182 Q138 190 130 190 Q122 190 112 182Z",fill:P.border,stroke:P.accent2,strokeWidth:"1"}),
      h("path",{d:"M112 182 Q130 186 148 182",fill:"none",stroke:P.accent2,strokeWidth:"1"}),
      h("path",{d:"M110 205 Q130 225 150 205",fill:"none",stroke:P.text3,strokeWidth:"1"}),
      ...zones.map(z=>{
        const val=points[z.k]||0,isSet=val>0,isAct=active===z.k;
        return h("g",{key:z.k,onClick:()=>click(z.k),style:{cursor:readOnly?"default":"pointer"}},
          h("circle",{cx:z.cx,cy:z.cy,r:z.r,fill:isAct?P.accent:isSet?zColor:"transparent",stroke:isAct?P.text:isSet?P.accent3:P.text3,strokeWidth:isAct?2:1,strokeDasharray:isSet?"none":"3 2",opacity:isAct?1:isSet?.85:.4}),
          isSet&&h("text",{x:z.cx,y:z.cy+3,textAnchor:"middle",fontSize:9,fontWeight:700,fill:P.text},val)
        );
      })
    ),
    active&&h("div",{style:{position:"absolute",top:60,left:45,background:P.bg2,padding:12,borderRadius:10,border:`1px solid ${P.border}`,boxShadow:"0 10px 30px rgba(0,0,0,.5)",zIndex:10,width:170,textAlign:"center"}},
      h("div",{style:{fontSize:11,color:P.text2,marginBottom:6,fontWeight:600}},zones.find(z=>z.k===active)?.label),
      h("div",{style:{display:"flex",gap:6,justifyContent:"center",alignItems:"center"}},
        h("input",{value:inp,onChange:e=>setInp(e.target.value),placeholder:"0",type:"number",autoFocus:true,style:{width:60,padding:"4px 8px",background:P.bg3,border:`1px solid ${P.border}`,color:P.text,borderRadius:6,fontSize:12,outline:"none"}}),
        h("span",{style:{fontSize:12,color:P.text3}},unit),
        h(Btn,{onClick:confirm,variant:"sm",style:{padding:"4px 10px"}},"Ok")
      )
    )
  );
}

// ─── COMPONENTES DE PAINEL ──────────────────────────────────────────────────
function Dashboard({patients,agenda,onNav,onSelectPatient,settings,returnRules}){
  const h=createElement;
  const tAct=agenda.filter(a=>a.date===todayISO());
  const tC=tAct.filter(a=>a.status==="Confirmado").length;
  const tR=tAct.filter(a=>a.status==="Realizado").length;
  
  const rets=useMemo(()=>{
    const list=[];
    const rulesMap=new Map(returnRules.map(r=>[r.procedure,r]));
    for(const p of patients){
      if(!p.sessions||p.sessions.length===0)continue;
      const sorted=[...safeList(p.sessions)].sort((a,b)=>parseDMY(b.date)-parseDMY(a.date));
      const last=sorted[0];
      const r=rulesMap.get(last.procedure);
      if(!r||!r.maintenanceDays)continue;
      const dLast=parseDMY(last.date);
      if(!dLast)continue;
      const dTarget=new Date(dLast.getTime()+(r.maintenanceDays*24*60*60*1000));
      const days=daysBetween(new Date(),dTarget);
      if(days<=15)list.push({patient:p,proc:last.procedure,date:dTarget.toLocaleDateString("pt-BR"),days});
    }
    return list.sort((a,b)=>a.days-b.days).slice(0,4);
  },[patients,returnRules]);

  return h("div",null,
    h("div",{style:{background:`linear-gradient(135deg,${P.card},${P.bg2})`,border:`1px solid ${P.border}`,borderRadius:16,padding:"32px 28px",marginBottom:24,position:"relative",overflow:"hidden"}},
      h("div",{style:{position:"absolute",right:-20,top:-20,fontSize:140,opacity:.03,fontFamily:"serif",fontStyle:"italic"}},"✦"),
      h("div",{style:{fontSize:13,color:P.accent,letterSpacing:".14em",textTransform:"uppercase",fontWeight:600}},settings.clinicName),
      h("h1",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:P.accent3,marginTop:4,fontWeight:400}},`Olá, ${settings.doctorName}`),
      h("p",{style:{fontSize:13,color:P.text3,marginTop:2}},settings.doctorTitle)
    ),
    h("div",{style:{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}},
      h("div",{style:{flex:"1 1 calc(25% - 12px)",minWidth:160}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3,letterSpacing:".08em"}},"Hoje"),h("div",{style:{fontSize:28,fontFamily:"serif",color:P.accent3,marginTop:6}},tAct.length),h("div",{style:{fontSize:12,color:P.text3,marginTop:4}},`${tC} confirmados · ${tR} concluintes`))),
      h("div",{style:{flex:"1 1 calc(25% - 12px)",minWidth:160}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3,letterSpacing:".08em"}},"Total Pacientes"),h("div",{style:{fontSize:28,fontFamily:"serif",color:P.accent3,marginTop:6}},patients.length),h("div",{style:{fontSize:12,color:P.green,marginTop:4}},`✦ Ativas e VIPs`))),
      h("div",{style:{flex:"1 1 calc(25% - 12px)",minWidth:160}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3,letterSpacing:".08em"}},"Retornos Alvo"),h("div",{style:{fontSize:28,fontFamily:"serif",color:P.accent3,marginTop:6}},rets.length),h("div",{style:{fontSize:12,color:P.yellow,marginTop:4}},"Próximos 15 dias"))),
    ),
    h("div",{style:{display:"flex",gap:16,flexWrap:"wrap"}},
      h("div",{style:{flex:"1 1 calc(60% - 8px)",minWidth:320}},h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:16}},h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3}},"Agenda de Hoje"),h(Btn,{variant:"ghost",onClick:()=>onNav("agenda"),style:{padding:"3px 10px",fontSize:11}},"Ver agenda")),
        tAct.length===0?h("div",{style:{color:P.text3,fontSize:13,padding:"20px 0",textAlign:"center"}},"Nenhum atendimento agendado para hoje."):
        h("div",{style:{display:"flex",flexDirection:"column",gap:10}},tAct.map((a,i)=>{
          const pat=patients.find(p=>p.name===a.patientName);
          return h("div",{key:a.id||i,onClick:()=>{if(pat){onSelectPatient(pat);onNav("prontuario");}},style:{display:"flex",alignItems:"center",gap:12,padding:10,background:P.bg3,borderRadius:8,cursor:pat?"pointer":"default",border:`1px solid ${P.border}`}},
            h(Avatar,{name:a.patientName,size:34,idx:i}),
            h("div",{style:{flex:1}},h("div",{style:{fontSize:13.5,fontWeight:500}},a.patientName),h("div",{style:{fontSize:11.5,color:P.text3}},`${a.time} · ${a.procedure}`)),
            h(StatusBadge,{status:a.status,cfg:APPT_STATUS_CFG})
          );
        }))
      )),
      h("div",{style:{flex:"1 1 calc(40% - 8px)",minWidth:260}},h(Card,null,
        h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3,marginBottom:16}},"Alertas de Manutenção"),
        rets.length===0?h("div",{style:{color:P.text3,fontSize:13,padding:"20px 0"}},"Nenhum alerta de retorno no momento."):
        h("div",{style:{display:"flex",flexDirection:"column",gap:10}},rets.map((r,i)=>h("div",{key:i,onClick:()=>{onSelectPatient(r.patient);onNav("prontuario");},style:{padding:10,background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,cursor:"pointer"}},
          h("div",{style:{fontSize:13,fontWeight:500}},r.patient.name),
          h("div",{style:{fontSize:11.5,color:P.text2,marginTop:2}},`${r.proc} (${r.date})`),
          h("div",{style:{fontSize:11,color:r.days<=0?P.red:P.yellow,marginTop:4,fontWeight:500}},r.days<=0?`Vencido há ${Math.abs(r.days)} dias`:`Vence em ${r.days} dias`)
        )))
      ))
    )
  );
}

function Sidebar({page,onNav,patients,agenda,onSelectPatient}){
  const h=createElement;
  const[q,setQ]=useState("");
  const[openSearch,setOpenSearch]=useState(false);

  const filtered = useMemo(() => {
    if (!q) return [];
    return (patients || []).filter(p => p && p.name && p.name.toLowerCase().includes(q.toLowerCase()));
  }, [q, patients]);

  function select(p){onSelectPatient(p);onNav("prontuario");setQ("");setOpenSearch(false);}
  const menu=[{k:"dashboard",l:"Painel",e:"✦"},{k:"agenda",l:"Agenda",e:"📅"},{k:"pacientes",l:"Pacientes",e:"👥"},{k:"prontuario",l:"Prontuário",e:"📝"},{k:"retornos",l:"Retornos",e:"⏳"},{k:"estoque",l:"Estoque",e:"📦"},{k:"financeiro",l:"Financeiro",e:"💰"},{k:"relatorios",l:"Relatórios",e:"📊"},{k:"mensagens",l:"Mensagens WhatsApp",e:"💬"},{k:"config",l:"Configurações",e:"⚙"}];
  return h("div",{style:{width:240,background:P.bg2,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",height:"100vh",flexShrink:0}},
    h("div",{style:{padding:"24px 20px",borderBottom:`1px solid ${P.border}`,position:"relative"}},
      h("button",{onClick:()=>setOpenSearch(true),style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",color:P.text3,fontSize:12.5,textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:6}},h("span",null,"🔍"),"Buscar paciente..."),
      h(Modal,{open:openSearch,onClose:()=>setOpenSearch(false),title:"Buscar Paciente",width:420},
        h(Inp,{value:q,onChange:setQ,placeholder:"Digite o nome do paciente...",autoFocus:true}),
        h("div",{style:{marginTop:14,display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}},
          q && filtered.length===0&&h("div",{style:{fontSize:13,color:P.text3,padding:10}},"Nenhum paciente localizado."),
          filtered.map((p,i)=>h("div",{key:p.id||i,onClick:()=>select(p),style:{padding:"9px 12px",background:P.bg3,borderRadius:8,cursor:"pointer",fontSize:13.5,display:"flex",alignItems:"center",gap:10,border:`1px solid ${P.border}`}},h(Avatar,{name:p.name,size:24,idx:i}),p.name))
        )
      )
    ),
    h("div",{style:{flex:1,padding:"16px 12px",display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}},
      menu.map(m=>h("button",{key:m.k,onClick:()=>onNav(m.k),style:{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 14px",background:page===m.k?P.rose:"transparent",color:page===m.k?P.accent3:P.text2,border:"none",borderRadius:8,fontSize:13,fontWeight:page===m.k?600:400,cursor:"pointer",textAlign:"left",transition:"all .15s"}},h("span",{style:{fontSize:14,opacity:page===m.k?1:.6}},m.e),m.l))
    ),
    h("div",{style:{padding:16,borderTop:`1px solid ${P.border}`,textAlign:"center"}},h(Btn,{variant:"ghost",onClick:async()=>{await supabase.auth.signOut();window.location.reload();},style:{width:"100%",fontSize:12}},"Sair da Conta"))
  );
}

function Agenda({patients,agenda,setAgenda,procedures,locations}){
  const h=createElement;
  const[modal,setModal]=useState(false);
  const[evt,setEvt]=useState({patientName:"",date:todayISO(),time:"09:00",procedure:procedures[0]||"",location:locations[0]||"",duration:"1 hora",value:"",status:"Confirmado",obs:""});
  function save(){
    if(!evt.patientName)return;
    const item={...evt,id:evt.id||String(Date.now()),value:Number(evt.value)||0};
    setAgenda(prev=>evt.id?prev.map(a=>a.id===evt.id?item:a):[...prev,item]);
    setModal(false);
  }
  function del(id){if(confirm("Excluir agendamento?")){setAgenda(prev=>prev.filter(a=>a.id!==id));setModal(false);}}
  const sorted=[...agenda].sort((a,b)=>a.date.localeCompare(b.date)||(a.time||"").localeCompare(b.time||""));
  return h("div",null,
    h(SectionHeader,{title:"Agenda de Atendimentos",sub:"Gerencie seus horários e consultas",action:h(Btn,{onClick:()=>{setEvt({patientName:"",date:todayISO(),time:"09:00",procedure:procedures[0]||"",location:locations[0]||"",duration:"1 hora",value:"",status:"Confirmado",obs:""});setModal(true);}},"✦ Novo Agendamento")}),
    h(Card,{style:{padding:0,overflow:"hidden"}},
      h("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:13.5,textAlign:"left"}},
        h("thead",{style:{background:P.bg2,color:P.text3,fontSize:11,textTransform:"uppercase"}},h("tr",null,h("th",{style:{padding:"12px 16px"}},"Data/Hora"),h("th",null,"Paciente"),h("th",null,"Procedimento"),h("th",null,"Local"),h("th",null,"Valor"),h("th",null,"Status"),h("th",{style:{padding:"12px 16px",textAlign:"right"}},"Ações"))),
        h("tbody",null,sorted.map((a,i)=>h("tr",{key:a.id||i,style:{borderBottom:`1px solid ${P.border}`}},
          h("td",{style:{padding:"14px 16px",fontWeight:500}},`${a.date.split("-").reverse().slice(0,2).join("/")} às ${a.time}`),
          h("td",null,a.patientName),h("td",null,a.procedure),h("td",null,a.location),h("td",null,fmtCurr(a.value)),
          h("td",null,h(StatusBadge,{status:a.status,cfg:APPT_STATUS_CFG})),
          h("td",{style:{padding:"14px 16px",textAlign:"right"}},h(Btn,{variant:"ghost",onClick:()=>{setEvt(a);setModal(true);},style:{padding:"4px 10px",fontSize:11}},"Editar"))
        )))
      )
    ),
    h(Modal,{open:modal,onClose:()=>setModal(false),title:evt.id?"Editar Agendamento":"Novo Agendamento"},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Paciente"},h(Inp,{value:evt.patientName,onChange:v=>setEvt({...evt,patientName:v}),placeholder:"Nome do paciente"})),
        h(Field,{label:"Procedimento",half:true},h(Sel,{value:evt.procedure,onChange:v=>setEvt({...evt,procedure:v}),options:procedures})),
        h(Field,{label:"Local",half:true},h(Sel,{value:evt.location,onChange:v=>setEvt({...evt,location:v}),options:locations})),
        h(Field,{label:"Data",third:true},h(Inp,{type:"date",value:evt.date,onChange:v=>setEvt({...evt,date:v})})),
        h(Field,{label:"Horário",third:true},h(Inp,{placeholder:"09:00",value:evt.time,onChange:v=>setEvt({...evt,time:v})})),
        h(Field,{label:"Duração",third:true},h(Inp,{placeholder:"1 hora",value:evt.duration,onChange:v=>setEvt({...evt,duration:v})})),
        h(Field,{label:"Valor Cobrado (R$)",half:true},h(Inp,{type:"number",placeholder:"0",value:evt.value,onChange:v=>setEvt({...evt,value:v})})),
        h(Field,{label:"Status",half:true},h(Sel,{value:evt.status,onChange:v=>setEvt({...evt,status:v}),options:APPT_STATUS})),
        h(Field,{label:"Observações"},h(TA,{value:evt.obs,onChange:v=>setEvt({...evt,obs:v}),placeholder:"Notas internas..."}))
      ),
      h("div",{style:{display:"flex",justifyContent:"space-between",marginTop:16}},
        evt.id?h(Btn,{variant:"danger",onClick:()=>del(evt.id)},"Excluir"):h("div"),
        h("div",{style:{display:"flex",gap:8}},h(Btn,{variant:"ghost",onClick:()=>setModal(false)},"Cancelar"),h(Btn,{onClick:save},"Salvar"))
      )
    )
  );
}

function Patients({patients,setPatients,onSelect,procedures,locations}){
  const h=createElement;
  const[modal,setModal]=useState(false);
  const[pat,setPat]=useState({name:"",age:"",phone:"",email:"",status:"new",tags:[],complaints:[],anamnese:{}});
  function save(){
    if(!pat.name)return;
    const item={...pat,id:pat.id||String(Date.now()),since:pat.since||new Date().toLocaleDateString("pt-BR")};
    setPatients(prev=>pat.id?prev.map(p=>p.id===pat.id?item:p):[...prev,item]);
    setModal(false);
  }
  return h("div",null,
    h(SectionHeader,{title:"Carteira de Pacientes",sub:"Históricos, fichas e registros corporais",action:h(Btn,{onClick:()=>{setPat({name:"",age:"",phone:"",email:"",status:"new",tags:[],complaints:[],anamnese:{}});setModal(true);}},"✦ Cadastrar Paciente")}),
    h("div",{style:{display:"flex",flexDirection:"column",gap:10}},patients.map((p,i)=>h(Card,{key:p.id||i,onClick:()=>onSelect(p),style:{display:"flex",alignItems:"center",gap:16,padding:16}},
      h(Avatar,{name:p.name,size:44,idx:i}),
      h("div",{style:{flex:1}},h("div",{style:{fontSize:15,fontWeight:600,color:P.accent3}},p.name),h("div",{style:{fontSize:12,color:P.text3,marginTop:3}},`Idade: ${p.age||"N/I"} · Tel: ${p.phone||"N/I"} · Prontuário desde: ${p.since||""}`)),
      h("div",{style:{textAlign:"right"}},h(StatusBadge,{status:p.status}))
    ))),
    h(Modal,{open:modal,onClose:()=>setModal(false),title:"Ficha Cadastral"},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Nome Completo"},h(Inp,{value:pat.name,onChange:v=>setPat({...pat,name:v}),placeholder:"Nome do paciente"})),
        h(Field,{label:"Idade",third:true},h(Inp,{type:"number",value:pat.age,onChange:v=>setPat({...pat,age:v})})),
        h(Field,{label:"Telefone",third:true},h(Inp,{placeholder:"(11) 99999-9999",value:pat.phone,onChange:v=>setPat({...pat,phone:v})})),
        h(Field,{label:"E-mail",third:true},h(Inp,{placeholder:"parceiro@email.com",value:pat.email,onChange:v=>setPat({...pat,email:v})})),
        h(Field,{label:"Status do Paciente",half:true},h(Sel,{value:pat.status,onChange:v=>setPat({...pat,status:v}),options:Object.keys(PAT_STATUS_CFG)}))
      ),
      h("div",{style:{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}},h(Btn,{variant:"ghost",onClick:()=>setModal(false)},"Cancelar"),h(Btn,{onClick:save},"Salvar Paciente"))
    )
  );
}

function PatientDetail({patient,setPatients,onBack,procedures,locations,products,returnRules}){
  const h=createElement;
  const[tab,setTab]=useState("historico");
  const[sMod,setSMod]=useState(false);
  const[sess,setSess]=useState({date:todayISO(),procedure:procedures[0]||"",doctor:"",product:products[0]||"",dose:"",region:"",location:locations[0]||"",value:"",paid:true,finStatus:"Pago",payMethod:"Pix",notes:"",evolution:"",faceMap:null});
  const[fmType,setFmType]=useState("botox");

  function saveSess(){
    const nSess={...sess,id:sess.id||String(Date.now()),value:Number(sess.value)||0};
    const updSess=sess.id?safeList(patient.sessions).map(s=>s.id===sess.id?nSess:s):[...safeList(patient.sessions),nSess];
    const updPat={...patient,sessions:updSess,lastVisit:new Date().toLocaleDateString("pt-BR")};
    setPatients(prev=>prev.map(p=>p.id===patient.id?updPat:p));
    setSMod(false);
  }

  const alerts=useMemo(()=>{
    const arr=[];
    if(patient.anamnese?.allergiesDetail)arr.push(patient.anamnese.allergiesDetail);
    if(patient.anamnese?.importantAlerts)arr.push(...patient.anamnese.importantAlerts);
    return arr;
  },[patient]);

  return h("div",null,
    h("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:20}},h(Btn,{variant:"ghost",onClick:onBack,style:{padding:"6px 12px"}},"← Voltar"),h("div",{style:{fontSize:13,color:P.text3}},`Ficha clínica / ${patient.name}`)),
    h("div",{style:{display:"flex",gap:20,alignItems:"center",marginBottom:24,background:P.card,padding:20,borderRadius:14,border:`1px solid ${P.border}`}},
      h(Avatar,{name:patient.name,size:54}),
      h("div",{style:{flex:1}},h("h2",{style:{fontFamily:"serif",color:P.accent3,fontSize:22}},patient.name),h("div",{style:{fontSize:12.5,color:P.text3,marginTop:4}},`CPF: ${patient.cpf||"Não informado"} · Tel: ${patient.phone} · E-mail: ${patient.email}`)),
      h("div",null,h(StatusBadge,{status:patient.status}))
    ),
    alerts.length>0&&h("div",{style:{marginBottom:20}},alerts.map((al,i)=>h(AlertBadge,{key:i,text:al}))),
    h(TabBar,{tabs:[{k:"historico",l:"Histórico de Sessões"},{k:"anamnese",l:"Anamnese"},{k:"planejamento",l:"Plano de Tratamento"}],active:tab,onChange:setTab}),
    
    tab==="historico"&&h("div",null,
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},h("div",{style:{fontSize:15,fontWeight:600,color:P.accent3}},"Aplicações Realizadas"),h(Btn,{onClick:()=>{setSess({date:todayISO(),procedure:procedures[0]||"",doctor:"",product:products[0]||"",dose:"",region:"",location:locations[0]||"",value:"",paid:true,finStatus:"Pago",payMethod:"Pix",notes:"",evolution:"",faceMap:null});setSMod(true);},variant:"sm"},"+ Registrar Atendimento")),
      safeList(patient.sessions).length===0?h("div",{style:{color:P.text3,textAlign:"center",padding:40}},"Nenhuma sessão clínica gravada."):
      h("div",{style:{display:"flex",flexDirection:"column",gap:14}},safeList(patient.sessions).map((s,i)=>h(Card,{key:s.id||i},
        h("div",{style:{display:"flex",justifyContent:"space-between"}},h("div",{style:{fontWeight:600,color:P.accent2,fontSize:14.5}},s.procedure),h("div",{style:{fontSize:12,color:P.text3}},s.date)),
        h("div",{style:{display:"flex",gap:24,marginTop:12,flexWrap:"wrap"}},
          s.faceMap?.points&&h("div",null,h(FaceMap,{mapType:s.faceMap.type,points:s.faceMap.points,readOnly:true})),
          h("div",{style:{flex:1,fontSize:13,display:"flex",flexDirection:"column",gap:6}},
            h("div",null,h("b",null,"Profissional: "),s.doctor||"Não informado"),
            h("div",null,h("b",null,"Insumo/Dose: "),`${s.product||""} - ${s.dose||""}`),
            h("div",null,h("b",null,"Região: "),s.region||"Não especificada"),
            s.notes&&h("div",{style:{background:P.bg3,padding:10,borderRadius:8,marginTop:6,color:P.text2}},h("b",null,"Notas clínicas: "),s.notes)
          )
        )
      )))
    ),
    tab==="anamnese"&&h(Card,null,
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:14,fontSize:13.5}},
        h("div",{style:{flex:"1 1 calc(50% - 8px)"}},h("b",null,"Histórico de Saúde: "),patient.anamnese?.healthHistory||"Nada consta"),
        h("div",{style:{flex:"1 1 calc(50% - 8px)"}},h("b",null,"Medicamentos de uso contínuo: "),patient.anamnese?.medications||"Nenhum"),
        h("div",{style:{flex:"1 1 calc(33% - 10px)"}},h("b",null,"Fumante: "),patient.anamnese?.smoking||"Não"),
        h("div",{style:{flex:"1 1 calc(33% - 10px)"}},h("b",null,"Gestante/Lactante: "),patient.anamnese?.pregnancy||"Não"),
        h("div",{style:{flex:"1 1 calc(33% - 10px)"}},h("b",null,"Tipo de Pele: "),patient.anamnese?.skinType||"Não informado"),
        h("div",{style:{flex:"1 1 100%",borderTop:`1px solid ${P.border}`,paddingTop:12,marginTop:6}},h("b",null,"Procedimentos estéticos anteriores: "),patient.anamnese?.previousProcedures||"Nenhum")
      )
    ),
    tab==="planejamento"&&h(Card,null,h("div",{style:{color:P.text3,textAlign:"center",padding:20}},"Módulo de planejamento de metas estéticas.")),

    h(Modal,{open:sMod,onClose:()=>setSMod(false),title:"Novo Registro Clínico",width:680},
      h("div",{style:{display:"flex",gap:20,flexWrap:"wrap"}},
        h("div",{style:{flex:"1 1 300px",display:"flex",flexDirection:"column",gap:10}},
          h(Field,{label:"Procedimento"},h(Sel,{value:sess.procedure,onChange:v=>setSess({...sess,procedure:v}),options:procedures})),
          h(Field,{label:"Insumo utilizado"},h(Sel,{value:sess.product,onChange:v=>setSess({...sess,product:v}),options:products})),
          h("div",{style:{display:"flex",gap:10}},
            h(Field,{label:"Dose/Quantidade",half:true},h(Inp,{placeholder:"Ex: 40U ou 1ml",value:sess.dose,onChange:v=>setSess({...sess,dose:v})})),
            h(Field,{label:"Valor Praticado",half:true},h(Inp,{type:"number",placeholder:"0.00",value:sess.value,onChange:v=>setSess({...sess,value:v})}))
          ),
          h(Field,{label:"Notas de Evolução"},h(TA,{rows:4,placeholder:"Técnica aplicada, intercorrências...",value:sess.notes,onChange:v=>setSess({...sess,notes:v})}))
        ),
        h("div",{style:{flex:"1 1 280px",textAlign:"center",borderLeft:`1px solid ${P.border}`,paddingLeft:16}},
          h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3,marginBottom:8,fontWeight:600}},"Mapeamento de Pontos"),
          h("div",{style:{display:"flex",justifyContent:"center",gap:6,marginBottom:10}},
            h(Btn,{variant:fmType==="botox"?"primary":"ghost",onClick:()=>{setFmType("botox");setSess({...sess,faceMap:{type:"botox",points:{}}});},style:{padding:"3px 8px",fontSize:10}},"Toxina"),
            h(Btn,{variant:fmType==="filler"?"primary":"ghost",onClick:()=>{setFmType("filler");setSess({...sess,faceMap:{type:"filler",points:{}}});},style:{padding:"3px 8px",fontSize:10}},"Preench."),
            h(Btn,{variant:fmType==="thread"?"primary":"ghost",onClick:()=>{setFmType("thread");setSess({...sess,faceMap:{type:"thread",points:{}}});},style:{padding:"3px 8px",fontSize:10}},"Fios")
          ),
          h(FaceMap,{mapType:fmType,points:sess.faceMap?.points||{},onChange:(pts)=>setSess({...sess,faceMap:{type:fmType,points:pts}})})
        )
      ),
      h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}},h(Btn,{variant:"ghost",onClick:()=>setSMod(false)},"Cancelar"),h(Btn,{onClick:saveSess},"Gravar Sessão"))
    )
  );
}

function Estoque({products,setProducts}){
  const h=createElement;
  const[m,setM]=useState(false);
  const[p,setP]=useState({name:"",cat:INIT_PRODUCTS[0],qty:"",min:"",unit:"Unidade",expiry:"",cost:""});
  function save(){
    if(!p.name)return;
    const item={...p,id:p.id||String(Date.now())};
    setProducts(prev=>p.id?prev.map(x=>x.id===p.id?item:x):[...prev,item]);
    setM(false);
  }
  return h("div",null,
    h(SectionHeader,{title:"Controle de Insumos e Estoque",sub:"Evite quebras de materiais em tratamentos",action:h(Btn,{onClick:()=>{setP({name:"",cat:INIT_PRODUCTS[0],qty:"",min:"",unit:"Unidade",expiry:"",cost:""});setM(true);}},"✦ Adicionar Material")}),
    h(Card,{style:{padding:0,overflow:"hidden"}},
      h("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:13.5,textAlign:"left"}},
        h("thead",{style:{background:P.bg2,color:P.text3,fontSize:11,textTransform:"uppercase"}},h("tr",null,h("th",{style:{padding:"12px 16px"}},"Item"),h("th",null,"Quantidade"),h("th",null,"Mínimo Alvo"),h("th",null,"Status"))),
        h("tbody",null,products.map((x,i)=>{
          const q=Number(x.qty)||0,mn=Number(x.min)||0;
          const low=q<=mn;
          return h("tr",{key:x.id||i,style:{borderBottom:`1px solid ${P.border}`}},
            h("td",{style:{padding:"14px 16px",fontWeight:500}},x.name),h("td",null,`${x.qty} ${x.unit||"un"}`),h("td",null,`${x.min} ${x.unit||"un"}`),
            h("td",null,h("span",{style:{color:low?P.red:P.green,fontWeight:500}},low?"⚠ Estoque Crítico":"✓ Seguro"))
          );
        }))
      )
    ),
    h(Modal,{open:m,onClose:()=>setM(false),title:"Ficha de Produto"},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Nome do Insumo"},h(Inp,{value:p.name,onChange:v=>setP({...p,name:v})})),
        h(Field,{label:"Quantidade Atual",half:true},h(Inp,{type:"number",value:p.qty,onChange:v=>setP({...p,qty:v})})),
        h(Field,{label:"Alerta Mínimo",half:true},h(Inp,{type:"number",value:p.min,onChange:v=>setP({...p,min:v})}))
      ),
      h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}},h(Btn,{variant:"ghost",onClick:()=>setM(false)},"Cancelar"),h(Btn,{onClick:save},"Salvar"))
    )
  );
}

function Financeiro({patients,setPatients,expenses,setExpenses,incomes,setIncomes}){
  const h=createElement;
  const[m,setM]=useState(false);
  const[exp,setNewExpense]=useState({desc:"",date:todayISO(),cat:EXPENSE_CATS[0],value:"",status:"Pago",notes:""});
  
  const totInc=useMemo(()=>{
    let sum=0;
    for(const p of patients){
      if(!p.sessions)continue;
      for(const s of safeList(p.sessions)){if(s.value&&s.finStatus==="Pago")sum+=Number(s.value);}
    }
    return sum;
  },[patients]);

  const totExp=useMemo(()=>expenses.reduce((acc,curr)=>acc+Number(curr.value||0),0),[expenses]);

  function saveExpense(){
    if(!exp.desc||!exp.value)return;
    const item={...exp,id:String(Date.now()),value:Number(exp.value)};
    setExpenses(prev=>[...prev,item]);
    setM(false);
    setNewExpense({desc:"",date:todayISO(),cat:EXPENSE_CATS[0],value:"",status:"Pago",notes:""});
  }

  return h("div",null,
    h(SectionHeader,{title:"Fluxo Financeiro",sub:"Acompanhamento de caixa e notas",action:h(Btn,{onClick:()=>setM(true)},"✦ Lançar Despesa")}),
    h("div",{style:{display:"flex",gap:16,marginBottom:24}},
      h("div",{style:{flex:1}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3}},"Faturamento (Receitas)"),h("div",{style:{fontSize:26,fontFamily:"serif",color:P.green,marginTop:4}},fmtCurr(totInc)))),
      h("div",{style:{flex:1}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3}},"Despesas Saídas"),h("div",{style:{fontSize:26,fontFamily:"serif",color:P.red,marginTop:4}},fmtCurr(totExp)))),
      h("div",{style:{flex:1}},h(Card,null,h("div",{style:{fontSize:11,textTransform:"uppercase",color:P.text3}},"Balanço Líquido"),h("div",{style:{fontSize:26,fontFamily:"serif",color:totInc-totExp>=0?P.accent3:P.red,marginTop:4}},fmtCurr(totInc-totExp))))
    ),
    h(Card,{style:{padding:0,overflow:"hidden"}},
      h("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:13.5,textAlign:"left"}},
        h("thead",{style:{background:P.bg2,color:P.text3,fontSize:11,textTransform:"uppercase"}},h("tr",null,h("th",{style:{padding:"12px 16px"}},"Descrição"),h("th",null,"Data"),h("th",null,"Categoria"),h("th",null,"Valor"),h("th",{style:{padding:"12px 16px",textAlign:"right"}},"Status"))),
        h("tbody",null,expenses.map((e,i)=>h("tr",{key:e.id||i,style:{borderBottom:`1px solid ${P.border}`}},
          h("td",{style:{padding:"14px 16px",fontWeight:500}},e.desc),h("td",null,e.date),h("td",null,e.cat),h("td",null,fmtCurr(e.value)),
          h("td",{style:{padding:"14px 16px",textAlign:"right",color:P.red}},"● Saída")
        )))
      )
    ),
    h(Modal,{open:m,onClose:()=>setM(false),title:"Nova Despesa"},
      h("div",{style:{display:"flex",flexDirection:"column",gap:12}},
        h(Field,{label:"Descrição"},h(Inp,{value:exp.desc,onChange:v=>setNewExpense({...exp,desc:v}),placeholder:"Ex: Energia elétrica, Aluguel"})),
        h("div",{style:{display:"flex",gap:10}},
          h(Field,{label:"Valor (R$)",half:true},h(Inp,{type:"number",value:exp.value,onChange:v=>setNewExpense({...exp,value:v}),placeholder:"0.00"})),
          h(Field,{label:"Data",half:true},h(Inp,{type:"date",value:exp.date,onChange:v=>setNewExpense({...exp,date:v})}))
        ),
        h(Field,{label:"Categoria"},h(Sel,{value:exp.cat,onChange:v=>setNewExpense({...exp,cat:v}),options:EXPENSE_CATS}))
      ),
      h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}},h(Btn,{variant:"ghost",onClick:()=>setM(false)},"Cancelar"),h(Btn,{onClick:saveExpense},"Lançar"))
    )
  );
}

function Relatorios({patients,onSelectPatient,onNav}){
  const h=createElement;
  
  const calculated = useMemo(() => {
    let tot = 0;
    const procs = {};
    
    for (const p of patients || []) {
      if (!p || !p.sessions) continue;
      const list = safeList(p.sessions);
      for (const s of list) {
        if (!s) continue;
        const val = Number(s.value) || 0;
        tot += val;
        if (s.procedure) {
          procs[s.procedure] = (procs[s.procedure] || 0) + 1;
        }
      }
    }
    return { tot, procs: Object.entries(procs) };
  }, [patients]);

  return h("div",null,
    h(SectionHeader,{title:"Métricas e Estatísticas",sub:"Indicadores de performance comercial e clínica"}),
    h("div",{style:{display:"flex",gap:16,flexWrap:"wrap"}},
      h("div",{style:{flex:"1 1 300px"}},h(Card,null,
        h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3,marginBottom:16}},"Ranking de Procedimentos Aplicados"),
        calculated.procs.length===0?h("div",{style:{color:P.text3,fontSize:13}},"Nenhum dado clínico acumulado para gráficos."):
        h("div",{style:{display:"flex",flexDirection:"column",gap:12}},calculated.procs.map(([name,count],i)=>h("div",{key:i},
          h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:4}},h("div",null,name),h("div",{style:{color:P.accent,fontWeight:600}},`${count} aplicações`)),
          h("div",{style:{width:"100%",background:P.bg3,height:6,borderRadius:3,overflow:"hidden"}},h("div",{style:{background:P.rose,height:"100%",width:`${Math.min(count*10,100)}%`}}))
        )))
      )),
      h("div",{style:{flex:"1 1 240px"}},h(Card,null,h("div",{style:{fontSize:13,fontWeight:600,color:P.accent3}},"Volume Total Faturado"),h("div",{style:{fontSize:32,fontFamily:"serif",color:P.green,marginTop:10}},fmtCurr(calculated.tot)),h("p",{style:{fontSize:12,color:P.text3,marginTop:6}},"Receita bruta gerada a partir das evoluções de prontuário gravadas.")))
    )
  );
}

function MensagensWhatsApp({patients}){
  const h=createElement;
  return h("div",null,
    h(SectionHeader,{title:"Mensagens e Alertas WhatsApp",sub:"Modelos de textos automatizados para pós-procedimento"}),
    h("div",{style:{display:"flex",flexDirection:"column",gap:14}},
      h(Card,null,
        h("div",{style:{fontWeight:600,color:P.accent3,fontSize:14.5,marginBottom:8}},"Template 1: Revisão de Toxina Botulínica (14 dias)"),
        h("div",{style:{background:P.bg3,padding:14,borderRadius:8,fontSize:13,color:P.text2,fontFamily:"monospace",whiteSpace:"pre-wrap"}},
          "Olá {nome}, tudo bem? Aqui é da clínica HarmonizaPro.\n\nLembrando que já completaram 14 dias desde a sua aplicação de Toxina Botulínica. Esse é o momento ideal para avaliarmos o seu resultado e realizar qualquer retoque necessário se houver necessidade.\n\nPodemos confirmar o seu horário para essa semana?"
        ),
        h("div",{style:{marginTop:12,textAlign:"right"}},h(Btn,{variant:"ghost",style:{padding:"4px 12px",fontSize:11}},"Editar Template"))
      ),
      h(Card,null,
        h("div",{style:{fontWeight:600,color:P.accent3,fontSize:14.5,marginBottom:8}},"Template 2: Manutenção Pós Preenchimento (6 meses)"),
        h("div",{style:{background:P.bg3,padding:14,borderRadius:8,fontSize:13,color:P.text2,fontFamily:"monospace",whiteSpace:"pre-wrap"}},
          "Olá {nome}! Esperamos que esteja amando os seus lábios.\n\nFaz cerca de 6 meses desde o seu último preenchimento labial. Como o ácido hialurônico é absorvido naturalmente, esse é o período indicado para uma nova sessão de manutenção para manter o volume e contorno desenhados.\n\nVamos agendar um horário?"
        ),
        h("div",{style:{marginTop:12,textAlign:"right"}},h(Btn,{variant:"ghost",style:{padding:"4px 12px",fontSize:11}},"Editar Template"))
      )
    )
  );
}

function Configuracoes({procedures,setProcedures,locations,setLocations,products,setProducts,settings,setSettings,returnRules,setReturnRules}){
  const h=createElement;
  const[docName,setDocName]=useState(settings.doctorName);
  const[docTitle,setDocTitle]=useState(settings.doctorTitle);
  const[clName,setClName]=useState(settings.clinicName);

  function saveProfile(){
    setSettings({doctorName:docName,doctorTitle:docTitle,clinicName:clName,procedures,locations,whatsappMessages:settings.whatsappMessages});
    alert("Perfil da clínica gravado com sucesso!");
  }

  return h("div",null,
    h(SectionHeader,{title:"Configurações Globais",sub:"Ajuste os parâmetros estruturais do seu consultório"}),
    h("div",{style:{display:"flex",gap:16,flexWrap:"wrap"}},
      h("div",{style:{flex:"1 1 100%"}},h(Card,null,
        h("div",{style:{fontSize:15,fontWeight:600,color:P.accent3,marginBottom:16}},"Perfil Profissional e Clínica"),
        h("div",{style:{display:"flex",gap:12,flexWrap:"wrap"}},
          h(Field,{label:"Nome do Profissional",third:true},h(Inp,{value:docName,onChange:setDocName})),
          h(Field,{label:"Especialidade / Título",third:true},h(Inp,{value:docTitle,onChange:setDocTitle})),
          h(Field,{label:"Nome da Clínica",third:true},h(Inp,{value:clName,onChange:setClName}))
        ),
        h("div",{style:{marginTop:10,textAlign:"right"}},h(Btn,{onClick:saveProfile},"Gravar Alterações Perfil"))
      )),
      h("div",{style:{flex:"1 1 calc(50% - 8px)"}},h(Card,null,
        h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3,marginBottom:12}},"Lista de Procedimentos Ativos"),
        h("div",{style:{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflowY:"auto",paddingRight:4}},procedures.map((p,i)=>h("div",{key:i,style:{padding:"6px 10px",background:P.bg3,borderRadius:6,fontSize:13,border:`1px solid ${P.border}`}},p)))
      )),
      h("div",{style:{flex:"1 1 calc(50% - 8px)"}},h(Card,null,
        h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3,marginBottom:12}},"Unidades e Consultórios"),
        h("div",{style:{display:"flex",flexDirection:"column",gap:6}},locations.map((l,i)=>h("div",{key:i,style:{padding:"6px 10px",background:P.bg3,borderRadius:6,fontSize:13,border:`1px solid ${P.border}`}},l)))
      ))
    )
  );
}

function RetornosPendentes({patients,returnRules,onSelectPatient,onNav}){
  const h=createElement;
  const rets=useMemo(()=>{
    const list=[];
    const rulesMap=new Map((returnRules||[]).map(r=>[r.procedure,r]));
    for(const p of patients||[]){
      if(!p.sessions||safeList(p.sessions).length===0)continue;
      const sorted=[...safeList(p.sessions)].sort((a,b)=>parseDMY(b.date)-parseDMY(a.date));
      const last=sorted[0];
      const r=rulesMap.get(last.procedure);
      if(!r||!r.maintenanceDays)continue;
      const dLast=parseDMY(last.date);
      if(!dLast)continue;
      const dTarget=new Date(dLast.getTime()+(r.maintenanceDays*24*60*60*1000));
      const days=daysBetween(new Date(),dTarget);
      list.push({patient:p,proc:last.procedure,date:dTarget.toLocaleDateString("pt-BR"),days});
    }
    return list.sort((a,b)=>a.days-b.days);
  },[patients,returnRules]);

  return h("div",null,
    h(SectionHeader,{title:"Retornos Pendentes",sub:"Pacientes com manutenção próxima ou vencida"}),
    rets.length===0
      ? h(Card,null,h("div",{style:{color:P.text3,textAlign:"center",padding:40}},"Nenhum retorno pendente no momento."))
      : h("div",{style:{display:"flex",flexDirection:"column",gap:10}},
          rets.map((r,i)=>h(Card,{key:i,onClick:()=>{onSelectPatient(r.patient);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:16,padding:16}},
            h(Avatar,{name:r.patient.name,size:40,idx:i}),
            h("div",{style:{flex:1}},
              h("div",{style:{fontSize:14,fontWeight:600,color:P.accent3}},r.patient.name),
              h("div",{style:{fontSize:12,color:P.text3,marginTop:3}},`${r.proc} · Manutenção: ${r.date}`)
            ),
            h("div",{style:{fontWeight:600,fontSize:13,color:r.days<=0?P.red:r.days<=15?P.yellow:P.green}},
              r.days<=0?`Vencido há ${Math.abs(r.days)}d`:`Em ${r.days} dias`
            )
          ))
        )
  );
}

// ─── MAIN APP RAIZ ────────────────────────────────────────────────────────────
export default function App() {
  const h = createElement;
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [currentPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients, pLoad] = useSupaTable("patients", INIT_PATIENTS);
  const [agenda, setAgenda, aLoad] = useSupaTable("agenda", INIT_AGENDA);
  const [products, setProducts, prLoad] = useSupaTable("products", INIT_PRODUCTS.map((p,i)=>({id:String(i+1),name:p,qty:10,min:2,unit:"Unidades"})));
  const [expenses, setExpenses, eLoad] = useSupaTable("expenses", INIT_EXPENSES);
  const [incomes, setIncomes] = useState([]);
  
  const [settings, setSettings, sLoad] = useSettings({
    doctorName: "Dra. Beatriz Schuab",
    doctorTitle: "Biomédica Responsável",
    clinicName: "HarmonizaPro",
    procedures: INIT_PROCEDURES,
    locations: INIT_LOCATIONS,
    whatsappMessages: []
  });

  const [returnRules, setReturnRules] = useState(INIT_RETURN_RULES);

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

  const handleNav = useCallback((p) => {
    setPage(p);
    if (p !== "prontuario") setSelectedPatient(null);
  }, []);

  const handleSelectPatient = useCallback((p) => {
    setSelectedPatient(p);
    setPage("prontuario");
  }, []);

  if (authLoading) {
    return h("div", { style: { minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", color: P.text3, fontSize: 14 } }, "Autenticando...");
  }
  if (!session) {
    return h(LoginScreen, { onLogin: () => supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s)) });
  }

  const appLoading = pLoad || aLoad || prLoad || eLoad || sLoad;

  return h("div", { style: { display: "flex", background: P.bg, color: P.text, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" } },
    h("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${P.bg}; }
      ::-webkit-scrollbar-thumb { background: ${P.border}; borderRadius: 3px; }
    `),
    h(Sidebar, { page, onNav: handleNav, patients, agenda, onSelectPatient: handleSelectPatient }),
    h("div", { style: { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" } },
      appLoading && h("div", { style: { padding: "8px 24px", background: "rgba(196,169,106,.1)", fontSize: 12, color: P.yellow, textAlign: "center" } }, "Sincronizando dados com nuvem Supabase..."),
      h("div", { style: { flex: 1, overflowY: "auto", padding: 24 } },
        page === "dashboard" && h(Dashboard, { patients, agenda, onNav: handleNav, onSelectPatient: handleSelectPatient, settings, returnRules }),
        page === "retornos" && h(RetornosPendentes, { patients, returnRules, onSelectPatient: handleSelectPatient, onNav: handleNav }),
        page === "agenda" && h(Agenda, { patients, agenda, setAgenda, procedures: settings.procedures, locations: settings.locations }),
        page === "pacientes" && h(Patients, { patients, setPatients, onSelect: handleSelectPatient, procedures: settings.procedures, locations: settings.locations }),
        page === "prontuario" && !currentPatient && h(Patients, { patients, setPatients, onSelect: handleSelectPatient, procedures: settings.procedures, locations: settings.locations }),
        page === "prontuario" && currentPatient && h(PatientDetail, { patient: currentPatient, setPatients, onBack: () => setSelectedPatient(null), procedures: settings.procedures, locations: settings.locations, products: products.map(p => p.name), returnRules }),
        page === "estoque" && h(Estoque, { products, setProducts }),
        page === "financeiro" && h(Financeiro, { patients, setPatients, expenses, setExpenses, incomes, setIncomes }),
        page === "relatorios" && h(Relatorios, { patients, onSelectPatient: handleSelectPatient, onNav: handleNav }),
        page === "mensagens" && h(MensagensWhatsApp, { patients }),
        page === "config" && h(Configuracoes, { procedures: settings.procedures, setProcedures: (p) => setSettings({ ...settings, procedures: p }), locations: settings.locations, setLocations: (l) => setSettings({ ...settings, locations: l }), products, setProducts, settings, setSettings, returnRules, setReturnRules })
      )
    )
  );
}
