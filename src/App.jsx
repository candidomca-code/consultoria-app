import { useState } from "react";

const P = "#7F77DD"; 
const ADMIN_WHATSAPP = "5551989640834"; 
const APP_VERSION = "1.2.0-PRO-SERVER"; 

const QUESTIONS = [
  { id: "estado_civil", sec: "👤 Perfil", q: "Qual o seu estado civil?", opts: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Outro"] },
  { id: "relacionamento_multiplo", sec: "👤 Perfil", q: "Você mantém mais de um relacionamento afetivo?", opts: ["Sim", "Não"], showIf: { id: "estado_civil", vals: ["Outro"] } },
  { id: "ciencia_relacionamentos", sec: "👤 Perfil", q: "As demais pessoas sabem umas das outras?", opts: ["Sim, todas sabem", "Não", "Algumas sabem"], showIf: { id: "relacionamento_multiplo", vals: ["Sim"] } },
  { id: "tem_filhos", sec: "👨‍👩‍👧 Família", q: "Você possui filhos?", opts: ["Sim", "Não"] },
  { id: "mora_filhos", sec: "👨‍👩‍👧 Família", q: "Mora com os filhos?", opts: ["Sim, com todos", "Sim, com alguns", "Não, com nenhum"], showIf: { id: "tem_filhos", vals: ["Sim"] } },
  { id: "filho_menor", sec: "👨‍👩‍👧 Família", q: "Algum dos filhos é menor de idade?", opts: ["Sim", "Não"], showIf: { id: "mora_filhos", vals: ["Sim, com alguns", "Não, com nenhum"] } },
  { id: "tipo_pensao", sec: "👨‍👩‍👧 Família", q: "Sobre a pensão do menor:", opts: ["Paga pensão Judicial", "Paga pensão Espontânea", "Não paga pensão"], showIf: { id: "filho_menor", vals: ["Sim"] } },
  { id: "contato_filhos", sec: "👨‍👩‍👧 Família", q: "Tem contato com todos eles?", opts: ["Sim", "Não"], showIf: { id: "tem_filhos", vals: ["Sim"] } },
  { id: "contato_menor", sec: "👨‍👩‍👧 Família", q: "Esses sem contato são menores?", opts: ["Sim", "Não"], showIf: { id: "contato_filhos", vals: ["Não"] } },
  { id: "moradia", sec: "🏠 Patrimônio", q: "Qual sua situação de moradia?", opts: ["Própria quitada", "Própria financiada", "Alugada", "Emprestada/Ocupada"] },
  { id: "outros_imoveis", sec: "🏠 Patrimônio", q: "Você tem ou custeia outros imóveis?", opts: ["Sim", "Não"] },
  { id: "gasto_luz", sec: "🏠 Patrimônio", q: "Valor médio da conta de luz?", opts: ["Até R$ 150", "R$ 150 a R$ 400", "R$ 400 a R$ 800", "Acima de R$ 800"] },
  { id: "tem_veiculo", sec: "🚗 Mobilidade", q: "Possui veículo?", opts: ["Sim", "Não"] },
  { id: "tipos_veiculo", sec: "🚗 Mobilidade", q: "Quais tipos?", multiple: true, opts: ["Carro(s)", "Moto(s)", "Outro(s)"], showIf: { id: "tem_veiculo", vals: ["Sim"] } },
  { id: "veiculo_financiado", sec: "🚗 Mobilidade", q: "Algum é Financiado?", opts: ["Sim", "Não"], showIf: { id: "tem_veiculo", vals: ["Sim"] } },
  { id: "veiculo_atraso", sec: "🚗 Mobilidade", q: "Algum com parcelas em atraso?", opts: ["Sim", "Não"], showIf: { id: "veiculo_financiado", vals: ["Sim"] } },
  { id: "gasto_combustivel", sec: "🚗 Mobilidade", q: "Gasto mensal com veículo:", opts: ["Até R$ 300", "R$ 300 a R$ 600", "R$ 600 a R$ 1.200", "Acima de R$ 1.200"], showIf: { id: "tem_veiculo", vals: ["Sim"] } },
  { id: "situacao_prof", sec: "💼 Profissional", q: "Situação profissional:", multiple: true, opts: ["CLT", "Empresário", "Autônomo", "Aposentado", "Desempregado"] },
  { id: "negativado", sec: "🏦 Financeiro", q: "Nome negativado?", opts: ["Sim", "Não", "Não sei"] },
  { id: "sonhos", sec: "⭐ Objetivo", q: "Seus sonhos após quitar dívidas?", multiple: true, opts: ["Casa", "Carro", "Viajar", "Investir", "Outros"] }
];

function isVisible(q, answers) { 
  if (!q.showIf) return true;
  const dep = answers[q.showIf.id];
  if (Array.isArray(dep)) return dep.some(v => q.showIf.vals.includes(v));
  return q.showIf.vals.includes(dep);
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [client, setClient] = useState({ nome: "", whatsapp: "" });
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [plan, setPlan] = useState("");
  const [multiSel, setMultiSel] = useState([]);
  const [history, setHistory] = useState([]);

  const visibleQs = QUESTIONS.filter(q => isVisible(q, answers));
  const currentQ = visibleQs[idx];

  async function callIA(finalAnswers) {
    try {
      const res = await fetch("/api/anthropic", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "claude-sonnet-4-6", // Modelo atualizado 2026
          max_tokens: 1500, 
          messages: [{ 
            role: "user", 
            content: `Você é Cândido Nathanael, especialista em Direito Popular. Analise estes dados: ${JSON.stringify(finalAnswers)}. Gere um plano direto com autoridade. Use negrito nos pontos principais.` 
          }] 
        })
      });
      
      const data = await res.json();
      if (!res.ok) return `Erro: ${data.error?.message || "Falha na API"}`;
      return data.content[0].text;
    } catch (e) { return `Falha na conexão: ${e.message}`; }
  }

  const next = (val) => {
    let finalVal = val;
    if (currentQ.multiple) {
      if (val === "NEXT_MULTI") finalVal = multiSel;
      else return;
    }
    setHistory([...history, idx]);
    const upd = { ...answers, [currentQ.id]: finalVal };
    setAnswers(upd);
    setMultiSel([]);
    if (idx + 1 < visibleQs.length) setIdx(idx + 1);
    else finish(upd);
  };

  const back = () => {
    if (history.length === 0) setScreen("home");
    else {
      const prevIdx = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setIdx(prevIdx);
    }
  };

  const toggleMulti = (opt) => {
    setMultiSel(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
  };

  async function finish(upd) {
    setScreen("loading");
    const result = await callIA(upd);
    setPlan(result);
    setScreen("result");
  }

  const VersionTag = () => <p style={{marginTop: 30, fontSize: 10, color: "#000", fontWeight: "bold"}}>Versão {APP_VERSION}</p>;

  if (screen === "home") return (
    <div style={{padding:30, maxWidth:450, margin:"auto", fontFamily:"sans-serif", textAlign:"center", background:"#fff", borderRadius:20, marginTop:50, boxShadow:"0 10px 30px rgba(0,0,0,0.1)"}}>
      <h1 style={{color: P, fontSize: 28, lineHeight: 1.3, marginTop: 0, marginBottom: 5}}>Portal da Consultoria Popular</h1>
      <p style={{color: "#666", fontSize: 16, marginBottom: 30}}>Análise de Perfil e Estratégia</p>
      <input placeholder="Seu Nome" value={client.nome} onChange={e=>setClient({...client, nome:e.target.value})} style={{width:"100%", padding:16, marginBottom:12, borderRadius:10, border:"2px solid #eee", boxSizing:"border-box", fontSize: 16}} />
      <input placeholder="WhatsApp" value={client.whatsapp} onChange={e=>setClient({...client, whatsapp:e.target.value})} style={{width:"100%", padding:16, marginBottom:25, borderRadius:10, border:"2px solid #eee", boxSizing:"border-box", fontSize: 16}} />
      <button disabled={!client.nome || client.whatsapp.length < 10} onClick={()=>setScreen("quiz")} style={{width:"100%", padding:18, background:P, color:"#fff", border:"none", borderRadius:12, fontWeight:"bold", cursor:"pointer", fontSize:18}}>Iniciar Análise Gratuita →</button>
      <VersionTag />
    </div>
  );

  if (screen === "quiz") return (
    <div style={{padding:25, maxWidth:450, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:40, boxShadow:"0 10px 30px rgba(0,0,0,0.05)", textAlign: "center"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:15}}>
        <button onClick={back} style={{background:"none", border:"none", color:P, cursor:"pointer", fontSize:14, fontWeight:"bold"}}>← Voltar</button>
        <p style={{color:"#999", fontSize:11, textTransform:"uppercase", margin:0}}>{currentQ.sec}</p>
      </div>
      <h2 style={{fontSize:20, marginBottom:25, color:"#333", textAlign: "left"}}>{currentQ.q}</h2>
      {currentQ.opts.map(o => (
        <button key={o} onClick={()=>currentQ.multiple ? toggleMulti(o) : next(o)} style={{width:"100%", padding:18, textAlign:"left", marginBottom:12, borderRadius:14, border:`2px solid ${multiSel.includes(o) ? P : "#eee"}`, background:multiSel.includes(o) ? "#F3F1FF" : "#fcfcfc", cursor:"pointer", color:"#444", fontSize:16}}>
          {currentQ.multiple && (multiSel.includes(o) ? "✅ " : "⬜ ")} {o}
        </button>
      ))}
      {currentQ.multiple && (
        <button onClick={()=>next("NEXT_MULTI")} disabled={multiSel.length === 0} style={{width:"100%", padding:18, background:P, color:"#fff", border:"none", borderRadius:12, marginTop:10, fontWeight:"bold", cursor:"pointer", fontSize:16}}>Continuar →</button>
      )}
      <VersionTag />
    </div>
  );

  if (screen === "loading") return <div style={{textAlign:"center", padding:100, fontFamily:"sans-serif"}}><h2>Analisando dados...</h2><VersionTag /></div>;

  if (screen === "result") return (
    <div style={{padding:25, maxWidth:580, margin:"auto", fontFamily:"sans-serif", background:"#fff", borderRadius:20, marginTop:20, boxShadow:"0 10px 30px rgba(0,0,0,0.1)", textAlign: "center"}}>
      <h2 style={{color:P, textAlign: "left"}}>Estratégia para {client.nome}</h2>
      <div style={{whiteSpace:"pre-wrap", lineHeight:1.7, color:"#444", fontSize:15, textAlign: "left"}}>{plan}</div>
      <button onClick={()=>window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=Olá! Finalizei minha análise. Sou o ${client.nome}.`)} style={{width:"100%", padding:20, background:"#25D366", color:"#fff", border:"none", borderRadius:15, marginTop:25, fontWeight:"bold", fontSize:17, cursor:"pointer"}}>Agendar Consultoria (Ficha 2)</button>
      <button onClick={()=>{setScreen("home"); setIdx(0); setHistory([]); setAnswers({});}} style={{width:"100%", background:"none", border:"none", color:"#999", marginTop:15, cursor:"pointer"}}>Fazer nova análise</button>
      <VersionTag />
    </div>
  );

  return null;
}
