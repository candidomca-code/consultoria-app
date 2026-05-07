import { useState } from "react";

const P = "#7F77DD"; 
const ADMIN_WHATSAPP = "5551989640834"; 

const QUESTIONS = [
  { id: "estado_civil", sec: "👤 Perfil", q: "Qual o seu estado civil?", opts: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Outro"] },
  { id: "tem_filhos", sec: "👨‍👩‍👧 Família", q: "Você possui filhos?", opts: ["Sim", "Não"] },
  { 
    id: "mora_filhos", 
    sec: "👨‍👩‍👧 Família", 
    q: "Mora com os filhos?", 
    opts: ["Sim, com todos", "Sim, com alguns", "Não, com nenhum"],
    showIf: { id: "tem_filhos", vals: ["Sim"] } 
  },
  { 
    id: "filho_menor", 
    sec: "👨‍👩‍👧 Família", 
    q: "Algum dos filhos é menor de idade?", 
    opts: ["Sim", "Não"], 
    showIf: { id: "mora_filhos", vals: ["Sim, com alguns", "Não, com nenhum"] } 
  },
  { 
    id: "tipo_pensao", 
    sec: "👨‍👩‍👧 Família", 
    q: "Sobre a pensão do menor:", 
    opts: ["Paga pensão Judicial", "Paga pensão Espontânea", "Não paga pensão"], 
    showIf: { id: "filho_menor", vals: ["Sim"] } 
  },
  { 
    id: "contato_filhos", 
    sec: "👨‍👩‍👧 Família", 
    q: "Tem contato com todos eles?", 
    opts: ["Sim", "Não", "Com a maioria"],
    showIf: { id: "tem_filhos", vals: ["Sim"] }
  },
  { id: "moradia", sec: "🏠 Patrimônio", q: "Qual sua situação de moradia?", opts: ["Própria quitada", "Própria financiada", "Alugada", "Emprestada/Ocupada"] },
  { id: "outros_imoveis", sec: "🏠 Patrimônio", q: "Você tem ou custeia outros imóveis?", opts: ["Sim", "Não"] },
  { id: "gasto_luz", sec: "🏠 Patrimônio", q: "Qual o valor médio da conta de luz?", opts: ["Até R$ 150", "R$ 150 a R$ 400", "R$ 400 a R$ 800", "Acima de R$ 800"] },
  { id: "tem_veiculo", sec: "🚗 Mobilidade", q: "Possui veículo?", opts: ["Sim", "Não"] },
  { 
    id: "tipos_veiculo", 
    sec: "🚗 Mobilidade", 
    q: "Quais tipos?", 
    multiple: true,
    opts: ["Carro(s)", "Moto(s)", "Outro(s)"], 
    showIf: { id: "tem_veiculo", vals: ["Sim"] } 
  },
  { 
    id: "veiculo_financiado", 
    sec: "🚗 Mobilidade", 
    q: "Algum deles é Financiado/Alienado?", 
    opts: ["Sim", "Não"], 
    showIf: { id: "tem_veiculo", vals: ["Sim"] } 
  },
  { 
    id: "veiculo_atraso", 
    sec: "🚗 Mobilidade", 
    q: "Algum com parcelas em atraso?", 
    opts: ["Sim", "Não"], 
    showIf: { id: "veiculo_financiado", vals: ["Sim"] } 
  },
  { 
    id: "gasto_combustivel", 
    sec: "🚗 Mobilidade", 
    q: "Gasto mensal com combustível/manutenção:", 
    opts: ["Até R$ 300", "R$ 300 a R$ 600", "R$ 600 a R$ 1.200", "Acima de R$ 1.200"],
    showIf: { id: "tem_veiculo", vals: ["Sim"] }
  },
  { id: "situacao_prof", sec: "💼 Profissional", q: "Sua situação profissional atual:", multiple: true, opts: ["CLT", "Empresário", "Autônomo/Profissional Liberal", "Aposentado/Pensionista", "Desempregado"] },
  { id: "negativado", sec: "🏦 Financeiro", q: "Seu nome está negativado (SPC, Serasa ou outro banco de dados)?", opts: ["Sim", "Não", "Não sei informar"] },
  { id: "sonhos", sec: "⭐ Objetivo", q: "Quais seus sonhos após quitar as dívidas?", multiple: true, opts: ["Comprar/Reformar casa", "Trocar de carro", "Viajar com a família", "Investir no próprio negócio", "Outros"] }
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
  const [history, setHistory] = useState([]); // Guarda os índices passados

  const visibleQs = QUESTIONS.filter(q => isVisible(q, answers));
  const currentQ = visibleQs[idx];

  const validateWhatsApp = (num) => {
    const clean = num.replace(/\D/g, "");
    return clean.length >= 10 && clean.length <= 11;
  };

  async function callIA(finalAnswers) {
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
            content: `Você é Cândido Nathanael, especialista em Direito Popular. Analise estes dados do cliente ${client.nome}: ${JSON.stringify(finalAnswers)}. Gere um plano de ação direto com autoridade e linguagem simples. Use **negrito**.` 
          }] 
        })
      });
      const data = await res.json();
      return data.content ? data.content[0].text : "Erro ao gerar resposta da IA.";
    } catch (e) { return "Erro técnico na conexão."; }
  }

  const next = (val) => {
    let finalVal = val;
    if (currentQ.multiple) {
      if (val === "NEXT_MULTI") finalVal = multiSel;
      else return;
    }
    setHistory([...history, idx]);
    const upd = { ...answers, [currentQ.id]: finalVal };