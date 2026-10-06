/**
 * Desafio das Palavras — lógica principal
 */

const STORAGE_PALAVRAS = "palavrasJogo";
const STORAGE_CONFIG = "configJogo";
const STORAGE_TEMA = "temaJogo";

const CONFIG_PADRAO = {
  pontosIniciais: 100,
  pontosPorAcerto: 10,
  penalidadeErro: 5,
  somAtivo: true,
  animacoesAtivas: true,
};

const PALAVRAS_EXEMPLO = [
  {
    id: 1,
    palavra: "ABACAXI",
    dica: "Fruta tropical de casca áspera.",
    categoria: "Frutas",
    pontos: 100,
  },
  {
    id: 2,
    palavra: "ELEFANTE",
    dica: "É considerado o maior animal terrestre.",
    categoria: "Animais",
    pontos: 100,
  },
  {
    id: 3,
    palavra: "BRASIL",
    dica: "País localizado na América do Sul.",
    categoria: "Países",
    pontos: 100,
  },
];

const estadoJogo = {
  palavraAtual: null,
  letrasEscolhidas: [],
  letrasCorretas: [],
  letrasErradas: [],
  pontuacao: 0,
  palavrasUsadas: [],
  filaPartida: [],
  ultimaPalavraId: null,
  partidaAtiva: false,
  pausado: false,
  indiceDicaAtual: 0,
};

let config = { ...CONFIG_PADRAO };
let palavras = [];
let audioCtx = null;

/** Normaliza para comparação (A = Á, Ç = C, etc.) */
function normalizarLetra(char) {
  if (!char) return "";
  return char
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ç/g, "C");
}

function ehLetraAdivinhavel(char) {
  return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(char);
}

function ehCaractereFixo(char) {
  return char === " " || char === "-" || char === "'" || char === "’";
}

function obterDicas(item) {
  if (!item) return [];
  if (Array.isArray(item.dicas) && item.dicas.length) return item.dicas;
  if (item.dica) return [item.dica];
  return [];
}

function init() {
  carregarConfiguracoes();
  aplicarTema(localStorage.getItem(STORAGE_TEMA) || "claro");
  carregarPalavras();
  construirTeclado();
  registrarEventos();
  document.getElementById("cad-pontos").value = config.pontosIniciais;
  mostrarTela("inicio");
}

function carregarPalavras() {
  const raw = localStorage.getItem(STORAGE_PALAVRAS);
  if (raw) {
    try {
      palavras = JSON.parse(raw);
      if (!Array.isArray(palavras)) palavras = [];
    } catch {
      palavras = [];
    }
  } else {
    palavras = PALAVRAS_EXEMPLO.map((p) => ({ ...p }));
    salvarPalavras();
  }
}

function salvarPalavras() {
  localStorage.setItem(STORAGE_PALAVRAS, JSON.stringify(palavras));
}

function proximoId() {
  if (!palavras.length) return 1;
  return Math.max(...palavras.map((p) => p.id)) + 1;
}

function carregarConfiguracoes() {
  const raw = localStorage.getItem(STORAGE_CONFIG);
  if (raw) {
    try {
      config = { ...CONFIG_PADRAO, ...JSON.parse(raw) };
    } catch {
      config = { ...CONFIG_PADRAO };
    }
  } else {
    config = { ...CONFIG_PADRAO };
  }
}

function salvarConfiguracoes() {
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
}

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem(STORAGE_TEMA, tema);
  const radio = document.querySelector(`input[name="tema"][value="${tema}"]`);
  if (radio) radio.checked = true;
}

function mostrarTela(nome) {
  document.querySelectorAll(".tela").forEach((el) => {
    const ativa = el.dataset.tela === nome;
    el.hidden = !ativa;
    el.classList.toggle("tela-ativa", ativa);
  });
  if (nome === "lista") renderizarLista();
  if (nome === "configuracoes") preencherFormConfig();
}

function mostrarMensagem(texto, tipo = "info") {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = texto;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function mostrarModal({ titulo, corpoHtml, acoes, classeExtra = "" }) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const card = document.getElementById("modal-card");
    const titleEl = document.getElementById("modal-title");
    const bodyEl = document.getElementById("modal-body");
    const actionsEl = document.getElementById("modal-actions");

    card.className = "modal-card " + classeExtra;
    titleEl.textContent = titulo;
    bodyEl.textContent = "";
    if (typeof corpoHtml === "string" && corpoHtml.includes("<")) {
      bodyEl.innerHTML = corpoHtml;
    } else if (corpoHtml instanceof HTMLElement) {
      bodyEl.appendChild(corpoHtml);
    } else {
      bodyEl.textContent = corpoHtml || "";
    }
    actionsEl.textContent = "";

    acoes.forEach((acao) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn " + (acao.classe || "btn-secondary");
      btn.textContent = acao.rotulo;
      btn.addEventListener("click", () => {
        fecharModal();
        resolve(acao.valor);
      });
      actionsEl.appendChild(btn);
    });

    overlay.classList.remove("hidden");
    const firstBtn = actionsEl.querySelector("button");
    if (firstBtn) firstBtn.focus();
  });
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function validarCadastro(palavra, dica, pontos) {
  if (!palavra.trim()) return "Informe a palavra.";
  if (!dica.trim()) return "Informe a dica.";
  const pts = Number(pontos);
  if (Number.isNaN(pts) || pts < 0) return "Pontuação inválida.";
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(palavra)) return "A palavra precisa conter ao menos uma letra.";
  return null;
}

function cadastrarPalavra(dados) {
  const erro = validarCadastro(dados.palavra, dados.dica, dados.pontos);
  if (erro) return erro;

  const item = {
    id: proximoId(),
    palavra: dados.palavra.trim().toUpperCase(),
    dica: dados.dica.trim(),
    categoria: (dados.categoria || "Geral").trim() || "Geral",
    pontos: Number(dados.pontos) || config.pontosIniciais,
  };
  palavras.push(item);
  salvarPalavras();
  return null;
}

function editarPalavra(id, dados) {
  const idx = palavras.findIndex((p) => p.id === id);
  if (idx === -1) return "Palavra não encontrada.";
  const erro = validarCadastro(dados.palavra, dados.dica, dados.pontos);
  if (erro) return erro;

  palavras[idx] = {
    ...palavras[idx],
    palavra: dados.palavra.trim().toUpperCase(),
    dica: dados.dica.trim(),
    categoria: (dados.categoria || "Geral").trim() || "Geral",
    pontos: Number(dados.pontos) || config.pontosIniciais,
  };
  salvarPalavras();
  return null;
}

function excluirPalavra(id) {
  palavras = palavras.filter((p) => p.id !== id);
  salvarPalavras();
}

function renderizarLista() {
  const container = document.getElementById("lista-palavras");
  const vazia = document.getElementById("lista-vazia");
  const busca = document.getElementById("busca-palavra").value.trim().toLowerCase();
  const cat = document.getElementById("filtro-categoria").value;

  atualizarFiltroCategorias();

  const filtradas = palavras.filter((p) => {
    const matchBusca =
      !busca ||
      p.palavra.toLowerCase().includes(busca) ||
      p.dica.toLowerCase().includes(busca) ||
      (p.categoria || "").toLowerCase().includes(busca);
    const matchCat = !cat || p.categoria === cat;
    return matchBusca && matchCat;
  });

  container.textContent = "";
  if (!palavras.length) {
    vazia.classList.remove("hidden");
    return;
  }
  vazia.classList.toggle("hidden", filtradas.length > 0);
  if (!filtradas.length) {
    const p = document.createElement("p");
    p.className = "lista-vazia";
    p.textContent = "Nenhuma palavra encontrada com esses filtros.";
    container.appendChild(p);
    return;
  }

  filtradas.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card palavra-item";

    const header = document.createElement("div");
    header.className = "palavra-item-header";
    const h3 = document.createElement("h3");
    h3.className = "palavra-item-titulo";
    h3.textContent = item.palavra;
    const meta = document.createElement("span");
    meta.className = "palavra-item-meta";
    meta.textContent = `${item.categoria || "Geral"} · ${item.pontos} pts`;
    header.appendChild(h3);
    header.appendChild(meta);

    const dica = document.createElement("p");
    dica.className = "palavra-item-dica";
    dica.textContent = item.dica;

    const acoes = document.createElement("div");
    acoes.className = "palavra-item-acoes";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn btn-secondary btn-sm";
    btnEdit.textContent = "Editar";
    btnEdit.setAttribute("aria-label", `Editar palavra ${item.palavra}`);
    btnEdit.addEventListener("click", () => abrirEditar(item.id));

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn btn-danger btn-sm";
    btnDel.textContent = "Excluir";
    btnDel.setAttribute("aria-label", `Excluir palavra ${item.palavra}`);
    btnDel.addEventListener("click", () => confirmarExclusao(item.id));

    acoes.appendChild(btnEdit);
    acoes.appendChild(btnDel);
    card.appendChild(header);
    card.appendChild(dica);
    card.appendChild(acoes);
    container.appendChild(card);
  });
}

function atualizarFiltroCategorias() {
  const select = document.getElementById("filtro-categoria");
  const atual = select.value;
  const cats = [...new Set(palavras.map((p) => p.categoria || "Geral"))].sort();
  select.textContent = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Todas as categorias";
  select.appendChild(optAll);
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  select.value = cats.includes(atual) ? atual : "";
}

async function confirmarExclusao(id) {
  const valor = await mostrarModal({
    titulo: "Excluir palavra",
    corpoHtml: "Tem certeza que deseja excluir esta palavra?",
    acoes: [
      { rotulo: "Cancelar", valor: false, classe: "btn-secondary" },
      { rotulo: "Excluir", valor: true, classe: "btn-danger" },
    ],
  });
  if (valor) {
    excluirPalavra(id);
    mostrarMensagem("Palavra excluída.");
    renderizarLista();
  }
}

function abrirEditar(id) {
  const item = palavras.find((p) => p.id === id);
  if (!item) return;
  document.getElementById("edit-id").value = item.id;
  document.getElementById("edit-categoria").value = item.categoria || "";
  document.getElementById("edit-palavra").value = item.palavra;
  document.getElementById("edit-dica").value = item.dica;
  document.getElementById("edit-pontos").value = item.pontos;
  document.getElementById("edit-erro").hidden = true;
  mostrarTela("editar");
}

function preencherFormConfig() {
  document.getElementById("cfg-pontos-iniciais").value = config.pontosIniciais;
  document.getElementById("cfg-pontos-acerto").value = config.pontosPorAcerto;
  document.getElementById("cfg-penalidade").value = config.penalidadeErro;
  document.getElementById("cfg-som").checked = config.somAtivo;
  document.getElementById("cfg-animacoes").checked = config.animacoesAtivas;
  aplicarTema(localStorage.getItem(STORAGE_TEMA) || "claro");
}

function embaralhar(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepararFilaPartida() {
  estadoJogo.filaPartida = embaralhar(palavras.map((p) => p.id));
  estadoJogo.palavrasUsadas = [];
  estadoJogo.ultimaPalavraId = null;
}

function evitarRepeticao() {
  if (!estadoJogo.filaPartida.length) {
    prepararFilaPartida();
  }
  let id = estadoJogo.filaPartida.shift();
  if (palavras.length > 1 && id === estadoJogo.ultimaPalavraId && estadoJogo.filaPartida.length) {
    estadoJogo.filaPartida.push(id);
    id = estadoJogo.filaPartida.shift();
  }
  return palavras.find((p) => p.id === id) || sortearPalavraFallback();
}

function sortearPalavraFallback() {
  const disponiveis = palavras.filter((p) => p.id !== estadoJogo.ultimaPalavraId);
  const pool = disponiveis.length ? disponiveis : palavras;
  return pool[Math.floor(Math.random() * pool.length)];
}

function sortearPalavra() {
  const item = evitarRepeticao();
  estadoJogo.ultimaPalavraId = item.id;
  if (!estadoJogo.palavrasUsadas.includes(item.id)) {
    estadoJogo.palavrasUsadas.push(item.id);
  }
  return item;
}

async function iniciarJogo() {
  if (!palavras.length) {
    await mostrarModal({
      titulo: "Sem palavras",
      corpoHtml:
        "Você ainda não cadastrou nenhuma palavra. Cadastre pelo menos uma palavra para começar.",
      acoes: [
        { rotulo: "Fechar", valor: "fechar", classe: "btn-secondary" },
        { rotulo: "Cadastrar Palavra", valor: "cadastro", classe: "btn-accent" },
      ],
    }).then((v) => {
      if (v === "cadastro") mostrarTela("cadastro");
    });
    return;
  }
  prepararFilaPartida();
  estadoJogo.partidaAtiva = true;
  estadoJogo.pausado = false;
  const sorteada = sortearPalavra();
  aplicarPalavraNoJogo(sorteada);
  mostrarTela("jogo");
  tocarSom("nova");
}

function aplicarPalavraNoJogo(item) {
  estadoJogo.palavraAtual = { ...item, dicas: obterDicas(item) };
  estadoJogo.letrasEscolhidas = [];
  estadoJogo.letrasCorretas = [];
  estadoJogo.letrasErradas = [];
  estadoJogo.pontuacao = item.pontos ?? config.pontosIniciais;
  estadoJogo.indiceDicaAtual = 0;
  estadoJogo.pausado = false;

  document.getElementById("jogo-categoria").textContent = item.categoria || "Geral";
  atualizarDicaNaTela();
  atualizarPontuacaoDisplay();
  limparFeedback();
  mostrarPalavra();
  resetarTeclado();
}

function atualizarDicaNaTela() {
  const dicas = obterDicas(estadoJogo.palavraAtual);
  const texto = dicas[estadoJogo.indiceDicaAtual] || "";
  document.getElementById("jogo-dica").textContent = texto;
  const btnExtra = document.getElementById("btn-outra-dica");
  const temMais = dicas.length > 1 && estadoJogo.indiceDicaAtual < dicas.length - 1;
  btnExtra.classList.toggle("hidden", !temMais);
}

function mostrarPalavra() {
  const container = document.getElementById("palavra-container");
  container.textContent = "";
  const palavra = estadoJogo.palavraAtual.palavra;

  for (let i = 0; i < palavra.length; i++) {
    const ch = palavra[i];
    const slot = document.createElement("div");
    slot.dataset.index = String(i);

    if (ch === " ") {
      slot.className = "letra-slot espaco";
      slot.setAttribute("aria-hidden", "true");
      slot.textContent = "";
    } else if (ehCaractereFixo(ch) && !ehLetraAdivinhavel(ch)) {
      slot.className = "letra-slot fixo";
      slot.textContent = ch;
      slot.setAttribute("aria-label", `Caractere ${ch}`);
    } else if (!ehLetraAdivinhavel(ch)) {
      slot.className = "letra-slot fixo";
      slot.textContent = ch;
    } else {
      const revelada = letraReveladaNaPosicao(i);
      slot.className = "letra-slot" + (revelada ? " revelada" : "");
      slot.textContent = revelada ? ch : "_";
      slot.setAttribute("aria-label", revelada ? `Letra ${ch}` : "Letra oculta");
    }
    container.appendChild(slot);
  }
}

function letraReveladaNaPosicao(index) {
  const ch = estadoJogo.palavraAtual.palavra[index];
  if (!ehLetraAdivinhavel(ch)) return true;
  const norm = normalizarLetra(ch);
  return estadoJogo.letrasCorretas.some((l) => normalizarLetra(l) === norm);
}

function indicesDaLetra(letra) {
  const alvo = normalizarLetra(letra);
  const palavra = estadoJogo.palavraAtual.palavra;
  const indices = [];
  for (let i = 0; i < palavra.length; i++) {
    if (ehLetraAdivinhavel(palavra[i]) && normalizarLetra(palavra[i]) === alvo) {
      indices.push(i);
    }
  }
  return indices;
}

function verificarLetra(letra) {
  const norm = normalizarLetra(letra);
  if (!norm || norm.length !== 1 || !/[A-Z]/.test(norm)) return null;
  if (estadoJogo.letrasEscolhidas.some((l) => normalizarLetra(l) === norm)) return "usada";
  return indicesDaLetra(letra).length > 0 ? "correta" : "errada";
}

function tentarLetra(letra) {
  if (!estadoJogo.partidaAtiva || estadoJogo.pausado || !estadoJogo.palavraAtual) return;

  const resultado = verificarLetra(letra);
  if (resultado === null || resultado === "usada") return;

  const norm = normalizarLetra(letra);
  estadoJogo.letrasEscolhidas.push(norm);

  if (resultado === "correta") {
    if (!estadoJogo.letrasCorretas.includes(norm)) estadoJogo.letrasCorretas.push(norm);
    estadoJogo.pontuacao = Math.max(0, estadoJogo.pontuacao + config.pontosPorAcerto);
    marcarTecla(norm, "correta");
    mostrarFeedback("CORRETO! 🎉", "acerto");
    tocarSom("acerto");
    animarAcerto();
  } else {
    estadoJogo.letrasErradas.push(norm);
    if (config.penalidadeErro > 0) {
      estadoJogo.pontuacao = Math.max(0, estadoJogo.pontuacao - config.penalidadeErro);
    }
    marcarTecla(norm, "errada");
    mostrarFeedback("ESSA LETRA NÃO ESTÁ NA PALAVRA!", "erro");
    tocarSom("erro");
  }

  atualizarPontuacaoDisplay();
  mostrarPalavra();
  verificarVitoria();
}

function mostrarFeedback(msg, tipo) {
  const el = document.getElementById("feedback-jogo");
  el.textContent = msg;
  el.className = "feedback-jogo " + (tipo || "");
  if (!config.animacoesAtivas) return;
  setTimeout(() => {
    if (el.textContent === msg) el.className = "feedback-jogo";
  }, 2000);
}

function limparFeedback() {
  const el = document.getElementById("feedback-jogo");
  el.textContent = "";
  el.className = "feedback-jogo";
}

function atualizarPontuacaoDisplay() {
  document.getElementById("jogo-pontuacao").textContent = `${estadoJogo.pontuacao} pts`;
}

function palavraCompletamenteRevelada() {
  const palavra = estadoJogo.palavraAtual.palavra;
  for (let i = 0; i < palavra.length; i++) {
    if (ehLetraAdivinhavel(palavra[i]) && !letraReveladaNaPosicao(i)) return false;
  }
  return true;
}

function verificarVitoria() {
  if (palavraCompletamenteRevelada()) {
    estadoJogo.partidaAtiva = false;
    mostrarTelaVitoria();
  }
}

async function mostrarTelaVitoria() {
  tocarSom("vitoria");
  if (config.animacoesAtivas) criarConfetes();

  const item = estadoJogo.palavraAtual;
  const body = document.createElement("div");
  const p1 = document.createElement("p");
  p1.textContent = "Você descobriu:";
  const palavraEl = document.createElement("p");
  palavraEl.className = "palavra-revelada";
  palavraEl.textContent = item.palavra;
  const pts = document.createElement("p");
  pts.textContent = `Pontuação: ${estadoJogo.pontuacao} pontos`;
  const dica = document.createElement("p");
  dica.textContent = item.dica || obterDicas(item)[0] || "";
  body.appendChild(p1);
  body.appendChild(palavraEl);
  body.appendChild(pts);
  body.appendChild(dica);

  await mostrarModal({
    titulo: "🎉 PARABÉNS! 🎉",
    corpoHtml: body,
    classeExtra: "modal-vitoria",
    acoes: [
      { rotulo: "➡️ Próxima Palavra", valor: "proxima", classe: "btn-accent" },
      { rotulo: "🏠 Voltar ao Início", valor: "inicio", classe: "btn-secondary" },
    ],
  }).then((v) => {
    if (v === "proxima") proximaPalavra();
    else if (v === "inicio") {
      estadoJogo.partidaAtiva = false;
      mostrarTela("inicio");
    }
  });
}

function proximaPalavra() {
  if (!palavras.length) return;
  estadoJogo.partidaAtiva = true;
  const sorteada = sortearPalavra();
  aplicarPalavraNoJogo(sorteada);
  tocarSom("nova");
}

async function resolverPalavra() {
  if (!estadoJogo.partidaAtiva || estadoJogo.pausado) return;

  const wrap = document.createElement("div");
  const label = document.createElement("label");
  label.setAttribute("for", "input-resolver");
  label.textContent = "Digite sua resposta";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "input-resolver";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Digite sua resposta");
  wrap.appendChild(label);
  wrap.appendChild(input);

  const valor = await mostrarModal({
    titulo: "🎯 Resolver palavra",
    corpoHtml: wrap,
    acoes: [
      { rotulo: "Cancelar", valor: false, classe: "btn-secondary" },
      { rotulo: "Confirmar", valor: true, classe: "btn-accent" },
    ],
  });

  if (!valor) return;
  const resposta = input.value.trim().toUpperCase();
  const alvo = estadoJogo.palavraAtual.palavra;

  if (resposta === alvo) {
    revelarPalavraCompleta();
    estadoJogo.partidaAtiva = false;
    mostrarTelaVitoria();
  } else {
    if (config.penalidadeErro > 0) {
      estadoJogo.pontuacao = Math.max(0, estadoJogo.pontuacao - config.penalidadeErro);
      atualizarPontuacaoDisplay();
    }
    tocarSom("erro");
    mostrarMensagem("Resposta incorreta!");
  }
}

function revelarPalavraCompleta() {
  const palavra = estadoJogo.palavraAtual.palavra;
  for (let i = 0; i < palavra.length; i++) {
    if (ehLetraAdivinhavel(palavra[i])) {
      const n = normalizarLetra(palavra[i]);
      if (!estadoJogo.letrasCorretas.includes(n)) estadoJogo.letrasCorretas.push(n);
    }
  }
  mostrarPalavra();
}

async function pausarJogo() {
  if (!estadoJogo.partidaAtiva) return;
  estadoJogo.pausado = true;
  const v = await mostrarModal({
    titulo: "Jogo pausado",
    corpoHtml: "O que deseja fazer?",
    acoes: [
      { rotulo: "Continuar", valor: "continuar", classe: "btn-accent" },
      { rotulo: "Reiniciar", valor: "reiniciar", classe: "btn-secondary" },
      { rotulo: "Sair", valor: "sair", classe: "btn-ghost" },
    ],
  });
  if (v === "continuar") estadoJogo.pausado = false;
  else if (v === "reiniciar") reiniciarPartida();
  else if (v === "sair") {
    estadoJogo.partidaAtiva = false;
    estadoJogo.pausado = false;
    mostrarTela("inicio");
  } else estadoJogo.pausado = false;
}

async function reiniciarPartida() {
  const ok = await mostrarModal({
    titulo: "Reiniciar partida",
    corpoHtml: "Deseja reiniciar a partida? A fila de palavras será embaralhada novamente.",
    acoes: [
      { rotulo: "Cancelar", valor: false, classe: "btn-secondary" },
      { rotulo: "Reiniciar", valor: true, classe: "btn-accent" },
    ],
  });
  if (!ok) {
    estadoJogo.pausado = false;
    return;
  }
  prepararFilaPartida();
  estadoJogo.partidaAtiva = true;
  aplicarPalavraNoJogo(sortearPalavra());
}

function construirTeclado() {
  const teclado = document.getElementById("teclado-virtual");
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  teclado.textContent = "";
  letras.forEach((L) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tecla";
    btn.textContent = L;
    btn.dataset.letra = L;
    btn.setAttribute("aria-label", `Letra ${L}`);
    btn.addEventListener("click", () => {
      tocarSom("clique");
      tentarLetra(L);
    });
    teclado.appendChild(btn);
  });
}

function resetarTeclado() {
  document.querySelectorAll(".tecla").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correta", "errada");
  });
}

function marcarTecla(letraNorm, tipo) {
  document.querySelectorAll(".tecla").forEach((btn) => {
    if (btn.dataset.letra && normalizarLetra(btn.dataset.letra) === letraNorm) {
      btn.disabled = true;
      btn.classList.add(tipo);
    }
  });
}

function animarAcerto() {
  if (!config.animacoesAtivas) return;
  document.getElementById("palavra-container").classList.add("pulse-once");
  setTimeout(() => document.getElementById("palavra-container").classList.remove("pulse-once"), 500);
}

function criarConfetes() {
  const container = document.getElementById("confetti-container");
  const cores = ["#fbbf24", "#7c3aed", "#3b82f6", "#22c55e", "#ef4444", "#fde047"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = Math.random() * 100 + "%";
    el.style.background = cores[Math.floor(Math.random() * cores.length)];
    el.style.animationDuration = 2 + Math.random() * 2 + "s";
    el.style.animationDelay = Math.random() * 0.5 + "s";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    container.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

function obterAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

function tocarSom(tipo) {
  if (!config.somAtivo) return;
  const ctx = obterAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const presets = {
    acerto: { f: 880, d: 0.12, type: "sine" },
    erro: { f: 180, d: 0.2, type: "sawtooth" },
    vitoria: { f: 523, d: 0.35, type: "triangle" },
    clique: { f: 420, d: 0.05, type: "sine" },
    nova: { f: 660, d: 0.15, type: "sine" },
  };
  const p = presets[tipo] || presets.clique;
  osc.type = p.type;
  osc.frequency.setValueAtTime(p.f, now);
  if (tipo === "vitoria") {
    osc.frequency.setValueAtTime(659, now + 0.12);
    osc.frequency.setValueAtTime(784, now + 0.24);
  }
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + p.d);
  osc.start(now);
  osc.stop(now + p.d);
}

function registrarEventos() {
  document.querySelectorAll("[data-acao]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tocarSom("clique");
      const acao = btn.dataset.acao;
      if (acao === "jogar") iniciarJogo();
      else mostrarTela(acao);
    });
  });

  document.querySelectorAll("[data-voltar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tocarSom("clique");
      mostrarTela(btn.dataset.voltar);
    });
  });

  document.getElementById("form-cadastro").addEventListener("submit", (e) => {
    e.preventDefault();
    const erroEl = document.getElementById("cad-erro");
    const err = cadastrarPalavra({
      categoria: document.getElementById("cad-categoria").value,
      palavra: document.getElementById("cad-palavra").value,
      dica: document.getElementById("cad-dica").value,
      pontos: document.getElementById("cad-pontos").value,
    });
    if (err) {
      erroEl.textContent = err;
      erroEl.hidden = false;
      return;
    }
    erroEl.hidden = true;
    document.getElementById("form-cadastro").reset();
    document.getElementById("cad-pontos").value = config.pontosIniciais;
    mostrarMensagem("Palavra cadastrada com sucesso!");
  });

  document.getElementById("form-editar").addEventListener("submit", (e) => {
    e.preventDefault();
    const erroEl = document.getElementById("edit-erro");
    const id = Number(document.getElementById("edit-id").value);
    const err = editarPalavra(id, {
      categoria: document.getElementById("edit-categoria").value,
      palavra: document.getElementById("edit-palavra").value,
      dica: document.getElementById("edit-dica").value,
      pontos: document.getElementById("edit-pontos").value,
    });
    if (err) {
      erroEl.textContent = err;
      erroEl.hidden = false;
      return;
    }
    erroEl.hidden = true;
    mostrarMensagem("Alterações salvas!");
    mostrarTela("lista");
  });

  document.getElementById("form-config").addEventListener("submit", (e) => {
    e.preventDefault();
    config.pontosIniciais = Number(document.getElementById("cfg-pontos-iniciais").value) || 0;
    config.pontosPorAcerto = Number(document.getElementById("cfg-pontos-acerto").value) || 0;
    config.penalidadeErro = Number(document.getElementById("cfg-penalidade").value) || 0;
    config.somAtivo = document.getElementById("cfg-som").checked;
    config.animacoesAtivas = document.getElementById("cfg-animacoes").checked;
    const tema = document.querySelector('input[name="tema"]:checked')?.value || "claro";
    salvarConfiguracoes();
    aplicarTema(tema);
    mostrarMensagem("Configurações salvas!");
  });

  document.getElementById("busca-palavra").addEventListener("input", renderizarLista);
  document.getElementById("filtro-categoria").addEventListener("change", renderizarLista);
  document.getElementById("btn-nova-palavra-lista").addEventListener("click", () => mostrarTela("cadastro"));

  document.getElementById("btn-pausar").addEventListener("click", pausarJogo);
  document.getElementById("btn-resolver").addEventListener("click", resolverPalavra);
  document.getElementById("btn-reiniciar-partida").addEventListener("click", reiniciarPartida);

  document.getElementById("btn-outra-dica").addEventListener("click", () => {
    const dicas = obterDicas(estadoJogo.palavraAtual);
    if (estadoJogo.indiceDicaAtual < dicas.length - 1) {
      estadoJogo.indiceDicaAtual++;
      atualizarDicaNaTela();
      tocarSom("clique");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!estadoJogo.partidaAtiva || estadoJogo.pausado) return;
    const telaJogo = document.getElementById("tela-jogo");
    if (telaJogo.hidden) return;
    if (e.key.length !== 1) return;
    if (!/^[a-zA-Z]$/.test(e.key)) return;
    e.preventDefault();
    tentarLetra(e.key.toUpperCase());
  });

}

document.addEventListener("DOMContentLoaded", init);
