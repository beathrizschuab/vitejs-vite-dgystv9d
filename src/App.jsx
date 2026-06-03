import { useState, useEffect, useRef, useMemo, useCallback, createElement, Fragment } from "react";

// ─── SUPABASE CLIENT (via CDN — sem npm install) ──────────────────────────────
// O createClient é carregado via importmap no index.html
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

// ─── REGRAS DE SEGURANÇA ENTRE PROCEDIMENTOS ─────────────────────────────────
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
// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_PROCEDURES=["Toxina Botulínica","Preenchimento Labial","Preenchimento Malar","Preenchimento Mandíbula","Preenchimento Têmpora","Preenchimento Jowls","Preenchimento Marionete","Preenchimento Olheira","Preenchimento Bigode Chinês","Preenchimento Queixo","Preenchimento Facial","Bioestimulador de Colágeno","Fio de PDO","Microagulhamento","Nano Hidrox","PDRN","Profhilo","Peeling Químico","Exossomos","Skinbooster","Avaliação Inicial","Harmonização Completa","Consultoria","Revisão / Retoque"];
const INIT_PRODUCTS=["Botox Allergan 100U","Dysport 500U","Xeomin 100U","Juvederm Ultra 1ml","Juvederm Volbella 1ml","Restylane 1ml","Sculptra 367mg","Radiesse 1,5ml","Profhilo 2ml","Ellansé M 1ml","Silhouette Soft 8 cones","Aptos Thread","Belotero 1ml"];
const INIT_LOCATIONS=["Barra Olímpica","Nova América"];
// Prazos padrão de retorno por procedimento (em dias)
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
  {id:1,name:"Ana Beatriz Martins",age:32,birthDate:"1993-05-28",phone:"(11) 99234-5678",email:"ana@email.com",cpf:"123.456.789-00",bloodType:"O+",allergies:"Nenhuma",since:"03/11/2025",status:"vip",tags:["VIP","Alta frequência"],profilePhoto:null,lastVisit:"28/05/2026",nextReturn:"28/08/2026",complaints:["Linhas de expressão","Volume labial"],
   sessions:[{id:1,date:"28/05/2026",procedure:"Toxina Botulínica",doctor:"Dra. Sofia",product:"Botox Allergan 100U",dose:"40U",region:"Glabela + Testa",location:"Barra Olímpica",value:850,paid:true,finStatus:"Pago",payMethod:"Pix",notes:"40U total. Glabela (20U), frontal (12U), pé de galinha D/E.",evolution:"Retorno em 14 dias.",faceMap:{type:"botox",points:{glabela_c:20,frontal_c:12,peGalinha_d:8,peGalinha_e:6}},photos:[],docs:[],intercorrencias:[],returnReminderDays:90}],
   sessions_packages:[],intercorrencias:[],planejamento:[],
   anamnese:{healthHistory:"Sem doenças crônicas",medications:"Anticoncepcional",smoking:"Não",pregnancy:"Não",previousProcedures:"Nenhum",skinType:"Mista",fitzpatrick:"III",allergiesDetail:"Sem alergias conhecidas.",contraindications:"Nenhuma",musicStyle:"Pop",importantAlerts:[]}},
  {id:2,name:"Camila R. Souza",age:28,birthDate:"1997-06-15",phone:"(11) 98876-1234",email:"camila@email.com",cpf:"987.654.321-00",bloodType:"A+",allergies:"Dipirona",since:"10/01/2026",status:"active",tags:["Recorrente"],profilePhoto:null,lastVisit:"28/05/2026",nextReturn:"28/08/2026",complaints:["Volume labial"],
   sessions:[{id:1,date:"28/05/2026",procedure:"Preenchimento Labial",doctor:"Dra. Sofia",product:"Juvederm Volbella 1ml",dose:"1ml",region:"Lábio superior",location:"Barra Olímpica",value:1200,paid:true,finStatus:"Pago",payMethod:"Cartão",notes:"Técnica linear. Resultado harmonioso.",evolution:"",faceMap:null,photos:[],docs:[],intercorrencias:[],returnReminderDays:180}],
   sessions_packages:[],intercorrencias:[],planejamento:[],
   anamnese:{healthHistory:"Rinite alérgica",medications:"Loratadina ocasional",smoking:"Não",pregnancy:"Não",previousProcedures:"Preenchimento (2024)",skinType:"Seca",fitzpatrick:"II",allergiesDetail:"Alergia à dipirona — reação cutânea. Usar paracetamol.",contraindications:"Dipirona contraindicada",musicStyle:"Sertanejo",importantAlerts:["Alergia à Dipirona"]}},
  {id:3,name:"Fernanda Lopes",age:35,birthDate:"1990-09-03",phone:"(11) 97654-3210",email:"fernanda@email.com",cpf:"111.222.333-44",bloodType:"B+",allergies:"Nenhuma",since:"12/03/2026",status:"treatment",tags:["Em Tratamento"],profilePhoto:null,lastVisit:"12/05/2026",nextReturn:"28/05/2026",complaints:["Flacidez","Sulcos"],
   sessions:[{id:1,date:"12/05/2026",procedure:"Bioestimulador de Colágeno",doctor:"Dra. Sofia",product:"Sculptra 367mg",dose:"2 frascos",region:"Região malar",location:"Nova América",value:2400,paid:false,finStatus:"Pendente",payMethod:"Pendente",notes:"Primeira sessão de Sculptra.",evolution:"Aguardar 4-6 semanas.",faceMap:null,photos:[],docs:[],intercorrencias:[],returnReminderDays:60}],
   sessions_packages:[{id:1,name:"Sculptra 3 sessões",total:3,done:1,value:7200,active:true,expiry:"12/2026"}],intercorrencias:[],planejamento:[{id:1,title:"Protocolo Bioestimulação",steps:["Sculptra sessão 1 ✓","Sculptra sessão 2","Sculptra sessão 3","Manutenção 6 meses"],notes:"Plano aprovado em 12/03/2026",done:false}],
   anamnese:{healthHistory:"Hipotireoidismo controlado",medications:"Levotiroxina 50mcg",smoking:"Ex-fumante",pregnancy:"Não",previousProcedures:"Botox (2023)",skinType:"Normal",fitzpatrick:"III",allergiesDetail:"Sem alergias.",contraindications:"Nenhuma",musicStyle:"MPB",importantAlerts:["Hipotireoidismo"]}},
  {id:4,name:"Juliana Pereira",age:41,birthDate:"1985-05-28",phone:"(11) 96543-2109",email:"juliana@email.com",cpf:"555.666.777-88",bloodType:"AB+",allergies:"Penicilina",since:"03/05/2026",status:"return",tags:["Retorno Pendente"],profilePhoto:null,lastVisit:"03/05/2026",nextReturn:"28/05/2026",complaints:["Linhas severas","Papada"],
   sessions:[],sessions_packages:[],intercorrencias:[],planejamento:[],
   anamnese:{healthHistory:"Diabetes tipo 2 controlada",medications:"Metformina 850mg",smoking:"Não",pregnancy:"Não",previousProcedures:"Nenhum",skinType:"Oleosa",fitzpatrick:"IV",allergiesDetail:"Alergia à penicilina — confirmada por teste.",contraindications:"Penicilínicos contraindicados",musicStyle:"Eletrônico",importantAlerts:["Penicilina","Diabetes"]}},
];
const INIT_AGENDA=[
  {id:1,patientName:"Ana Beatriz Martins",date:"2026-05-28",time:"09:00",procedure:"Toxina Botulínica",location:"Barra Olímpica",duration:"1 hora",value:850,status:"Realizado",obs:""},
  {id:2,patientName:"Camila R. Souza",date:"2026-05-28",time:"10:30",procedure:"Preenchimento Labial",location:"Barra Olímpica",duration:"1 hora",value:1200,status:"Realizado",obs:""},
  {id:3,patientName:"Fernanda Lopes",date:"2026-05-28",time:"14:00",procedure:"Bioestimulador de Colágeno",location:"Nova América",duration:"1h30",value:2400,status:"Confirmado",obs:""},
  {id:4,patientName:"Juliana Pereira",date:"2026-05-28",time:"15:30",procedure:"Avaliação Inicial",location:"Barra Olímpica",duration:"45 min",value:0,status:"Aguardando",obs:""},
  {id:5,patientName:"Renata Ferreira",date:"2026-05-29",time:"09:00",procedure:"Microagulhamento",location:"Barra Olímpica",duration:"1 hora",value:600,status:"Confirmado",obs:""},
  {id:6,patientName:"Larissa Mendes",date:"2026-05-30",time:"11:00",procedure:"Profhilo",location:"Nova América",duration:"45 min",value:1500,status:"Aguardando",obs:""},
  {id:7,patientName:"Ana Beatriz Martins",date:"2026-06-05",time:"10:00",procedure:"Revisão / Retoque",location:"Barra Olímpica",duration:"30 min",value:0,status:"Confirmado",obs:"Retorno pós botox"},
];
const INIT_EXPENSES=[
  {id:1,desc:"Aluguel Barra Olímpica",date:"2026-05-05",cat:"Aluguel",value:4800,status:"Pago",notes:""},
  {id:2,desc:"Reposição Botox Allergan",date:"2026-05-20",cat:"Produtos",value:4200,status:"Pago",notes:""},
  {id:3,desc:"Marketing Digital",date:"2026-05-10",cat:"Marketing",value:1500,status:"Pago",notes:""},
  {id:4,desc:"Contador Mensal",date:"2026-05-01",cat:"Outros",value:620,status:"Pago",notes:""},
  {id:5,desc:"Materiais Descartáveis",date:"2026-05-15",cat:"Produtos",value:890,status:"Pago",notes:""},
];
// ─── HELPERS & BASE UI ────────────────────────────────────────────────────────
const initials=n=>n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtCurr=v=>"R$"+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:0});
const parseDMY=s=>{if(!s)return null;const[d,m,y]=s.split("/");return new Date(`${y}-${m}-${d}`);};
const daysBetween=(a,b)=>Math.floor((b-a)/(1000*60*60*24));
const todayISO=()=>new Date().toISOString().slice(0,10);


// ─── SUPABASE DATA HOOKS ─────────────────────────────────────────────────────
// useSupaTable: carrega uma tabela e retorna [data, setter, loading]
// setter aceita função (como useState) ou valor direto
// Toda alteração é sincronizada com o Supabase automaticamente
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
      // Sync to Supabase async (fire and forget)
      (async () => {
        if (!uid.current) return;
        // upsert all records with user_id set
        const toUpsert = Array.isArray(next)
          ? next.map(r => ({ ...r, user_id: uid.current }))
          : [{ ...next, user_id: uid.current }];
        await supabase.from(table).upsert(toUpsert, { onConflict: "id" });
        // delete removed records
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

// useSettings: objeto único por usuário (não array)
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
            procedures: row.procedures || [],
            locations: row.locations || [],
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
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      })();
      return next;
    });
  }, []);

  return [data, setData, loading];
}

// Compatibilidade: manter useLocalStorage para dados locais temporários
function useLocalStorage(key,init){
  const[val,setVal]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch{return init;}});
  const set=useCallback(v=>{const nv=typeof v==="function"?v(val):v;setVal(nv);try{localStorage.setItem(key,JSON.stringify(nv));}catch{};},[key]);
  return[val,set];
}

// ─── TELA DE LOGIN ────────────────────────────────────────────────────────────
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
// ─── FACE MAP ─────────────────────────────────────────────────────────────────
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
          h("circle",{cx:z.cx,cy:z.cy,r:z.r,fill:isAct?"rgba(92,31,50,.5)":isSet?`${zColor}22`:"rgba(255,255,255,.03)",stroke:isAct?zColor:isSet?zColor+"99":P.border,strokeWidth:isAct?2:1.5,strokeDasharray:isSet||isAct?"none":"3,2"}),
          isSet?h("text",{x:z.cx,y:z.cy+4,textAnchor:"middle",fill:P.accent3,fontSize:9,fontWeight:600},`${val}${unit}`):h("text",{x:z.cx,y:z.cy+4,textAnchor:"middle",fill:P.text3,fontSize:11},"+")
        );
      })
    ),
    h("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}},
      zones.map(z=>h("div",{key:z.k,style:{position:"absolute",left:z.cx<130?Math.max(0,z.cx-z.r-52):z.cx+z.r+4,top:z.cy-7,fontSize:8,color:P.text3,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}},z.label))
    ),
    active&&!readOnly&&h("div",{style:{position:"absolute",bottom:-58,left:"50%",transform:"translateX(-50%)",background:P.bg2,border:`1px solid ${P.border}`,borderRadius:10,padding:"8px 14px",display:"flex",gap:8,alignItems:"center",zIndex:10,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}},
      h("span",{style:{fontSize:11,color:P.accent}},zones.find(z=>z.k===active)?.label),
      h("input",{value:inp,onChange:e=>setInp(e.target.value),onKeyDown:e=>e.key==="Enter"&&confirm(),autoFocus:true,style:{width:52,background:P.bg3,border:`1px solid ${P.border}`,borderRadius:6,padding:"4px 8px",color:P.text,fontSize:13,outline:"none",textAlign:"center"}}),
      h("span",{style:{fontSize:11,color:P.text3}},unit),
      h("button",{onClick:confirm,style:{background:`linear-gradient(135deg,${P.rose},${P.gold})`,color:P.accent3,border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}},"OK"),
      h("button",{onClick:()=>{onChange({...points,[active]:0});setActive(null);},style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:14}},"×")
    )
  );
}
function FaceMapEditor({sessionMap,onChange,readOnly=false}){
  const[mt,setMt]=useState(sessionMap?.type||"botox");
  const points=sessionMap?.points||{};
  const types=[{k:"botox",l:"💉 Toxina"},{k:"filler",l:"✨ Preenchimento"},{k:"thread",l:"🧵 Fios"}];
  const total=Object.values(points).reduce((a,v)=>a+v,0);
  const unit=mt==="botox"?"U":"ml";
  const h=createElement;
  return h("div",null,
    !readOnly&&h("div",{style:{display:"flex",gap:6,marginBottom:14}},types.map(t=>h("button",{key:t.k,onClick:()=>{setMt(t.k);onChange({type:t.k,points:{}});},style:{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:mt===t.k?P.rose:"transparent",border:`1px solid ${mt===t.k?P.rose:P.border}`,color:mt===t.k?P.accent3:P.text3}},t.l))),
    h("div",{style:{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}},
      h("div",{style:{paddingBottom:readOnly?0:64}},h(FaceMap,{mapType:mt,points,onChange:p=>onChange({type:mt,points:p}),readOnly})),
      h("div",{style:{flex:1,minWidth:140}},
        h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}},"Resumo"),
        Object.entries(points).filter(([,v])=>v>0).length===0
          ?h("div",{style:{fontSize:13,color:P.text3}},readOnly?"Nenhum ponto.":"Clique nos círculos.")
          :Object.entries(points).filter(([,v])=>v>0).map(([k,v])=>h("div",{key:k,style:{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${P.border}`,fontSize:12.5}},h("span",{style:{color:P.text2}},k.replace(/_/g," ")),h("span",{style:{color:P.accent3,fontWeight:600}},`${v}${unit}`))),
        total>0&&h("div",{style:{display:"flex",justifyContent:"space-between",padding:"8px 0",marginTop:4}},h("span",{style:{fontSize:12,color:P.text3}},"Total"),h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.accent}},`${total}${unit}`))
      )
    )
  );
}
// ─── MEDIA GALLERY ─────────────────────────────────────────────────────────────
function MediaGallery({items,onAdd,onRemove,label,docMode=false}){
  const[preview,setPreview]=useState(null);
  const h=createElement;
  function addFiles(files){onAdd(files.map(f=>({id:Date.now()+Math.random(),name:f.name,type:f.type,url:URL.createObjectURL(f),date:new Date().toLocaleDateString("pt-BR")})));}
  return h("div",null,
    h("div",{style:{marginBottom:12}},h(UploadZone,{onFiles:addFiles,accept:docMode?"image/*,.pdf,.doc,.docx":"image/*",label})),
    items.length===0?h("div",{style:{textAlign:"center",padding:20,color:P.text3,fontSize:13}},"Nenhum arquivo.")
    :h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8}},
      items.map(item=>h("div",{key:item.id,style:{borderRadius:8,overflow:"hidden",border:`1px solid ${P.border}`,background:P.card2,position:"relative"}},
        h("div",{onClick:()=>setPreview(item),style:{cursor:"pointer"}},
          item.type?.startsWith("image")?h("img",{src:item.url,alt:item.name,style:{width:"100%",height:70,objectFit:"cover",display:"block"}}):h("div",{style:{width:"100%",height:70,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,background:P.card}},"📄"),
          h("div",{style:{padding:"5px 7px"}},h("div",{style:{fontSize:9.5,color:P.text2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},item.name))
        ),
        onRemove&&h("button",{onClick:()=>onRemove(item.id),style:{position:"absolute",top:3,right:3,width:17,height:17,borderRadius:"50%",background:"rgba(0,0,0,.7)",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}},"×")
      ))
    ),
    preview&&h("div",{onClick:()=>setPreview(null),style:{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}},
      preview.type?.startsWith("image")?h("img",{src:preview.url,alt:preview.name,style:{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}):h("div",{style:{color:P.text,textAlign:"center"}},h("div",{style:{fontSize:48,marginBottom:12}},"📄"),h("div",null,preview.name),h("a",{href:preview.url,target:"_blank",rel:"noreferrer",style:{color:P.accent,fontSize:14,marginTop:8,display:"block"}},"Abrir ↗"))
    )
  );
}
// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
function GlobalSearch({patients,agenda,onSelectPatient,onNav}){
  const[q,setQ]=useState("");
  const[open,setOpen]=useState(false);
  const h=createElement;
  const results=useMemo(()=>{
    if(q.trim().length<2)return[];
    const s=q.toLowerCase();
    const out=[];
    safePats.forEach(p=>{
      if(p.name.toLowerCase().includes(s)||p.phone.includes(s)||p.cpf.includes(s)||p.email.toLowerCase().includes(s))out.push({type:"paciente",label:p.name,sub:p.phone,id:p.id,pat:p});
      p.sessions?.forEach(sess=>{
        if(sess.procedure.toLowerCase().includes(s)||sess.notes?.toLowerCase().includes(s)||sess.product?.toLowerCase().includes(s))out.push({type:"sessão",label:`${p.name} — ${sess.procedure}`,sub:sess.date,id:p.id,pat:p});
      });
    });
    agenda.forEach(a=>{if(a.patientName.toLowerCase().includes(s)||a.procedure.toLowerCase().includes(s))out.push({type:"agenda",label:`${a.patientName} — ${a.procedure}`,sub:`${a.date} ${a.time}`,id:a.id});});
    return out.slice(0,10);
  },[q,patients,agenda]);
  const typeColor={paciente:P.accent,sessão:P.gold,agenda:"#7aaed4"};
  return h("div",{style:{position:"relative",flex:1,maxWidth:340}},
    h("div",{style:{position:"relative"}},
      h("span",{style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:P.text3,pointerEvents:"none"}},"🔍"),
      h("input",{value:q,onChange:e=>{setQ(e.target.value);setOpen(true);},onFocus:()=>setOpen(true),placeholder:"Busca inteligente... paciente, CPF, procedimento",style:{...IS,paddingLeft:36,width:"100%"}})
    ),
    open&&results.length>0&&h("div",{style:{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:P.bg2,border:`1px solid ${P.border}`,borderRadius:12,zIndex:500,boxShadow:"0 8px 32px rgba(0,0,0,.5)",overflow:"hidden"}},
      results.map((r,i)=>h("div",{key:i,onClick:()=>{setOpen(false);setQ("");if(r.pat){onSelectPatient(r.pat);onNav("prontuario");}else onNav("agenda");},style:{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${P.border}`},onMouseEnter:e=>e.currentTarget.style.background=P.card,onMouseLeave:e=>e.currentTarget.style.background="transparent"},
        h("span",{style:{fontSize:10,padding:"2px 7px",borderRadius:10,background:typeColor[r.type]+"22",color:typeColor[r.type],fontWeight:600,minWidth:50,textAlign:"center"}},r.type),
        h("div",null,h("div",{style:{fontSize:13,color:P.text}},r.label),h("div",{style:{fontSize:11,color:P.text3}},r.sub))
      ))
    ),
    open&&q&&results.length===0&&h("div",{style:{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:P.bg2,border:`1px solid ${P.border}`,borderRadius:12,zIndex:500,padding:"14px",textAlign:"center",color:P.text3,fontSize:13}},"Nenhum resultado encontrado.")
  );
}
// ─── RETORNOS PENDENTES ───────────────────────────────────────────────────────
function RetornosPendentes({patients,returnRules,onSelectPatient,onNav,mini=false}){
  const h=createElement;
  const today=new Date();
  const safePats=Array.isArray(patients)?patients:[];
  const[filter,setFilter]=useState("todos"); // todos | urgente | proximo | ok

  // Para cada paciente, pega a sessão mais recente e calcula o retorno esperado
  const retornos=useMemo(()=>{
    const list=[];
    safePats.forEach(p=>{
      const sessions=(p.sessions||[]);
      if(sessions.length===0)return;
      // Sessão mais recente
      const last=[...sessions].sort((a,b)=>{
        const da=parseDMY(a.date)||new Date(0);
        const db=parseDMY(b.date)||new Date(0);
        return db-da;
      })[0];
      const sessDate=parseDMY(last.date);
      if(!sessDate)return;
      const diasDesde=daysBetween(sessDate,today);
      const returnDays=Number(last.returnReminderDays)||0;
      if(!returnDays)return; // sem prazo configurado
      const diasRestantes=returnDays-diasDesde;
      const retornoData=new Date(sessDate);
      retornoData.setDate(retornoData.getDate()+returnDays);

      // urgência
      let urgencia,urgLabel,urgColor,urgBg;
      if(diasRestantes<0){
        urgencia=0;urgLabel="Atrasada";urgColor=P.red;urgBg="rgba(192,112,112,.10)";
      }else if(diasRestantes<=7){
        urgencia=1;urgLabel="Esta semana";urgColor="#c4a96a";urgBg="rgba(196,169,106,.10)";
      }else if(diasRestantes<=30){
        urgencia=2;urgLabel="Este mês";urgColor="#7aaed4";urgBg="rgba(122,174,212,.10)";
      }else{
        urgencia=3;urgLabel="Em dia";urgColor:P.green;urgBg="rgba(122,173,138,.08)";
      }

      list.push({patient:p,last,diasDesde,diasRestantes,retornoData,urgencia,urgLabel,urgColor,urgBg,returnDays});
    });
    return list.sort((a,b)=>a.diasRestantes-b.diasRestantes);
  },[patients,returnRules]);

  const countUrgente=retornos.filter(r=>r.urgencia===0).length;
  const countProximo=retornos.filter(r=>r.urgencia===1||r.urgencia===2).length;

  const filtered=filter==="urgente"?retornos.filter(r=>r.urgencia===0)
    :filter==="proximo"?retornos.filter(r=>r.urgencia===1||r.urgencia===2)
    :filter==="ok"?retornos.filter(r=>r.urgencia===3)
    :retornos;

  // MODO MINI: widget do Dashboard
  if(mini){
    const urgent=retornos.filter(r=>r.urgencia===0||r.urgencia===1);
    if(urgent.length===0)return null;
    return h("div",{style:{marginBottom:14,padding:"14px 18px",background:"rgba(192,112,112,.07)",border:"1px solid rgba(192,112,112,.22)",borderRadius:12}},
      h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}},
        h("div",{style:{display:"flex",alignItems:"center",gap:8}},
          h("span",{style:{fontSize:18}},"⏰"),
          h("div",null,
            h("div",{style:{fontSize:13,color:P.red,fontWeight:700}},"Retornos Pendentes"),
            h("div",{style:{fontSize:11,color:P.text3}},`${countUrgente} atrasada${countUrgente!==1?"s":""} · ${countProximo} próxima${countProximo!==1?"s":""}`)
          )
        ),
        h("button",{onClick:()=>onNav("retornos"),style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid rgba(157,119,97,.3)`,borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"Ver todas →")
      ),
      h("div",{style:{display:"flex",flexDirection:"column",gap:6}},
        urgent.slice(0,4).map(r=>{
          const phone=(r.patient.phone||"").replace(/\D/g,"");
          const waMsg=encodeURIComponent(`Olá ${r.patient.name.split(" ")[0]}! 🌸 Passando para lembrar que está na hora do seu retorno. Que tal marcarmos? 😊`);
          return h("div",{key:r.patient.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:r.urgBg,borderRadius:8,border:`1px solid ${r.urgColor}33`}},
            h("div",{onClick:()=>{onSelectPatient(r.patient);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:8,flex:1,cursor:"pointer",minWidth:0}},
              h(Avatar,{name:r.patient.name,size:28,src:r.patient.profilePhoto}),
              h("div",{style:{flex:1,minWidth:0}},
                h("div",{style:{fontSize:12.5,color:P.text,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},r.patient.name),
                h("div",{style:{fontSize:11,color:r.urgColor}},
                  r.diasRestantes<0?`Atrasada ${Math.abs(r.diasRestantes)} dias · ${r.last.procedure}`:`Em ${r.diasRestantes}d · ${r.last.procedure}`)
              )
            ),
            phone&&h("a",{href:`https://wa.me/55${phone}?text=${waMsg}`,target:"_blank",rel:"noreferrer",style:{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",background:"rgba(106,196,130,.13)",border:"1px solid rgba(106,196,130,.3)",borderRadius:7,color:"#7aad8a",fontSize:11,fontWeight:600,textDecoration:"none",flexShrink:0}},"💬")
          );
        })
      )
    );
  }

  // MODO COMPLETO: página dedicada
  return h("div",null,
    h(SectionHeader,{title:"Retornos Pendentes",sub:"Pacientes que precisam voltar para manutenção ou revisão"}),
    // Resumo em cards
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}},
      [{l:"Atrasadas",v:retornos.filter(r=>r.urgencia===0).length,c:P.red,icon:"🔴",f:"urgente"},
       {l:"Esta semana",v:retornos.filter(r=>r.urgencia===1).length,c:"#c4a96a",icon:"🟡",f:"proximo"},
       {l:"Este mês",v:retornos.filter(r=>r.urgencia===2).length,c:"#7aaed4",icon:"🔵",f:"proximo"},
       {l:"Em dia",v:retornos.filter(r=>r.urgencia===3).length,c:P.green,icon:"🟢",f:"ok"}
      ].map(k=>h(Card,{key:k.l,onClick:()=>setFilter(f=>f===k.f?"todos":k.f),style:{cursor:"pointer",border:`1px solid ${filter===k.f?k.c:P.border}`,transition:"all .15s"}},
        h("div",{style:{fontSize:22,marginBottom:6}},k.icon),
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:34,color:k.c,lineHeight:1}},k.v),
        h("div",{style:{fontSize:11,color:P.text3,marginTop:4}},k.l)
      ))
    ),
    // Filtros
    h("div",{style:{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}},
      [{k:"todos",l:"Todas ("+retornos.length+")"},{k:"urgente",l:"🔴 Atrasadas"},{k:"proximo",l:"⏳ Próximas"},{k:"ok",l:"🟢 Em dia"}].map(f=>
        h("button",{key:f.k,onClick:()=>setFilter(f.k),style:{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:filter===f.k?P.rose:"transparent",border:`1px solid ${filter===f.k?P.rose:P.border}`,color:filter===f.k?P.accent3:P.text2}},f.l)
      )
    ),
    // Lista
    retornos.length===0
      ?h(Card,{style:{textAlign:"center",padding:40}},h("div",{style:{fontSize:32,marginBottom:12}},"✅"),h("div",{style:{color:P.text3,fontSize:14}},"Nenhum retorno pendente no momento."))
      :filtered.length===0
        ?h(Card,{style:{textAlign:"center",padding:32}},h("div",{style:{fontSize:24,marginBottom:8}},"🔍"),h("div",{style:{color:P.text3,fontSize:13}},"Nenhuma paciente nesta categoria."))
        :h("div",{style:{display:"flex",flexDirection:"column",gap:8}},
          filtered.map(r=>{
            const phone=(r.patient.phone||"").replace(/\D/g,"");
            const waMsg=encodeURIComponent(`Olá ${r.patient.name.split(" ")[0]}! 🌸 Passando para lembrar que está na hora do seu retorno pós ${r.last.procedure}. Que tal marcarmos um horário? 😊`);
            const retornoFormatted=r.retornoData.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
            return h(Card,{key:r.patient.id,style:{border:`1px solid ${r.urgColor}33`,background:r.urgBg}},
              h("div",{style:{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}},
                // Avatar + info principal
                h("div",{onClick:()=>{onSelectPatient(r.patient);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:200,cursor:"pointer"}},
                  h("div",{style:{position:"relative"}},
                    h(Avatar,{name:r.patient.name,size:44,src:r.patient.profilePhoto}),
                    h("div",{style:{position:"absolute",bottom:-2,right:-2,width:14,height:14,borderRadius:"50%",background:r.urgColor,border:`2px solid ${P.bg2}`}})
                  ),
                  h("div",null,
                    h("div",{style:{fontSize:14,color:P.text,fontWeight:500}},r.patient.name),
                    h("div",{style:{fontSize:12,color:P.text3,marginTop:2}},`Último: ${r.last.procedure} em ${r.last.date}`)
                  )
                ),
                // Badges de status
                h("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}},
                  h("span",{style:{fontSize:11,padding:"4px 10px",borderRadius:12,background:r.urgColor+"18",color:r.urgColor,fontWeight:600,border:`1px solid ${r.urgColor}44`}},
                    `${r.urgLabel}`
                  ),
                  h("div",{style:{textAlign:"center",minWidth:80}},
                    h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:r.urgColor,lineHeight:1}},
                      r.diasRestantes<0?`+${Math.abs(r.diasRestantes)}d`:r.diasRestantes===0?"Hoje":`${r.diasRestantes}d`
                    ),
                    h("div",{style:{fontSize:9,color:P.text3,textTransform:"uppercase",letterSpacing:".08em"}},r.diasRestantes<0?"de atraso":"para o retorno")
                  ),
                  h("div",{style:{fontSize:11,color:P.text3,minWidth:100,textAlign:"center"}},
                    h("div",{style:{color:P.text2}},`Retorno previsto`),
                    h("div",{style:{color:P.text,fontWeight:500,fontSize:12,marginTop:2}},retornoFormatted)
                  ),
                  // Ações
                  phone&&h("a",{href:`https://wa.me/55${phone}?text=${waMsg}`,target:"_blank",rel:"noreferrer",style:{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"rgba(106,196,130,.13)",border:"1px solid rgba(106,196,130,.3)",borderRadius:8,color:"#7aad8a",fontSize:12,fontWeight:600,textDecoration:"none",cursor:"pointer",flexShrink:0}},"💬 WhatsApp"),
                  h("button",{onClick:()=>{onSelectPatient(r.patient);onNav("prontuario");},style:{padding:"7px 14px",borderRadius:8,background:"transparent",border:`1px solid ${P.border}`,color:P.text2,fontSize:12,cursor:"pointer"}},"Ver Prontuário")
                )
              )
            );
          })
        )
  );
}
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({patients,agenda,onNav,onSelectPatient,settings,returnRules}){
  const today=new Date();
  const todayStr=today.toISOString().slice(0,10);
  const todayBirthdays=patients.filter(p=>{if(!p.birthDate)return false;const bd=new Date(p.birthDate);return bd.getMonth()===today.getMonth()&&bd.getDate()===today.getDate();});
  const allS=patients.flatMap(p=>p.sessions||[]);
  const totalRec=allS.filter(s=>s.paid).reduce((a,s)=>a+s.value,0);
  const totalPend=allS.filter(s=>!s.paid).reduce((a,s)=>a+s.value,0);
  const todayAppts=agenda.filter(a=>a.date===todayStr).sort((a,b)=>a.time.localeCompare(b.time));
  const months=[{m:"Dez",v:52},{m:"Jan",v:39},{m:"Fev",v:63},{m:"Mar",v:70},{m:"Abr",v:58},{m:"Mai",v:95}];
  const h=createElement;
  return h("div",null,
    h(SectionHeader,{title:`Olá, ${settings.doctorName||"Dra. Sofia"} 👋`,sub:today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),action:h(Btn,{onClick:()=>onNav("agenda")},"＋ Novo Agendamento")}),
    // Alerts
    todayBirthdays.length>0&&h("div",{style:{marginBottom:14,padding:"16px 20px",background:"linear-gradient(135deg,rgba(196,169,106,.13),rgba(196,169,106,.06))",border:"1px solid rgba(196,169,106,.4)",borderRadius:14,boxShadow:"0 2px 16px rgba(196,169,106,.08)"}},
      h("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12}},
        h("span",{style:{fontSize:26}},"🎂"),
        h("div",null,
          h("div",{style:{fontSize:14,color:P.yellow,fontWeight:700,letterSpacing:".02em"}},"Aniversariante(s) de Hoje!"),
          h("div",{style:{fontSize:11,color:P.text3,marginTop:2}},`${todayBirthdays.length} paciente${todayBirthdays.length>1?"s":""} fazendo aniversário`)
        )
      ),
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:10}},
        todayBirthdays.map(p=>{
          const age=new Date().getFullYear()-new Date(p.birthDate).getFullYear();
          const phone=p.phone?p.phone.replace(/\D/g,""):"";
          const waMsg=encodeURIComponent(`Olá ${p.name.split(" ")[0]}! 🎂 Feliz aniversário! Que seu dia seja incrível! 🌸`);
          return h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"rgba(196,169,106,.1)",border:"1px solid rgba(196,169,106,.3)",borderRadius:12,flex:"1 1 auto",minWidth:220}},
            h("div",{onClick:()=>{onSelectPatient(p);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:10,cursor:"pointer",flex:1}},
              h(Avatar,{name:p.name,size:36,src:p.profilePhoto}),
              h("div",null,
                h("div",{style:{fontSize:13.5,color:P.text,fontWeight:600}},p.name),
                h("div",{style:{fontSize:12,color:P.yellow,marginTop:1}},`🎉 ${age} anos hoje!`)
              )
            ),
            phone&&h("a",{href:`https://wa.me/55${phone}?text=${waMsg}`,target:"_blank",rel:"noreferrer",style:{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"rgba(106,196,130,.15)",border:"1px solid rgba(106,196,130,.35)",borderRadius:8,color:"#7aad8a",fontSize:11,fontWeight:600,textDecoration:"none",flexShrink:0,cursor:"pointer"}},"💬 WhatsApp")
          );
        })
      )
    ),
    h(RetornosPendentes,{patients,returnRules,onSelectPatient,onNav,mini:true}),
    // KPIs
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}},
      [{l:"Receita do Mês",v:`R$${(totalRec/1000||48.2).toFixed(1)}k`,sub:"Sessões pagas",c:P.accent},{l:"Consultas Hoje",v:todayAppts.length,sub:`${todayAppts.filter(a=>a.status==="Realizado").length} realizadas`,c:P.rose2},{l:"Pacientes Ativos",v:patients.length,sub:"cadastrados",c:P.gold},{l:"A Receber",v:fmtCurr(totalPend||6800),sub:"pendências",c:"#7aaed4"}].map(k=>h(Card,{key:k.l,style:{position:"relative",overflow:"hidden"}},
        h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}},k.l),
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:k.c,lineHeight:1}},k.v),
        h("div",{style:{fontSize:11,color:P.text3,marginTop:6}},k.sub),
        h("div",{style:{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:k.c,opacity:.05}})
      ))
    ),
    h("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18}},
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:16}},"Receita — Últimos 6 Meses"),
        h("div",{style:{display:"flex",alignItems:"flex-end",gap:8,height:96}},
          months.map(m=>h("div",{key:m.m,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}},
            h("div",{style:{flex:1,display:"flex",alignItems:"flex-end",width:"100%"}},h("div",{style:{width:"100%",height:`${m.v}%`,background:m.m==="Mai"?`linear-gradient(to top,${P.rose},${P.gold})`:`linear-gradient(to top,rgba(92,31,50,.5),rgba(133,89,84,.2))`,borderRadius:"4px 4px 0 0"}})),
            h("div",{style:{fontSize:9,color:m.m==="Mai"?P.accent:P.text3,textTransform:"uppercase"}},m.m)
          ))
        )
      ),
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:12}},"Status Agenda Hoje"),
        Object.entries(APPT_STATUS_CFG).map(([st,cfg])=>{const n=todayAppts.filter(a=>a.status===st).length;if(!n)return null;return h("div",{key:st,style:{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${P.border}`}},h("span",{style:{fontSize:12,color:P.text2}},st),h("span",{style:{fontSize:16,fontFamily:"'Cormorant Garamond',serif",color:cfg.color}},n));})
      )
    ),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}},
      h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text}},"Agenda de Hoje"),
          h("button",{onClick:()=>onNav("agenda"),style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid rgba(157,119,97,.25)`,borderRadius:6,padding:"3px 10px",cursor:"pointer"}},"Ver tudo")
        ),
        todayAppts.length===0?h("div",{style:{color:P.text3,fontSize:13,textAlign:"center",padding:20}},"Nenhuma consulta hoje.")
        :todayAppts.map((a,i)=>{const sc=APPT_STATUS_CFG[a.status]||APPT_STATUS_CFG.Aguardando;return h("div",{key:i,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",marginBottom:6,background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`}},
          h("div",{style:{width:6,height:6,borderRadius:"50%",background:sc.color,flexShrink:0}}),
          h("div",{style:{fontSize:11,color:P.accent,fontWeight:700,minWidth:36}},a.time),
          h("div",{style:{flex:1}},h("div",{style:{fontSize:13,color:P.text,fontWeight:500}},a.patientName),h("div",{style:{fontSize:11,color:P.text3}},`${a.procedure} · 📍 ${a.location}`)),
          h("span",{style:{fontSize:10,padding:"2px 7px",borderRadius:12,color:sc.color,background:sc.bg}},a.status)
        );})
      ),
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:14}},"Pacientes — Atenção"),
        (()=>{
          const todayISO2=today.toISOString().slice(0,10);
          const computedGroups=patients.map(p=>{
            const d=parseDMY(p.lastVisit);
            const days=d?daysBetween(d,today):null;
            const hasUpcoming=agenda.some(a=>a.patientName===p.name&&a.date>=todayISO2&&a.date<=new Date(today.getTime()+30*864e5).toISOString().slice(0,10));
            const hadRecent=days!==null&&days<=60;
            const isInTreatment=hasUpcoming||hadRecent;
            return{...p,_days:days,_inTreatment:isInTreatment};
          });
          const groups=[
            {label:"Inativas +6 meses",patients:computedGroups.filter(p=>p._days!==null&&p._days>180&&p.status!=="vip"),color:P.red,icon:"🔴"},
            {label:"Retorno pendente +3m",patients:computedGroups.filter(p=>p._days!==null&&p._days>90&&p._days<=180&&p.status!=="vip"),color:P.yellow,icon:"🟡"},
            {label:"Em tratamento",patients:computedGroups.filter(p=>p._inTreatment&&p.status!=="vip"),color:"#7aaed4",icon:"🔵"},
            {label:"VIPs",patients:computedGroups.filter(p=>p.status==="vip"),color:P.gold,icon:"⭐"},
          ];
          return groups.map(r=>h("div",{key:r.label,style:{marginBottom:4}},
            h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${P.border}`}},
              h("span",{style:{fontSize:12.5,color:P.text2}},`${r.icon} ${r.label}`),
              h("div",{style:{display:"flex",alignItems:"center",gap:8}},
                h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:r.color}},r.patients.length),
                r.patients.length>0&&h("button",{onClick:()=>onNav("pacientes"),style:{fontSize:10,color:r.color,background:r.color+"15",border:`1px solid ${r.color}33`,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},"Ver todas →")
              )
            ),
            r.patients.length>0&&h("div",{style:{padding:"4px 0 8px"}},
              r.patients.slice(0,3).map(p=>{
                const d=parseDMY(p.lastVisit);const dias=d?daysBetween(d,today):null;
                return h("div",{key:p.id,onClick:()=>{onSelectPatient(p);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",cursor:"pointer",borderRadius:7,transition:"all .12s"},onMouseEnter:e=>e.currentTarget.style.background=P.bg3,onMouseLeave:e=>e.currentTarget.style.background="transparent"},
                  h(Avatar,{name:p.name,size:24,idx:patients.indexOf(p),src:p.profilePhoto}),
                  h("div",{style:{flex:1,minWidth:0}},
                    h("div",{style:{fontSize:12.5,color:P.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},p.name),
                    dias&&h("div",{style:{fontSize:10.5,color:r.color}},`há ${dias} dias`)
                  ),
                  h("span",{style:{fontSize:10,color:P.text3}},p.phone?.slice(0,9)||"")
                );
              }),
              r.patients.length>3&&h("div",{style:{fontSize:11,color:P.text3,padding:"4px 10px"}},`+ ${r.patients.length-3} mais...`)
            )
          ));
        })(),
        // PACIENTES SEM RETORNO HÁ MUITO TEMPO
        (()=>{
          const longInactive=patients.filter(p=>{const d=parseDMY(p.lastVisit);return d&&daysBetween(d,today)>270&&p.status!=="vip";}).sort((a,b)=>{const da=parseDMY(a.lastVisit),db=parseDMY(b.lastVisit);return da-db;}).slice(0,5);
          if(!longInactive.length)return null;
          return h(Card,{style:{marginTop:16,border:`1px solid rgba(192,112,112,.25)`,background:"rgba(192,112,112,.04)"}},
            h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
              h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.red}},"💤 Pacientes para Reativar"),
              h("div",{style:{fontSize:11,color:P.text3}},"Sem retorno há mais de 9 meses")
            ),
            longInactive.map(p=>{
              const d=parseDMY(p.lastVisit);
              const dias=d?daysBetween(d,today):0;
              const phone=(p.phone||"").replace(/\D/g,"");
              const waMsg=encodeURIComponent(`Olá ${p.name.split(" ")[0]}! 😊 Sentimos sua falta! Que tal marcarmos uma consulta de avaliação? Temos novidades que você vai adorar! 🌸`);
              return h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,marginBottom:6,background:P.bg3,border:`1px solid ${P.border}`}},
                h("div",{onClick:()=>{onSelectPatient(p);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer"}},
                  h(Avatar,{name:p.name,size:30,src:p.profilePhoto}),
                  h("div",null,
                    h("div",{style:{fontSize:13,color:P.text,fontWeight:500}},p.name),
                    h("div",{style:{fontSize:11,color:P.red}},`Sem retorno há ${dias} dias`)
                  )
                ),
                phone&&h("a",{href:`https://wa.me/55${phone}?text=${waMsg}`,target:"_blank",rel:"noreferrer",style:{fontSize:11,padding:"5px 12px",background:"rgba(106,196,130,.15)",border:"1px solid rgba(106,196,130,.35)",borderRadius:8,color:"#7aad8a",textDecoration:"none",fontWeight:600,flexShrink:0}},"💬 Reativar")
              );
            })
          );
        })()
      
      )
    )
  );
}
// ─── PATIENT AUTOCOMPLETE ────────────────────────────────────────────────────
function PatientAutocomplete({value,onChange,patients}){
  const[open,setOpen]=useState(false);
  const[q,setQ]=useState(value||"");
  const ref=useRef();
  const h=createElement;
  const suggestions=useMemo(()=>{
    if(!q||q.length<1)return[];
    const s=q.toLowerCase();
    return patients.filter(p=>p.name.toLowerCase().includes(s)).slice(0,6);
  },[q,patients]);
  useEffect(()=>{setQ(value||"");},[value]);
  useEffect(()=>{
    function handleClick(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener("mousedown",handleClick);
    return()=>document.removeEventListener("mousedown",handleClick);
  },[]);
  return h("div",{ref,style:{position:"relative"}},
    h("input",{value:q,onChange:e=>{setQ(e.target.value);onChange(e.target.value,null);setOpen(true);},onFocus:()=>setOpen(true),placeholder:"Nome da paciente",style:{...{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"9px 12px",color:P.text,fontSize:13.5,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}}),
    open&&suggestions.length>0&&h("div",{style:{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:P.bg2,border:`1px solid ${P.border}`,borderRadius:10,zIndex:999,boxShadow:"0 8px 24px rgba(0,0,0,.5)",overflow:"hidden"}},
      suggestions.map(p=>h("div",{key:p.id,onMouseDown:e=>{e.preventDefault();setQ(p.name);onChange(p.name,p);setOpen(false);},style:{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",borderBottom:`1px solid ${P.border}`},onMouseEnter:e=>e.currentTarget.style.background=P.card,onMouseLeave:e=>e.currentTarget.style.background="transparent"},
        h(Avatar,{name:p.name,size:26,src:p.profilePhoto}),
        h("div",null,
          h("div",{style:{fontSize:13,color:P.text,fontWeight:500}},p.name),
          h("div",{style:{fontSize:11,color:P.text3}},`${p.phone||""} · Última visita: ${p.lastVisit||"—"}`)
        ),
        p.status==="vip"&&h("span",{style:{marginLeft:"auto",fontSize:10,color:P.gold,background:"rgba(196,169,106,.15)",padding:"2px 7px",borderRadius:10}},"VIP ✦")
      ))
    )
  );
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function Agenda({patients,agenda,setAgenda,procedures,locations}){
  const[selDate,setSelDate]=useState(todayISO());
  const[viewMonth,setViewMonth]=useState({y:2026,m:4});
  const[viewMode,setViewMode]=useState("month");
  const[showNew,setShowNew]=useState(false);
  const[editItem,setEditItem]=useState(null);
  const blank={patientName:"",date:selDate,time:"09:00",procedure:procedures[0]||"",location:locations[0]||"",duration:"1 hora",value:"",status:"Confirmado",obs:""};
  const[form,setForm]=useState(blank);
  const fv=k=>v=>setForm(p=>({...p,[k]:v}));
  const h=createElement;
  const daysInMonth=new Date(viewMonth.y,viewMonth.m+1,0).getDate();
  const firstDow=new Date(viewMonth.y,viewMonth.m,1).getDay();
  const agendaDates=new Set(agenda.map(a=>a.date));
  function saveAppt(){
    if(editItem)setAgenda(prev=>prev.map(a=>a.id===editItem.id?{...a,...form,value:Number(form.value)||0}:a));
    else setAgenda(prev=>[...prev,{...form,id:Date.now(),value:Number(form.value)||0}]);
    setShowNew(false);setEditItem(null);
  }
  function delAppt(id){if(window.confirm("Excluir agendamento?"))setAgenda(prev=>prev.filter(a=>a.id!==id));}
  function cycleStatus(id){setAgenda(prev=>prev.map(a=>{if(a.id!==id)return a;const i=APPT_STATUS.indexOf(a.status);return{...a,status:APPT_STATUS[(i+1)%APPT_STATUS.length]};}));}
  function openEdit(a){setEditItem(a);setForm({...a,value:String(a.value)});setShowNew(true);}
  function prevMonth(){setViewMonth(v=>{const m=v.m-1<0?11:v.m-1,y=v.m-1<0?v.y-1:v.y;return{y,m};});}
  function nextMonth(){setViewMonth(v=>{const m=v.m+1>11?0:v.m+1,y=v.m+1>11?v.y+1:v.y;return{y,m};});}
  const dayAppts=agenda.filter(a=>a.date===selDate).sort((a,b)=>a.time.localeCompare(b.time));
  // Week view helpers
  const getWeekDays=(dateStr)=>{const d=new Date(dateStr+"T12:00");const dow=d.getDay();return Array.from({length:7},(_,i)=>{const nd=new Date(d);nd.setDate(d.getDate()-dow+i);return nd.toISOString().slice(0,10);});};
  const weekDays=getWeekDays(selDate);
  const HOURS=["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  return h("div",null,
    h(SectionHeader,{title:"Agenda",sub:`${MONTH_NAMES[viewMonth.m]} ${viewMonth.y}`,action:h(Btn,{onClick:()=>{setEditItem(null);setForm({...blank,date:selDate});setShowNew(true);}},"＋ Novo")}),
    h("div",{style:{display:"flex",gap:8,marginBottom:16}},
      [{k:"month",l:"Mês"},{k:"week",l:"Semana"},{k:"day",l:"Dia"}].map(v=>h("button",{key:v.k,onClick:()=>setViewMode(v.k),style:{padding:"6px 16px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:viewMode===v.k?P.rose:"transparent",border:`1px solid ${viewMode===v.k?P.rose:P.border}`,color:viewMode===v.k?P.accent3:P.text2}},v.l))
    ),
    // ── VIEW DIA ──
    viewMode==="day"&&h("div",{style:{display:"grid",gridTemplateColumns:"60px 1fr",gap:0,background:P.bg2,borderRadius:12,border:`1px solid ${P.border}`,overflow:"hidden"}},
      h("div",{style:{borderRight:`1px solid ${P.border}`}},
        h("div",{style:{height:48,borderBottom:`1px solid ${P.border}`}},
          h("div",{style:{textAlign:"center",padding:"12px 4px",fontSize:11,color:P.text3}},new Date(selDate+"T12:00").toLocaleDateString("pt-BR",{weekday:"short",day:"numeric"}))
        ),
        HOURS.map(hr=>h("div",{key:hr,style:{height:64,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:6,fontSize:10,color:P.text3}},hr))
      ),
      h("div",null,
        h("div",{style:{height:48,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",padding:"0 16px",gap:8}},
          h("button",{onClick:()=>{const d=new Date(selDate+"T12:00");d.setDate(d.getDate()-1);setSelDate(d.toISOString().slice(0,10));},style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:26,height:26,color:P.text2,cursor:"pointer",fontSize:13}},"‹"),
          h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,flex:1,textAlign:"center"}},new Date(selDate+"T12:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})),
          h("button",{onClick:()=>{const d=new Date(selDate+"T12:00");d.setDate(d.getDate()+1);setSelDate(d.toISOString().slice(0,10));},style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:26,height:26,color:P.text2,cursor:"pointer",fontSize:13}},"›")
        ),
        h("div",{style:{position:"relative"}},
          HOURS.map(hr=>h("div",{key:hr,style:{height:64,borderBottom:`1px solid rgba(71,35,37,.2)`}})),
          agenda.filter(a=>a.date===selDate).map(a=>{
            const sc=APPT_STATUS_CFG[a.status]||APPT_STATUS_CFG.Aguardando;
            const [hh]=a.time.split(":").map(Number);
            const top=(hh-7)*64+2;
            return h("div",{key:a.id,onClick:()=>openEdit(a),style:{position:"absolute",left:8,right:8,top,minHeight:58,background:`linear-gradient(135deg,${P.rose}22,${P.gold}11)`,border:`1px solid ${P.rose}66`,borderLeft:`3px solid ${sc.color}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",zIndex:2}},
              h("div",{style:{fontSize:12,color:P.accent,fontWeight:700}},a.time+" — "+a.patientName),
              h("div",{style:{fontSize:11,color:P.text2}},a.procedure),
              h("div",{style:{fontSize:10,color:P.text3}},"📍 "+a.location)
            );
          })
        )
      )
    ),
    // ── VIEW SEMANA ──
    viewMode==="week"&&h("div",{style:{background:P.bg2,borderRadius:12,border:`1px solid ${P.border}`,overflow:"hidden"}},
      h("div",{style:{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",borderBottom:`1px solid ${P.border}`}},
        h("div",{style:{padding:"12px 4px",display:"flex",alignItems:"center",justifyContent:"space-between",borderRight:`1px solid ${P.border}`,gap:2}},
          h("button",{onClick:()=>{const d=new Date(selDate+"T12:00");d.setDate(d.getDate()-7);setSelDate(d.toISOString().slice(0,10));},style:{background:"transparent",border:"none",color:P.text3,cursor:"pointer",fontSize:14,padding:0}},"‹"),
          h("button",{onClick:()=>{const d=new Date(selDate+"T12:00");d.setDate(d.getDate()+7);setSelDate(d.toISOString().slice(0,10));},style:{background:"transparent",border:"none",color:P.text3,cursor:"pointer",fontSize:14,padding:0}},"›")
        ),
        weekDays.map(ds=>{
          const isToday=ds===todayISO();const isSel=ds===selDate;
          const d=new Date(ds+"T12:00");
          return h("div",{key:ds,onClick:()=>setSelDate(ds),style:{padding:"10px 4px",textAlign:"center",borderRight:`1px solid ${P.border}`,cursor:"pointer",background:isSel?P.rose:isToday?"rgba(157,119,97,.1)":"transparent"}},
            h("div",{style:{fontSize:9.5,color:isSel?P.accent3:P.text3,textTransform:"uppercase",letterSpacing:".08em"}},["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]),
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:isSel?P.accent3:isToday?P.accent:P.text,marginTop:2}},d.getDate())
          );
        })
      ),
      h("div",{style:{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)"}},
        h("div",{style:{borderRight:`1px solid ${P.border}`}},
          HOURS.map(hr=>h("div",{key:hr,style:{height:56,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:4,fontSize:9.5,color:P.text3}},hr))
        ),
        weekDays.map(ds=>h("div",{key:ds,style:{borderRight:`1px solid ${P.border}`,position:"relative"}},
          HOURS.map(hr=>h("div",{key:hr,style:{height:56,borderBottom:`1px solid rgba(71,35,37,.2)`}})),
          agenda.filter(a=>a.date===ds).map(a=>{
            const sc=APPT_STATUS_CFG[a.status]||APPT_STATUS_CFG.Aguardando;
            const [hh]=a.time.split(":").map(Number);
            const top=(hh-7)*56+2;
            return h("div",{key:a.id,onClick:()=>openEdit(a),style:{position:"absolute",left:2,right:2,top,minHeight:50,background:`${P.rose}22`,border:`1px solid ${P.rose}55`,borderLeft:`2px solid ${sc.color}`,borderRadius:6,padding:"3px 5px",cursor:"pointer",zIndex:2,overflow:"hidden"}},
              h("div",{style:{fontSize:10,color:P.accent,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},a.time+" "+a.patientName),
              h("div",{style:{fontSize:9.5,color:P.text3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},a.procedure)
            );
          })
        ))
      )
    ),
    // ── VIEW MÊS ──
    viewMode==="month"&&h("div",{style:{display:"grid",gridTemplateColumns:"1fr 320px",gap:18}},
      h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},`${MONTH_NAMES[viewMonth.m]} ${viewMonth.y}`),
          h("div",{style:{display:"flex",gap:6}},
            h("button",{onClick:prevMonth,style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:28,height:28,color:P.text2,cursor:"pointer",fontSize:14}},"‹"),
            h("button",{onClick:nextMonth,style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:28,height:28,color:P.text2,cursor:"pointer",fontSize:14}},"›")
          )
        ),
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}},["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=>h("div",{key:d,style:{textAlign:"center",fontSize:9.5,color:P.text3,textTransform:"uppercase",letterSpacing:".08em",paddingBottom:6}},d))),
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}},
          [...Array(firstDow).fill(null).map((_,i)=>h("div",{key:"e"+i})),
          ...Array(daysInMonth).fill(null).map((_,i)=>{
            const d=i+1,ds=`${viewMonth.y}-${String(viewMonth.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const isSel=ds===selDate,hasApp=agendaDates.has(ds),isToday=ds===todayISO();
            const apptCount=agenda.filter(a=>a.date===ds).length;
            return h("div",{key:d,onClick:()=>setSelDate(ds),style:{textAlign:"center",padding:"9px 2px",borderRadius:8,cursor:"pointer",fontSize:13,position:"relative",color:isSel?"#160b0e":hasApp?P.text:P.text3,background:isSel?`linear-gradient(135deg,${P.rose},${P.gold})`:"transparent",border:`1px solid ${isToday&&!isSel?"rgba(157,119,97,.4)":"transparent"}`}},
              d,apptCount>0&&!isSel&&h("div",{style:{width:4,height:4,borderRadius:"50%",background:P.rose,position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)"}})
            );
          })]
        )
      ),
      h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text}},new Date(selDate+"T12:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})),
          h("span",{style:{fontSize:12,color:P.text3}},`${dayAppts.length} consulta(s)`)
        ),
        dayAppts.length===0?h("div",{style:{color:P.text3,fontSize:13,textAlign:"center",padding:24}},"Nenhuma consulta.")
        :dayAppts.map(a=>{const sc=APPT_STATUS_CFG[a.status]||APPT_STATUS_CFG.Aguardando;return h("div",{key:a.id,style:{padding:"10px 12px",marginBottom:8,background:P.bg3,borderRadius:9,border:`1px solid ${P.border}`}},
          h("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:6}},
            h("div",{style:{fontSize:11,color:P.accent,fontWeight:700,minWidth:36}},a.time),
            h("div",{style:{flex:1}},h("div",{style:{fontSize:13,color:P.text,fontWeight:500}},a.patientName),h("div",{style:{fontSize:11,color:P.text3}},a.procedure),h("div",{style:{fontSize:10,color:P.text3}},"📍 "+a.location))
          ),
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}},
            h("button",{onClick:()=>cycleStatus(a.id),style:{fontSize:10,padding:"3px 8px",borderRadius:12,color:sc.color,background:sc.bg,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},"↻ "+a.status),
            h("div",{style:{display:"flex",gap:5,alignItems:"center"}},
              (()=>{
                const pat=patients.find(p=>p.name===a.patientName);
                const phone=pat?.phone?.replace(/\D/g,"")||"";
                const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
                const tomorrowStr=tomorrow.toISOString().slice(0,10);
                const isToday=a.date===new Date().toISOString().slice(0,10);
                const isTomorrow=a.date===tomorrowStr;
                const msgConfirm=encodeURIComponent(`Olá ${a.patientName.split(" ")[0]}! 😊 Confirmando sua consulta ${isTomorrow?"amanhã":isToday?"hoje":"no dia "+new Date(a.date+"T12:00").toLocaleDateString("pt-BR")} às ${a.time} para ${a.procedure}. Confirme com SIM ou nos avise se precisar remarcar. 🌸`);
                return phone?h("a",{href:`https://wa.me/55${phone}?text=${msgConfirm}`,target:"_blank",rel:"noreferrer",title:"Confirmar consulta",style:{fontSize:10,padding:"3px 8px",borderRadius:6,background:"rgba(106,196,130,.15)",border:"1px solid rgba(106,196,130,.35)",color:"#7aad8a",textDecoration:"none",cursor:"pointer",fontWeight:600}},"✓ Confirmar"):null;
              })(),
              h("button",{onClick:()=>openEdit(a),style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"✎"),
              h("button",{onClick:()=>delAppt(a.id),style:{fontSize:11,color:P.red,background:"transparent",border:"1px solid rgba(192,112,112,.2)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"🗑")
            )
          )
        );}),
        h("button",{onClick:()=>{setEditItem(null);setForm({...blank,date:selDate});setShowNew(true);},style:{width:"100%",marginTop:6,padding:"8px",borderRadius:8,border:`1px dashed ${P.border}`,background:"transparent",color:P.text3,cursor:"pointer",fontSize:12}},"＋ Agendar neste dia")
      )
    ),
    h(Modal,{open:showNew,onClose:()=>{setShowNew(false);setEditItem(null);},title:editItem?"✎ Editar Agendamento":"✦ Novo Agendamento",width:540},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Paciente"},h(PatientAutocomplete,{value:form.patientName,onChange:(name,pat)=>{if(pat){setForm(p=>({...p,patientName:name,procedure:pat.sessions&&pat.sessions.length>0?pat.sessions[0].procedure:p.procedure,location:pat.sessions&&pat.sessions.length>0?pat.sessions[0].location:p.location}));}else{setForm(p=>({...p,patientName:name}));}},patients})),
        h(Field,{label:"Procedimento"},h(Sel,{value:form.procedure,onChange:fv("procedure"),options:procedures})),
        h(Field,{label:"Data",half:true},h(Inp,{type:"date",value:form.date,onChange:fv("date")})),
        h(Field,{label:"Horário",half:true},h(Inp,{type:"time",value:form.time,onChange:fv("time")})),
        h(Field,{label:"Local",half:true},h(Sel,{value:form.location,onChange:fv("location"),options:locations})),
        h(Field,{label:"Duração",half:true},h(Sel,{value:form.duration,onChange:fv("duration"),options:["30 min","45 min","1 hora","1h30","2 horas"]})),
        h(Field,{label:"Valor (R$)",half:true},h(Inp,{value:form.value,onChange:fv("value"),placeholder:"0,00"})),
        h(Field,{label:"Status",half:true},h(Sel,{value:form.status,onChange:fv("status"),options:APPT_STATUS})),
        h(Field,{label:"Observações"},h(TA,{value:form.obs,onChange:fv("obs"),placeholder:"Anotações, avisos...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},
        h(Btn,{variant:"ghost",onClick:()=>{setShowNew(false);setEditItem(null);}},"Cancelar"),
        h(Btn,{onClick:saveAppt},editItem?"Salvar Alterações":"Confirmar")
      )
    )
  );
}
// ─── PATIENTS LIST ────────────────────────────────────────────────────────────
function Patients({patients,setPatients,onSelect,procedures,locations}){
  const[search,setSearch]=useState("");
  const[filter,setFilter]=useState("all");
  const[showNew,setShowNew]=useState(false);
  const blank={name:"",age:"",birthDate:"",phone:"",email:"",cpf:"",bloodType:"A+",allergies:"Nenhuma",complaints:"",skinType:"Normal",fitzpatrick:"II",healthHistory:"",medications:"",smoking:"Não",pregnancy:"Não",previousProcedures:"",allergiesDetail:"",contraindications:"",musicStyle:"Pop",status:"active"};
  const[form,setForm]=useState(blank);
  const fv=k=>v=>setForm(p=>({...p,[k]:v}));
  const[profPhoto,setProfPhoto]=useState(null);
  const today=new Date();
  const h=createElement;
  const filtersBtns=[{k:"all",l:"Todos"},{k:"vip",l:"VIP"},{k:"active",l:"Ativas"},{k:"treatment",l:"Tratamento"},{k:"return",l:"Retorno"},{k:"inactive",l:"Inativas"}];
  // Auto compute status based on activity
  const enhanced=patients.map(p=>{
    const d=parseDMY(p.lastVisit);const days=d?daysBetween(d,today):0;
    let autoStatus=p.status;
    if(d&&days>365&&p.status!=="vip")autoStatus="inactive";
    else if(d&&days>90&&p.status!=="vip"&&p.status!=="treatment")autoStatus="return";
    return{...p,_days:days,_autoStatus:autoStatus};
  });
  const visible=enhanced.filter(p=>{
    const ms=p.name.toLowerCase().includes(search.toLowerCase())||p.phone.includes(search)||p.cpf?.includes(search);
    const mf=filter==="all"||(p._autoStatus||p.status)===filter;
    return ms&&mf;
  });
  function addPatient(){
    const np={id:Date.now(),...form,age:Number(form.age),profilePhoto:profPhoto,lastVisit:"—",nextReturn:"—",sessions:[],sessions_packages:[],intercorrencias:[],planejamento:[],
      complaints:form.complaints.split(",").map(s=>s.trim()).filter(Boolean),tags:[],
      anamnese:{healthHistory:form.healthHistory,medications:form.medications,smoking:form.smoking,pregnancy:form.pregnancy,previousProcedures:form.previousProcedures,skinType:form.skinType,fitzpatrick:form.fitzpatrick,allergiesDetail:form.allergiesDetail,contraindications:form.contraindications,musicStyle:form.musicStyle,importantAlerts:form.allergies&&form.allergies!=="Nenhuma"?[form.allergies]:[]}};
    setPatients(prev=>[...prev,np]);setShowNew(false);setForm(blank);setProfPhoto(null);
  }
  return h("div",null,
    h(SectionHeader,{title:"Pacientes",sub:`${patients.length} pacientes cadastrados`,action:h(Btn,{onClick:()=>setShowNew(true)},"＋ Novo Paciente")}),
    h("div",{style:{display:"flex",gap:12,marginBottom:18,alignItems:"center",flexWrap:"wrap"}},
      h("input",{value:search,onChange:e=>setSearch(e.target.value),placeholder:"🔍 Buscar por nome, telefone, CPF...",style:{...IS,flex:1,minWidth:200,padding:"8px 14px"}}),
      h("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},filtersBtns.map(fi=>h("button",{key:fi.k,onClick:()=>setFilter(fi.k),style:{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:filter===fi.k?P.rose:"transparent",border:`1px solid ${filter===fi.k?P.rose:P.border}`,color:filter===fi.k?P.accent3:P.text2}},fi.l)))
    ),
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}},
      visible.map((p,i)=>h("div",{key:p.id,onClick:()=>onSelect(p),style:{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:P.card,border:`1px solid ${P.border}`,borderRadius:10,cursor:"pointer",transition:"all .18s"},onMouseEnter:e=>{e.currentTarget.style.borderColor=P.accent;e.currentTarget.style.transform="translateX(3px)";},onMouseLeave:e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.transform="";}},
        h(Avatar,{name:p.name,size:46,idx:i,src:p.profilePhoto}),
        h("div",{style:{flex:1,minWidth:0}},
          h("div",{style:{fontSize:14,color:P.text,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},p.name),
          h("div",{style:{fontSize:12,color:P.text3,marginTop:2}},`${p.age} anos · ${(p.sessions||[]).length} sessões`),
          p._days>180?h("div",{style:{fontSize:11,color:P.red,marginTop:2}},`⚠ Inativa há ${p._days} dias`):p._days>90?h("div",{style:{fontSize:11,color:P.yellow,marginTop:2}},`↩ Sem retorno há ${p._days} dias`):null,
          p.allergies&&p.allergies!=="Nenhuma"&&h("div",{style:{fontSize:11,color:P.red,marginTop:2}},`⚠ ${p.allergies}`)
        ),
        h(StatusBadge,{status:p._autoStatus||p.status})
      ))
    ),
    h(Modal,{open:showNew,onClose:()=>setShowNew(false),title:"✦ Novo Paciente",width:620},
      h("div",{style:{display:"flex",alignItems:"center",gap:16,marginBottom:20,padding:14,background:P.bg3,borderRadius:10,border:`1px solid ${P.border}`}},
        profPhoto?h("img",{src:profPhoto,alt:"foto",style:{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:`2px solid ${P.rose}`}}):h("div",{style:{width:64,height:64,borderRadius:"50%",background:P.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:`2px dashed ${P.border}`}},"👤"),
        h(UploadZone,{onFiles:f=>f[0]&&setProfPhoto(URL.createObjectURL(f[0])),label:"Foto de perfil",multiple:false})
      ),
      h("div",{style:{fontSize:11,textTransform:"uppercase",letterSpacing:".12em",color:P.accent,borderBottom:`1px solid ${P.border}`,paddingBottom:8,marginBottom:14}},"Dados Pessoais"),
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Nome Completo"},h(Inp,{value:form.name,onChange:fv("name"),placeholder:"Nome da paciente"})),
        h(Field,{label:"Idade",third:true},h(Inp,{value:form.age,onChange:fv("age"),placeholder:"32"})),
        h(Field,{label:"Data Nasc.",third:true},h(Inp,{type:"date",value:form.birthDate,onChange:fv("birthDate")})),
        h(Field,{label:"Tipo Sang.",third:true},h(Sel,{value:form.bloodType,onChange:fv("bloodType"),options:BLOOD_TYPES})),
        h(Field,{label:"Telefone",half:true},h(Inp,{value:form.phone,onChange:fv("phone"),placeholder:"(11) 99999-9999"})),
        h(Field,{label:"E-mail",half:true},h(Inp,{value:form.email,onChange:fv("email"),placeholder:"email@email.com"})),
        h(Field,{label:"CPF"},h(Inp,{value:form.cpf,onChange:fv("cpf"),placeholder:"000.000.000-00"})),
        h(Field,{label:"Status"},h(Sel,{value:form.status,onChange:fv("status"),options:Object.keys(PAT_STATUS_CFG)})),
        h(Field,{label:"Alergias Conhecidas"},h(Inp,{value:form.allergies,onChange:fv("allergies"),placeholder:"Ex: Dipirona, Penicilina"})),
        h(Field,{label:"Detalhes das Alergias"},h(TA,{value:form.allergiesDetail,onChange:fv("allergiesDetail"),placeholder:"Tipo de reação...",rows:2})),
        h(Field,{label:"Contraindicações"},h(Inp,{value:form.contraindications,onChange:fv("contraindications"),placeholder:"Substâncias contraindicadas"})),
        h(Field,{label:"Tipo de Pele",half:true},h(Sel,{value:form.skinType,onChange:fv("skinType"),options:SKIN_TYPES})),
        h(Field,{label:"Fitzpatrick",half:true},h(Sel,{value:form.fitzpatrick,onChange:fv("fitzpatrick"),options:FITZPATRICK})),
        h(Field,{label:"Histórico de Saúde"},h(TA,{value:form.healthHistory,onChange:fv("healthHistory"),placeholder:"Doenças, cirurgias...",rows:2})),
        h(Field,{label:"Medicamentos"},h(Inp,{value:form.medications,onChange:fv("medications"),placeholder:"Medicamentos em uso"})),
        h(Field,{label:"Fumante",third:true},h(Sel,{value:form.smoking,onChange:fv("smoking"),options:["Não","Sim","Ex-fumante"]})),
        h(Field,{label:"Gestante",third:true},h(Sel,{value:form.pregnancy,onChange:fv("pregnancy"),options:["Não","Gestante","Lactante"]})),
        h(Field,{label:"🎵 Estilo Musical",third:true},h(Sel,{value:form.musicStyle,onChange:fv("musicStyle"),options:MUSIC_STYLES})),
        h(Field,{label:"Principais Queixas"},h(TA,{value:form.complaints,onChange:fv("complaints"),placeholder:"Separadas por vírgula",rows:2})),
        h(Field,{label:"Procedimentos Anteriores"},h(TA,{value:form.previousProcedures,onChange:fv("previousProcedures"),placeholder:"Histórico...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},
        h(Btn,{variant:"ghost",onClick:()=>setShowNew(false)},"Cancelar"),
        h(Btn,{onClick:addPatient},"Cadastrar Paciente")
      )
    )
  );
}
// ─── PATIENT DETAIL ───────────────────────────────────────────────────────────
function PatientDetail({patient,setPatients,onBack,procedures,locations,products,returnRules}){
  const[tab,setTab]=useState("prontuario");
  const[showNewS,setShowNewS]=useState(false);
  const[editSess,setEditSess]=useState(null);
  const[sessionFaceMap,setSessionFaceMap]=useState(null);
  const[editPat,setEditPat]=useState(false);
  const[showIntercorr,setShowIntercorr]=useState(null);
  const[showPlan,setShowPlan]=useState(false);
  const h=createElement;
  const today=new Date();
  const blankS={date:"",procedure:procedures[0]||"",product:products[0]||"",dose:"",region:"",location:locations[0]||"",value:"",payMethod:"Pix",parcelas:"1",finStatus:"Pendente",paid:false,notes:"",evolution:"",useFaceMap:false,returnReminderDays:14};
  const[sForm,setSForm]=useState(blankS);
  const sfv=k=>v=>setSForm(p=>({...p,[k]:v}));
  // Auto-preenche prazo de retorno ao trocar procedimento
  const sfvProcedure=v=>{
    const rule=(returnRules||[]).find(r=>r.procedure===v);
    setSForm(p=>({...p,procedure:v,returnReminderDays:rule?rule.revisionDays||rule.maintenanceDays:90}));
  };
  const[patForm,setPatForm]=useState({...patient,...patient.anamnese,complaints:(patient.complaints||[]).join(", ")});
  const pfv=k=>v=>setPatForm(p=>({...p,[k]:v}));
  const[icForm,setIcForm]=useState({type:"Edema",notes:"",conduct:"",date:""});
  const[planForm,setPlanForm]=useState({title:"",steps:"",notes:""});
  const totalSpent=(patient.sessions||[]).reduce((a,s)=>a+s.value,0);
  const tabs=[{k:"prontuario",l:"📋 Prontuário"},{k:"mapa",l:"🗺 Mapa"},{k:"intercorrencias",l:"⚠ Intercorr."},{k:"planejamento",l:"🎯 Planejamento"},{k:"anamnese",l:"📄 Anamnese"},{k:"galeria",l:"🖼 Fotos"},{k:"docs",l:"📎 Docs"},{k:"financeiro",l:"💰 Financeiro"}];
  function upd(fn){setPatients(prev=>prev.map(p=>p.id===patient.id?fn(p):p));}
  function savePat(){
    upd(p=>({...p,...patForm,age:Number(patForm.age),complaints:patForm.complaints.split(",").map(s=>s.trim()).filter(Boolean),
      anamnese:{...p.anamnese,healthHistory:patForm.healthHistory,medications:patForm.medications,smoking:patForm.smoking,pregnancy:patForm.pregnancy,previousProcedures:patForm.previousProcedures,skinType:patForm.skinType,fitzpatrick:patForm.fitzpatrick,allergiesDetail:patForm.allergiesDetail,contraindications:patForm.contraindications,musicStyle:patForm.musicStyle,importantAlerts:patForm.allergies&&patForm.allergies!=="Nenhuma"?[patForm.allergies]:[]}}));
    setEditPat(false);
  }
  function saveSession(){
    const s={id:editSess?editSess.id:Date.now(),date:sForm.date||new Date().toLocaleDateString("pt-BR"),procedure:sForm.procedure,doctor:"Dra. Sofia",product:sForm.product,lote:sForm.lote,dose:sForm.dose,region:sForm.region,location:sForm.location,value:Number(sForm.value)||0,paid:sForm.finStatus==="Pago",finStatus:sForm.finStatus,payMethod:sForm.payMethod,parcelas:sForm.payMethod==="Cartão Crédito"?Number(sForm.parcelas)||1:1,notes:sForm.notes,evolution:sForm.evolution,faceMap:sForm.useFaceMap?sessionFaceMap:null,photos:editSess?editSess.photos:[],docs:editSess?editSess.docs:[],intercorrencias:editSess?editSess.intercorrencias:[],returnReminderDays:Number(sForm.returnReminderDays)||90};
    upd(p=>editSess?{...p,sessions:p.sessions.map(x=>x.id===s.id?s:x),lastVisit:s.date}:{...p,sessions:[s,...(p.sessions||[])],lastVisit:s.date});
    setShowNewS(false);setEditSess(null);setSForm(blankS);setSessionFaceMap(null);
  }
  function toggleFinStatus(sessId,newSt){upd(p=>({...p,sessions:p.sessions.map(s=>s.id===sessId?{...s,finStatus:newSt,paid:newSt==="Pago"}:s)}));}
  function delSession(id){if(window.confirm("Excluir sessão?"))upd(p=>({...p,sessions:p.sessions.filter(s=>s.id!==id)}));}
  function addMedia(sessId,files,type){const news=files.map(f=>({id:Date.now()+Math.random(),name:f.name,type:f.type,url:URL.createObjectURL(f),date:new Date().toLocaleDateString("pt-BR")}));upd(p=>({...p,sessions:p.sessions.map(s=>s.id===sessId?{...s,[type]:[...(s[type]||[]),...news]}:s)}));}
  function removeMedia(sessId,fid,type){upd(p=>({...p,sessions:p.sessions.map(s=>s.id===sessId?{...s,[type]:(s[type]||[]).filter(f=>f.id!==fid)}:s)}));}
  function saveIntercorrencia(sessId){
    const ic={id:Date.now(),...icForm,date:icForm.date||new Date().toLocaleDateString("pt-BR"),photos:[]};
    upd(p=>({...p,sessions:p.sessions.map(s=>s.id===sessId?{...s,intercorrencias:[...(s.intercorrencias||[]),ic]}:s),intercorrencias:[...(p.intercorrencias||[]),{...ic,sessId}]}));
    setShowIntercorr(null);setIcForm({type:"Edema",notes:"",conduct:"",date:""});
  }
  function addPlanejamento(){
    const pl={id:Date.now(),title:planForm.title,steps:planForm.steps.split("\n").filter(s=>s.trim()),notes:planForm.notes,done:false,created:new Date().toLocaleDateString("pt-BR")};
    upd(p=>({...p,planejamento:[...(p.planejamento||[]),pl]}));
    setShowPlan(false);setPlanForm({title:"",steps:"",notes:""});
  }
  function togglePlanStep(planId,stepIdx){
    upd(p=>({...p,planejamento:(p.planejamento||[]).map(pl=>{if(pl.id!==planId)return pl;const steps=[...pl.steps];steps[stepIdx]=steps[stepIdx].includes("✓")?steps[stepIdx].replace(" ✓",""):steps[stepIdx]+" ✓";return{...pl,steps};})}));
  }
  const alertColors={alergia:P.red,hipertensão:"#c07070",diabetes:"#c4a96a",anticoagulante:"#9b7aad",gestante:"#d47090","lidocaína":P.red};
  function getAlertColor(txt){const t=txt.toLowerCase();for(const[k,v]of Object.entries(alertColors)){if(t.includes(k))return v;}return P.red;}
  return h("div",null,
    h("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:22}},
      h("button",{onClick:onBack,style:{background:`rgba(92,31,50,.12)`,border:`1px solid ${P.rose}`,borderRadius:8,padding:"7px 14px",color:P.accent,cursor:"pointer",fontSize:13}},"← Voltar"),
      h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:P.text}},"Ficha da Paciente"),
      h("div",{style:{marginLeft:"auto",display:"flex",gap:8}},
        h(Btn,{variant:"ghost",onClick:()=>setEditPat(true),style:{fontSize:12,padding:"6px 14px"}},"✎ Editar"),
        h(Btn,{variant:"danger",onClick:()=>{if(window.confirm("Excluir paciente?"))setPatients(prev=>prev.filter(p=>p.id!==patient.id));onBack();},style:{fontSize:12,padding:"6px 14px"}},"🗑 Excluir")
      )
    ),
    // Header card
    h(Card,{style:{marginBottom:18}},
      h("div",{style:{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}},
        h("div",{style:{position:"relative",flexShrink:0}},
          h(Avatar,{name:patient.name,size:70,idx:patient.id,src:patient.profilePhoto}),
          h("div",{onClick:()=>document.getElementById(`pp-${patient.id}`).click(),style:{position:"absolute",bottom:0,right:0,width:22,height:22,borderRadius:"50%",background:P.rose,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,border:`2px solid ${P.bg2}`}},"✎"),
          h("input",{id:`pp-${patient.id}`,type:"file",accept:"image/*",style:{display:"none"},onChange:e=>{if(e.target.files[0])upd(p=>({...p,profilePhoto:URL.createObjectURL(e.target.files[0])}));}})
        ),
        h("div",{style:{flex:1,minWidth:200}},
          h("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:P.text}},patient.name),
            h(StatusBadge,{status:patient.status})
          ),
          h("div",{style:{fontSize:13,color:P.text3,marginBottom:6}},`${patient.age} anos · Tipo ${patient.bloodType} · Fitzpatrick ${patient.anamnese?.fitzpatrick} · Desde ${patient.since}`),
          patient.anamnese?.musicStyle&&h("div",{style:{fontSize:12,color:P.text3,marginBottom:6}},`🎵 ${patient.anamnese.musicStyle}`),
          h("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},(patient.complaints||[]).map(c=>h("span",{key:c,style:{fontSize:11,padding:"3px 9px",borderRadius:20,background:`rgba(92,31,50,.12)`,color:P.accent,border:`1px solid rgba(92,31,50,.25)`}},c)))
        ),
        h("div",{style:{display:"flex",gap:12,flexWrap:"wrap"}},
          [{l:"Sessões",v:(patient.sessions||[]).length,c:P.accent},{l:"Total Investido",v:fmtCurr(totalSpent),c:P.green},{l:"Próx. Retorno",v:patient.nextReturn,c:"#7aaed4"}].map(s=>h("div",{key:s.l,style:{background:P.bg3,borderRadius:10,padding:"10px 16px",border:`1px solid ${P.border}`,textAlign:"center"}},h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:s.c,whiteSpace:"nowrap"}},s.v),h("div",{style:{fontSize:9.5,color:P.text3,textTransform:"uppercase",letterSpacing:".08em",marginTop:3}},s.l)))
        ),
        h(Btn,{onClick:()=>{setEditSess(null);setSForm(blankS);setShowNewS(true);}},"＋ Nova Sessão")
      ),
      // IMPORTANT ALERTS
      (patient.anamnese?.importantAlerts||[]).length>0&&h("div",{style:{marginTop:14,padding:"10px 14px",background:"rgba(192,112,112,.08)",borderRadius:8,border:"1px solid rgba(192,112,112,.2)"}},
        h("div",{style:{fontSize:11,color:P.red,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6,fontWeight:600}},"⚠ Alertas Importantes"),
        h("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},(patient.anamnese.importantAlerts||[]).map((a,i)=>h(AlertBadge,{key:i,text:a,color:getAlertColor(a)})))
      ),
      patient.allergies&&patient.allergies!=="Nenhuma"&&!(patient.anamnese?.importantAlerts||[]).includes(patient.allergies)&&h("div",{style:{marginTop:10,padding:"8px 14px",background:"rgba(192,112,112,.06)",borderRadius:8,border:"1px solid rgba(192,112,112,.18)",display:"flex",alignItems:"center",gap:8}},
        h("span",null,"⚠️"),h("span",{style:{fontSize:13,color:P.red}},`Alergia registrada: `,h("strong",null,patient.allergies))
      )
    ),
    h(TabBar,{tabs,active:tab,onChange:setTab}),
    // ─── PRONTUÁRIO TAB
    tab==="prontuario"&&h("div",null,
      (patient.sessions||[]).length===0&&h(Card,{style:{textAlign:"center",padding:40}},h("div",{style:{fontSize:32,marginBottom:12}},"📋"),h("div",{style:{color:P.text3,fontSize:14}},"Nenhuma sessão."),h(Btn,{style:{marginTop:16},onClick:()=>setShowNewS(true)},"Registrar Primeira Sessão")),
      (patient.sessions||[]).map(s=>h(Card,{key:s.id,style:{marginBottom:14}},
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}},
          h("div",null,
            h("div",{style:{fontSize:10,color:P.rose2,textTransform:"uppercase",letterSpacing:".12em",fontWeight:600,marginBottom:4}},`${s.date} · 📍 ${s.location||""}`),
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},s.procedure),
            h("div",{style:{fontSize:12,color:P.text3,marginTop:2}},`${s.doctor} · ${s.product}${s.dose?" · "+s.dose:""}${s.lote?" · Lote: "+s.lote:""}`)
          ),
          h("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:21,color:s.finStatus==="Pago"?P.green:s.finStatus==="Pendente"?P.yellow:P.red}},fmtCurr(s.value)),
            s.payMethod==="Cartão Crédito"&&s.parcelas>1&&h("div",{style:{fontSize:11,color:P.accent,background:"rgba(157,119,97,.1)",borderRadius:8,padding:"2px 8px",fontWeight:600}},`${s.parcelas}x ${fmtCurr(s.value/s.parcelas)}`),
            h("select",{value:s.finStatus||"Pendente",onChange:e=>toggleFinStatus(s.id,e.target.value),style:{fontSize:11,padding:"3px 8px",borderRadius:12,color:s.finStatus==="Pago"?P.green:P.yellow,background:P.bg3,border:`1px solid ${P.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},FIN_STATUS.map(st=>h("option",{key:st,value:st},st))),
            h("button",{onClick:()=>{setEditSess(s);setSForm({...s,value:String(s.value),useFaceMap:!!s.faceMap,finStatus:s.finStatus||"Pendente"});setSessionFaceMap(s.faceMap);setShowNewS(true);},style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer"}},"✎"),
            h("button",{onClick:()=>delSession(s.id),style:{fontSize:11,color:P.red,background:"transparent",border:"1px solid rgba(192,112,112,.2)",borderRadius:6,padding:"3px 8px",cursor:"pointer"}},"🗑")
          )
        ),
        s.region&&h("div",{style:{fontSize:12,color:P.text2,marginBottom:8}},`🎯 Região: `,h("strong",{style:{color:P.text}},s.region)),
        s.notes&&h("div",{style:{background:P.bg3,borderRadius:8,padding:"10px 14px",marginBottom:8}},h("div",{style:{fontSize:9.5,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}},"Notas"),h("div",{style:{fontSize:13,color:P.text2,lineHeight:1.6}},s.notes)),
        s.evolution&&h("div",{style:{background:`rgba(92,31,50,.06)`,borderRadius:8,padding:"10px 14px",border:`1px solid rgba(92,31,50,.15)`,marginBottom:8}},h("div",{style:{fontSize:9.5,color:P.accent,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}},"Evolução / Retorno"),h("div",{style:{fontSize:13,color:P.text2,lineHeight:1.6}},s.evolution)),
        s.returnReminderDays&&h("div",{style:{fontSize:11,color:P.text3,marginBottom:8}},`⏰ Lembrete de retorno: ${s.returnReminderDays} dias após procedimento`),
        s.faceMap&&Object.values(s.faceMap.points||{}).some(v=>v>0)&&h("div",{style:{padding:"8px 12px",background:P.bg3,borderRadius:8,marginBottom:8}},h("div",{style:{fontSize:9.5,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}},`Mapa · ${s.faceMap.type}`),h("div",{style:{display:"flex",gap:5,flexWrap:"wrap"}},Object.entries(s.faceMap.points||{}).filter(([,v])=>v>0).map(([k,v])=>h("span",{key:k,style:{fontSize:11,padding:"3px 9px",borderRadius:20,background:`rgba(92,31,50,.1)`,color:P.accent}},`${k.replace(/_/g," ")}: ${v}${s.faceMap.type==="botox"?"U":"ml"}`)))),
        (s.intercorrencias||[]).length>0&&h("div",{style:{marginBottom:8,padding:"8px 12px",background:"rgba(192,112,112,.06)",borderRadius:8,border:"1px solid rgba(192,112,112,.18)"}},h("div",{style:{fontSize:10,color:P.red,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}},"⚠ Intercorrências"),(s.intercorrencias||[]).map((ic,i)=>h("div",{key:i,style:{fontSize:12,color:P.text2}},`${ic.date} · ${ic.type}: ${ic.notes}`))),
        (s.photos||[]).length>0&&h("div",{style:{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}},(s.photos||[]).slice(0,4).map(ph=>h("img",{key:ph.id,src:ph.url,alt:ph.name,style:{width:58,height:58,objectFit:"cover",borderRadius:6,border:`1px solid ${P.border}`}})),(s.photos||[]).length>4&&h("div",{style:{width:58,height:58,borderRadius:6,background:P.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:P.text3}},`+${(s.photos||[]).length-4}`)),
        h("div",{style:{display:"flex",gap:8,marginTop:10}},
          h("label",{style:{fontSize:11,color:P.accent,border:`1px solid ${P.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}},"📷 Fotos",h("input",{type:"file",accept:"image/*",multiple:true,style:{display:"none"},onChange:e=>addMedia(s.id,[...e.target.files],"photos")})),
          h("label",{style:{fontSize:11,color:P.accent,border:`1px solid ${P.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}},"📎 Docs",h("input",{type:"file",multiple:true,style:{display:"none"},onChange:e=>addMedia(s.id,[...e.target.files],"docs")})),
          h("button",{onClick:()=>setShowIntercorr(s.id),style:{fontSize:11,color:P.red,background:"transparent",border:"1px solid rgba(192,112,112,.2)",borderRadius:6,padding:"4px 10px",cursor:"pointer"}},"⚠ Intercorrência")
        )
      ))
    ),
    // ─── MAPA TAB
    tab==="mapa"&&h("div",null,
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}},
        [{title:"💉 Toxina",type:"botox"},{title:"✨ Preenchimento",type:"filler"},{title:"🧵 Fios",type:"thread"}].map(mt=>{
          const sess=(patient.sessions||[]).find(s=>s.faceMap?.type===mt.type);
          return h(Card,{key:mt.type},h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:P.text,marginBottom:14}},mt.title),sess?h(FaceMapEditor,{sessionMap:sess.faceMap,onChange:()=>{},readOnly:true}):h("div",{style:{textAlign:"center",padding:"20px 0",color:P.text3,fontSize:13}},"Nenhuma sessão."),sess&&h("div",{style:{fontSize:11,color:P.text3,marginTop:8}},`Sessão: ${sess.date}`));
        })
      ),
      h(Card,{style:{marginTop:14}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:14}},"Histórico de Mapas"),
        (patient.sessions||[]).filter(s=>s.faceMap&&Object.values(s.faceMap.points||{}).some(v=>v>0)).length===0?h("div",{style:{color:P.text3,fontSize:13}},"Nenhum mapa registrado.")
        :(patient.sessions||[]).filter(s=>s.faceMap&&Object.values(s.faceMap.points||{}).some(v=>v>0)).map((s,i)=>h("div",{key:i,style:{padding:"10px 0",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}},
          h("span",{style:{fontSize:13,color:P.text}},`${s.date} · ${s.procedure}`),
          h("div",{style:{display:"flex",gap:4,flexWrap:"wrap"}},Object.entries(s.faceMap.points||{}).filter(([,v])=>v>0).map(([k,v])=>h("span",{key:k,style:{fontSize:10,padding:"2px 8px",borderRadius:12,background:`rgba(92,31,50,.1)`,color:P.accent}},`${k.replace(/_/g," ")}: ${v}${s.faceMap.type==="botox"?"U":"ml"}`)))
        ))
      )
    ),
    // ─── INTERCORRÊNCIAS TAB
    tab==="intercorrencias"&&h("div",null,
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},"Intercorrências Registradas"),
        h(Btn,{onClick:()=>setShowIntercorr("global")},"＋ Registrar")
      ),
      (patient.intercorrencias||[]).length===0?h(Card,{style:{textAlign:"center",padding:32}},h("div",{style:{fontSize:28,marginBottom:8}},"✅"),h("div",{style:{color:P.text3,fontSize:13}},"Nenhuma intercorrência registrada.")):
      (patient.intercorrencias||[]).map((ic,i)=>h(Card,{key:i,style:{marginBottom:12,border:"1px solid rgba(192,112,112,.2)"}},
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}},
          h("div",null,h("div",{style:{fontSize:10,color:P.red,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}},ic.date),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text}},ic.type),ic.notes&&h("div",{style:{fontSize:13,color:P.text2,marginTop:6}},ic.notes),ic.conduct&&h("div",{style:{fontSize:12,color:P.green,marginTop:4}},`✓ Conduta: ${ic.conduct}`))
        )
      ))
    ),
    // ─── PLANEJAMENTO TAB
    tab==="planejamento"&&h("div",null,
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},"Planejamento Facial"),
        h(Btn,{onClick:()=>setShowPlan(true)},"＋ Novo Plano")
      ),
      (patient.planejamento||[]).length===0?h(Card,{style:{textAlign:"center",padding:32}},h("div",{style:{fontSize:28,marginBottom:8}},"🎯"),h("div",{style:{color:P.text3,fontSize:13}},"Nenhum planejamento criado.")):
      (patient.planejamento||[]).map(pl=>h(Card,{key:pl.id,style:{marginBottom:14}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:8}},pl.title),
        pl.notes&&h("div",{style:{fontSize:13,color:P.text3,marginBottom:10}},pl.notes),
        h("div",null,(pl.steps||[]).map((step,si)=>h("div",{key:si,onClick:()=>togglePlanStep(pl.id,si),style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${P.border}`,cursor:"pointer"}},
          h("div",{style:{width:16,height:16,borderRadius:4,border:`2px solid ${step.includes("✓")?P.green:P.border}`,background:step.includes("✓")?P.green:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}},step.includes("✓")?"✓":""),
          h("span",{style:{fontSize:13,color:step.includes("✓")?P.green:P.text,textDecoration:step.includes("✓")?"line-through":"none"}},step.replace(" ✓",""))
        ))),
        h("div",{style:{fontSize:11,color:P.text3,marginTop:8}},`Criado em ${pl.created}`)
      ))
    ),
    // ─── ANAMNESE TAB
    tab==="anamnese"&&patient.anamnese&&h("div",null,
      h("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:14}},
        h("button",{onClick:()=>{
          const an=patient.anamnese||{};
          const w=window.open("","_blank","width=900,height=700");
          w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Anamnese — ${patient.name}</title><style>*{box-sizing:border-box}body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#222;line-height:1.6;padding:0 20px}h1{font-size:24px;border-bottom:2px solid #5C1F32;padding-bottom:8px;color:#5C1F32;margin-bottom:4px}h2{font-size:14px;color:#5C1F32;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.1em}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px}td{padding:7px 10px;border:1px solid #ddd}td:first-child{font-weight:600;background:#faf5f3;width:38%}.badge{display:inline-block;padding:2px 8px;border-radius:20px;background:#f0e0e0;color:#5C1F32;font-size:12px;margin:2px}footer{margin-top:40px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}@media print{body{margin:16px}}</style></head><body><h1>Ficha de Anamnese</h1><p style="color:#888;font-size:13px">Gerado em ${new Date().toLocaleDateString("pt-BR")} — HarmonizaPro</p><h2>Dados Pessoais</h2><table><tr><td>Nome</td><td>${patient.name}</td></tr><tr><td>Data de Nascimento</td><td>${patient.birthDate||"—"}</td></tr><tr><td>Telefone</td><td>${patient.phone||"—"}</td></tr><tr><td>E-mail</td><td>${patient.email||"—"}</td></tr><tr><td>CPF</td><td>${patient.cpf||"—"}</td></tr><tr><td>Tipo Sanguíneo</td><td>${patient.bloodType||"—"}</td></tr></table><h2>Dados Clínicos</h2><table><tr><td>Tipo de Pele</td><td>${an.skinType||"—"}</td></tr><tr><td>Fitzpatrick</td><td>${an.fitzpatrick||"—"}</td></tr><tr><td>Histórico de Saúde</td><td>${an.healthHistory||"—"}</td></tr><tr><td>Medicamentos</td><td>${an.medications||"—"}</td></tr><tr><td>Alergias</td><td>${patient.allergies||"—"}</td></tr><tr><td>Detalhes das Alergias</td><td>${an.allergiesDetail||"—"}</td></tr><tr><td>Contraindicações</td><td>${an.contraindications||"—"}</td></tr><tr><td>Fumante</td><td>${an.smoking||"—"}</td></tr><tr><td>Gestante/Lactante</td><td>${an.pregnancy||"—"}</td></tr></table><h2>Estético</h2><table><tr><td>Procedimentos Anteriores</td><td>${an.previousProcedures||"—"}</td></tr><tr><td>Principais Queixas</td><td>${(patient.complaints||[]).join(", ")||"—"}</td></tr></table>${(an.importantAlerts||[]).length>0?`<h2>⚠ Alertas</h2><div>${an.importantAlerts.map(a=>'<span class="badge">'+a+'</span>').join(" ")}</div>`:""}<h2>Assinatura</h2><table><tr><td style="height:60px">Assinatura da Paciente</td><td style="height:60px">Assinatura da Profissional</td></tr><tr><td>Data: ___/___/______</td><td>CRM/CRN: ________________</td></tr></table><footer>Documento gerado pelo HarmonizaPro — ${new Date().toLocaleDateString("pt-BR")}</footer></body></html>`);
          w.document.close();setTimeout(()=>w.print(),500);
        },style:{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:`linear-gradient(135deg,${P.rose},${P.gold})`,color:P.accent3,border:"none"}},"🖨 Imprimir Ficha / PDF")
      ),
      (patient.anamnese.importantAlerts||[]).length>0&&h(Card,{style:{marginBottom:14,border:"1px solid rgba(192,112,112,.3)",background:"rgba(192,112,112,.05)"}},
        h("div",{style:{fontSize:11,color:P.red,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10,fontWeight:600}},"⚠ Alertas & Contraindicações"),
        h("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
          (patient.anamnese.importantAlerts||[]).map((a,i)=>h(AlertBadge,{key:i,text:a,color:getAlertColor(a)}))
        ),
        patient.anamnese.allergiesDetail&&h("div",{style:{fontSize:13,color:P.text2,marginTop:8}},patient.anamnese.allergiesDetail),
        patient.anamnese.contraindications&&patient.anamnese.contraindications!=="Nenhuma"&&h("div",{style:{fontSize:13,color:P.red,marginTop:6}},`Contraindicações: ${patient.anamnese.contraindications}`)
      ),
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}},
        [{l:"Tipo de Pele",v:patient.anamnese.skinType},{l:"Fitzpatrick",v:patient.anamnese.fitzpatrick},{l:"Fumante",v:patient.anamnese.smoking},{l:"Gestante/Lactante",v:patient.anamnese.pregnancy},{l:"Histórico de Saúde",v:patient.anamnese.healthHistory},{l:"Medicamentos",v:patient.anamnese.medications},{l:"Procedimentos Anteriores",v:patient.anamnese.previousProcedures||"Nenhum"},{l:"🎵 Estilo Musical",v:patient.anamnese.musicStyle||"—"}].map(f=>h(Card,{key:f.l,style:{padding:"14px 16px"}},h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}},f.l),h("div",{style:{fontSize:14,color:P.text}},f.v||"—")))
      )
    ),
    // ─── GALERIA TAB
    tab==="galeria"&&h("div",null,
      // Comparação lado a lado se há fotos em múltiplas sessões
      (()=>{
        const sessWithPhotos=(patient.sessions||[]).filter(s=>(s.photos||[]).length>0);
        if(sessWithPhotos.length>=2){
          const [compA,compB]=useState([sessWithPhotos[0]?.id,sessWithPhotos[sessWithPhotos.length-1]?.id]);
          const sA=sessWithPhotos.find(s=>s.id===compA[0]);
          const sB=sessWithPhotos.find(s=>s.id===compB[0]);
          return h(Card,{style:{marginBottom:18,background:`linear-gradient(135deg,${P.bg2},${P.card})`,border:`1px solid ${P.rose}44`}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:14}},"🔄 Comparação Antes & Depois"),
            h("div",{style:{display:"flex",gap:12,marginBottom:14}},
              h("div",{style:{flex:1}},
                h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}},"Sessão A"),
                h("select",{value:compA[0],onChange:e=>compA[1](Number(e.target.value)),style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 10px",color:P.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}},
                  sessWithPhotos.map(s=>h("option",{key:s.id,value:s.id},`${s.date} — ${s.procedure}`))
                )
              ),
              h("div",{style:{flex:1}},
                h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}},"Sessão B"),
                h("select",{value:compB[0],onChange:e=>compB[1](Number(e.target.value)),style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 10px",color:P.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}},
                  sessWithPhotos.map(s=>h("option",{key:s.id,value:s.id},`${s.date} — ${s.procedure}`))
                )
              )
            ),
            h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
              [sA,sB].map((s,i)=>s?h("div",{key:i},
                h("div",{style:{fontSize:11,color:P.accent,fontWeight:600,marginBottom:8}},i===0?"◀ Antes":"Depois ▶"),
                h("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
                  (s.photos||[]).map(f=>h("img",{key:f.id,src:f.url,alt:f.name,style:{width:"calc(50% - 4px)",borderRadius:8,objectFit:"cover",aspectRatio:"1",border:`1px solid ${P.border}`}}))
                )
              ):null)
            )
          );
        }
        return null;
      })(),
      (patient.sessions||[]).map(s=>h(Card,{key:s.id,style:{marginBottom:14}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:P.text,marginBottom:12}},`${s.date} · ${s.procedure} `,h("span",{style:{fontSize:12,color:P.text3,fontFamily:"'DM Sans',sans-serif"}},`${(s.photos||[]).length} foto(s)`)),
        h(MediaGallery,{items:s.photos||[],onAdd:files=>addMedia(s.id,files,"photos"),onRemove:id=>removeMedia(s.id,id,"photos"),label:"Adicionar fotos (antes/depois)"})
      ))
    ),
    // ─── DOCS TAB
    tab==="docs"&&h("div",null,(patient.sessions||[]).map(s=>h(Card,{key:s.id,style:{marginBottom:14}},
      h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:P.text,marginBottom:12}},`${s.date} · ${s.procedure} `,h("span",{style:{fontSize:12,color:P.text3,fontFamily:"'DM Sans',sans-serif"}},`${(s.docs||[]).length} doc(s)`)),
      h(MediaGallery,{items:s.docs||[],onAdd:files=>addMedia(s.id,files,"docs"),onRemove:id=>removeMedia(s.id,id,"docs"),docMode:true,label:"Termos, anamnese, receitas..."})
    ))),
    // ─── FINANCEIRO TAB
    tab==="financeiro"&&h("div",null,
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}},
        [{l:"Total Investido",v:fmtCurr(totalSpent),c:P.accent},{l:"Pago",v:fmtCurr((patient.sessions||[]).filter(s=>s.paid).reduce((a,s)=>a+s.value,0)),c:P.green},{l:"Pendente",v:fmtCurr((patient.sessions||[]).filter(s=>!s.paid).reduce((a,s)=>a+s.value,0)),c:P.yellow}].map(s=>h(Card,{key:s.l,style:{textAlign:"center"}},h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}},s.l),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:s.c}},s.v)))
      ),
      h(Card,null,h("table",{style:{width:"100%",borderCollapse:"collapse"}},
        h("thead",null,h("tr",null,["Data","Procedimento","Local","Pag.","Status","Valor"].map(hd=>h("th",{key:hd,style:{textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:P.text3,padding:"0 0 12px",borderBottom:`1px solid ${P.border}`}},hd)))),
        h("tbody",null,(patient.sessions||[]).map((s,i)=>h("tr",{key:i},
          h("td",{style:{padding:"11px 0",fontSize:13,color:P.text2,borderBottom:`1px solid rgba(71,35,37,.4)`}},s.date),
          h("td",{style:{padding:"11px 0",fontSize:13,color:P.text,borderBottom:`1px solid rgba(71,35,37,.4)`}},s.procedure),
          h("td",{style:{padding:"11px 0",fontSize:12,color:P.text3,borderBottom:`1px solid rgba(71,35,37,.4)`}},s.location||"—"),
          h("td",{style:{padding:"11px 0",fontSize:12,color:P.text2,borderBottom:`1px solid rgba(71,35,37,.4)`}},s.payMethod),
          h("td",{style:{padding:"11px 0",borderBottom:`1px solid rgba(71,35,37,.4)`}},
            h("select",{value:s.finStatus||"Pendente",onChange:e=>toggleFinStatus(s.id,e.target.value),style:{fontSize:11,padding:"3px 8px",borderRadius:10,color:s.finStatus==="Pago"?P.green:P.yellow,background:P.bg3,border:`1px solid ${P.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},FIN_STATUS.map(st=>h("option",{key:st,value:st},st)))
          ),
          h("td",{style:{padding:"11px 0",fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:s.paid?P.green:P.yellow,textAlign:"right",borderBottom:`1px solid rgba(71,35,37,.4)`}},fmtCurr(s.value))
        )))
      ))
    ),
    // ─── MODALS
    h(Modal,{open:showNewS,onClose:()=>{setShowNewS(false);setEditSess(null);},title:editSess?"✎ Editar Sessão":"✦ Nova Sessão",width:620},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Data",half:true},h(Inp,{type:"date",value:sForm.date,onChange:sfv("date")})),
        h(Field,{label:"Procedimento",half:true},h(Sel,{value:sForm.procedure,onChange:sfvProcedure,options:procedures})),
        h(Field,{label:"Produto"},h(Sel,{value:sForm.product,onChange:sfv("product"),options:products})),
        h(Field,{label:"Nº do Lote",half:true},h(Inp,{value:sForm.lote||"",onChange:sfv("lote"),placeholder:"Ex: LOT2025A"})),
        h(Field,{label:"Dose",half:true},h(Inp,{value:sForm.dose,onChange:sfv("dose"),placeholder:"Ex: 40U, 1ml"})),
        h(Field,{label:"Região",half:true},h(Inp,{value:sForm.region,onChange:sfv("region"),placeholder:"Ex: Glabela + Testa"})),
        (()=>{
          const rule=PROC_SAFETY[sForm.procedure];
          if(!rule||!sForm.procedure)return null;
          const recent=(patient.sessions||[]).filter(s=>s.procedure===sForm.procedure&&s.region&&sForm.region&&s.region.toLowerCase().includes(sForm.region.toLowerCase().split(" ")[0]));
          if(!recent.length)return null;
          const last=recent.sort((a,b)=>(new Date(b.date)-new Date(a.date)))[0];
          const lastDate=last.date?.includes("/")?new Date(last.date.split("/").reverse().join("-")):new Date(last.date);
          const daysSince=Math.floor((new Date()-lastDate)/864e5);
          if(daysSince<rule.days){
            return h("div",{style:{width:"100%",padding:"10px 14px",background:"rgba(192,112,112,.1)",border:"1px solid rgba(192,112,112,.35)",borderRadius:8,display:"flex",gap:10,alignItems:"flex-start"}},
              h("span",{style:{fontSize:16,flexShrink:0}},"⚠️"),
              h("div",null,
                h("div",{style:{fontSize:12,color:P.red,fontWeight:600}},`Intervalo de segurança: ${sForm.procedure}`),
                h("div",{style:{fontSize:11,color:P.text2,marginTop:2}},`Último procedimento nessa região foi há ${daysSince} dias. O recomendado é aguardar ${rule.days} dias (${rule.label}).`),
                h("div",{style:{fontSize:11,color:P.text3,marginTop:2}},`Sessão anterior: ${last.date}`)
              )
            );
          }
          return null;
        })(),
        h(Field,{label:"Local",half:true},h(Sel,{value:sForm.location,onChange:sfv("location"),options:locations})),
        h(Field,{label:"Valor (R$)",half:true},h(Inp,{value:sForm.value,onChange:sfv("value"),placeholder:"0,00"})),
        h(Field,{label:"Forma de Pagamento",half:true},h(Sel,{value:sForm.payMethod,onChange:sfv("payMethod"),options:PAY_METHODS})),
        h(Field,{label:"Status Financeiro",half:true},h(Sel,{value:sForm.finStatus,onChange:sfv("finStatus"),options:FIN_STATUS})),
        sForm.payMethod==="Cartão Crédito"&&h(Field,{label:"Parcelas",half:true},h(Sel,{value:sForm.parcelas,onChange:sfv("parcelas"),options:["1","2","3","4","5","6","7","8","9","10","11","12"]})),
        sForm.payMethod==="Cartão Crédito"&&Number(sForm.parcelas)>1&&Number(sForm.value)>0&&h("div",{style:{width:"100%",padding:"10px 14px",background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`,marginTop:-4}},
          h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}},"Parcelamento"),
          h("div",{style:{display:"flex",gap:20}},
            h("div",null,h("div",{style:{fontSize:10,color:P.text3}},"Valor por parcela"),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text}},fmtCurr(Number(sForm.value)/Number(sForm.parcelas)))),
            h("div",null,h("div",{style:{fontSize:10,color:P.text3}},"Total"),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.accent}},fmtCurr(Number(sForm.value))))
          )
        ),
        h(Field,{label:"Retorno Automático (dias)",half:true},
          h("div",null,
            h(Inp,{value:sForm.returnReminderDays,onChange:sfv("returnReminderDays"),placeholder:"14",type:"number"}),
            (()=>{const rule=(returnRules||[]).find(r=>r.procedure===sForm.procedure);return rule?h("div",{style:{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}},
              rule.revisionDays>0&&h("button",{onClick:()=>sfv("returnReminderDays")(String(rule.revisionDays)),style:{fontSize:10,padding:"3px 8px",borderRadius:12,background:Number(sForm.returnReminderDays)===rule.revisionDays?"rgba(92,31,50,.25)":"transparent",border:`1px solid ${Number(sForm.returnReminderDays)===rule.revisionDays?P.rose:P.border}`,color:Number(sForm.returnReminderDays)===rule.revisionDays?P.accent3:P.text3,cursor:"pointer"}},"✏ Revisão "+rule.revisionDays+"d"),
              rule.maintenanceDays>0&&h("button",{onClick:()=>sfv("returnReminderDays")(String(rule.maintenanceDays)),style:{fontSize:10,padding:"3px 8px",borderRadius:12,background:Number(sForm.returnReminderDays)===rule.maintenanceDays?"rgba(92,31,50,.25)":"transparent",border:`1px solid ${Number(sForm.returnReminderDays)===rule.maintenanceDays?P.rose:P.border}`,color:Number(sForm.returnReminderDays)===rule.maintenanceDays?P.accent3:P.text3,cursor:"pointer"}},"🔄 Manutenção "+rule.maintenanceDays+"d"),
              h("button",{onClick:()=>sfv("returnReminderDays")("0"),style:{fontSize:10,padding:"3px 8px",borderRadius:12,background:Number(sForm.returnReminderDays)===0?"rgba(192,112,112,.15)":"transparent",border:`1px solid ${Number(sForm.returnReminderDays)===0?"rgba(192,112,112,.4)":P.border}`,color:Number(sForm.returnReminderDays)===0?P.red:P.text3,cursor:"pointer"}},"✕ Sem retorno")
            ):null;})()
          )
        ),
        h(Field,{label:"Notas"},h(TA,{value:sForm.notes,onChange:sfv("notes"),placeholder:"Detalhes técnicos...",rows:3})),
        h(Field,{label:"Evolução"},h(TA,{value:sForm.evolution,onChange:sfv("evolution"),placeholder:"Próximos passos...",rows:2})),
        h(Field,{label:"Mapa de Aplicação"},
          h("button",{onClick:()=>sfv("useFaceMap")(!sForm.useFaceMap),style:{padding:"7px 16px",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",background:sForm.useFaceMap?P.rose:"transparent",border:`1px solid ${sForm.useFaceMap?P.rose:P.border}`,color:sForm.useFaceMap?P.accent3:P.text3,marginBottom:sForm.useFaceMap?14:0}},sForm.useFaceMap?"✓ Incluindo Mapa":"＋ Incluir Mapa"),
          sForm.useFaceMap&&h("div",{style:{paddingBottom:64}},h(FaceMapEditor,{sessionMap:sessionFaceMap,onChange:setSessionFaceMap}))
        )
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},h(Btn,{variant:"ghost",onClick:()=>{setShowNewS(false);setEditSess(null);}},"Cancelar"),h(Btn,{onClick:saveSession},editSess?"Salvar":"Salvar Sessão"))
    ),
    showIntercorr&&h(Modal,{open:true,onClose:()=>setShowIntercorr(null),title:"⚠ Registrar Intercorrência",width:480},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Tipo"},h(Sel,{value:icForm.type,onChange:v=>setIcForm(p=>({...p,type:v})),options:INTERCORRENCIA_TYPES})),
        h(Field,{label:"Data"},h(Inp,{type:"date",value:icForm.date,onChange:v=>setIcForm(p=>({...p,date:v}))})),
        h(Field,{label:"Descrição"},h(TA,{value:icForm.notes,onChange:v=>setIcForm(p=>({...p,notes:v})),placeholder:"Descreva a intercorrência...",rows:3})),
        h(Field,{label:"Conduta Realizada"},h(TA,{value:icForm.conduct,onChange:v=>setIcForm(p=>({...p,conduct:v})),placeholder:"O que foi feito...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},h(Btn,{variant:"ghost",onClick:()=>setShowIntercorr(null)},"Cancelar"),h(Btn,{onClick:()=>saveIntercorrencia(showIntercorr==="global"?(patient.sessions||[])[0]?.id:showIntercorr)},"Registrar"))
    ),
    showPlan&&h(Modal,{open:true,onClose:()=>setShowPlan(false),title:"🎯 Novo Planejamento Facial",width:480},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Título do Plano"},h(Inp,{value:planForm.title,onChange:v=>setPlanForm(p=>({...p,title:v})),placeholder:"Ex: Protocolo de Harmonização Completa"})),
        h(Field,{label:"Etapas (uma por linha)"},h(TA,{value:planForm.steps,onChange:v=>setPlanForm(p=>({...p,steps:v})),placeholder:"Toxina Botulínica\nPreenchimento Labial\nBioestimulador...",rows:5})),
        h(Field,{label:"Observações"},h(TA,{value:planForm.notes,onChange:v=>setPlanForm(p=>({...p,notes:v})),placeholder:"Metas, prazos, considerações...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},h(Btn,{variant:"ghost",onClick:()=>setShowPlan(false)},"Cancelar"),h(Btn,{onClick:addPlanejamento},"Criar Plano"))
    ),
    editPat&&h(Modal,{open:true,onClose:()=>setEditPat(false),title:"✎ Editar Dados da Paciente",width:620},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Nome"},h(Inp,{value:patForm.name,onChange:pfv("name")})),
        h(Field,{label:"Idade",third:true},h(Inp,{value:patForm.age,onChange:pfv("age")})),
        h(Field,{label:"Data Nasc.",third:true},h(Inp,{type:"date",value:patForm.birthDate,onChange:pfv("birthDate")})),
        h(Field,{label:"Status",third:true},h(Sel,{value:patForm.status,onChange:pfv("status"),options:Object.keys(PAT_STATUS_CFG)})),
        h(Field,{label:"Telefone",half:true},h(Inp,{value:patForm.phone,onChange:pfv("phone")})),
        h(Field,{label:"E-mail",half:true},h(Inp,{value:patForm.email,onChange:pfv("email")})),
        h(Field,{label:"Alergias"},h(Inp,{value:patForm.allergies,onChange:pfv("allergies")})),
        h(Field,{label:"Detalhes Alergias"},h(TA,{value:patForm.allergiesDetail||"",onChange:pfv("allergiesDetail"),rows:2})),
        h(Field,{label:"Contraindicações"},h(Inp,{value:patForm.contraindications||"",onChange:pfv("contraindications")})),
        h(Field,{label:"Alertas Importantes (separados por vírgula)"},h(Inp,{value:(patForm.importantAlerts||[]).join(", "),onChange:v=>pfv("importantAlerts")(v.split(",").map(s=>s.trim()).filter(Boolean))})),
        h(Field,{label:"Tipo de Pele",half:true},h(Sel,{value:patForm.skinType||"Normal",onChange:pfv("skinType"),options:SKIN_TYPES})),
        h(Field,{label:"Fitzpatrick",half:true},h(Sel,{value:patForm.fitzpatrick||"II",onChange:pfv("fitzpatrick"),options:FITZPATRICK})),
        h(Field,{label:"Histórico de Saúde"},h(TA,{value:patForm.healthHistory||"",onChange:pfv("healthHistory"),rows:2})),
        h(Field,{label:"Medicamentos"},h(Inp,{value:patForm.medications||"",onChange:pfv("medications")})),
        h(Field,{label:"Fumante",third:true},h(Sel,{value:patForm.smoking||"Não",onChange:pfv("smoking"),options:["Não","Sim","Ex-fumante"]})),
        h(Field,{label:"Gestante",third:true},h(Sel,{value:patForm.pregnancy||"Não",onChange:pfv("pregnancy"),options:["Não","Gestante","Lactante"]})),
        h(Field,{label:"🎵 Estilo Musical",third:true},h(Sel,{value:patForm.musicStyle||"Pop",onChange:pfv("musicStyle"),options:MUSIC_STYLES})),
        h(Field,{label:"Próx. Retorno"},h(Inp,{value:patForm.nextReturn||"",onChange:pfv("nextReturn"),placeholder:"DD/MM/AAAA"}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}},h(Btn,{variant:"ghost",onClick:()=>setEditPat(false)},"Cancelar"),h(Btn,{onClick:savePat},"Salvar Alterações"))
    )
  );
}
// ─── ESTOQUE ──────────────────────────────────────────────────────────────────
function Estoque({products,setProducts}){
  const[filter,setFilter]=useState("all");
  const[showNew,setShowNew]=useState(false);
  const[editItem,setEditItem]=useState(null);
  const blank={name:"",cat:"Toxina Botulínica",qty:"",min:"",unit:"un",expiry:"",cost:"",emoji:"💉"};
  const[form,setForm]=useState(blank);
  const fv=k=>v=>setForm(p=>({...p,[k]:v}));
  const h=createElement;
  const cats=["Toxina Botulínica","Ácido Hialurônico","Bioestimulador","Fios de PDO","Anestésico","Skinbooster","Outros"];
  const stCfg={critical:{color:P.red,bg:"rgba(192,112,112,.12)",l:"⚠ Crítico"},low:{color:P.yellow,bg:"rgba(196,169,106,.12)",l:"⚡ Baixo"},ok:{color:P.green,bg:"rgba(122,173,138,.12)",l:"✓ OK"}};
  const calc=(qty,min)=>qty===0?"critical":qty<min?"low":"ok";
  const visible=filter==="all"?products:products.filter(i=>i.status===filter);
  function save(){
    const qty=Number(form.qty),min=Number(form.min);
    if(editItem)setProducts(prev=>prev.map(i=>i.id===editItem.id?{...i,...form,qty,min,cost:Number(form.cost),status:calc(qty,min)}:i));
    else setProducts(prev=>[...prev,{id:Date.now(),...form,qty,min,cost:Number(form.cost),status:calc(qty,min)}]);
    setShowNew(false);setEditItem(null);setForm(blank);
  }
  function del(id){if(window.confirm("Excluir produto?"))setProducts(prev=>prev.filter(i=>i.id!==id));}
  function adj(id,d){setProducts(prev=>prev.map(i=>{if(i.id!==id)return i;const qty=Math.max(0,i.qty+d);return{...i,qty,status:calc(qty,i.min)};}));}
  function openEdit(item){setEditItem(item);setForm({...item,qty:String(item.qty),min:String(item.min),cost:String(item.cost)});setShowNew(true);}
  const critical=products.filter(i=>i.status==="critical").length;
  const totalVal=products.reduce((a,i)=>a+i.qty*i.cost,0);
  return h("div",null,
    h(SectionHeader,{title:"Estoque",sub:`${products.length} produtos · ${critical} críticos`,action:h(Btn,{onClick:()=>{setEditItem(null);setForm(blank);setShowNew(true);}},"＋ Entrada")}),
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}},
      [{l:"Nível Crítico",v:critical,c:P.red},{l:"Produtos",v:products.length,c:P.accent},{l:"Valor em Estoque",v:fmtCurr(totalVal),c:P.green}].map(k=>h(Card,{key:k.l,style:{textAlign:"center"}},h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}},k.l),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:k.c}},k.v)))
    ),
    h("div",{style:{display:"flex",gap:8,marginBottom:14}},[{k:"all",l:"Todos"},{k:"critical",l:"⚠ Crítico"},{k:"low",l:"⚡ Baixo"},{k:"ok",l:"✓ OK"}].map(f=>h("button",{key:f.k,onClick:()=>setFilter(f.k),style:{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:filter===f.k?P.rose:"transparent",border:`1px solid ${filter===f.k?P.rose:P.border}`,color:filter===f.k?P.accent3:P.text2}},f.l))),
    h(Card,null,h("table",{style:{width:"100%",borderCollapse:"collapse"}},
      h("thead",null,h("tr",null,["Produto","Cat.","Estoque","Mín.","Validade","Custo","Status","Ações"].map(hd=>h("th",{key:hd,style:{textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:P.text3,padding:"0 8px 12px 0",borderBottom:`1px solid ${P.border}`}},hd)))),
      h("tbody",null,visible.map(item=>{const sc=stCfg[item.status],pct=Math.min(100,(item.qty/Math.max(item.min*1.5,1))*100);return h("tr",{key:item.id},
        h("td",{style:{padding:"11px 8px 11px 0",borderBottom:`1px solid rgba(71,35,37,.4)`}},h("span",{style:{fontSize:16,marginRight:8}},item.emoji),h("span",{style:{fontSize:13,color:P.text,fontWeight:500}},item.name)),
        h("td",{style:{padding:"11px 8px 11px 0",fontSize:12,color:P.text3,borderBottom:`1px solid rgba(71,35,37,.4)`}},item.cat),
        h("td",{style:{padding:"11px 8px 11px 0",borderBottom:`1px solid rgba(71,35,37,.4)`}},h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:sc.color,lineHeight:1}},`${item.qty} `,h("span",{style:{fontSize:10,color:P.text3,fontFamily:"'DM Sans',sans-serif"}},item.unit)),h("div",{style:{height:3,borderRadius:2,background:P.bg3,width:50,marginTop:4,overflow:"hidden"}},h("div",{style:{height:"100%",width:`${pct}%`,background:sc.color,borderRadius:2}}))),
        h("td",{style:{padding:"11px 8px 11px 0",fontSize:12,color:P.text3,borderBottom:`1px solid rgba(71,35,37,.4)`}},`${item.min} ${item.unit}`),
        h("td",{style:{padding:"11px 8px 11px 0",fontSize:12,color:P.text2,borderBottom:`1px solid rgba(71,35,37,.4)`}},item.expiry),
        h("td",{style:{padding:"11px 8px 11px 0",fontSize:12,color:P.text2,borderBottom:`1px solid rgba(71,35,37,.4)`}},`R$${item.cost}`),
        h("td",{style:{padding:"11px 8px 11px 0",borderBottom:`1px solid rgba(71,35,37,.4)`}},h("span",{style:{fontSize:11,padding:"3px 8px",borderRadius:12,color:sc.color,background:sc.bg}},sc.l)),
        h("td",{style:{padding:"11px 0",borderBottom:`1px solid rgba(71,35,37,.4)`}},h("div",{style:{display:"flex",gap:4}},
          h("button",{onClick:(e)=>{e.stopPropagation();adj(item.id,-1);},style:{width:26,height:26,borderRadius:5,border:`1px solid ${P.border}`,background:P.bg3,color:P.red,cursor:"pointer",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}},"−"),
          h("input",{type:"number",value:item.qty,min:0,onChange:(e)=>{const v=parseInt(e.target.value)||0;setProducts(prev=>prev.map(i=>i.id===item.id?{...i,qty:v,status:calc(v,i.min)}:i));},style:{width:38,height:26,borderRadius:5,border:`1px solid ${P.border}`,background:P.bg3,color:P.accent3,fontSize:12,textAlign:"center",outline:"none",fontFamily:"'DM Sans',sans-serif"}}),
          h("button",{onClick:(e)=>{e.stopPropagation();adj(item.id,+1);},style:{width:26,height:26,borderRadius:5,border:`1px solid ${P.border}`,background:P.bg3,color:P.green,cursor:"pointer",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}},"＋"),
          h("button",{onClick:()=>openEdit(item),style:{width:23,height:23,borderRadius:5,border:`1px solid ${P.border}`,background:"transparent",color:P.accent,cursor:"pointer",fontSize:11}},"✎"),
          h("button",{onClick:()=>del(item.id),style:{width:23,height:23,borderRadius:5,border:"1px solid rgba(192,112,112,.2)",background:"transparent",color:P.red,cursor:"pointer",fontSize:11}},"🗑")
        ))
      );}))
    )),
    h(Modal,{open:showNew,onClose:()=>{setShowNew(false);setEditItem(null);},title:editItem?"✎ Editar Produto":"✦ Novo Produto",width:480},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Nome"},h(Inp,{value:form.name,onChange:fv("name"),placeholder:"Ex: Botox Allergan 100U"})),
        h(Field,{label:"Emoji",half:true},h(Inp,{value:form.emoji,onChange:fv("emoji"),placeholder:"💉"})),
        h(Field,{label:"Categoria",half:true},h(Sel,{value:form.cat,onChange:fv("cat"),options:cats})),
        h(Field,{label:"Unidade",half:true},h(Sel,{value:form.unit,onChange:fv("unit"),options:["un","sir","fr","amp","cx","pct","ml"]})),
        h(Field,{label:"Qtd. Atual",half:true},h(Inp,{value:form.qty,onChange:fv("qty"),placeholder:"0"})),
        h(Field,{label:"Qtd. Mínima",half:true},h(Inp,{value:form.min,onChange:fv("min"),placeholder:"5"})),
        h(Field,{label:"Validade",half:true},h(Inp,{value:form.expiry,onChange:fv("expiry"),placeholder:"MM/AAAA"})),
        h(Field,{label:"Custo Unit. (R$)",half:true},h(Inp,{value:form.cost,onChange:fv("cost"),placeholder:"0,00"}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}},h(Btn,{variant:"ghost",onClick:()=>{setShowNew(false);setEditItem(null);}},"Cancelar"),h(Btn,{onClick:save},editItem?"Salvar":"Adicionar"))
    )
  );
}
// ─── FINANCEIRO ───────────────────────────────────────────────────────────────
function Financeiro({patients,setPatients,expenses,setExpenses,incomes,setIncomes}){
  const[showNewExp,setShowNewExp]=useState(false);
  const[editExp,setEditExp]=useState(null);
  const[showNewInc,setShowNewInc]=useState(false);
  const[editInc,setEditInc]=useState(null);
  const[finTab,setFinTab]=useState("entradas");
  const blankExp={desc:"",date:"",cat:"Outros",value:"",status:"Pago",notes:"",parcelas:"",taxaMaq:""};
  const blankInc={desc:"",date:"",cat:"Sessão",value:"",payMethod:"Pix",status:"Pago",notes:"",parcelas:"1",taxaMaq:"",patientName:""};
  const[form,setForm]=useState(blankExp);
  const[incForm,setIncForm]=useState(blankInc);
  const fv=k=>v=>setForm(p=>({...p,[k]:v}));
  const ifv=k=>v=>setIncForm(p=>({...p,[k]:v}));
  const h=createElement;
  const allS=patients.flatMap((p,i)=>p.sessions.map(s=>({...s,pname:p.name,pi:i,pid:p.id})));
  const sessionsRec=allS.filter(s=>s.paid).reduce((a,s)=>a+s.value,0);
  const incomesRec=incomes.filter(i=>i.status==="Pago").reduce((a,i)=>a+Number(i.value||0),0);
  const received=sessionsRec+incomesRec;
  const pending=allS.filter(s=>!s.paid).reduce((a,s)=>a+s.value,0);
  const totalExp=expenses.reduce((a,e)=>a+Number(e.value||0),0);
  const months=[{m:"Jan",rec:38000,exp:14000},{m:"Fev",rec:41000,exp:13200},{m:"Mar",rec:44500,exp:15100},{m:"Abr",rec:42000,exp:14800},{m:"Mai",rec:received||48200,exp:totalExp}];
  function toggleFinStatus(pid,sid,newSt){setPatients(prev=>prev.map(p=>p.id!==pid?p:{...p,sessions:p.sessions.map(s=>s.id!==sid?s:{...s,finStatus:newSt,paid:newSt==="Pago"})}));}
  function saveExp(){
    if(editExp)setExpenses(prev=>prev.map(e=>e.id===editExp.id?{...e,...form,value:Number(form.value)||0}:e));
    else setExpenses(prev=>[...prev,{...form,id:Date.now(),value:Number(form.value)||0}]);
    setShowNewExp(false);setEditExp(null);setForm(blankExp);
  }
  function saveInc(){
    const tax=Number(incForm.taxaMaq)||0;
    const gross=Number(incForm.value)||0;
    const net=incForm.payMethod==="Cartão Crédito"?gross*(1-tax/100):gross;
    const entry={...incForm,id:Date.now(),value:gross,netValue:net,paid:incForm.status==="Pago"};
    if(editInc)setIncomes(prev=>prev.map(i=>i.id===editInc.id?entry:i));
    else setIncomes(prev=>[...prev,entry]);
    setShowNewInc(false);setEditInc(null);setIncForm(blankInc);
  }
  function delExp(id){if(window.confirm("Excluir despesa?"))setExpenses(prev=>prev.filter(e=>e.id!==id));}
  function delInc(id){if(window.confirm("Excluir entrada?"))setIncomes(prev=>prev.filter(i=>i.id!==id));}
  function openEditExp(e){setEditExp(e);setForm({...e,value:String(e.value)});setShowNewExp(true);}
  function openEditInc(i){setEditInc(i);setIncForm({...i,value:String(i.value)});setShowNewInc(true);}
  return h("div",null,
    h(SectionHeader,{title:"Fluxo de Caixa",sub:"Resumo financeiro completo"}),
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}},
      [{l:"Receita",v:fmtCurr(received||48200),c:P.accent},{l:"Despesas",v:fmtCurr(totalExp),c:P.red},{l:"Lucro Líquido",v:fmtCurr((received||48200)-totalExp),c:P.green},{l:"A Receber",v:fmtCurr(pending||6800),c:P.yellow}].map(k=>h(Card,{key:k.l,style:{textAlign:"center"}},h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}},k.l),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:k.c}},k.v)))
    ),
    h(Card,{style:{marginBottom:18}},
      h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:14}},"Receita vs Despesas"),
      h("div",{style:{display:"flex",alignItems:"flex-end",gap:12,height:90}},
        months.map(m=>{const mx=55000;return h("div",{key:m.m,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}},
          h("div",{style:{flex:1,display:"flex",alignItems:"flex-end",gap:3,width:"100%"}},
            h("div",{style:{flex:1,height:`${(m.rec/mx)*100}%`,background:`linear-gradient(to top,${P.rose},${P.gold})`,borderRadius:"3px 3px 0 0"}}),
            h("div",{style:{flex:1,height:`${(m.exp/mx)*100}%`,background:`linear-gradient(to top,${P.red},rgba(192,112,112,.3))`,borderRadius:"3px 3px 0 0"}})
          ),
          h("div",{style:{fontSize:9,color:m.m==="Mai"?P.accent:P.text3,textTransform:"uppercase"}},m.m)
        );})
      )
    ),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}},
      h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text}},"Entradas"),
          h(Btn,{onClick:()=>{setEditInc(null);setIncForm(blankInc);setShowNewInc(true);},style:{fontSize:12,padding:"6px 14px"}},"＋ Entrada Manual")
        ),
        h("div",{style:{fontSize:11,color:P.text3,marginBottom:8}},"Sessões de pacientes:"),
        allS.slice(0,5).map((s,i)=>h("div",{key:i,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${P.border}`}},
          h("div",null,h("div",{style:{fontSize:13,color:P.text}},`${s.pname} — ${s.procedure}`),h("div",{style:{fontSize:11,color:P.text3}},`${s.date} · ${s.payMethod}${s.payMethod==="Cartão Crédito"&&s.parcelas>1?" · "+s.parcelas+"x de "+fmtCurr(s.value/s.parcelas):""}`)  ),
          h("div",{style:{display:"flex",alignItems:"center",gap:8}},
            h("div",{style:{textAlign:"right"}},
              h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:s.paid?P.green:P.yellow}},fmtCurr(s.value)),
              s.payMethod==="Cartão Crédito"&&s.parcelas>1&&h("div",{style:{fontSize:10,color:P.accent,fontWeight:600}},`${s.parcelas}x ${fmtCurr(s.value/s.parcelas)}`)
            ),
            h("select",{value:s.finStatus||"Pendente",onChange:e=>toggleFinStatus(s.pid,s.id,e.target.value),style:{fontSize:10,padding:"3px 8px",borderRadius:10,color:s.paid?P.green:P.yellow,background:P.bg3,border:`1px solid ${P.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},FIN_STATUS.map(st=>h("option",{key:st,value:st},st)))
          )
        )),
        incomes.length>0&&h("div",null,
          h("div",{style:{fontSize:11,color:P.text3,margin:"10px 0 6px"}},"Entradas manuais:"),
          incomes.map((inc,i)=>h("div",{key:i,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${P.border}`}},
            h("div",null,h("div",{style:{fontSize:13,color:P.text}},inc.desc||inc.patientName||"Entrada"),h("div",{style:{fontSize:11,color:P.text3}},`${inc.date} · ${inc.payMethod}${inc.payMethod==="Cartão Crédito"&&inc.parcelas>1?" · "+inc.parcelas+"x":""}`)),
            h("div",{style:{display:"flex",alignItems:"center",gap:8}},
              h("div",null,
                h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:inc.status==="Pago"?P.green:P.yellow}},fmtCurr(inc.value)),
                inc.netValue&&inc.netValue!==inc.value&&h("div",{style:{fontSize:10,color:P.text3}},`Líq: ${fmtCurr(inc.netValue)}`)
              ),
              h("select",{value:inc.status,onChange:e=>setIncomes(prev=>prev.map(x=>x.id===inc.id?{...x,status:e.target.value,paid:e.target.value==="Pago"}:x)),style:{fontSize:10,padding:"3px 8px",borderRadius:10,color:inc.status==="Pago"?P.green:P.yellow,background:P.bg3,border:`1px solid ${P.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},FIN_STATUS.map(st=>h("option",{key:st,value:st},st))),
              h("button",{onClick:()=>openEditInc(inc),style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"✎"),
              h("button",{onClick:()=>delInc(inc.id),style:{fontSize:11,color:P.red,background:"transparent",border:"1px solid rgba(192,112,112,.2)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"🗑")
            )
          ))
        )
      ),
      h(Card,null,
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text}},"Despesas"),
          h(Btn,{onClick:()=>{setEditExp(null);setForm(blank);setShowNewExp(true);},style:{fontSize:12,padding:"6px 14px"}},"＋ Despesa")
        ),
        expenses.map((e,i)=>h("div",{key:i,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${P.border}`}},
          h("div",null,h("div",{style:{fontSize:13,color:P.text}},e.desc),h("div",{style:{fontSize:11,color:P.text3}},`${e.date} · ${e.cat}`)),
          h("div",{style:{display:"flex",alignItems:"center",gap:8}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.red}},`− ${fmtCurr(e.value)}`),
            h("button",{onClick:()=>openEditExp(e),style:{fontSize:11,color:P.accent,background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"✎"),
            h("button",{onClick:()=>delExp(e.id),style:{fontSize:11,color:P.red,background:"transparent",border:"1px solid rgba(192,112,112,.2)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}},"🗑")
          )
        )),
        h("div",{style:{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:`1px solid ${P.border}`}},h("span",{style:{fontSize:12,color:P.text3}},"Total Despesas"),h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:P.red}},`− ${fmtCurr(totalExp)}`))
      )
    ),
    h(Modal,{open:showNewInc,onClose:()=>{setShowNewInc(false);setEditInc(null);},title:editInc?"✎ Editar Entrada":"＋ Nova Entrada Manual",width:520},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Descrição"},h(Inp,{value:incForm.desc,onChange:ifv("desc"),placeholder:"Ex: Consultoria avulsa, Venda produto..."})),
        h(Field,{label:"Paciente (opcional)",half:true},h(Inp,{value:incForm.patientName,onChange:ifv("patientName"),placeholder:"Nome da paciente"})),
        h(Field,{label:"Data",half:true},h(Inp,{type:"date",value:incForm.date,onChange:ifv("date")})),
        h(Field,{label:"Categoria",half:true},h(Sel,{value:incForm.cat,onChange:ifv("cat"),options:["Sessão","Produto","Consultoria","Evento","Outro"]})),
        h(Field,{label:"Forma de Pagamento",half:true},h(Sel,{value:incForm.payMethod,onChange:ifv("payMethod"),options:PAY_METHODS})),
        h(Field,{label:"Valor Bruto (R$)",half:true},h(Inp,{value:incForm.value,onChange:ifv("value"),placeholder:"0,00"})),
        h(Field,{label:"Status",half:true},h(Sel,{value:incForm.status,onChange:ifv("status"),options:FIN_STATUS})),
        incForm.payMethod==="Cartão Crédito"&&h(Field,{label:"Parcelas",half:true},h(Sel,{value:incForm.parcelas,onChange:ifv("parcelas"),options:["1","2","3","4","5","6","7","8","9","10","11","12"]})),
        incForm.payMethod==="Cartão Crédito"&&h(Field,{label:"Taxa Maquininha (%)",half:true},h(Inp,{value:incForm.taxaMaq,onChange:ifv("taxaMaq"),placeholder:"Ex: 2.5"})),
        incForm.payMethod==="Cartão Crédito"&&Number(incForm.taxaMaq)>0&&Number(incForm.value)>0&&h("div",{style:{width:"100%",padding:"10px 14px",background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`}},
          h("div",{style:{fontSize:11,color:P.text3,marginBottom:6}},"Simulação de Recebimento:"),
          h("div",{style:{display:"flex",gap:20}},
            h("div",null,h("div",{style:{fontSize:10,color:P.text3}},"Valor por parcela"),h("div",{style:{fontSize:15,color:P.text}},fmtCurr(Number(incForm.value)/Number(incForm.parcelas||1)))),
            h("div",null,h("div",{style:{fontSize:10,color:P.text3}},"Taxa"),h("div",{style:{fontSize:15,color:P.red}},`${incForm.taxaMaq}%`)),
            h("div",null,h("div",{style:{fontSize:10,color:P.text3}},"Valor Líquido"),h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.green}},fmtCurr(Number(incForm.value)*(1-Number(incForm.taxaMaq)/100))))
          )
        ),
        h(Field,{label:"Observações"},h(TA,{value:incForm.notes,onChange:ifv("notes"),placeholder:"Notas...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}},h(Btn,{variant:"ghost",onClick:()=>{setShowNewInc(false);setEditInc(null);}},"Cancelar"),h(Btn,{onClick:saveInc},editInc?"Salvar":"Adicionar"))
    ),
    h(Modal,{open:showNewExp,onClose:()=>{setShowNewExp(false);setEditExp(null);},title:editExp?"✎ Editar Despesa":"＋ Nova Despesa",width:480},
      h("div",{style:{display:"flex",flexWrap:"wrap",gap:12}},
        h(Field,{label:"Descrição"},h(Inp,{value:form.desc,onChange:fv("desc"),placeholder:"Ex: Aluguel Barra Olímpica"})),
        h(Field,{label:"Data",half:true},h(Inp,{type:"date",value:form.date,onChange:fv("date")})),
        h(Field,{label:"Categoria",half:true},h(Sel,{value:form.cat,onChange:fv("cat"),options:EXPENSE_CATS})),
        h(Field,{label:"Valor (R$)",half:true},h(Inp,{value:form.value,onChange:fv("value"),placeholder:"0,00"})),
        h(Field,{label:"Status",half:true},h(Sel,{value:form.status,onChange:fv("status"),options:["Pago","Pendente","Cancelado"]})),
        h(Field,{label:"Observações"},h(TA,{value:form.notes,onChange:fv("notes"),placeholder:"Notas...",rows:2}))
      ),
      h("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}},h(Btn,{variant:"ghost",onClick:()=>{setShowNewExp(false);setEditExp(null);}},"Cancelar"),h(Btn,{onClick:saveExp},editExp?"Salvar":"Adicionar"))
    )
  );
}
// ─── DONUT CHART (componente externo — não pode ser definido dentro de render) ─
const CAT_MAP_GLOBAL={"Toxina Botulínica":"Toxina","Dysport":"Toxina","Xeomin":"Toxina","Preenchimento Labial":"Preenchimento","Preenchimento Malar":"Preenchimento","Preenchimento Mandíbula":"Preenchimento","Preenchimento Têmpora":"Preenchimento","Preenchimento Jowls":"Preenchimento","Preenchimento Marionete":"Preenchimento","Preenchimento Olheira":"Preenchimento","Preenchimento Bigode Chinês":"Preenchimento","Preenchimento Queixo":"Preenchimento","Preenchimento Facial":"Preenchimento","Bioestimulador de Colágeno":"Bioestimuladores","Sculptra":"Bioestimuladores","Fio de PDO":"Fios / Lifting","Microagulhamento":"Skincare","Nano Hidrox":"Skincare","PDRN":"Skincare","Profhilo":"Skincare","Peeling Químico":"Skincare","Exossomos":"Skincare","Skinbooster":"Skincare"};
const CAT_COLORS_GLOBAL={"Toxina":P.rose,"Preenchimento":"#7aaed4","Bioestimuladores":P.gold,"Fios / Lifting":"#9b7aad","Skincare":P.accent,"Outros":P.text3};
function DonutChart({catList,totalCat}){
  const h=createElement;
  if(!catList||!catList.length||!totalCat)return h("div",{style:{textAlign:"center",color:P.text3,fontSize:12,padding:20}},"Sem dados");
  const R=52,cx=70,cy=70,stroke=22,circ=2*Math.PI*R;
  let offset=0;
  const slices=catList.map(([cat,val])=>{const dash=(val/Math.max(totalCat,1))*circ;const el=h("circle",{key:cat,cx,cy,r:R,fill:"none",stroke:CAT_COLORS_GLOBAL[cat]||P.text3,strokeWidth:stroke,strokeDasharray:`${dash} ${circ-dash}`,strokeDashoffset:-offset,style:{transform:"rotate(-90deg)",transformOrigin:`${cx}px ${cy}px`}});offset+=dash;return el;});
  return h("svg",{width:140,height:140,viewBox:"0 0 140 140"},...slices,h("text",{x:cx,y:cy-6,textAnchor:"middle",fill:P.accent3,fontSize:13,fontWeight:600},catList.length),h("text",{x:cx,y:cy+10,textAnchor:"middle",fill:P.text3,fontSize:9},"categorias"));
}
// ─── ANIVERSARIANTES DO MÊS ───────────────────────────────────────────────────
function AniversariantesDoMes({patients,onSelectPatient,onNav}){
  const h=createElement;
  const today=new Date();
  const curM=today.getMonth(),curD=today.getDate();
  const bdays=patients.filter(p=>{if(!p.birthDate)return false;const bd=new Date(p.birthDate);return bd.getMonth()===curM;}).map(p=>{const bd=new Date(p.birthDate);const age=today.getFullYear()-bd.getFullYear();const day=bd.getDate();return{...p,_bday:day,_age:age,_isToday:day===curD,_isPast:day<curD};}).sort((a,b)=>a._bday-b._bday);
  if(!bdays.length)return null;
  return h(Card,{style:{marginBottom:22,border:`1px solid rgba(196,169,106,.3)`,background:"rgba(196,169,106,.04)"}},
    h("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14}},
      h("span",{style:{fontSize:20}},"🎂"),
      h("div",null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.yellow}},"Aniversariantes de "+MONTH_NAMES[curM]),
        h("div",{style:{fontSize:12,color:P.text3,marginTop:1}},`${bdays.length} paciente${bdays.length>1?"s":""}`)
      )
    ),
    h("div",{style:{display:"flex",flexDirection:"column",gap:6}},
      bdays.map(p=>{
        const phone=(p.phone||"").replace(/\D/g,"");
        const waMsg=encodeURIComponent(`Olá ${p.name.split(" ")[0]}! 🎂 Feliz aniversário! Que seu dia seja incrível! 🌸`);
        return h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:10,background:p._isToday?"rgba(196,169,106,.12)":P.bg3,border:`1px solid ${p._isToday?"rgba(196,169,106,.4)":P.border}`}},
          h("div",{style:{fontSize:18,minWidth:28,textAlign:"center"}},p._isToday?"🎉":p._isPast?"✓":"🗓"),
          h("div",{onClick:()=>{onSelectPatient(p);onNav("prontuario");},style:{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer"}},
            h(Avatar,{name:p.name,size:32,src:p.profilePhoto}),
            h("div",null,
              h("div",{style:{fontSize:13,color:p._isToday?P.yellow:P.text,fontWeight:p._isToday?600:400}},p.name+(p._isToday?" 🎂 Hoje!":"")),
              h("div",{style:{fontSize:11,color:P.text3}},`Dia ${p._bday} · ${p._age} anos`)
            )
          ),
          phone&&h("a",{href:`https://wa.me/55${phone}?text=${waMsg}`,target:"_blank",rel:"noreferrer",style:{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",background:"rgba(106,196,130,.13)",border:"1px solid rgba(106,196,130,.3)",borderRadius:8,color:"#7aad8a",fontSize:11,fontWeight:600,textDecoration:"none",flexShrink:0}},"💬 WhatsApp")
        );
      })
    )
  );
}
// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function Relatorios({patients,onSelectPatient,onNav}){
  const[hasError,setHasError]=useState(false);
  const now=new Date();
  const[selMonth,setSelMonth]=useState(now.getMonth());
  const[selYear,setSelYear]=useState(now.getFullYear());
  const[chartMode,setChartMode]=useState("receita");
  const[exportingPDF,setExportingPDF]=useState(false);
  const h=createElement;
  const safePats=Array.isArray(patients)?patients.filter(p=>p&&typeof p==="object"):[];
  const allS=safePats.flatMap(p=>(p.sessions||[]).map(s=>({...s,pname:p.name,pid:p.id})));
  const parseDMY2=s=>{if(!s)return null;try{const[d,m,y]=s.split("/");return new Date(`${y}-${m}-${d}`);}catch{return null;}};

  // ── mês selecionado ──
  const monthSessions=allS.filter(s=>{const d=parseDMY2(s.date);return d&&d.getMonth()===selMonth&&d.getFullYear()===selYear;});
  const monthRevenue=monthSessions.filter(s=>s.paid).reduce((a,s)=>a+s.value,0);

  // ── mapa de procedimentos ──
  const procMap={};
  monthSessions.forEach(s=>{
    if(!procMap[s.procedure])procMap[s.procedure]={count:0,total:0,paid:0,pending:0,patientsSet:new Set()};
    procMap[s.procedure].count++;
    procMap[s.procedure].total+=s.value;
    if(s.paid)procMap[s.procedure].paid+=s.value;
    else procMap[s.procedure].pending+=s.value;
    procMap[s.procedure].patientsSet.add(s.pname);
  });
  const procList=Object.entries(procMap).map(([k,v])=>[k,{...v,patientsCount:v.patientsSet?v.patientsSet.size:0,patientsSet:undefined}]).sort((a,b)=>b[1].total-a[1].total);
  const colors=[P.rose,P.gold,P.accent,"#7aaed4","#7aad8a","#9b7aad","#8a5c7a","#5a8a7a"];

  // ── donut: categorias ──
  const catMap={};
  monthSessions.filter(s=>s.paid).forEach(s=>{const cat=CAT_MAP_GLOBAL[s.procedure]||"Outros";if(!catMap[cat])catMap[cat]=0;catMap[cat]+=s.value;});
  const catList=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const totalCat=catList.reduce((a,[,v])=>a+v,0);

  // ── evolução 6 meses ──
  const last6=Array.from({length:6},(_,i)=>{const d=new Date(selYear,selMonth-5+i,1);return{m:d.getMonth(),y:d.getFullYear(),label:MONTH_NAMES[d.getMonth()].slice(0,3)};});
  const monthlyData=last6.map(({m,y,label})=>{
    const ss=allS.filter(s=>{const d=parseDMY2(s.date);return d&&d.getMonth()===m&&d.getFullYear()===y;});
    return{label,rec:ss.filter(s=>s.paid).reduce((a,s)=>a+s.value,0),count:ss.length};
  });
  const maxRec=Math.max(...monthlyData.map(d=>d.rec),1);
  const maxCount=Math.max(...monthlyData.map(d=>d.count),1);

  // ── índice de fidelização ──
  const totalPatsWithSessions=safePats.filter(p=>(p.sessions||[]).length>0).length;
  const returnedOnTime=safePats.filter(p=>{
    const s=[...(p.sessions||[])].sort((a,b)=>(parseDMY2(b.date)||0)-(parseDMY2(a.date)||0));
    if(s.length<2)return false;
    const last=s[0],prev=s[1];
    const d1=parseDMY2(prev.date),d2=parseDMY2(last.date);
    if(!d1||!d2)return false;
    const diff=daysBetween(d1,d2);
    const rule=Number(prev.returnReminderDays)||90;
    return diff<=rule*1.2;
  }).length;
  const fidPct=totalPatsWithSessions>0?Math.round((returnedOnTime/totalPatsWithSessions)*100):0;

  // ── forecast próximo mês ──
  const nextM=(selMonth+1)%12;
  const nextY=selMonth===11?selYear+1:selYear;
  const avgLast3=Math.round([0,1,2].map(i=>{const m=(selMonth-i+12)%12,y=selMonth-i<0?selYear-1:selYear;return allS.filter(s=>{const d=parseDMY2(s.date);return d&&d.getMonth()===m&&d.getFullYear()===y&&s.paid;}).reduce((a,s)=>a+s.value,0);}).reduce((a,v)=>a+v,0)/3);
  const forecastRev=Math.round(avgLast3*1.05);

  // ── top combos ──
  const combos={};
  safePats.forEach(p=>{
    const ss=p.sessions||[];
    ss.forEach((a,i)=>ss.slice(i+1).forEach(b=>{
      if(Math.abs((parseDMY2(a.date)||0)-(parseDMY2(b.date)||0))<7*24*3600*1000){
        const key=[a.procedure,b.procedure].sort().join(" + ");
        combos[key]=(combos[key]||0)+1;
      }
    }));
  });
  const comboList=Object.entries(combos).sort((a,b)=>b[1]-a[1]).slice(0,5);

  function prevMonth(){if(selMonth===0){setSelMonth(11);setSelYear(y=>y-1);}else setSelMonth(m=>m-1);}
  function nextMonth(){if(selMonth===11){setSelMonth(0);setSelYear(y=>y+1);}else setSelMonth(m=>m+1);}

  const maxBarVal=procList.length===0?1:chartMode==="receita"?Math.max(...procList.map(([,d])=>d.total),1):Math.max(...procList.map(([,d])=>d.count),1);

  if(hasError)return h("div",{style:{padding:40,textAlign:"center",color:P.text3}},
    h("div",{style:{fontSize:32,marginBottom:16}},"📊"),
    h("div",{style:{fontSize:16,color:P.text,marginBottom:8}},"Erro ao carregar relatórios"),
    h("div",{style:{fontSize:13,marginBottom:20}},"Isso pode acontecer quando ainda não há sessões registradas."),
    h("button",{onClick:()=>setHasError(false),style:{padding:"8px 20px",background:P.rose,border:"none",borderRadius:8,color:P.accent3,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}},"Tentar novamente")
  );
  return h("div",null,
    h(SectionHeader,{title:"Relatórios",sub:"Análise completa da clínica",
      action:h("button",{
        onClick:()=>{setExportingPDF(true);setTimeout(()=>{window.print();setExportingPDF(false);},200);},
        style:{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:`linear-gradient(135deg,${P.rose},${P.gold})`,color:P.accent3,border:"none"}
      },exportingPDF?"Preparando...":"📄 Exportar PDF")
    }),
    h(AniversariantesDoMes,{patients:safePats,onSelectPatient,onNav}),

    // ── KPIs ──
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}},
      [
        {l:"Total Sessões",v:allS.length,c:P.gold},
        {l:"Procedimentos",v:[...new Set(allS.map(s=>s.procedure))].length,c:"#7aaed4"},
        {l:"Fidelização",v:`${fidPct}%`,c:P.green},
        {l:`Forecast ${MONTH_NAMES[nextM].slice(0,3)}`,v:fmtCurr(forecastRev),c:P.accent},
      ].map(k=>h(Card,{key:k.l,style:{textAlign:"center"}},
        h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}},k.l),
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:k.c}},k.v)
      ))
    ),

    // ── Bloco principal: barras + donut ──
    h(Card,{style:{marginBottom:22,border:`1px solid rgba(92,31,50,.35)`}},
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}},
        h("div",null,
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},"Procedimentos Realizados"),
          h("div",{style:{fontSize:13,color:P.text3,marginTop:2}},"Volume e receita por procedimento")
        ),
        h("div",{style:{display:"flex",alignItems:"center",gap:10}},
          h("button",{onClick:prevMonth,style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:28,height:28,color:P.text2,cursor:"pointer",fontSize:14}},"‹"),
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.accent3,minWidth:160,textAlign:"center"}},`${MONTH_NAMES[selMonth]} ${selYear}`),
          h("button",{onClick:nextMonth,style:{background:"transparent",border:`1px solid ${P.border}`,borderRadius:6,width:28,height:28,color:P.text2,cursor:"pointer",fontSize:14}},"›")
        ),
        h("div",{style:{display:"flex",gap:6}},
          ["receita","volume"].map(m=>h("button",{key:m,onClick:()=>setChartMode(m),style:{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",border:`1px solid ${P.border}`,background:chartMode===m?P.rose:"transparent",color:chartMode===m?P.accent3:P.text2}},m==="receita"?"💰 Receita":"📊 Volume"))
        )
      ),

      procList.length===0
        ? h("div",{style:{textAlign:"center",padding:30,color:P.text3,fontSize:13}},"Nenhum procedimento registrado neste mês.")
        : h("div",{style:{display:"grid",gridTemplateColumns:"1fr 180px",gap:24,alignItems:"start"}},

            // barras horizontais
            h("div",null,
              procList.map(([proc,data],i)=>{
                const val=chartMode==="receita"?data.total:data.count;
                const pct=Math.round((val/maxBarVal)*100);
                const ticketMedio=data.count>0?Math.round(data.total/data.count):0;
                return h("div",{key:proc,style:{marginBottom:14}},
                  h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}},
                    h("div",{style:{display:"flex",alignItems:"center",gap:8}},
                      h("span",{style:{display:"inline-block",width:10,height:10,borderRadius:2,background:colors[i%colors.length],flexShrink:0}}),
                      h("span",{style:{fontSize:13,color:P.text,fontWeight:500}},proc)
                    ),
                    h("div",{style:{display:"flex",alignItems:"center",gap:16,flexShrink:0}},
                      h("span",{style:{fontSize:11,color:P.text3}},`${data.count}x · ticket médio ${fmtCurr(ticketMedio)}`),
                      h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:colors[i%colors.length]}},chartMode==="receita"?fmtCurr(data.total):data.count)
                    )
                  ),
                  h("div",{style:{height:8,borderRadius:4,background:P.bg3,overflow:"hidden"}},
                    h("div",{style:{height:"100%",width:`${pct}%`,background:colors[i%colors.length],borderRadius:4,transition:"width .4s ease"}})
                  ),
                  h("div",{style:{display:"flex",gap:12,marginTop:4}},
                    h("span",{style:{fontSize:10,color:P.green}},`✓ pago ${fmtCurr(data.paid)}`),
                    data.pending>0&&h("span",{style:{fontSize:10,color:P.yellow}},`⏳ pendente ${fmtCurr(data.pending)}`)
                  )
                );
              })
            ),

            // donut
            h("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:12}},
              h("div",{style:{fontSize:12,color:P.text3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}},"Receita por Categoria"),
              h(DonutChart,{catList,totalCat}),
              h("div",{style:{width:"100%"}},
                catList.map(([cat,val])=>h("div",{key:cat,style:{display:"flex",alignItems:"center",gap:6,marginBottom:5}},
                  h("span",{style:{width:8,height:8,borderRadius:2,background:CAT_COLORS_GLOBAL[cat]||P.text3,flexShrink:0,display:"inline-block"}}),
                  h("span",{style:{fontSize:11,color:P.text2,flex:1}},cat),
                  h("span",{style:{fontSize:11,color:P.text3}},`${Math.round((val/totalCat)*100)}%`)
                ))
              )
            )
          ),

      // sumário rodapé
      monthSessions.length>0&&h("div",{style:{marginTop:18,padding:"12px 16px",background:P.bg3,borderRadius:10,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}},
        [{l:"Total Sessões",v:monthSessions.length},{l:"Pagas",v:monthSessions.filter(s=>s.paid).length},{l:"Pendentes",v:monthSessions.filter(s=>!s.paid).length},{l:"Ticket Médio",v:fmtCurr(monthRevenue/Math.max(monthSessions.filter(s=>s.paid).length,1))},{l:"Receita",v:fmtCurr(monthRevenue)}]
          .map(k=>h("div",{key:k.l,style:{textAlign:"center"}},
            h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}},k.l),
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.accent3}},k.v)
          ))
      )
    ),

    // ── Evolução 6 meses ──
    h(Card,{style:{marginBottom:22}},
      h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:16}},"Evolução dos Últimos 6 Meses"),
      h("div",{style:{display:"flex",alignItems:"flex-end",gap:10,height:110,marginBottom:8}},
        monthlyData.map((m,i)=>{
          const isSelected=m.label===MONTH_NAMES[selMonth].slice(0,3)&&i===5;
          const hPct=maxRec>0?Math.round((m.rec/maxRec)*90):0;
          return h("div",{key:i,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}},
            h("div",{style:{fontSize:10,color:P.text3,marginBottom:2}},m.rec>0?fmtCurr(m.rec):"—"),
            h("div",{style:{width:"100%",display:"flex",alignItems:"flex-end",gap:2,height:80}},
              h("div",{style:{flex:1,height:`${hPct||4}%`,background:isSelected?`linear-gradient(to top,${P.rose},${P.gold})`:`linear-gradient(to top,${P.rose2},rgba(92,31,50,.3))`,borderRadius:"3px 3px 0 0",transition:"height .4s ease"}}),
            ),
            h("div",{style:{fontSize:10,color:isSelected?P.accent:P.text3,fontWeight:isSelected?600:400}},m.label)
          );
        })
      ),
      h("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4}},
        h("div",{style:{width:10,height:3,borderRadius:2,background:`linear-gradient(to right,${P.rose},${P.gold})`}}),
        h("span",{style:{fontSize:11,color:P.text3}},"Mês selecionado destacado · Barras = receita recebida")
      )
    ),

    // ── Forecast + Fidelização + Combos ──
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18,marginBottom:22}},

      // forecast
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:4}},"Forecast"),
        h("div",{style:{fontSize:12,color:P.text3,marginBottom:14}},`Projeção para ${MONTH_NAMES[nextM]} ${nextY}`),
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:P.green,marginBottom:6}},fmtCurr(forecastRev)),
        h("div",{style:{fontSize:11,color:P.text3,marginBottom:14}},"Média dos últimos 3 meses + 5%"),
        h("div",{style:{height:4,borderRadius:2,background:P.bg3,overflow:"hidden",marginBottom:8}},
          h("div",{style:{height:"100%",width:"72%",background:P.green,borderRadius:2}})
        ),
        h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:P.text3}},
          h("span",null,"Base"),h("span",{style:{color:P.green}},"Meta +5%")
        )
      ),

      // fidelização
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:4}},"Fidelização"),
        h("div",{style:{fontSize:12,color:P.text3,marginBottom:14}},"Retorno dentro do prazo recomendado"),
        h("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:42,color:fidPct>=70?P.green:fidPct>=50?P.yellow:P.red}},`${fidPct}%`),
          h("div",{style:{fontSize:12,color:P.text3}},`${returnedOnTime} de ${totalPatsWithSessions} pacientes`)
        ),
        h("div",{style:{height:6,borderRadius:3,background:P.bg3,overflow:"hidden",marginBottom:8}},
          h("div",{style:{height:"100%",width:`${fidPct}%`,background:fidPct>=70?P.green:fidPct>=50?P.yellow:P.red,borderRadius:3,transition:"width .4s ease"}})
        ),
        h("div",{style:{fontSize:11,color:P.text3}},fidPct>=70?"✦ Ótima retenção":fidPct>=50?"⚡ Retenção moderada":"⚠ Retenção baixa — reveja retornos")
      ),

      // top combos
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:4}},"Top Combos"),
        h("div",{style:{fontSize:12,color:P.text3,marginBottom:14}},"Procedimentos mais feitos juntos"),
        comboList.length===0
          ? h("div",{style:{fontSize:12,color:P.text3,textAlign:"center",padding:"16px 0"}},"Dados insuficientes")
          : comboList.map(([combo,count],i)=>h("div",{key:combo,style:{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<comboList.length-1?`1px solid ${P.border}`:"none"}},
              h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:colors[i%colors.length],minWidth:22,textAlign:"center"}},`${i+1}°`),
              h("span",{style:{fontSize:12,color:P.text,flex:1,lineHeight:1.3}},combo),
              h("span",{style:{fontSize:11,color:P.text3,flexShrink:0}},`${count}x`)
            ))
      )
    ),

    // ── Receita por Local ──
    h(Card,{style:{marginBottom:22}},
      h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:16}},"📍 Receita por Local de Atendimento"),
      (()=>{
        const locMap={};
        allS.filter(s=>s.paid&&s.location).forEach(s=>{if(!locMap[s.location])locMap[s.location]={total:0,count:0};locMap[s.location].total+=s.value;locMap[s.location].count++;});
        const locList=Object.entries(locMap).sort((a,b)=>b[1].total-a[1].total);
        const locMax=Math.max(...locList.map(([,d])=>d.total),1);
        const locColors=[P.rose,P.gold,"#7aaed4","#7aad8a","#9b7aad"];
        if(!locList.length)return h("div",{style:{textAlign:"center",color:P.text3,fontSize:13,padding:20}},"Nenhuma sessão registrada ainda.");
        return h("div",{style:{display:"flex",flexDirection:"column",gap:14}},
          locList.map(([loc,data],i)=>{
            const pct=Math.round((data.total/locMax)*100);
            const totalAll=locList.reduce((a,[,d])=>a+d.total,0);
            const share=totalAll>0?Math.round((data.total/totalAll)*100):0;
            return h("div",{key:loc},
              h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
                h("div",{style:{display:"flex",alignItems:"center",gap:8}},
                  h("span",{style:{display:"inline-block",width:12,height:12,borderRadius:3,background:locColors[i%locColors.length]}}),
                  h("span",{style:{fontSize:14,color:P.text,fontWeight:500}},loc)
                ),
                h("div",{style:{display:"flex",alignItems:"center",gap:16}},
                  h("span",{style:{fontSize:11,color:P.text3}},`${data.count} sessões`),
                  h("span",{style:{fontSize:11,color:P.text3}},`${share}% da receita`),
                  h("span",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:locColors[i%locColors.length]}},fmtCurr(data.total))
                )
              ),
              h("div",{style:{height:10,borderRadius:5,background:P.bg3,overflow:"hidden"}},
                h("div",{style:{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${locColors[i%locColors.length]},${locColors[i%locColors.length]}99)`,borderRadius:5,transition:"width .5s ease"}})
              )
            );
          })
        );
      })()
    ),

    // ── Ranking + Formas de pagamento ──
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}},
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:14}},"Ranking de Pacientes"),
        [...safePats].sort((a,b)=>(b.sessions||[]).reduce((s,x)=>s+x.value,0)-(a.sessions||[]).reduce((s,x)=>s+x.value,0)).slice(0,5).map((p,i)=>h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${P.border}`}},
          h("div",{style:{fontSize:16,color:P.accent,fontFamily:"'Cormorant Garamond',serif",minWidth:22}},`${i+1}°`),
          h(Avatar,{name:p.name,size:30,idx:i,src:p.profilePhoto}),
          h("div",{style:{flex:1}},h("div",{style:{fontSize:13,color:P.text}},p.name),h("div",{style:{fontSize:11,color:P.text3}},`${(p.sessions||[]).length} sessões`)),
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.green}},fmtCurr((p.sessions||[]).reduce((a,s)=>a+s.value,0)))
        ))
      ),
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text,marginBottom:14}},"Formas de Pagamento"),
        (()=>{
          const pmMap={};
          allS.filter(s=>s.paid).forEach(s=>{const pm=s.payMethod||"Outro";pmMap[pm]=(pmMap[pm]||0)+s.value;});
          const pmTotal=Object.values(pmMap).reduce((a,v)=>a+v,0)||1;
          const pmIcons={"Pix":"💚","Cartão Crédito":"💳","Cartão Débito":"💳","Dinheiro":"💵","Transferência":"🏦","Pendente":"⏳"};
          const pmColors={"Pix":P.green,"Cartão Crédito":"#7aaed4","Cartão Débito":"#5a8aad","Dinheiro":P.accent,"Transferência":P.rose2,"Pendente":P.yellow};
          return Object.entries(pmMap).sort((a,b)=>b[1]-a[1]).map(([pm,val])=>{
            const pct=Math.round((val/pmTotal)*100);
            return h("div",{key:pm,style:{marginBottom:12}},
              h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,color:P.text2,marginBottom:5}},
                h("span",null,`${pmIcons[pm]||"💰"} ${pm}`),
                h("span",{style:{color:pmColors[pm]||P.accent}},`${pct}%`)
              ),
              h("div",{style:{height:4,borderRadius:2,background:P.bg3,overflow:"hidden"}},
                h("div",{style:{height:"100%",width:`${pct}%`,background:pmColors[pm]||P.accent,borderRadius:2,transition:"width .4s ease"}})
              )
            );
          });
        })()
      )
    )
  );
}
// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
// ─── MENSAGENS WHATSAPP ───────────────────────────────────────────────────────
const DEFAULT_WA_MSGS=[
  {id:"confirm",icon:"✅",label:"Confirmação de Consulta",text:"Olá [nome]! 😊 Confirmando sua consulta amanhã às [hora] para [procedimento]. Confirme com SIM ou nos avise se precisar remarcar. 🌸"},
  {id:"pos",icon:"💆",label:"Pós-Procedimento",text:"Olá [nome]! Como você está se sentindo após o procedimento de hoje? Lembre-se: [cuidados]. Qualquer dúvida estou à disposição! 🌸"},
  {id:"retorno",icon:"🗓",label:"Lembrete de Retorno",text:"Olá [nome]! Passando para lembrar que está na hora do seu retorno! Vamos agendar? 😊"},
  {id:"aniversario",icon:"🎂",label:"Aniversário",text:"Olá [nome]! 🎂 Feliz aniversário! Que seu dia seja incrível e cheio de alegria! Com carinho, HarmonizaPro 🌸"},
  {id:"orcamento",icon:"💰",label:"Orçamento",text:"Olá [nome]! Segue o orçamento que conversamos: [procedimento] por R$[valor]. Qualquer dúvida estou à disposição! 😊"},
  {id:"faltou",icon:"📅",label:"Paciente Faltou",text:"Olá [nome]! Sentimos sua falta hoje. Quando puder, entre em contato para remarcarmos sua consulta. 🌸"},
];
function MensagensWhatsApp({patients}){
  const h=createElement;
  const[msgs,setMsgs]=useLocalStorage("hp_wa_msgs",DEFAULT_WA_MSGS);
  const[selMsg,setSelMsg]=useState(null);
  const[selPat,setSelPat]=useState(null);
  const[editingId,setEditingId]=useState(null);
  const[editText,setEditText]=useState("");
  const[patSearch,setPatSearch]=useState("");
  const safePats=Array.isArray(patients)?patients:[];

  function applyVars(text,pat,appt){
    if(!pat)return text;
    return text
      .replace(/\[nome\]/g,pat.name.split(" ")[0])
      .replace(/\[procedimento\]/g,pat.sessions&&pat.sessions.length>0?pat.sessions[0].procedure:"procedimento")
      .replace(/\[hora\]/g,"09:00")
      .replace(/\[valor\]/g,"")
      .replace(/\[cuidados\]/g,"não massagear a área, evitar calor e atividade física nas primeiras 24h");
  }

  const filteredPats=safePats.filter(p=>!patSearch||p.name.toLowerCase().includes(patSearch.toLowerCase()));

  return h("div",null,
    h(SectionHeader,{title:"Mensagens WhatsApp",sub:"Modelos prontos e editáveis"}),
    h("div",{style:{display:"grid",gridTemplateColumns:"320px 1fr",gap:18}},
      // Lista de modelos
      h("div",null,
        h(Card,{style:{marginBottom:14}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:P.text}},"📋 Modelos"),
            h("button",{onClick:()=>{const id="custom_"+Date.now();const nova={id,icon:"✨",label:"Nova Mensagem",text:"Olá [nome]! "};setMsgs(prev=>[...prev,nova]);setSelMsg(nova);setEditingId(id);setEditText(nova.text);},style:{fontSize:11,padding:"5px 12px",background:P.rose,border:"none",borderRadius:8,color:P.accent3,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}},"＋ Nova")
          ),
          msgs.map(m=>h("div",{key:m.id,onClick:()=>{setSelMsg(m);setEditingId(null);},style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,cursor:"pointer",marginBottom:6,background:selMsg?.id===m.id?P.rose:P.bg3,border:`1px solid ${selMsg?.id===m.id?P.rose:P.border}`,transition:"all .12s"}},
            h("span",{style:{fontSize:18}},m.icon),
            h("div",{style:{flex:1,minWidth:0}},
              h("div",{style:{fontSize:13,color:selMsg?.id===m.id?P.accent3:P.text,fontWeight:500}},m.label),
              h("div",{style:{fontSize:11,color:P.text3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},m.text.slice(0,50)+"...")
            ),
            !DEFAULT_WA_MSGS.find(d=>d.id===m.id)&&h("button",{onClick:e=>{e.stopPropagation();setMsgs(prev=>prev.filter(x=>x.id!==m.id));if(selMsg?.id===m.id)setSelMsg(null);},style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:14,flexShrink:0,padding:2}},"×")
          ))
        )
      ),
      // Painel direito
      h("div",null,
        selMsg?h(Card,null,
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text}},selMsg.icon+" "+selMsg.label),
            h("div",{style:{display:"flex",gap:8}},
              editingId===selMsg.id
                ?h(Btn,{onClick:()=>{setMsgs(prev=>prev.map(m=>m.id===selMsg.id?{...m,text:editText}:m));setSelMsg({...selMsg,text:editText});setEditingId(null);}},null,"💾 Salvar")
                :h(Btn,{variant:"ghost",onClick:()=>{setEditingId(selMsg.id);setEditText(selMsg.text);}},null,"✎ Editar"),
              h(Btn,{variant:"ghost",onClick:()=>setMsgs(DEFAULT_WA_MSGS)},null,"↺ Restaurar padrões")
            )
          ),
          // Edição ou preview
          editingId===selMsg.id
            ?h("div",{style:{marginBottom:16}},
              h("div",{style:{display:"flex",gap:10,marginBottom:10}},
                h("div",{style:{flex:1}},
                  h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}},"Nome do modelo"),
                  h("input",{value:selMsg.label,onChange:e=>{const updated={...selMsg,label:e.target.value};setSelMsg(updated);setMsgs(prev=>prev.map(m=>m.id===selMsg.id?updated:m));},style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",color:P.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}})
                ),
                h("div",{style:{width:70}},
                  h("div",{style:{fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}},"Emoji"),
                  h("input",{value:selMsg.icon,onChange:e=>{const updated={...selMsg,icon:e.target.value};setSelMsg(updated);setMsgs(prev=>prev.map(m=>m.id===selMsg.id?updated:m));},style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 10px",color:P.text,fontSize:18,fontFamily:"'DM Sans',sans-serif",outline:"none",textAlign:"center",boxSizing:"border-box"}})
                )
              ),
              h("div",{style:{fontSize:11,color:P.text3,marginBottom:6}},"Variáveis disponíveis: [nome] [procedimento] [hora] [valor] [cuidados]"),
              h("textarea",{value:editText,onChange:e=>setEditText(e.target.value),rows:5,style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"10px 12px",color:P.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box"}})
            )
            :h("div",{style:{background:P.bg3,borderRadius:10,padding:"14px 16px",marginBottom:16,fontSize:13,color:P.text2,lineHeight:1.7}},selMsg.text),
          h("div",{style:{borderTop:`1px solid ${P.border}`,paddingTop:16}},
            h("div",{style:{fontSize:12,color:P.text3,marginBottom:10,textTransform:"uppercase",letterSpacing:".08em",fontWeight:600}},"Enviar para paciente"),
            h("input",{value:patSearch,onChange:e=>setPatSearch(e.target.value),placeholder:"Buscar paciente pelo nome...",style:{width:"100%",background:P.bg3,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",color:P.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:10,boxSizing:"border-box"}}),
            h("div",{style:{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}},
              filteredPats.map(p=>{
                const phone=(p.phone||"").replace(/\D/g,"");
                const finalMsg=applyVars(editingId===selMsg.id?editText:selMsg.text,p,null);
                const waLink=`https://wa.me/55${phone}?text=${encodeURIComponent(finalMsg)}`;
                return phone?h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`}},
                  h(Avatar,{name:p.name,size:28,src:p.profilePhoto}),
                  h("div",{style:{flex:1,fontSize:13,color:P.text}},p.name),
                  h("a",{href:waLink,target:"_blank",rel:"noreferrer",style:{fontSize:11,padding:"5px 12px",background:"rgba(106,196,130,.15)",border:"1px solid rgba(106,196,130,.35)",borderRadius:8,color:"#7aad8a",textDecoration:"none",fontWeight:600,flexShrink:0}},"💬 Enviar")
                ):null;
              })
            )
          )
        ):h(Card,{style:{textAlign:"center",padding:40}},
          h("div",{style:{fontSize:32,marginBottom:12}},"💬"),
          h("div",{style:{color:P.text3,fontSize:14}},"Selecione um modelo à esquerda para visualizar e enviar")
        )
      )
    )
  );
}

function Configuracoes({procedures,setProcedures,locations,setLocations,products,setProducts,settings,setSettings,returnRules,setReturnRules}){
  const[newProc,setNewProc]=useState("");
  const[newLoc,setNewLoc]=useState("");
  const[editProc,setEditProc]=useState(null);
  const[editProcVal,setEditProcVal]=useState("");
  const[editRule,setEditRule]=useState(null); // {id, revisionDays, maintenanceDays}
  const h=createElement;
  function addProc(){if(newProc.trim()&&!procedures.includes(newProc.trim())){setProcedures(prev=>[...prev,newProc.trim()]);setNewProc("");}}
  function delProc(p){if(window.confirm('Excluir: '+p))setProcedures(prev=>prev.filter(x=>x!==p));}
  function saveEditProc(){if(editProcVal.trim())setProcedures(prev=>prev.map(p=>p===editProc?editProcVal.trim():p));setEditProc(null);}
  function addLoc(){if(newLoc.trim()&&!locations.includes(newLoc.trim())){setLocations(prev=>[...prev,newLoc.trim()]);setNewLoc("");}}
  function delLoc(l){if(window.confirm('Excluir: '+l))setLocations(prev=>prev.filter(x=>x!==l));}
  // Return rules helpers
  function getRuleForProc(proc){return (returnRules||[]).find(r=>r.procedure===proc);}
  function saveRule(proc,revisionDays,maintenanceDays){
    const existing=getRuleForProc(proc);
    if(existing){setReturnRules(prev=>prev.map(r=>r.procedure===proc?{...r,revisionDays:Number(revisionDays),maintenanceDays:Number(maintenanceDays)}:r));}
    else{setReturnRules(prev=>[...prev,{id:Date.now(),procedure:proc,revisionDays:Number(revisionDays),maintenanceDays:Number(maintenanceDays)}]);}
    setEditRule(null);
  }
  return h("div",null,
    h(SectionHeader,{title:"Configurações",sub:"Gerencie todos os dados do sistema"}),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}},
      // Dados profissional
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:16}},"👩‍⚕️ Dados da Profissional"),
        h(Field,{label:"Nome"},h(Inp,{value:settings.doctorName||"",onChange:v=>setSettings(s=>({...s,doctorName:v})),placeholder:"Dra. Sofia"})),
        h(Field,{label:"Profissão"},h(Inp,{value:settings.doctorTitle||"",onChange:v=>setSettings(s=>({...s,doctorTitle:v})),placeholder:"Médica Responsável"})),
        h(Field,{label:"Clínica"},h(Inp,{value:settings.clinicName||"",onChange:v=>setSettings(s=>({...s,clinicName:v})),placeholder:"HarmonizaPro"})),
        h("div",{style:{fontSize:12,color:P.green,marginTop:8}},"✓ Salvo automaticamente")
      ),
      // Locais de atendimento
      h(Card,null,
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:16}},"📍 Locais de Atendimento"),
        h("div",{style:{display:"flex",gap:8,marginBottom:14}},
          h(Inp,{value:newLoc,onChange:setNewLoc,placeholder:"Nome do local..."}),
          h(Btn,{onClick:addLoc,style:{flexShrink:0,padding:"9px 14px"}},"＋")
        ),
        h("div",{style:{display:"flex",flexDirection:"column",gap:6}},locations.map(l=>h("div",{key:l,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`}},
          h("span",{style:{fontSize:13,color:P.text}},"📍 "+l),
          h("button",{onClick:()=>delLoc(l),style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:15}},locations.length>1?"×":"")
        )))
      ),
      // Procedimentos
      h(Card,{style:{gridColumn:"1/-1"}},
        h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:16}},"🩺 Procedimentos Cadastrados"),
        h("div",{style:{display:"flex",gap:8,marginBottom:16}},
          h(Inp,{value:newProc,onChange:setNewProc,placeholder:"Nome do novo procedimento...",style:{flex:1}}),
          h(Btn,{onClick:addProc,style:{flexShrink:0}},"＋ Adicionar")
        ),
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}},procedures.map((proc,i)=>h("div",{key:proc,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:P.bg3,borderRadius:8,border:`1px solid ${P.border}`}},
          editProc===proc
            ?h("div",{style:{display:"flex",gap:6,flex:1}},h(Inp,{value:editProcVal,onChange:setEditProcVal,style:{flex:1}}),h("button",{onClick:saveEditProc,style:{background:"none",border:"none",color:P.green,cursor:"pointer",fontSize:14}},"✓"),h("button",{onClick:()=>setEditProc(null),style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:14}},"×"))
            :h(Fragment,null,
              h("div",{style:{display:"flex",alignItems:"center",gap:8}},h("span",{style:{fontSize:11,color:P.text3,minWidth:18}},`${i+1}`),h("span",{style:{fontSize:13,color:P.text}},proc)),
              h("div",{style:{display:"flex",gap:4}},h("button",{onClick:()=>{setEditProc(proc);setEditProcVal(proc);},style:{background:"none",border:"none",color:P.accent,cursor:"pointer",fontSize:13}},"✎"),h("button",{onClick:()=>delProc(proc),style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:15}},"×"))
            )
        )))
      ),
      // ── PRAZOS DE RETORNO ──────────────────────────────────────────────────
      h(Card,{style:{gridColumn:"1/-1"}},
        h("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}},
          h("div",null,
            h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:P.text,marginBottom:4}},"⏰ Prazos de Retorno por Procedimento"),
            h("div",{style:{fontSize:12,color:P.text3,marginBottom:16}},"Ao registrar uma sessão, o retorno é criado automaticamente na Agenda com os dias configurados aqui.")
          )
        ),
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}},
          procedures.map(proc=>{
            const rule=getRuleForProc(proc);
            const isEditing=editRule&&editRule.procedure===proc;
            return h("div",{key:proc,style:{padding:"12px 14px",background:P.bg3,borderRadius:10,border:`1px solid ${isEditing?P.rose:P.border}`}},
              h("div",{style:{fontSize:12.5,color:P.text,fontWeight:500,marginBottom:8}},proc),
              isEditing
                ?h("div",null,
                  h("div",{style:{display:"flex",gap:10,marginBottom:10}},
                    h("div",{style:{flex:1}},
                      h("label",{style:{display:"block",fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}},"Revisão (dias)"),
                      h("input",{type:"number",value:editRule.revisionDays,min:0,onChange:e=>setEditRule(r=>({...r,revisionDays:e.target.value})),style:{...IS,padding:"7px 10px",fontSize:13}})
                    ),
                    h("div",{style:{flex:1}},
                      h("label",{style:{display:"block",fontSize:10,color:P.text3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}},"Manutenção (dias)"),
                      h("input",{type:"number",value:editRule.maintenanceDays,min:0,onChange:e=>setEditRule(r=>({...r,maintenanceDays:e.target.value})),style:{...IS,padding:"7px 10px",fontSize:13}})
                    )
                  ),
                  h("div",{style:{fontSize:10,color:P.text3,marginBottom:8}},"Use 0 para desativar aquele prazo."),
                  h("div",{style:{display:"flex",gap:8}},
                    h(Btn,{onClick:()=>saveRule(proc,editRule.revisionDays,editRule.maintenanceDays),style:{fontSize:11,padding:"5px 14px"}},"✓ Salvar"),
                    h(Btn,{variant:"ghost",onClick:()=>setEditRule(null),style:{fontSize:11,padding:"5px 12px"}},"Cancelar")
                  )
                )
                :h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},
                  rule
                    ?h("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
                        rule.revisionDays>0&&h("span",{style:{fontSize:11,padding:"2px 9px",borderRadius:12,background:"rgba(92,31,50,.12)",color:P.accent,border:`1px solid rgba(92,31,50,.2)`}},`✏ Revisão: ${rule.revisionDays}d`),
                        rule.maintenanceDays>0&&h("span",{style:{fontSize:11,padding:"2px 9px",borderRadius:12,background:"rgba(133,89,84,.1)",color:P.accent2,border:`1px solid rgba(133,89,84,.2)`}},`🔄 Manutenção: ${rule.maintenanceDays}d`),
                        !rule.revisionDays&&!rule.maintenanceDays&&h("span",{style:{fontSize:11,color:P.text3}},"Sem retorno automático")
                      )
                    :h("span",{style:{fontSize:11,color:P.text3}},"Não configurado"),
                  h("button",{onClick:()=>setEditRule({procedure:proc,revisionDays:rule?.revisionDays??14,maintenanceDays:rule?.maintenanceDays??90}),style:{background:"none",border:"none",color:P.accent,cursor:"pointer",fontSize:13,flexShrink:0}},"✎")
                )
            );
          })
        )
      )
    )
  );
}
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ─── ROOT APP (com autenticação) ─────────────────────────────────────────────
function App(){
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Enquanto verifica sessão
  if (authLoading) return createElement("div", {
    style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: P.bg, color: P.text3, fontSize: 14, fontFamily: "sans-serif" }
  }, "Carregando...");

  // Não logada → tela de login
  if (!session) return createElement(LoginScreen, { onLogin: () => {} });

  // Logada → sistema completo
  return createElement(AppInner, { session, onLogout: () => supabase.auth.signOut() });
}

function AppInner({ session, onLogout }) {
  const[,forceUpdate]=useState(0);
  const[patients,setPatients]=useSupaTable("patients",INIT_PATIENTS);
  const[agenda,setAgenda]=useSupaTable("agenda",INIT_AGENDA);
  const[expenses,setExpenses]=useSupaTable("expenses",INIT_EXPENSES);
  const[incomes,setIncomes]=useLocalStorage("hp_incomes",[]);
  const[products,setProducts]=useSupaTable("products",[
    {id:"p1",name:"Botox Allergan 100U",cat:"Toxina Botulínica",qty:2,min:5,unit:"un",expiry:"12/2026",cost:800,emoji:"💉",status:"critical"},
    {id:"p2",name:"Juvederm Ultra 1ml",cat:"Ácido Hialurônico",qty:5,min:8,unit:"sir",expiry:"08/2026",cost:450,emoji:"✨",status:"low"},
    {id:"p3",name:"Sculptra 367mg",cat:"Bioestimulador",qty:7,min:4,unit:"fr",expiry:"09/2026",cost:950,emoji:"🧪",status:"ok"},
    {id:"p4",name:"Fio PDO 29G Mono",cat:"Fios de PDO",qty:48,min:20,unit:"un",expiry:"01/2028",cost:35,emoji:"🧵",status:"ok"},
    {id:"p5",name:"Profhilo 2ml",cat:"Skinbooster",qty:4,min:3,unit:"sir",expiry:"11/2026",cost:520,emoji:"💧",status:"ok"},
  ]);
  const[settingsData,setSettings]=useSettings({doctorName:"Dra. Sofia",doctorTitle:"Médica Responsável",clinicName:"HarmonizaPro"});
  const[procedures,setProcedures]=useLocalStorage("hp_procedures",INIT_PROCEDURES);
  const[locations,setLocations]=useLocalStorage("hp_locations",INIT_LOCATIONS);
  const[returnRules,setReturnRules]=useLocalStorage("hp_return_rules",INIT_RETURN_RULES);
  const[page,setPage]=useState("dashboard");
  const[selectedPatient,setSelectedPatient]=useState(null);
  const h=createElement;
  const todayStr=new Date().toISOString().slice(0,10);
  const todayApptCount=agenda.filter(a=>a.date===todayStr).length;
  const criticalStock=products.filter(p=>p.status==="critical").length;
  const nav=[
    {k:"dashboard",l:"Dashboard",icon:"✦"},
    {k:"retornos",l:"Retornos",icon:"⏰",badge:(()=>{const today=new Date();return patients.filter(p=>{const s=(p.sessions||[]);if(!s.length)return false;const last=[...s].sort((a,b)=>(parseDMY(b.date)||new Date(0))-(parseDMY(a.date)||new Date(0)))[0];const d=parseDMY(last.date);if(!d)return false;return Number(last.returnReminderDays)>0&&daysBetween(d,today)>Number(last.returnReminderDays);}).length||null;})(),badgeColor:P.red},
    {k:"agenda",l:"Agenda",icon:"📅",badge:todayApptCount||null},
    {k:"pacientes",l:"Pacientes",icon:"👤"},
    {k:"prontuario",l:"Prontuários",icon:"📋"},
    {k:"estoque",l:"Estoque",icon:"🧴",badge:criticalStock||null,badgeColor:P.yellow},
    {k:"financeiro",l:"Financeiro",icon:"💰"},
    {k:"relatorios",l:"Relatórios",icon:"📊"},
    {k:"mensagens",l:"Mensagens WA",icon:"💬"},
    {k:"config",l:"Configurações",icon:"⚙️"},
  ];
  function handleNav(k){setPage(k);if(k!=="prontuario")setSelectedPatient(null);}
  function handleSelectPatient(p){setSelectedPatient(p);setPage("prontuario");}
  const currentPatient=selectedPatient?patients.find(p=>p.id===selectedPatient.id):null;
  const pageTitles={dashboard:"Dashboard",retornos:"Retornos Pendentes",agenda:"Agenda",pacientes:"Pacientes",prontuario:currentPatient?currentPatient.name:"Prontuários",estoque:"Estoque",financeiro:"Fluxo de Caixa",relatorios:"Relatórios",mensagens:"Mensagens WhatsApp",config:"Configurações"};
  const settings = settingsData;
  return h(Fragment,null,
    h("style",null,`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:${P.bg};color:${P.text};font-family:'DM Sans',sans-serif;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${P.border};border-radius:2px;}input,select,textarea{font-family:'DM Sans',sans-serif;color:${P.text};}select option{background:${P.bg2};}@media print{aside,.no-print{display:none!important;}body{background:#fff!important;color:#222!important;}*{box-shadow:none!important;}}@media(max-width:768px){aside{width:200px!important;}.grid4{grid-template-columns:repeat(2,1fr)!important;}.grid2{grid-template-columns:1fr!important;}}`),
    h("div",{style:{display:"flex",height:"100vh",overflow:"hidden",background:P.bg}},
      h("aside",{style:{width:238,background:P.bg2,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",flexShrink:0}},
        h("div",{style:{padding:"24px 20px 16px",borderBottom:`1px solid ${P.border}`}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:P.accent3,letterSpacing:".04em",lineHeight:1.1}},settings.clinicName||"HarmonizaPro"),
          h("div",{style:{fontSize:9,color:P.text3,letterSpacing:".14em",textTransform:"uppercase",marginTop:3}},"Gestão de Clínica")
        ),
        h("nav",{style:{flex:1,padding:"14px 10px",overflowY:"auto"}},
          nav.map(item=>h("div",{key:item.k,onClick:()=>handleNav(item.k),style:{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,cursor:"pointer",marginBottom:2,background:page===item.k?P.rose:"transparent",color:page===item.k?P.accent3:P.text2,border:`1px solid ${page===item.k?P.rose:"transparent"}`,transition:"all .15s"},onMouseEnter:e=>{if(page!==item.k){e.currentTarget.style.background=P.card;e.currentTarget.style.color=P.text;}},onMouseLeave:e=>{if(page!==item.k){e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.text2;}}},
            h("span",{style:{fontSize:15,width:20,textAlign:"center"}},item.icon),
            h("span",{style:{fontSize:13.5}},item.l),
            item.badge&&h("span",{style:{marginLeft:"auto",background:item.badgeColor||P.rose2,color:item.badgeColor===P.yellow?"#160b0e":P.accent3,fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:20,lineHeight:1.7}},item.badge)
          ))
        ),
        h("div",{style:{padding:14,borderTop:`1px solid ${P.border}`}},
          h("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:P.card}},
            h("div",{style:{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${P.rose},${P.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:P.accent3}},initials(settings.doctorName||"Dra Sofia")),
            h("div",{style:{flex:1,minWidth:0}},
              h("div",{style:{fontSize:12.5,fontWeight:500,color:P.text}},settings.doctorName||"Dra. Sofia"),
              h("div",{style:{fontSize:10.5,color:P.text3}},settings.doctorTitle||"Médica Responsável")
            ),
            h("button",{onClick:()=>{const isDark=document.body.style.background!==LIGHT_P.bg;setTheme(!isDark);document.body.style.background=isDark?LIGHT_P.bg:DARK_P.bg;window.__isDark=!isDark;forceUpdate(x=>x+1);},title:"Alternar tema",style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:14,padding:"4px",borderRadius:6,flexShrink:0}},"☀️"),
            h("button",{onClick:onLogout,title:"Sair",style:{background:"none",border:"none",color:P.text3,cursor:"pointer",fontSize:16,padding:"4px",borderRadius:6,flexShrink:0}},"⏻")
          )
        )
      ),
      h("div",{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}},
        h("div",{style:{height:56,background:P.bg2,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",padding:"0 24px",gap:14,flexShrink:0}},
          h("div",{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.text,flexShrink:0}},pageTitles[page]),
          h(GlobalSearch,{patients,agenda,onSelectPatient:handleSelectPatient,onNav:handleNav})
        ),
        h("div",{style:{flex:1,overflowY:"auto",padding:24}},
          page==="dashboard"&&h(Dashboard,{patients,agenda,onNav:handleNav,onSelectPatient:handleSelectPatient,settings,returnRules}),
          page==="retornos"&&h(RetornosPendentes,{patients,returnRules,onSelectPatient:handleSelectPatient,onNav:handleNav}),
          page==="agenda"&&h(Agenda,{patients,agenda,setAgenda,procedures,locations}),
          page==="pacientes"&&h(Patients,{patients,setPatients,onSelect:handleSelectPatient,procedures,locations}),
          page==="prontuario"&&!currentPatient&&h(Patients,{patients,setPatients,onSelect:handleSelectPatient,procedures,locations}),
          page==="prontuario"&&currentPatient&&h(PatientDetail,{patient:currentPatient,setPatients,onBack:()=>setSelectedPatient(null),procedures,locations,products:products.map(p=>p.name),returnRules}),
          page==="estoque"&&h(Estoque,{products,setProducts}),
          page==="financeiro"&&h(Financeiro,{patients,setPatients,expenses,setExpenses,incomes,setIncomes}),
          page==="relatorios"&&h(Relatorios,{patients,onSelectPatient:handleSelectPatient,onNav:handleNav}),
          page==="mensagens"&&h(MensagensWhatsApp,{patients}),
          page==="config"&&h(Configuracoes,{procedures,setProcedures,locations,setLocations,products,setProducts,settings,setSettings,returnRules,setReturnRules})
        )
      )
    )
  );
}

export default App;