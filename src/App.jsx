import { useState } from "react";

// Configurações Gerais
const P = "#7F77DD"; // Roxo da marca
const ADMIN_KEY = "candido2024";
const ADMIN_WHATSAPP = "5551989640834"; 

const QUESTIONS = [
  // 👤 PERFIL
  { id: "genero", sec: "👤 Perfil", q: "Como você se identifica?", opts: ["Homem", "Mulher", "Outro"] },
  { id: "idade_faixa", sec: "👤 Perfil", q: "Qual a sua faixa etária?", opts: ["Menor de 18", "18 a 59", "60 ou mais"] },
  
  // 👨‍👩‍👧 FAMÍLIA E SUCESSÃO
  { id: "estado_civil", sec: "👨‍👩‍👧 Família", q: "Qual o seu estado civil?", opts: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"] },
  { id: "pais_vivos", sec: "👨‍👩‍👧 Família", q: "Situação dos seus pais?", opts: ["Ambos vivos", "Um vivo", "Ambos falecidos"] },
  { id: "filhos_pensao", sec: "👨‍👩‍👧 Família", q: "Possui filhos ou paga pensão?", opts: ["Filhos moram comigo", "Pago pensão judicial", "Pago pensão espontânea", "Não tenho filhos"] },

  // 🏠 MORADIA E ENERGIA SOLAR (OPORTUNIDADE)
  { id: "moradia", sec: "🏠 Moradia", q: "Situação de moradia?", opts: ["Própria quitada", "Própria financiada", "Alugada", "Emprestada"] },
  { id: "gasto_luz", sec: "🏠 Moradia", q: "Qual o valor médio da conta de luz?", opts: ["Até R$ 150", "R$ 150 a R$ 400", "Acima de R$ 400 (Oportunidade Solar)"] },

  // 🚗 VEÍCULO E GNV (OPORTUNIDADE)
  { id: "veiculo", sec: "🚗 Veículo", q: "Possui veículo?", opts: ["Carro Quitado", "Carro Financiado", "Moto", "Não tenho"] },
  { id: "gasto_combustivel", sec: "🚗 Veículo", q: "Gasto mensal com combustível/manutenção?", opts: ["Até R$ 300", "R$ 300 a R$ 700", "Acima de R$ 700 (Sugestão GNV)"], showIf: { id: "veiculo", vals: ["Carro Quitado", "Carro Financiado", "Moto"] } },

  // 💰 RENDA E SAÚDE
  { id: "trabalho", sec: "💰 Renda e Saúde", q: "Situação profissional?", opts: ["CLT", "Autônomo", "Empresário", "Desempregado"] },
  { id: "saude_plano", sec: "💰 Renda e Saúde", q: "Como está seu plano de saúde?", opts: ["Não tenho (uso SUS)", "Tenho, mas está caro", "Uso particular (sem plano)", "Tenho e estou satisfeito"] },

  // 🏦 FINANCEIRO (O MÉTODO CÂNDIDO)
  { id: "spc", sec: "🏦 Bancos", q: "Seu nome está negativado (SPC/Serasa)?", opts: ["Sim", "Não", "Não sei"] },
  { id: "dividas_atraso", sec: "🏦 Bancos", q: "Tem contas vencidas (dívidas) hoje?", opts: ["Sim, várias", "Uma ou duas", "Não, tudo em dia"] },

  // ⭐ OBJETIVOS
  { id: "sonho", sec: "⭐ Objetivos", q: "Qual seu maior sonho após resolver o financeiro?", opts: ["Casa Própria", "Trocar Veículo", "Viagem", "Investir", "Outro"] }
];

// Funções de Ajuda
function isVisible(q, answers) { return !q.showIf || q.showIf.vals.includes(answers[q.showIf.id]); }
function visibleQs(answers) { return QUESTIONS.filter(q => isVisible(q, answers)); }
function renderMd(text) { 
  return text ? text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') : ""; 
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [client, setClient] = useState({ nome: "", whatsapp: "" });
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");

  const qs = visibleQs(answers);
  const q = qs[idx];

  async function callIA(prompt) {
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
          messages: [{ role: "user", content: prompt }] 
        })
      });
      const data = await res.json();
      return data.content[0].text;
    } catch (e) {
      console.error(e);
      return "Erro ao gerar plano. Verifique o saldo da sua chave API.";
    }
  }

  async function finish(upd) {
    setScreen("loading");
    setLoading(true);
    const summary = JSON.stringify(upd);
    
    const prompt = `Você é um consultor estratégico de elite. Gere um PLANO DE AÇÃO motivador para o cliente ${client.nome}.
    Use o seu método: "Dívidas são apenas contas vencidas que precisam de estratégia".
    - Se o gasto de luz for > 400, venda a ideia de ENERGIA SOLAR como investimento.
    - Se o combustível for > 700, venda a ideia de GNV ou Elétrico.
    - Se o plano de saúde estiver caro, sugira portabilidade.
    Finalize com um "Termo de Compromisso com o Sucesso" para ele assinar mentalmente.
    Dados do cliente: ${summary}`;

    const result = await callIA(prompt);
    setPlan(result);
    setLoading(false);
    setScreen("result");
  }

  const next = (val) => {
    const upd = { ...answers, [q.id]: val };
    setAnswers(upd);
    if (idx + 1 < qs.length) setIdx(idx + 1);
    else finish(upd);
  };

  // --- TELAS ---
  if (screen === "home") return (
    <div style={{padding:25, maxWidth:450, margin:"auto", fontFamily:"sans-serif", textAlign:"center", background:"#fff", borderRadius:20, marginTop:50, boxShadow:"0 10px 30px rgba(0,0,0,0.1)"}}>
      <h1 style={{color:P}}>⚖️ Consultoria Popular</h1>
      <p style={{color:"#666"}}>Retome o controle da sua vida financeira hoje.</p>
      <input placeholder="Seu Nome" onChange={e=>setClient({...client, nome:e.target.value})} style={{width:"100%", padding:12, marginBottom:10, borderRadius:8, border:"1px solid #ddd"}} />
      <input placeholder="WhatsApp" onChange={e=>setClient({...client, whatsapp:e.target.value})} style={{width:"100%", padding:12, marginBottom:20, borderRadius:8, border:"1px solid #ddd"}} />
      <button onClick={()=>setScreen("quiz")} style={{width:"100%", padding:15, background:P, color:"#fff", border:"none", borderRadius:10, fontWeight:"bold", cursor:"pointer"}}>Iniciar Análise Gratuita →</button>
    </div>
  );

  if (screen === "quiz") return (
    <div style={{padding:25, maxWidth:450, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:50}}>
      <div style={{height:5, background:"#eee", borderRadius:10, marginBottom:20}}>
        <div style={{width:`${((idx+1)/qs.length)*100}%`, height:"100%", background:P, borderRadius:10, transition:"0.3s"}} />
      </div>
      <p style={{color:"#999", fontSize:12, textTransform:"uppercase"}}>{q.sec}</p>
      <h2 style={{fontSize:20, marginBottom:20}}>{q.q}</h2>
      {q.opts.map(o => (
        <button key={o} onClick={()=>next(o)} style={{width:"100%", padding:14, textAlign:"left", marginBottom:10, borderRadius:12, border:"1px solid #eee", background:"#f9f9f9", cursor:"pointer", fontSize:15}}>{o}</button>
      ))}
    </div>
  );

  if (screen === "loading") return (
    <div style={{textAlign:"center", padding:100, fontFamily:"sans-serif"}}>
      <h2 style={{color:P}}>Analisando seus dados...</h2>
      <p>Nossa IA está construindo seu Plano de Ação 🚀</p>
    </div>
  );

  if (screen === "result") return (
    <div style={{padding:25, maxWidth:500, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:20}}>
      <h2 style={{color:P}}>Plano de Ação: {client.nome}</h2>
      <div dangerouslySetInnerHTML={{__html: renderMd(plan)}} style={{lineHeight:1.6, color:"#333", fontSize:15}} />
      <button onClick={()=>window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=Olá Cândido! Finalizei o formulário e quero agendar a Consultoria Ficha 2.`)} style={{width:"100%", padding:18, background:"#25D366", color:"#fff", border:"none", borderRadius:12, marginTop:25, fontWeight:"bold", fontSize:16, cursor:"pointer"}}>Falar com Especialista no WhatsApp</button>
      <button onClick={()=>setScreen("home")} style={{width:"100%", background:"none", border:"none", color:"#999", marginTop:15, cursor:"pointer"}}>Voltar ao início</button>
    </div>
  );

  return null;
}