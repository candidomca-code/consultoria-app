const QUESTIONS = [
  // PERFIL E RELACIONAMENTO
  { id: "estado_civil", sec: "👤 Perfil", q: "Qual o seu estado civil?", opts: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Outro"] },
  { 
    id: "relacionamento_multiplo", 
    sec: "👤 Perfil", 
    q: "Você mantém mais de um relacionamento afetivo ou união simultânea?", 
    opts: ["Sim", "Não"],
    showIf: { id: "estado_civil", vals: ["Outro"] } 
  },
  { 
    id: "ciencia_relacionamentos", 
    sec: "👤 Perfil", 
    q: "As demais pessoas sabem umas das outras?", 
    opts: ["Sim, todas sabem", "Não", "Algumas sabem"],
    showIf: { id: "relacionamento_multiplo", vals: ["Sim"] } 
  },

  // FAMÍLIA (A partir daqui continua o que você já tem...)
  { id: "tem_filhos", sec: "👨‍👩‍👧 Família", q: "Você possui filhos?", opts: ["Sim", "Não"] },
  { 
    id: "mora_filhos", 
    sec: "👨‍👩‍👧 Família", 
    q: "Mora com os filhos?", 
    opts: ["Sim, com todos", "Sim, com alguns", "Não, com nenhum"],
    showIf: { id: "tem_filhos", vals: ["Sim"] } 
  },
  