import { useState } from "react";

const P = "#7F77DD";
const ADMIN_WHATSAPP = "5551989640834";
const APP_VERSION = "1.4.0-VERCEL";

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

function buildResumo(answers) {
  return QUESTIONS
    .filter(q => isVisible(q, answers) && answers[q.id])
    .map(q => {
      const val = Array.isArray(answers[q.id]) ? answers[q.id].join(", ") : answers[q.id];
      return `- ${q.q} → ${val}`;
    }).join("\n");
}

async function callIA(resumo, nome) {
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Você é Cândido Nathanael, especialista em Direito Popular e consultoria financeira no Brasil.

Analise o perfil do cliente ${nome} e gere uma estratégia personalizada com:
1. **Diagnóstico rápido** do perfil
2. **Alertas importantes** (riscos jurídicos ou financeiros identificados)
3. **Oportunidades** que ele pode estar perdendo
4. **Próximos passos** práticos antes da consultoria

Use linguagem clara, direta e encorajadora. Destaque em negrito os pontos mais importantes.

Dados do cliente:
${resumo}`
        }]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Erro na API");
    return data.content?.map(b => b.text || "").join("") || "Não foi possível gerar a análise.";
  } catch(e) {
    console.error(e);
    return null;
  }
}

const s = {
  wrap: { padding: 24, maxWidth: 460, margin: "40px auto", fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  title: { color: P, fontSize: 26, lineHeight: 1.3, margin: "0 0 6px" },
  sub: { color: "#888", fontSize: 15, margin: "0 0 24px" },
  input: { width: "100%", padding: 14, marginBottom: 12, borderRadius: 10, border: "2px solid #eee", boxSizing: "border-box", fontSize: 15, outline: "none" },
  btnMain: { width: "100%", padding: 16, background: P, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 17, marginBottom: 0 },
  btnWa: { width: "100%", padding: 18, background: "#25D366", color: "#fff", border: "none", borderRadius: 14, marginTop: 20, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  btnReset: { width: "100%", background: "none", border: "none", color: "#bbb", marginTop: 12, cursor: "pointer", fontSize: 14 },
  opt: (sel) => ({ width: "100%", padding: 16, textAlign: "left", marginBottom: 10, borderRadius: 14, border: `2px solid ${sel ? P : "#eee"}`, background: sel ? "#F3F1FF" : "#fcfcfc", cursor: "pointer", color: sel ? "#3C3489" : "#444", fontSize: 15, fontWeight: sel ? 600 : 400 }),
  ver: { marginTop: 28, fontSize: 10, color: "#ccc", textAlign: "center" },
  bar: { height: 5, background: "#e5e2ff", borderRadius: 99, marginBottom: 20, overflow: "hidden" },
  prog: (p) => ({ height: "100%", width: p + "%", background: P, borderRadius: 99, transition: "width .3s" }),
  sec: { fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 },
  qText: { fontSize: 19, fontWeight: 700, color: "#1a1a2e", margin: "0 0 20px", lineHeight: 1.4 },
  back: { background: "none", border: "none", color: P, cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 16 },
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [client, setClient] = useState({ nome: "", whatsapp: "" });
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [plan, setPlan] = useState("");
  const [multiSel, setMultiSel] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(false);

  const visibleQs = QUESTIONS.filter(q => isVisible(q, answers));
  const currentQ = visibleQs[idx];
  const progress = Math.round(((idx + 1) / visibleQs.length) * 100);

  const next = (val) => {
    let finalVal = val;
    if (currentQ.multiple) {
      if (val === "NEXT_MULTI") finalVal = [...multiSel];
      else return;
    }
    setHistory(h => [...h, idx]);
    const upd = { ...answers, [currentQ.id]: finalVal };
    setAnswers(upd);
    setMultiSel([]);
    if (idx + 1 < QUESTIONS.filter(q => isVisible(q, upd)).length) setIdx(idx + 1);
    else finish(upd);
  };

  const back = () => {
    if (history.length === 0) { setScreen("home"); return; }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setIdx(prev);
  };

  const toggleMulti = (opt) => {
    setMultiSel(p => p.includes(opt) ? p.filter(i => i !== opt) : [...p, opt]);
  };

  async function finish(upd) {
    setScreen("loading");
    setError(false);
    const resumo = buildResumo(upd);
    const result = await callIA(resumo, client.nome);
    if (!result) { setError(true); setScreen("result"); }
    else { setPlan(result); setScreen("result"); }
  }

  function renderPlan(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#3C3489">$1</strong>')
      .replace(/^(\d+)\. (.+)$/gm, '<p style="margin:.5rem 0;font-weight:600;color:#444">$1. $2</p>')
      .replace(/^- (.+)$/gm, '<li style="margin:4px 0;line-height:1.6">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/gs, m => `<ul style="padding-left:1.2rem;margin:.4rem 0">${m}</ul>`)
      .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
  }

  function reset() {
    setScreen("home"); setIdx(0); setHistory([]);
    setAnswers({}); setMultiSel([]); setPlan(""); setError(false);
  }

  const VerTag = () => <p style={s.ver}>v{APP_VERSION}</p>;

  if (screen === "home") return (
    <div style={s.wrap}>
      <h1 style={s.title}>Portal da Consultoria Popular</h1>
      <p style={s.sub}>Análise de Perfil e Estratégia Jurídica</p>
      <input style={s.input} placeholder="Seu Nome Completo" value={client.nome} onChange={e => setClient({ ...client, nome: e.target.value })} />
      <input style={s.input} placeholder="WhatsApp (com DDD)" value={client.whatsapp} onChange={e => setClient({ ...client, whatsapp: e.target.value })} />
      <button style={{ ...s.btnMain, opacity: (!client.nome || client.whatsapp.length < 10) ? 0.5 : 1 }}
        disabled={!client.nome || client.whatsapp.length < 10}
        onClick={() => setScreen("quiz")}>
        Iniciar Análise Gratuita →
      </button>
      <VerTag />
    </div>
  );

  if (screen === "quiz") return (
    <div style={s.wrap}>
      <div style={s.bar}><div style={s.prog(progress)} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button style={s.back} onClick={back}>← Voltar</button>
        <span style={s.sec}>{currentQ.sec} · {idx + 1}/{visibleQs.length}</span>
      </div>
      <p style={s.qText}>{currentQ.q}</p>
      {currentQ.opts.map(o => {
        const sel = multiSel.includes(o);
        return (
          <button key={o} onClick={() => currentQ.multiple ? toggleMulti(o) : next(o)} style={s.opt(sel)}>
            {currentQ.multiple && <span style={{ marginRight: 10 }}>{sel ? "✅" : "⬜"}</span>}
            {o}
          </button>
        );
      })}
      {currentQ.multiple && (
        <button onClick={() => next("NEXT_MULTI")} disabled={multiSel.length === 0}
          style={{ ...s.btnMain, marginTop: 8, opacity: multiSel.length === 0 ? 0.4 : 1 }}>
          Confirmar →
        </button>
      )}
      <VerTag />
    </div>
  );

  if (screen === "loading") return (
    <div style={{ ...s.wrap, textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <h2 style={{ color: P, margin: "0 0 8px" }}>Analisando seu perfil...</h2>
      <p style={{ color: "#aaa", fontSize: 14 }}>Gerando sua estratégia personalizada.</p>
      <VerTag />
    </div>
  );

  if (screen === "result") return (
    <div style={s.wrap}>
      {error ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: "#c33", margin: "0 0 8px" }}>Erro ao gerar análise</h3>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Verifique sua conexão e tente novamente.</p>
          <button style={s.btnMain} onClick={() => finish(answers)}>🔄 Tentar novamente</button>
          <button style={s.btnReset} onClick={reset}>Começar do zero</button>
        </div>
      ) : (
        <>
          <h2 style={{ color: P, margin: "0 0 16px" }}>Estratégia para {client.nome}</h2>
          <div style={{ lineHeight: 1.8, color: "#444", fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: renderPlan(plan) }} />
          <button style={s.btnWa}
            onClick={() => window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Olá! Finalizei minha análise no Portal da Consultoria Popular. Sou ${client.nome}, WhatsApp: ${client.whatsapp}.`)}`)}>
            💬 Agendar Consultoria via WhatsApp
          </button>
          <button style={s.btnReset} onClick={reset}>Fazer nova análise</button>
        </>
      )}
      <VerTag />
    </div>
  );

  return null;
}
