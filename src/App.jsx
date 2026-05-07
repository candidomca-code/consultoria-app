import { useState } from "react";

// --- CONFIGURAÇÕES DA MARCA ---
const P = "#7F77DD"; // Roxo da Consultoria Popular
const ADMIN_WHATSAPP = "5551989640834"; 

// --- ESTRUTURA DE PERGUNTAS (A FICHA ESTRATÉGICA) ---
const QUESTIONS = [
  { id: "genero", sec: "👤 Perfil", q: "Como você se identifica?", opts: ["Homem", "Mulher", "Outro"] },
  { id: "idade_faixa", sec: "👤 Perfil", q: "Qual a sua faixa etária?", opts: ["Menor de 18", "18 a 59", "60 ou mais"] },
  
  // FAMÍLIA E RELACIONAMENTOS
  { id: "estado_civil", sec: "👨‍👩‍👧 Família", q: "Qual o seu estado civil?", opts: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Outro"] },
  { 
    id: "relacionamento_multiplo", 
    sec: "👨‍👩‍👧 Família", 
    q: "Você mantém mais de um relacionamento afetivo ou união simultânea?", 
    opts: ["Sim, mantenho", "Não, apenas um", "Prefiro não responder"],
    showIf: { id: "estado_civil", vals: ["Outro"] } 
  },
  { id: "regime_bens", sec: "👨‍👩‍👧 Família", q: "Qual o regime de bens?", opts: ["Comunhão Parcial", "Comunhão Universal", "Separação de Bens", "Não sei"], showIf: { id: "estado_civil", vals: ["Casado(a)", "União estável", "Outro"] } },
  { id: "pais_vivos", sec: "👨‍👩‍👧 Família", q: "Seus pais possuem bens em nome deles?", opts: ["Sim, e estão vivos", "Sim, mas um/ambos faleceram (Inventário)", "Não possuem bens", "Não sei"] },
  { id: "filhos_pensao", sec: "👨‍👩‍👧 Família", q: "Sobre filhos e pensão:", opts: ["Tenho filhos e moram comigo", "Pago pensão (Judicial)", "Pago pensão (Acordo boca)", "Não tenho filhos / Sem pensão"] },

  // PATRIMÔNIO E OPORTUNIDADES
  { id: "moradia", sec: "🏠 Patrimônio", q: "Qual sua situação de moradia?", opts: ["Própria quitada", "Própria financiada", "Alugada", "Emprestada/Ocupada"] },
  { id: "imovel_doc", sec: "🏠 Patrimônio", q: "O imóvel tem escritura e matrícula no Registro de Imóveis?", opts: ["Sim, tudo ok", "Só contrato de gaveta", "Tem escritura, mas não registrei", "Não sei"], showIf: { id: "moradia", vals: ["Própria quitada", "Própria financiada"] } },
  { id: "gasto_luz", sec: "🏠 Patrimônio", q: "Média da conta de luz mensal:", opts: ["Até R$ 150", "R$ 150 a R$ 400", "R$ 400 a R$ 800", "Acima de R$ 800 (Oportunidade Solar)"] },

  // MOBILIDADE
  { id: "veiculo", sec: "🚗 Mobilidade", q: "Possui veículo?", opts: ["Carro Quitado", "Carro Financiado", "Moto", "Não tenho"] },
  { id: "gasto_combustivel", sec: "🚗 Mobilidade", q: "Gasto mensal com combustível:", opts: ["Até R$ 300", "R$ 300 a R$ 600", "R$ 600 a R$ 1.200", "Acima de R$ 1.200 (Sugestão GNV)"], showIf: { id: "veiculo", vals: ["Carro Quitado", "Carro Financiado", "Moto"] } },
  { id: "busca_apreensao", sec: "🚗 Mobilidade", q: "As parcelas do veículo estão em dia?", opts: ["Sim", "Não (Risco de Busca e Apreensão)", "Estão em dia, mas o juros parece alto"], showIf: { id: "veiculo", vals: ["Carro Financiado"] } },

  // FINANCEIRO
  { id: "bancos_uso", sec: "🏦 Financeiro", q: "Onde você mais deve ou movimenta?", opts: ["Bancos Tradicionais", "Bancos Digitais", "Financeiras (Crefisa, Agibank...)", "Cooperativas"] },
  { id: "spc", sec: "🏦 Financeiro", q: "Situação do seu CPF:", opts: ["Limpo", "Negativado", "Nome limpo, mas score baixo"] },
  { id: "contas_atrasadas", sec: "🏦 Financeiro", q: "O que está tirando seu sono hoje?", opts: ["Cartão de Crédito", "Empréstimo Consignado", "Cheque Especial", "Dívidas com o Estado", "Tudo em dia, mas sem sobra"] },

  { id: "prioridade", sec: "⭐ Objetivo", q: "Se eu pudesse resolver UMA coisa hoje, qual seria?", opts: ["Limpar meu nome", "Reduzir valor das parcelas", "Regularizar meu imóvel", "Aumentar minha renda mensal"] }
];

// --- AUXILIARES ---
function isVisible(q, answers) { 
  if (!q.showIf) return true;
  const dependency = answers[q.showIf.id];
  return q.showIf.vals.includes(dependency);
}
function renderMd(text) { return text ? text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') : ""; }

export default function App() {
  const [screen, setScreen] = useState("home");
  const [client, setClient] = useState({ nome: "", whatsapp: "" });
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");

  const visibleQs = QUESTIONS.filter(q => isVisible(q, answers));
  const currentQ = visibleQs[idx];

  async function callIA(summaryData) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY, 
          "anthropic-version": "2023-06-01", 
          "anthropic-dangerous-direct-browser-access": "true" 
        },
        body: JSON.stringify({ 
          model: "claude-3-5-sonnet-20241022", 
          max_tokens: 1500, 
          messages: [{ 
            role: "user", 
            content: `Você é Cândido, advogado especialista em Holding e Direito Popular. Analise estes dados: ${JSON.stringify(summaryData)}. 
            Gere um plano de ação curto, direto e com tom de autoridade. Foque em: 
            1. Solar se luz > 400. 2. GNV se combustível > 600. 3. Regularização de imóvel se for 'gaveta'. 
            4. Se 'relacionamento_multiplo' for Sim, recomende Holding Familiar para proteção.
            Diga que dívidas são apenas contas vencidas que precisam de estratégia.` 
          }] 
        })
      });
      const data = await res.json();
      return data.content[0].text;
    } catch (e) {
      return "Ocorreu um erro ao gerar sua estratégia. Por favor, entre em contato via WhatsApp.";
    }
  }

  async function finish(finalAnswers) {
    setScreen("loading");
    setLoading(true);
    const result = await callIA(finalAnswers);
    setPlan(result);
    setLoading(false);
    setScreen("result");
  }

  const next = (val) => {
    const upd = { ...answers, [currentQ.id]: val };
    setAnswers(upd);
    if (idx + 1 < visibleQs.length) setIdx(idx + 1);
    else finish(upd);
  };

  // --- TELAS ---
  if (screen === "home") return (
    <div style={{padding:25, maxWidth:450, margin:"auto", fontFamily:"sans-serif", textAlign:"center", background:"#fff", borderRadius:20, marginTop:50, boxShadow:"0 10px 30px rgba(0,0,0,0.1)"}}>
      <h1 style={{color:P}}>⚖️ Consultoria Popular</h1>
      <p style={{color:"#666", marginBottom:30}}>Análise Estratégica de Crédito e Patrimônio</p>
      <input placeholder="Seu Nome" onChange={e=>setClient({...client, nome:e.target.value})} style={{width:"100%", padding:14, marginBottom:10, borderRadius:10, border:"1px solid #ddd", boxSizing:"border-box"}} />
      <input placeholder="WhatsApp com DDD" onChange={e=>setClient({...client, whatsapp:e.target.value})} style={{width:"100%", padding:14, marginBottom:20, borderRadius:10, border:"1px solid #ddd", boxSizing:"border-box"}} />
      <button onClick={()=>setScreen("quiz")} style={{width:"100%", padding:18, background:P, color:"#fff", border:"none", borderRadius:12, fontWeight:"bold", cursor:"pointer", fontSize:16}}>Iniciar Análise Gratuita →</button>
    </div>
  );

  if (screen === "quiz") return (
    <div style={{padding:25, maxWidth:450, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:40, boxShadow:"0 10px 30px rgba(0,0,0,0.05)"}}>
      <div style={{height:6, background:"#eee", borderRadius:10, marginBottom:25}}>
        <div style={{width:`${((idx+1)/visibleQs.length)*100}%`, height:"100%", background:P, borderRadius:10, transition:"0.4s"}} />
      </div>
      <p style={{color:"#999", fontSize:11, textTransform:"uppercase", letterSpacing:1}}>{currentQ.sec}</p>
      <h2 style={{fontSize:21, marginBottom:25, color:"#333"}}>{currentQ.q}</h2>
      {currentQ.opts.map(o => (
        <button key={o} onClick={()=>next(o)} style={{width:"100%", padding:16, textAlign:"left", marginBottom:12, borderRadius:14, border:"1px solid #f0f0f0", background:"#fcfcfc", cursor:"pointer", fontSize:16, color:"#444", transition:"0.2s"}}>
          {o}
        </button>
      ))}
    </div>
  );

  if (screen === "loading") return (
    <div style={{textAlign:"center", padding:100, fontFamily:"sans-serif"}}>
      <div style={{border:"4px solid #f3f3f3", borderTop:`4px solid ${P}`, borderRadius:"50%", width:40, height:40, animation:"spin 1s linear infinite", margin:"auto"}} />
      <h2 style={{color:P, marginTop:20}}>Processando Estratégia...</h2>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (screen === "result") return (
    <div style={{padding:25, maxWidth:550, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:20, boxShadow:"0 10px 30px rgba(0,0,0,0.1)"}}>
      <h2 style={{color:P, borderBottom:`2px solid ${P}`, paddingBottom:10}}>Plano de Ação para {client.nome}</h2>
      <div dangerouslySetInnerHTML={{__html: renderMd(plan)}} style={{lineHeight:1.7, color:"#444", fontSize:15, padding:"15px 0"}} />
      <button onClick={()=>window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=Olá Cândido! Finalizei minha Ficha 1. Quero agendar minha Ficha 2.`)} style={{width:"100%", padding:20, background:"#25D366", color:"#fff", border:"none", borderRadius:14, marginTop:25, fontWeight:"bold", fontSize:17, cursor:"pointer", boxShadow:"0 4px 15px rgba(37,211,102,0.3)"}}>Agendar Consultoria (Ficha 2)</button>
      <p style={{textAlign:"center", color:"#999", fontSize:12, marginTop:20}}>© Consultoria Popular - Dr. Cândido Nathanael</p>
    </div>
  );

  return null;
}