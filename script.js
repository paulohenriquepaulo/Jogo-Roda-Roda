/**
 * Desafio das Palavras — lógica principal (versão multijogador)
 *
 * Organização do arquivo:
 *  1. Constantes e estado
 *  2. Utilitários de texto
 *  3. Persistência (LocalStorage) e migração de dados antigos
 *  4. Telas, toasts e modais
 *  5. Cadastro / edição / lista de palavras
 *  6. Configurar partida (jogadores + quantidade de palavras)
 *  7. Fluxo da partida (rodadas, jogadores, dicas, pontuação, passar a vez)
 *  8. Renderização do jogo (palavra, teclado, placar)
 *  9. Resultado final
 * 10. Modo apresentação / tela cheia
 * 11. Áudio, confetes e eventos
 */

/* ==========================================================================
   1. CONSTANTES E ESTADO
   ========================================================================== */

const STORAGE_PALAVRAS = "palavrasJogo";
const STORAGE_CONFIG = "configJogo";
const STORAGE_TEMA = "temaJogo";
const STORAGE_BANCO = "bancoBiblicoV1";

const MAX_JOGADORES = 8;
const MAX_DICAS = 3;
const MAX_PALAVRAS = 3; // palavras por desafio
const OPCOES_QTD_PALAVRAS = [5, 10, 15, 20, 25, 30];
const OPCOES_PENALIDADE_DICA = [0, 5, 10];
const TELAS_DE_JOGO = ["jogo", "transicao", "final"];

/**
 * Regra de pontuação das dicas: a DICA 1 aparece automaticamente em toda rodada.
 * false  -> cada dica exibida (inclusive a 1ª) reduz o valor da palavra (100 → 95 → 90 → 85).
 * true   -> a 1ª dica é gratuita; só a 2ª e a 3ª reduzem o valor (100 → 100 → 95 → 90).
 */
const PRIMEIRA_DICA_GRATIS = false;

const CONFIG_PADRAO = {
  pontosIniciais: 100, // valor sugerido ao cadastrar uma palavra nova
  pontosPorLetra: 5, // ganho do jogador por letra correta
  penalidadeErro: 5, // perda do jogador atual por letra/resposta errada
  penalidadeDica: 5, // redução do valor da palavra por dica exibida
  somAtivo: true,
  animacoesAtivas: true,
};

/** Banco inicial: 50 desafios bíblicos (palavra, dicas). */
const BANCO_BIBLICO = [
  ["ADÃO", ["Primeiro homem criado por Deus.", "Viveu no Jardim do Éden."]],
  ["EVA", ["Primeira mulher criada por Deus.", "Foi formada a partir da costela de Adão."]],
  ["NOÉ", ["Construiu uma grande arca.", "Salvou sua família e os animais do dilúvio.", "Recebeu o arco-íris como sinal da aliança."]],
  ["ABRAÃO", ["É chamado de pai da fé.", "Deus prometeu que sua descendência seria numerosa como as estrelas."]],
  ["ISAQUE", ["Filho de Abraão e Sara.", "Quase foi oferecido em sacrifício."]],
  ["JACÓ", ["Recebeu o nome de Israel.", "Sonhou com uma escada que chegava ao céu.", "Teve doze filhos."]],
  ["JOSÉ", ["Foi vendido pelos irmãos.", "Tornou-se governador do Egito.", "Ganhou do pai uma túnica colorida."]],
  ["MOISÉS", ["Libertou o povo hebreu do Egito.", "Recebeu os Dez Mandamentos no monte."]],
  ["ARÃO", ["Era irmão de Moisés.", "Foi o primeiro sumo sacerdote."]],
  ["JOSUÉ", ["Sucedeu Moisés como líder.", "Viu as muralhas de Jericó caírem."]],
  ["DÉBORA", ["Foi juíza e profetisa de Israel.", "Liderou o povo junto com Baraque."]],
  ["SANSÃO", ["Tinha força extraordinária.", "Sua força estava nos cabelos.", "Foi traído por Dalila."]],
  ["RUTE", ["Mulher de Moabe fiel à sogra Noemi.", "Casou-se com Boaz."]],
  ["SAMUEL", ["Profeta que ungiu Saul e Davi.", "Foi dedicado a Deus por sua mãe, Ana."]],
  ["SAUL", ["Foi o primeiro rei de Israel.", "Foi o primeiro rei, e Davi o sucedeu depois de sua queda."]],
  ["DAVI", ["Venceu um gigante com uma pedra.", "Foi rei de Israel e escreveu salmos."]],
  ["GOLIAS", ["Era um gigante filisteu.", "Foi derrotado por um jovem pastor."]],
  ["SALOMÃO", ["Rei famoso pela sabedoria.", "Construiu o primeiro templo em Jerusalém.", "Era filho de Davi."]],
  ["ELIAS", ["Profeta levado ao céu num redemoinho.", "Enfrentou os profetas de Baal no monte Carmelo."]],
  ["ELISEU", ["Foi sucessor do profeta Elias.", "Recebeu uma porção dobrada do espírito de seu mestre."]],
  ["JONAS", ["Foi engolido por um grande peixe.", "Pregou na cidade de Nínive."]],
  ["DANIEL", ["Foi lançado na cova dos leões.", "Interpretava sonhos na Babilônia.", "Seus amigos foram salvos da fornalha."]],
  ["ESTER", ["Rainha que salvou seu povo.", "Seu primo se chamava Mardoqueu."]],
  ["JÓ", ["Homem que enfrentou grandes sofrimentos.", "É exemplo de paciência e fé."]],
  ["MARIA", ["Foi a mãe de Jesus.", "Recebeu a visita do anjo Gabriel."]],
  ["JESUS", ["É o Filho de Deus.", "Nasceu em Belém.", "Foi crucificado e ressuscitou ao terceiro dia."]],
  ["PEDRO", ["Era pescador antes de seguir Jesus.", "Negou o Mestre três vezes."]],
  ["PAULO", ["Antes se chamava Saulo.", "Escreveu várias cartas do Novo Testamento.", "Fez viagens missionárias."]],
  ["JOÃO BATISTA", ["Batizou Jesus no rio Jordão.", "Anunciou a vinda do Messias."]],
  ["LÁZARO", ["Foi ressuscitado por Jesus.", "Era irmão de Marta e Maria."]],
  ["JUDAS", ["Traiu Jesus por trinta moedas de prata."]],
  ["MATEUS", ["Era cobrador de impostos.", "Tornou-se apóstolo e escreveu um evangelho."]],
  ["GÊNESIS", ["É o primeiro livro da Bíblia.", "Conta a criação do mundo."]],
  ["ÊXODO", ["Livro que narra a saída do povo do Egito."]],
  ["SALMOS", ["Livro de cânticos e orações.", "Muitos foram escritos por Davi."]],
  ["PROVÉRBIOS", ["Livro de ditados de sabedoria.", "É atribuído em grande parte a Salomão."]],
  ["APOCALIPSE", ["É o último livro da Bíblia.", "Foi escrito por João na ilha de Patmos."]],
  ["EVANGELHO", ["Significa boa notícia.", "Mateus, Marcos, Lucas e João escreveram os seus."]],
  ["ÉDEN", ["Jardim onde viveram Adão e Eva."]],
  ["BELÉM", ["Cidade onde Jesus nasceu.", "Também foi a cidade do rei Davi."]],
  ["JERUSALÉM", ["É a cidade santa de Israel.", "Ali ficava o templo construído por Salomão."]],
  ["NAZARÉ", ["Cidade onde Jesus cresceu."]],
  ["JORDÃO", ["Rio onde Jesus foi batizado.", "O povo o atravessou para entrar na terra prometida."]],
  ["EGITO", ["Terra onde os hebreus foram escravos.", "Sofreu dez pragas."]],
  ["BABEL", ["Torre que os homens tentaram construir até o céu.", "Ali as línguas foram confundidas."]],
  ["SINAI", ["Monte onde Moisés recebeu a Lei."]],
  ["CANAÃ", ["Era a terra prometida ao povo de Israel.", "Dizia-se que nela corria leite e mel."]],
  ["ARCA DE NOÉ", ["Grande embarcação construída por ordem de Deus.", "Abrigou casais de animais durante o dilúvio."]],
  ["MANÁ", ["Alimento que caiu do céu no deserto.", "Sustentou os hebreus por quarenta anos."]],
  ["PENTECOSTES", ["Dia em que o Espírito Santo desceu sobre os discípulos.", "Eles falaram em outras línguas."]],
].map(([palavra, dicas], i) => ({ id: i + 1, palavra, termos: [palavra], categoria: "Bíblia", dicas, pontos: 100 }));

const PALAVRAS_EXEMPLO = BANCO_BIBLICO;

/** Exemplos antigos (sem relação bíblica) removidos na migração do banco. */
const EXEMPLOS_ANTIGOS = [
  ["ABACAXI", "Frutas"],
  ["ELEFANTE", "Animais"],
  ["BRASIL", "Países"],
];

function estadoInicialPartida() {
  return {
    jogadores: [],
    quantidadeJogadores: 0,
    indiceJogadorAtual: 0,
    palavras: [],
    indicePalavraAtual: 0,
    totalPalavras: 0,
    palavraAtual: null,
    dicasExibidas: 0,
    pontosDaPalavra: 0,
    partidaAtiva: false,
    // controle interno
    rodadaEmAndamento: false, // true somente quando o jogador pode agir
    pausado: false,
    passesNaPalavra: 0, // quantas vezes a vez foi passada na palavra atual
    modoTransicao: "nova", // "nova" | "continuar"
    letrasEscolhidas: [],
    letrasCorretas: [],
    letrasErradas: [],
  };
}

const partida = estadoInicialPartida();

let config = { ...CONFIG_PADRAO };
let palavras = [];
let audioCtx = null;
let configPartidaInicializada = false;

const $ = (id) => document.getElementById(id);

function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/* ==========================================================================
   2. UTILITÁRIOS DE TEXTO
   ========================================================================== */

/** Normaliza para comparação (A = Á, Ç = C, etc.) */
function normalizarLetra(char) {
  if (!char) return "";
  return char
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ç/g, "C");
}

/** Normaliza uma resposta inteira: sem acentos, espaços, hífens ou apóstrofos. */
function normalizarResposta(texto) {
  return normalizarLetra(String(texto || "")).replace(/[^A-Z0-9]/g, "");
}

function ehLetraAdivinhavel(char) {
  return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(char);
}

function ehCaractereFixo(char) {
  return char === " " || char === "-" || char === "'" || char === "’";
}

function textoPontos(n) {
  return `${n} ${n === 1 ? "ponto" : "pontos"}`;
}

/** Aceita o formato novo (dicas: []) e o antigo (dica: "..."). */
function obterDicas(item) {
  if (!item) return [];
  if (Array.isArray(item.dicas)) {
    const lista = item.dicas.map((d) => String(d ?? "").trim()).filter(Boolean);
    if (lista.length) return lista;
  }
  if (typeof item.dica === "string" && item.dica.trim()) return [item.dica.trim()];
  return [];
}

/** Palavras do desafio: formato novo (termos: []) ou antigo (palavra: "..."). */
function obterTermos(item) {
  if (!item) return [];
  if (Array.isArray(item.termos)) {
    const lista = item.termos.map((t) => String(t ?? "").trim().toUpperCase()).filter(Boolean);
    if (lista.length) return lista;
  }
  const unica = String(item.palavra || "").trim().toUpperCase();
  return unica ? [unica] : [];
}

/* ==========================================================================
   3. PERSISTÊNCIA E MIGRAÇÃO
   ========================================================================== */

function init() {
  carregarConfiguracoes();
  aplicarTema(localStorage.getItem(STORAGE_TEMA) || "claro");
  carregarPalavras();
  migrarBancoBiblico();
  construirTeclado();
  construirSeletoresPartida();
  construirBlocosDesafio("cad");
  construirBlocosDesafio("edit");
  registrarEventos();
  $("cad-pontos").value = config.pontosIniciais;
  mostrarTela("inicio");
}

/** Converte um registro (novo ou antigo) para o modelo atual. Não perde dados. */
function normalizarPalavraSalva(p) {
  const pontos = Number(p.pontos);
  const termos = obterTermos(p);
  return {
    id: Number(p.id) || 0,
    palavra: termos[0] || "",
    termos,
    categoria: String(p.categoria || "Geral").trim() || "Geral",
    dicas: obterDicas(p),
    pontos: Number.isFinite(pontos) && pontos >= 0 ? Math.round(pontos) : config.pontosIniciais,
  };
}

function carregarPalavras() {
  const raw = localStorage.getItem(STORAGE_PALAVRAS);
  if (!raw) {
    palavras = PALAVRAS_EXEMPLO.map((p) => ({ ...p, dicas: [...p.dicas] }));
    salvarPalavras();
    return;
  }
  try {
    const dados = JSON.parse(raw);
    palavras = Array.isArray(dados) ? dados.filter((p) => p && obterTermos(p).length).map(normalizarPalavraSalva) : [];
  } catch {
    palavras = [];
    return;
  }
  // garante ids únicos
  const usados = new Set();
  let maior = Math.max(0, ...palavras.map((p) => p.id));
  palavras.forEach((p) => {
    if (!p.id || usados.has(p.id)) p.id = ++maior;
    usados.add(p.id);
  });
  // grava a versão migrada (dica -> dicas) se algo mudou
  if (JSON.stringify(palavras) !== raw) salvarPalavras();
}

/**
 * Executa uma única vez: remove os 3 exemplos antigos (sem tema bíblico), se ainda existirem,
 * e acrescenta os 50 desafios bíblicos que ainda não estiverem cadastrados.
 * Palavras cadastradas pelo usuário não são alteradas.
 */
function migrarBancoBiblico() {
  if (localStorage.getItem(STORAGE_BANCO)) return;
  palavras = palavras.filter((p) => {
    const termos = obterTermos(p);
    return !(termos.length === 1 && EXEMPLOS_ANTIGOS.some(([w, c]) => w === termos[0] && c === p.categoria));
  });
  const existentes = new Set(palavras.map((p) => obterTermos(p).join("|")));
  BANCO_BIBLICO.forEach((item) => {
    if (existentes.has(item.palavra)) return;
    palavras.push({ ...item, id: proximoId(), termos: [...item.termos], dicas: [...item.dicas] });
  });
  salvarPalavras();
  localStorage.setItem(STORAGE_BANCO, "1");
}

function salvarPalavras() {
  localStorage.setItem(STORAGE_PALAVRAS, JSON.stringify(palavras));
}

function proximoId() {
  if (!palavras.length) return 1;
  return Math.max(...palavras.map((p) => p.id)) + 1;
}

function carregarConfiguracoes() {
  config = { ...CONFIG_PADRAO };
  const raw = localStorage.getItem(STORAGE_CONFIG);
  if (!raw) return;
  try {
    const salvo = JSON.parse(raw);
    Object.keys(CONFIG_PADRAO).forEach((chave) => {
      if (salvo[chave] !== undefined && typeof salvo[chave] === typeof CONFIG_PADRAO[chave]) {
        config[chave] = salvo[chave];
      }
    });
    if (!OPCOES_PENALIDADE_DICA.includes(config.penalidadeDica)) config.penalidadeDica = CONFIG_PADRAO.penalidadeDica;
  } catch {
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

/* ==========================================================================
   4. TELAS, TOASTS E MODAIS
   ========================================================================== */

function mostrarTela(nome) {
  document.querySelectorAll(".tela").forEach((el) => {
    const ativa = el.dataset.tela === nome;
    el.hidden = !ativa;
    el.classList.toggle("tela-ativa", ativa);
  });
  const emJogo = TELAS_DE_JOGO.includes(nome);
  $("app").classList.toggle("app-larga", emJogo);
  if (!emJogo) sairModoApresentacao();
  if (nome === "lista") renderizarLista();
  if (nome === "configuracoes") preencherFormConfig();
  window.scrollTo(0, 0);
}

function mostrarMensagem(texto) {
  const region = $("toast-region");
  const toast = criar("div", "toast", texto);
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function modalAberto() {
  return !$("modal-overlay").classList.contains("hidden");
}

function mostrarModal({ titulo, corpoHtml, acoes, classeExtra = "" }) {
  return new Promise((resolve) => {
    const overlay = $("modal-overlay");
    const card = $("modal-card");
    const bodyEl = $("modal-body");
    const actionsEl = $("modal-actions");

    card.className = "modal-card " + classeExtra;
    $("modal-title").textContent = titulo;
    bodyEl.textContent = "";
    if (corpoHtml instanceof HTMLElement) {
      bodyEl.appendChild(corpoHtml);
    } else {
      bodyEl.textContent = corpoHtml || "";
    }
    actionsEl.textContent = "";

    acoes.forEach((acao) => {
      const btn = criar("button", "btn " + (acao.classe || "btn-secondary"), acao.rotulo);
      btn.type = "button";
      btn.addEventListener("click", () => {
        fecharModal();
        resolve(acao.valor);
      });
      actionsEl.appendChild(btn);
    });

    overlay.classList.remove("hidden");
    const alvo = actionsEl.querySelector(".btn-accent, .btn-danger, .btn-primary") || actionsEl.querySelector("button");
    if (alvo) alvo.focus();
  });
}

function fecharModal() {
  $("modal-overlay").classList.add("hidden");
}

/** Monta o corpo do modal a partir de linhas de texto (seguro para nomes digitados pelo usuário). */
function criarCorpo(linhas) {
  const wrap = criar("div");
  linhas.forEach((l) => {
    const item = typeof l === "string" ? { texto: l } : l;
    wrap.appendChild(criar("p", item.classe || "", item.texto));
  });
  return wrap;
}

/* ==========================================================================
   5. CADASTRO, EDIÇÃO E LISTA DE PALAVRAS
   ========================================================================== */

function limparDicas(lista) {
  return lista
    .map((d) => String(d ?? "").trim())
    .filter(Boolean)
    .slice(0, MAX_DICAS);
}

function lerPontos(valor) {
  if (valor === "" || valor === null || valor === undefined) return config.pontosIniciais;
  return Number(valor);
}

function validarCadastro(dados) {
  const termos = (dados.termos || []).map((t) => String(t ?? "").trim());
  if (!termos.length || termos.some((t) => !t)) {
    return termos.length > 1 ? "Preencha todas as palavras do desafio." : "Informe a palavra.";
  }
  if (termos.some((t) => !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t))) return "Cada palavra precisa conter ao menos uma letra.";
  const normalizadas = termos.map(normalizarResposta);
  if (new Set(normalizadas).size !== normalizadas.length) return "As palavras do desafio não podem se repetir.";
  const dicas = (dados.dicas || []).map((d) => String(d ?? "").trim());
  if (!dicas.length || dicas.some((d) => !d)) {
    return dicas.length > 1 ? "Preencha todas as dicas escolhidas." : "Informe a dica 1 (obrigatória).";
  }
  const pts = lerPontos(dados.pontos);
  if (!Number.isFinite(pts) || pts < 0) return "Pontuação inválida.";
  return null;
}

function montarRegistro(dados) {
  const termos = dados.termos.map((t) => t.trim().toUpperCase()).slice(0, MAX_PALAVRAS);
  return {
    palavra: termos[0],
    termos,
    categoria: (dados.categoria || "Geral").trim() || "Geral",
    dicas: limparDicas(dados.dicas),
    pontos: Math.round(lerPontos(dados.pontos)),
  };
}

function cadastrarPalavra(dados) {
  const erro = validarCadastro(dados);
  if (erro) return erro;
  palavras.push({ id: proximoId(), ...montarRegistro(dados) });
  salvarPalavras();
  return null;
}

function editarPalavra(id, dados) {
  const idx = palavras.findIndex((p) => p.id === id);
  if (idx === -1) return "Palavra não encontrada.";
  const erro = validarCadastro(dados);
  if (erro) return erro;
  palavras[idx] = { id, ...montarRegistro(dados) };
  salvarPalavras();
  return null;
}

function excluirPalavra(id) {
  palavras = palavras.filter((p) => p.id !== id);
  salvarPalavras();
}

/** Cria, no formulário "cad" ou "edit", os seletores e campos de palavras e dicas do desafio. */
function construirBlocosDesafio(prefixo) {
  const tipos = [
    ["palavra", "Quantas palavras neste desafio?", "Palavra", MAX_PALAVRAS, ["Ex.: ABACAXI ou RIO DE JANEIRO", "Ex.: BANANA", "Ex.: LARANJA"]],
    ["dica", "Quantas dicas neste desafio?", "Dica", MAX_DICAS, ["Ex.: É uma fruta tropical.", "Ex.: Possui uma casca áspera.", "Ex.: Seu nome começa com a letra A."]],
  ];
  tipos.forEach(([tipo, rotuloQtd, rotulo, max, exemplos]) => {
    const bloco = $(`${prefixo}-bloco-${tipo}s`);
    bloco.textContent = "";

    const campoQtd = criar("div", "campo");
    const lblQtd = criar("label", "", rotuloQtd);
    lblQtd.setAttribute("for", `${prefixo}-qtd-${tipo}s`);
    const select = criar("select");
    select.id = `${prefixo}-qtd-${tipo}s`;
    for (let n = 1; n <= max; n++) {
      const opt = criar("option", "", String(n));
      opt.value = String(n);
      select.appendChild(opt);
    }
    select.addEventListener("change", () => atualizarCamposDesafio(prefixo));
    campoQtd.appendChild(lblQtd);
    campoQtd.appendChild(select);
    bloco.appendChild(campoQtd);

    for (let n = 1; n <= max; n++) {
      const campo = criar("div", "campo");
      const lbl = criar("label", "", `${rotulo} ${n}`);
      lbl.setAttribute("for", `${prefixo}-${tipo}${n}`);
      const input = criar("input");
      input.type = "text";
      input.id = `${prefixo}-${tipo}${n}`;
      input.placeholder = exemplos[n - 1];
      input.autocomplete = "off";
      campo.appendChild(lbl);
      campo.appendChild(input);
      bloco.appendChild(campo);
    }
  });
  atualizarCamposDesafio(prefixo);
}

/** Mostra só os campos correspondentes às quantidades escolhidas. */
function atualizarCamposDesafio(prefixo) {
  [["palavra", MAX_PALAVRAS], ["dica", MAX_DICAS]].forEach(([tipo, max]) => {
    const qtd = Number($(`${prefixo}-qtd-${tipo}s`).value);
    for (let n = 1; n <= max; n++) {
      const input = $(`${prefixo}-${tipo}${n}`);
      input.closest(".campo").classList.toggle("hidden", n > qtd);
      input.required = n <= qtd;
    }
  });
}

function lerDesafio(prefixo) {
  const ler = (tipo) => {
    const qtd = Number($(`${prefixo}-qtd-${tipo}s`).value);
    return Array.from({ length: qtd }, (_, i) => $(`${prefixo}-${tipo}${i + 1}`).value);
  };
  return { termos: ler("palavra"), dicas: ler("dica") };
}

function renderizarLista() {
  const container = $("lista-palavras");
  const vazia = $("lista-vazia");
  const busca = $("busca-palavra").value.trim().toLowerCase();
  const cat = $("filtro-categoria").value;

  atualizarFiltroCategorias();

  const filtradas = palavras.filter((p) => {
    const matchBusca =
      !busca ||
      obterTermos(p).some((t) => t.toLowerCase().includes(busca)) ||
      obterDicas(p).some((d) => d.toLowerCase().includes(busca)) ||
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
    container.appendChild(criar("p", "lista-vazia", "Nenhuma palavra encontrada com esses filtros."));
    return;
  }

  filtradas.forEach((item) => {
    const dicas = obterDicas(item);
    const termos = obterTermos(item);
    const card = criar("article", "card palavra-item");

    const header = criar("div", "palavra-item-header");
    header.appendChild(criar("h3", "palavra-item-titulo", termos.join(" + ")));
    header.appendChild(
      criar("span", "palavra-item-meta", `${item.categoria || "Geral"} · ${termos.length} ${termos.length === 1 ? "palavra" : "palavras"} · ${dicas.length} ${dicas.length === 1 ? "dica" : "dicas"} · ${item.pontos} pontos`)
    );

    const listaDicas = criar("ol", "palavra-item-dicas");
    dicas.forEach((d) => listaDicas.appendChild(criar("li", "", d)));

    const acoes = criar("div", "palavra-item-acoes");
    const btnEdit = criar("button", "btn btn-secondary btn-sm", "Editar");
    btnEdit.type = "button";
    btnEdit.setAttribute("aria-label", `Editar palavra ${termos.join(" e ")}`);
    btnEdit.addEventListener("click", () => abrirEditar(item.id));

    const btnDel = criar("button", "btn btn-danger btn-sm", "Excluir");
    btnDel.type = "button";
    btnDel.setAttribute("aria-label", `Excluir palavra ${termos.join(" e ")}`);
    btnDel.addEventListener("click", () => confirmarExclusao(item.id));

    acoes.appendChild(btnEdit);
    acoes.appendChild(btnDel);
    card.appendChild(header);
    card.appendChild(listaDicas);
    card.appendChild(acoes);
    container.appendChild(card);
  });
}

function atualizarFiltroCategorias() {
  const select = $("filtro-categoria");
  const atual = select.value;
  const cats = [...new Set(palavras.map((p) => p.categoria || "Geral"))].sort();
  select.textContent = "";
  const optAll = criar("option", "", "Todas as categorias");
  optAll.value = "";
  select.appendChild(optAll);
  cats.forEach((c) => {
    const opt = criar("option", "", c);
    opt.value = c;
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
  const termos = obterTermos(item).slice(0, MAX_PALAVRAS);
  const dicas = obterDicas(item).slice(0, MAX_DICAS);
  $("edit-id").value = item.id;
  $("edit-categoria").value = item.categoria || "";
  $("edit-qtd-palavras").value = String(Math.max(1, termos.length));
  $("edit-qtd-dicas").value = String(Math.max(1, dicas.length));
  for (let n = 1; n <= MAX_PALAVRAS; n++) $(`edit-palavra${n}`).value = termos[n - 1] || "";
  for (let n = 1; n <= MAX_DICAS; n++) $(`edit-dica${n}`).value = dicas[n - 1] || "";
  atualizarCamposDesafio("edit");
  $("edit-pontos").value = item.pontos;
  $("edit-erro").hidden = true;
  mostrarTela("editar");
}

function preencherFormConfig() {
  $("cfg-pontos-iniciais").value = config.pontosIniciais;
  $("cfg-pontos-letra").value = config.pontosPorLetra;
  $("cfg-penalidade").value = config.penalidadeErro;
  $("cfg-penalidade-dica").value = String(config.penalidadeDica);
  $("cfg-som").checked = config.somAtivo;
  $("cfg-animacoes").checked = config.animacoesAtivas;
  aplicarTema(localStorage.getItem(STORAGE_TEMA) || "claro");
}

/** Resumo das regras (usa os valores configurados de pontos e penalidades). */
function mostrarRegras() {
  const regras = [
    ["👥 Jogadores", "De 1 a 8 jogadores, um por vez, sempre na mesma ordem. Todos começam com 0 pontos."],
    ["🔤 Sua vez", "Escolha uma letra no teclado da tela ou do computador. Acertando ou errando, a vez passa para o próximo jogador."],
    ["✅ Letra certa", `A letra aparece em todos os lugares da palavra e você ganha ${config.pontosPorLetra} pontos.`],
    ["❌ Letra errada", config.penalidadeErro > 0 ? `Você perde ${config.penalidadeErro} pontos.` : "Não perde pontos, mas a vez passa."],
    ["💡 Dicas", `Cada desafio tem de 1 a 3 dicas. Pedir a próxima dica reduz o valor da palavra em ${config.penalidadeDica} pontos.`],
    ["🧩 Desafios", "Um desafio pode ter até 3 palavras. Cada letra vale para todas ao mesmo tempo."],
    ["🏆 Completar a palavra", "Quem completa a palavra (última letra ou Resolver) ganha os pontos dela, proporcionais ao que ainda estava oculto. Palavra de 100 pontos com 90% já mostrada vale 10."],
    ["🎯 Resolver palavra", "Tente a resposta completa na sua vez. Se errar, você perde metade dos seus pontos e a vez passa para o próximo jogador."],
    ["⏭️ Passar a vez", "A mesma palavra vai para o próximo jogador. Se todos passarem, a palavra é descartada."],
    ["🏁 Fim da partida", "Quando as palavras acabam, o jogador com mais pontos vence. Em caso de empate, ficam na mesma posição."],
  ];
  const lista = criar("ul", "regras-lista");
  regras.forEach(([titulo, texto]) => {
    const li = criar("li");
    li.appendChild(criar("strong", "", titulo));
    li.appendChild(criar("span", "", texto));
    lista.appendChild(li);
  });
  mostrarModal({
    titulo: "📖 Regras do Jogo",
    corpoHtml: lista,
    classeExtra: "modal-regras",
    acoes: [{ rotulo: "Entendi", valor: true, classe: "btn-primary" }],
  });
}

/* ==========================================================================
   6. CONFIGURAR PARTIDA
   ========================================================================== */

function construirSeletoresPartida() {
  const seletor = $("seletor-jogadores");
  const campos = $("campos-jogadores");
  seletor.textContent = "";
  campos.textContent = "";

  for (let n = 1; n <= MAX_JOGADORES; n++) {
    const label = criar("label", "chip-num");
    const input = criar("input");
    input.type = "radio";
    input.name = "qtd-jogadores";
    input.value = String(n);
    input.checked = n === 1;
    input.setAttribute("aria-label", `${n} ${n === 1 ? "jogador" : "jogadores"}`);
    label.appendChild(input);
    label.appendChild(criar("span", "", String(n)));
    seletor.appendChild(label);

    const campo = criar("div", "campo campo-jogador");
    campo.dataset.jogador = String(n);
    const lbl = criar("label", "", `Jogador ${n}:`);
    lbl.setAttribute("for", `nome-jogador-${n}`);
    const nome = criar("input");
    nome.type = "text";
    nome.id = `nome-jogador-${n}`;
    nome.maxLength = 20;
    nome.placeholder = `Jogador ${n}`;
    nome.autocomplete = "off";
    campo.appendChild(lbl);
    campo.appendChild(nome);
    campos.appendChild(campo);
  }
}

function obterQuantidadeJogadores() {
  const marcado = document.querySelector('input[name="qtd-jogadores"]:checked');
  return marcado ? Number(marcado.value) : 1;
}

function atualizarCamposJogadores() {
  const qtd = obterQuantidadeJogadores();
  document.querySelectorAll(".campo-jogador").forEach((campo) => {
    campo.classList.toggle("hidden", Number(campo.dataset.jogador) > qtd);
  });
}

/** Cria os jogadores da partida. Todos começam com 0 pontos. */
function criarJogadores() {
  const qtd = obterQuantidadeJogadores();
  const lista = [];
  for (let i = 1; i <= qtd; i++) {
    const digitado = $(`nome-jogador-${i}`).value.replace(/\s+/g, " ").trim();
    lista.push({ id: i, nome: digitado || `Jogador ${i}`, pontos: 0 });
  }
  return lista;
}

function validarQuantidadePalavras() {
  const valor = $("partida-qtd-palavras").value;
  const disponiveis = palavras.length;
  let total;
  if (valor === "todas") total = disponiveis;
  else if (valor === "outra") total = Number($("partida-qtd-custom").value);
  else total = Number(valor);
  if (valor === "outra" && (!Number.isInteger(total) || total < 1)) {
    return { ok: false, total, mensagem: "Informe uma quantidade de palavras maior que zero." };
  }
  if (disponiveis === 0) {
    return { ok: false, total, mensagem: "Você ainda não cadastrou nenhuma palavra. Cadastre ao menos uma palavra para jogar." };
  }
  if (total > disponiveis) {
    const cadastradas = disponiveis === 1 ? "palavra cadastrada" : "palavras cadastradas";
    return {
      ok: false,
      total,
      mensagem: `Você possui apenas ${disponiveis} ${cadastradas}. Cadastre mais palavras ou escolha uma quantidade menor.`,
    };
  }
  return { ok: true, total };
}

function mostrarErroPartida(mensagem) {
  const el = $("partida-erro");
  el.textContent = mensagem || "";
  el.hidden = !mensagem;
}

function atualizarInfoPartida() {
  $("partida-custom-wrap").classList.toggle("hidden", $("partida-qtd-palavras").value !== "outra");
  const v = validarQuantidadePalavras();
  const n = palavras.length;
  $("partida-info").textContent = v.ok
    ? `Palavras cadastradas: ${n}. Esta partida terá ${v.total} ${v.total === 1 ? "palavra" : "palavras"}.`
    : `Palavras cadastradas: ${n}.`;
  mostrarErroPartida(v.ok ? "" : v.mensagem);
}

function configurarPartida() {
  if (!palavras.length) {
    mostrarModal({
      titulo: "Sem palavras",
      corpoHtml: "Você ainda não cadastrou nenhuma palavra. Cadastre pelo menos uma palavra para começar.",
      acoes: [
        { rotulo: "Fechar", valor: "fechar", classe: "btn-secondary" },
        { rotulo: "Cadastrar Palavra", valor: "cadastro", classe: "btn-accent" },
      ],
    }).then((v) => {
      if (v === "cadastro") mostrarTela("cadastro");
    });
    return;
  }
  if (!configPartidaInicializada) {
    $("partida-qtd-palavras").value = palavras.length >= 10 ? "10" : "todas";
    configPartidaInicializada = true;
  }
  Object.assign(partida, estadoInicialPartida());
  atualizarCamposJogadores();
  atualizarInfoPartida();
  mostrarTela("partida");
}

/* ==========================================================================
   7. FLUXO DA PARTIDA
   ========================================================================== */

function embaralharPalavras(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Embaralha as palavras cadastradas e separa somente a quantidade escolhida (sem repetições). */
function sortearPalavrasDaPartida(quantidade) {
  return embaralharPalavras(palavras)
    .slice(0, quantidade)
    .map((p) => ({ ...p, termos: obterTermos(p), dicas: obterDicas(p) }));
}

function jogadorAtual() {
  return partida.jogadores[partida.indiceJogadorAtual];
}

function acaoPermitida() {
  return partida.partidaAtiva && partida.rodadaEmAndamento && !partida.pausado && !modalAberto();
}

/** Valida o formulário e inicia a partida. */
function iniciarPartida() {
  const v = validarQuantidadePalavras();
  if (!v.ok) {
    mostrarErroPartida(v.mensagem);
    return;
  }
  comecarPartida(criarJogadores(), v.total);
}

function comecarPartida(jogadores, totalPalavras) {
  Object.assign(partida, estadoInicialPartida());
  partida.jogadores = jogadores.map((j) => ({ id: j.id, nome: j.nome, pontos: 0 }));
  partida.quantidadeJogadores = partida.jogadores.length;
  partida.indiceJogadorAtual = 0;
  partida.palavras = sortearPalavrasDaPartida(totalPalavras);
  partida.totalPalavras = partida.palavras.length;
  partida.indicePalavraAtual = 0;
  partida.partidaAtiva = true;
  tocarSom("nova");
  if (partida.quantidadeJogadores > 1) mostrarTransicao("nova");
  else iniciarRodada();
}

/** Carrega a palavra da vez (nova) e libera o jogador atual para jogar. */
function iniciarRodada() {
  const item = partida.palavras[partida.indicePalavraAtual];
  if (!item) {
    finalizarPartida();
    return;
  }
  partida.palavraAtual = item;
  partida.letrasEscolhidas = [];
  partida.letrasCorretas = [];
  partida.letrasErradas = [];
  partida.passesNaPalavra = 0;
  partida.dicasExibidas = Math.min(1, obterDicas(item).length);
  calcularPontuacao();
  partida.pausado = false;
  partida.rodadaEmAndamento = true;
  mostrarTela("jogo");
  renderizarRodada();
  tocarSom("nova");
}

/** Mesma palavra, jogador seguinte (após passar a vez). Mantém letras e dicas já reveladas. */
function retomarRodada() {
  partida.pausado = false;
  partida.rodadaEmAndamento = true;
  mostrarTela("jogo");
  renderizarRodada();
  tocarSom("nova");
}

function proximoJogador() {
  partida.indiceJogadorAtual++;
  if (partida.indiceJogadorAtual >= partida.quantidadeJogadores) partida.indiceJogadorAtual = 0;
}

function proximaPalavra() {
  partida.indicePalavraAtual++;
}

/** Palavras do desafio atual. */
function termosAtuais() {
  return partida.palavraAtual ? obterTermos(partida.palavraAtual) : [];
}

/** Conta as posições de letras de todas as palavras do desafio: total e ainda ocultas. */
function contarLetras() {
  let total = 0;
  let ocultas = 0;
  termosAtuais().forEach((termo) => {
    for (const ch of termo) {
      if (!ehLetraAdivinhavel(ch)) continue;
      total++;
      if (!letraRevelada(ch)) ocultas++;
    }
  });
  return { total, ocultas };
}

/**
 * Valor atual da palavra = (pontos cadastrados − penalidade das dicas) × % ainda oculto.
 * Ex.: palavra de 100 pontos com 90% já revelada vale 10. Nunca abaixo de 0.
 */
function calcularPontuacao() {
  if (!partida.palavraAtual) return 0;
  const base = Number(partida.palavraAtual.pontos) || 0;
  const dicasCobradas = Math.max(0, partida.dicasExibidas - (PRIMEIRA_DICA_GRATIS ? 1 : 0));
  const liquido = Math.max(0, base - dicasCobradas * config.penalidadeDica);
  const { total, ocultas } = contarLetras();
  partida.pontosDaPalavra = total ? Math.round((liquido * ocultas) / total) : 0;
  return partida.pontosDaPalavra;
}

function aplicarPenalidadeErro() {
  const jogador = jogadorAtual();
  if (config.penalidadeErro > 0) jogador.pontos = Math.max(0, jogador.pontos - config.penalidadeErro);
}

function mostrarProximaDica() {
  if (!acaoPermitida()) return;
  const dicas = obterDicas(partida.palavraAtual);
  if (partida.dicasExibidas >= dicas.length) return;
  partida.dicasExibidas++;
  calcularPontuacao();
  mostrarDica();
  atualizarValorPalavra();
  mostrarFeedback(`💡 DICA ${partida.dicasExibidas} REVELADA`, "");
  tocarSom("clique");
}

/**
 * Cada letra escolhida (acertando ou errando) encerra a vez: joga o próximo jogador.
 * Letra correta: +pontosPorLetra. Quem completa a palavra ganha o valor proporcional ao que
 * ainda estava oculto antes da jogada.
 */
function tentarLetra(letra) {
  if (!acaoPermitida() || !partida.palavraAtual) return;

  const resultado = verificarLetra(letra);
  if (resultado === null || resultado === "usada") return;

  const norm = normalizarLetra(letra);
  partida.letrasEscolhidas.push(norm);
  partida.passesNaPalavra = 0;

  if (resultado === "correta") {
    const valorAntes = calcularPontuacao();
    if (!partida.letrasCorretas.includes(norm)) partida.letrasCorretas.push(norm);
    jogadorAtual().pontos += config.pontosPorLetra;
    marcarTecla(norm, "correta");
    mostrarFeedback("CORRETO! 🎉", "acerto");
    tocarSom("acerto");
    animarAcerto();
    mostrarPalavra(norm);
    if (palavraCompletamenteRevelada()) {
      acertarPalavra(valorAntes);
      return;
    }
  } else {
    partida.letrasErradas.push(norm);
    aplicarPenalidadeErro();
    marcarTecla(norm, "errada");
    mostrarFeedback("❌ LETRA INCORRETA!", "erro");
    tocarSom("erro");
  }

  calcularPontuacao();
  atualizarValorPalavra();
  proximoJogador();
  mostrarJogadorAtual();
  mostrarPlacar();
}

async function resolverPalavra() {
  if (!acaoPermitida()) return;

  const termos = termosAtuais();
  const wrap = criar("div", "resolver-campos");
  if (termos.length > 1) wrap.appendChild(criar("p", "", `Digite as ${termos.length} palavras (em qualquer ordem).`));
  const inputs = termos.map((_, i) => {
    const id = i === 0 ? "input-resolver" : `input-resolver-${i + 1}`;
    const rotulo = termos.length > 1 ? `Palavra ${i + 1}` : "Digite sua resposta";
    const label = criar("label", "", rotulo);
    label.setAttribute("for", id);
    const input = criar("input");
    input.type = "text";
    input.id = id;
    input.autocomplete = "off";
    input.setAttribute("aria-label", rotulo);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.querySelector("#modal-actions .btn-accent")?.click();
      }
    });
    wrap.appendChild(label);
    wrap.appendChild(input);
    return input;
  });

  const confirmou = await mostrarModal({
    titulo: "🎯 Resolver palavra",
    corpoHtml: wrap,
    acoes: [
      { rotulo: "Cancelar", valor: false, classe: "btn-secondary" },
      { rotulo: "Confirmar", valor: true, classe: "btn-accent" },
    ],
  });
  if (!confirmou) return;

  const respostas = inputs.map((i) => normalizarResposta(i.value));
  if (respostas.some((r) => !r)) {
    mostrarMensagem(termos.length > 1 ? "Preencha todas as palavras para resolver." : "Digite uma resposta para resolver.");
    return;
  }

  const alvo = termos.map(normalizarResposta);
  const certo = [...respostas].sort().join("|") === [...alvo].sort().join("|");
  if (certo) {
    const ganhos = calcularPontuacao();
    revelarPalavraCompleta();
    acertarPalavra(ganhos);
  } else {
    // erro ao resolver: o jogador perde metade dos próprios pontos e a vez passa ao próximo
    const jogador = jogadorAtual();
    jogador.pontos -= Math.floor(jogador.pontos / 2);
    partida.passesNaPalavra = 0;
    mostrarFeedback("❌ RESPOSTA INCORRETA!", "erro");
    tocarSom("erro");
    proximoJogador();
    mostrarJogadorAtual();
    mostrarPlacar();
  }
}

function revelarPalavraCompleta() {
  termosAtuais().forEach((termo) => {
    for (const ch of termo) {
      if (!ehLetraAdivinhavel(ch)) continue;
      const n = normalizarLetra(ch);
      if (!partida.letrasCorretas.includes(n)) partida.letrasCorretas.push(n);
    }
  });
  mostrarPalavra("*");
}

/** O jogador atual descobriu a palavra: recebe os pontos e a rodada termina. */
async function acertarPalavra(ganhos) {
  partida.rodadaEmAndamento = false;
  const jogador = jogadorAtual();
  jogador.pontos += ganhos;
  mostrarPlacar();
  await finalizarRodada({ resultado: "acertou", jogador, ganhos });
}

/** Passa a vez mantendo a mesma palavra para o próximo jogador. */
async function passarVez() {
  if (!acaoPermitida()) return;

  const ultimoDaVolta = partida.passesNaPalavra + 1 >= partida.quantidadeJogadores;
  let aviso = "";
  if (partida.quantidadeJogadores === 1) {
    aviso = "Como você é o único jogador, passar a vez descarta esta palavra (sem pontos).";
  } else if (ultimoDaVolta) {
    aviso = "Todos os outros jogadores já passaram. Se você passar, a palavra será descartada sem pontos.";
  }
  const linhas = ["Tem certeza que deseja passar a vez?"];
  if (aviso) linhas.push({ texto: aviso, classe: "modal-aviso" });

  const confirmou = await mostrarModal({
    titulo: "⏭️ Passar a vez",
    corpoHtml: criarCorpo(linhas),
    acoes: [
      { rotulo: "Continuar jogando", valor: false, classe: "btn-secondary" },
      { rotulo: "Passar a vez", valor: true, classe: "btn-accent" },
    ],
  });
  if (!confirmou || !partida.partidaAtiva) return;

  partida.rodadaEmAndamento = false;
  partida.passesNaPalavra++;
  proximoJogador();

  if (partida.passesNaPalavra >= partida.quantidadeJogadores) {
    // todos passaram uma vez: regra de encerramento — a palavra sai da partida
    await finalizarRodada({ resultado: "descartada" });
    return;
  }
  mostrarTransicao("continuar");
}

/** Encerra a palavra atual (acertada ou descartada) e segue o fluxo. */
async function finalizarRodada({ resultado, jogador, ganhos }) {
  const ultima = partida.indicePalavraAtual + 1 >= partida.totalPalavras;
  const rotuloBotao = ultima ? "🏁 VER RESULTADO FINAL" : "PRÓXIMA RODADA";
  const palavra = termosAtuais().join(" • ");

  if (resultado === "acertou") {
    tocarSom("vitoria");
    if (config.animacoesAtivas) criarConfetes();
    await mostrarModal({
      titulo: "🎉 ACERTOU!",
      classeExtra: "modal-vitoria",
      corpoHtml: criarCorpo([
        { texto: `${jogador.nome} descobriu:`, classe: "modal-nome" },
        { texto: palavra, classe: "palavra-revelada" },
        { texto: `+${ganhos} PONTOS`, classe: "modal-pontos-ganhos" },
        `Pontuação atual: ${jogador.nome}: ${jogador.pontos}`,
      ]),
      acoes: [{ rotulo: rotuloBotao, valor: true, classe: "btn-accent" }],
    });
  } else {
    tocarSom("erro");
    revelarPalavraCompleta();
    await mostrarModal({
      titulo: "😕 NINGUÉM ACERTOU",
      corpoHtml: criarCorpo(["Todos passaram a vez. A palavra era:", { texto: palavra, classe: "palavra-revelada" }, "Ninguém pontuou nesta rodada."]),
      classeExtra: "modal-vitoria",
      acoes: [{ rotulo: rotuloBotao, valor: true, classe: "btn-accent" }],
    });
  }

  if (!partida.partidaAtiva) return; // partida foi encerrada/reiniciada enquanto o modal estava aberto
  seguirParaProximaRodada();
}

function seguirParaProximaRodada() {
  if (partida.indicePalavraAtual + 1 >= partida.totalPalavras) {
    finalizarPartida();
    return;
  }
  proximoJogador();
  proximaPalavra();
  if (partida.quantidadeJogadores > 1) mostrarTransicao("nova");
  else iniciarRodada();
}

function mostrarTransicao(modo) {
  partida.rodadaEmAndamento = false;
  partida.modoTransicao = modo;
  $("transicao-nome").textContent = jogadorAtual().nome;
  $("transicao-rodada").textContent = `🎯 Rodada ${partida.indicePalavraAtual + 1} de ${partida.totalPalavras}`;
  const nota = $("transicao-nota");
  nota.textContent = "A palavra continua a mesma: letras e dicas já reveladas permanecem.";
  nota.classList.toggle("hidden", modo !== "continuar");
  mostrarTela("transicao");
  $("btn-comecar-rodada").focus();
}

function comecarRodadaDaTransicao() {
  if (partida.modoTransicao === "continuar") retomarRodada();
  else iniciarRodada();
}

async function pausarJogo() {
  if (!acaoPermitida()) return;
  partida.pausado = true;
  const v = await mostrarModal({
    titulo: "Jogo pausado",
    corpoHtml: "O que deseja fazer?",
    acoes: [
      { rotulo: "Continuar", valor: "continuar", classe: "btn-accent" },
      { rotulo: "Reiniciar", valor: "reiniciar", classe: "btn-secondary" },
      { rotulo: "Sair", valor: "sair", classe: "btn-ghost" },
    ],
  });
  partida.pausado = false;
  if (v === "reiniciar") reiniciarPartida();
  else if (v === "sair") sairDaPartida();
}

async function reiniciarPartida() {
  if (!partida.partidaAtiva || !partida.rodadaEmAndamento) return;
  const ok = await mostrarModal({
    titulo: "Reiniciar partida",
    corpoHtml: "Deseja reiniciar a partida? Todos voltam a 0 pontos e as palavras serão sorteadas novamente.",
    acoes: [
      { rotulo: "Cancelar", valor: false, classe: "btn-secondary" },
      { rotulo: "Reiniciar", valor: true, classe: "btn-accent" },
    ],
  });
  if (!ok) return;
  comecarPartida(partida.jogadores, partida.totalPalavras);
}

async function sairDaPartida() {
  const ok = await mostrarModal({
    titulo: "Sair da partida",
    corpoHtml: "Sair agora encerra a partida e os pontos serão perdidos. Deseja sair?",
    acoes: [
      { rotulo: "Voltar ao jogo", valor: false, classe: "btn-secondary" },
      { rotulo: "Sair", valor: true, classe: "btn-danger" },
    ],
  });
  if (!ok) return;
  Object.assign(partida, estadoInicialPartida());
  mostrarTela("inicio");
}

function finalizarPartida() {
  partida.partidaAtiva = false;
  partida.rodadaEmAndamento = false;
  mostrarResultadoFinal();
}

function novaPartida() {
  Object.assign(partida, estadoInicialPartida());
  configurarPartida();
}

/* ==========================================================================
   8. RENDERIZAÇÃO DO JOGO
   ========================================================================== */

function renderizarRodada() {
  $("jogo-categoria").textContent = partida.palavraAtual.categoria || "Geral";
  mostrarJogadorAtual();
  mostrarPlacar();
  mostrarDica();
  atualizarValorPalavra();
  limparFeedback();
  mostrarPalavra();
  resetarTeclado();
  partida.letrasEscolhidas.forEach((l) => {
    marcarTecla(l, partida.letrasCorretas.includes(l) ? "correta" : "errada");
  });
}

function mostrarJogadorAtual() {
  const jogador = jogadorAtual();
  $("vez-nome").textContent = jogador.nome;
  $("vez-rodada").textContent = `${partida.indicePalavraAtual + 1} / ${partida.totalPalavras}`;
  const card = $("vez-card");
  card.classList.remove("troca");
  if (config.animacoesAtivas) {
    void card.offsetWidth; // reinicia a animação
    card.classList.add("troca");
  }
}

function mostrarPlacar() {
  const lista = $("placar-lista");
  lista.textContent = "";
  partida.jogadores.forEach((j, i) => {
    const atual = i === partida.indiceJogadorAtual && partida.partidaAtiva;
    const li = criar("li", "placar-item" + (atual ? " atual" : ""));
    if (atual) li.setAttribute("aria-current", "true");
    li.appendChild(criar("span", "placar-seta", atual ? "👉" : ""));
    li.appendChild(criar("span", "placar-nome", j.nome));
    li.appendChild(criar("span", "placar-pontilhado"));
    li.appendChild(criar("span", "placar-pontos", textoPontos(j.pontos)));
    lista.appendChild(li);
  });
}

function mostrarDica() {
  const dicas = obterDicas(partida.palavraAtual);
  const lista = $("jogo-dicas");
  lista.textContent = "";

  if (!dicas.length) {
    lista.appendChild(criar("li", "dica-item atual", "Esta palavra não tem dica cadastrada."));
  }
  for (let i = 0; i < partida.dicasExibidas; i++) {
    const li = criar("li", "dica-item" + (i === partida.dicasExibidas - 1 ? " atual" : ""));
    li.appendChild(criar("span", "dica-num", `💡 DICA ${i + 1}`));
    li.appendChild(criar("p", "dica-texto", dicas[i]));
    lista.appendChild(li);
  }

  const temMais = partida.dicasExibidas < dicas.length;
  const btn = $("btn-outra-dica");
  btn.disabled = !temMais;
  const custo = config.penalidadeDica > 0 ? ` (−${config.penalidadeDica} pts)` : "";
  btn.textContent = `💡 PRÓXIMA DICA${temMais ? custo : ""}`;
  $("dicas-fim").classList.toggle("hidden", temMais);
}

function atualizarValorPalavra() {
  $("jogo-pontuacao").textContent = `Vale ${partida.pontosDaPalavra} pts`;
}

/** letraNova: letra normalizada recém-revelada (animada) ou "*" para todas. */
function mostrarPalavra(letraNova = "") {
  const container = $("palavra-container");
  container.textContent = "";
  const termos = termosAtuais();

  termos.forEach((termo, t) => {
    const linha = criar("div", "palavra-linha");
    if (termos.length > 1) {
      linha.setAttribute("role", "group");
      linha.setAttribute("aria-label", `Palavra ${t + 1}`);
    }
    for (const ch of termo) {
      const slot = criar("div");
      if (ch === " ") {
        slot.className = "letra-slot espaco";
        slot.setAttribute("aria-hidden", "true");
      } else if (!ehLetraAdivinhavel(ch)) {
        slot.className = "letra-slot fixo";
        slot.textContent = ch;
        slot.setAttribute("aria-label", `Caractere ${ch}`);
      } else {
        const revelada = letraRevelada(ch);
        const nova = revelada && letraNova && (letraNova === "*" || normalizarLetra(ch) === letraNova);
        slot.className = "letra-slot" + (revelada ? " revelada" : "") + (nova ? " nova" : "");
        slot.textContent = revelada ? ch : "_";
        slot.setAttribute("aria-label", revelada ? `Letra ${ch}` : "Letra oculta");
      }
      linha.appendChild(slot);
    }
    container.appendChild(linha);
  });
}

/** A letra já foi descoberta? (caracteres que não são letras contam como revelados) */
function letraRevelada(ch) {
  if (!ehLetraAdivinhavel(ch)) return true;
  const norm = normalizarLetra(ch);
  return partida.letrasCorretas.some((l) => normalizarLetra(l) === norm);
}

/** Quantas vezes a letra aparece em todas as palavras do desafio. */
function ocorrenciasDaLetra(letra) {
  const alvo = normalizarLetra(letra);
  let n = 0;
  termosAtuais().forEach((termo) => {
    for (const ch of termo) {
      if (ehLetraAdivinhavel(ch) && normalizarLetra(ch) === alvo) n++;
    }
  });
  return n;
}

function verificarLetra(letra) {
  const norm = normalizarLetra(letra);
  if (!norm || norm.length !== 1 || !/[A-Z]/.test(norm)) return null;
  if (partida.letrasEscolhidas.some((l) => normalizarLetra(l) === norm)) return "usada";
  return ocorrenciasDaLetra(letra) > 0 ? "correta" : "errada";
}

function palavraCompletamenteRevelada() {
  return contarLetras().ocultas === 0;
}

function mostrarFeedback(msg, tipo) {
  const el = $("feedback-jogo");
  el.textContent = msg;
  el.className = "feedback-jogo " + (tipo || "");
  if (!config.animacoesAtivas) return;
  setTimeout(() => {
    if (el.textContent === msg) el.className = "feedback-jogo";
  }, 2000);
}

function limparFeedback() {
  const el = $("feedback-jogo");
  el.textContent = "";
  el.className = "feedback-jogo";
}

function construirTeclado() {
  const teclado = $("teclado-virtual");
  teclado.textContent = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((L) => {
    const btn = criar("button", "tecla", L);
    btn.type = "button";
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
  const c = $("palavra-container");
  c.classList.add("pulse-once");
  setTimeout(() => c.classList.remove("pulse-once"), 500);
}

/* ==========================================================================
   9. RESULTADO FINAL
   ========================================================================== */

/**
 * Ordena por pontos (maior primeiro). Empatados ficam na mesma posição,
 * mantendo a ordem original dos jogadores — sem critério de desempate.
 */
function calcularRanking() {
  const ordenados = [...partida.jogadores].sort((a, b) => b.pontos - a.pontos);
  return ordenados.map((j) => ({
    jogador: j,
    posicao: 1 + ordenados.filter((o) => o.pontos > j.pontos).length,
    empatado: ordenados.filter((o) => o.pontos === j.pontos).length > 1,
  }));
}

function mostrarResultadoFinal() {
  const ranking = calcularRanking();
  const lista = $("ranking-lista");
  lista.textContent = "";
  const medalhas = { 1: "🥇", 2: "🥈", 3: "🥉" };

  ranking.forEach(({ jogador, posicao, empatado }) => {
    const li = criar("li", `ranking-item pos-${Math.min(posicao, 4)}`);
    li.appendChild(criar("span", "ranking-medalha", medalhas[posicao] || `${posicao}º`));
    li.appendChild(criar("span", "ranking-nome", jogador.nome));
    if (empatado) li.appendChild(criar("span", "badge-empate", "empate"));
    li.appendChild(criar("span", "ranking-pontos", textoPontos(jogador.pontos)));
    lista.appendChild(li);
  });

  const empatePrimeiro = ranking.filter((r) => r.posicao === 1).length > 1;
  $("final-empate").classList.toggle("hidden", !empatePrimeiro);

  mostrarTela("final");
  tocarSom("vitoria");
  if (config.animacoesAtivas) criarConfetes();
  $("btn-nova-partida").focus();
}

/* ==========================================================================
   10. MODO APRESENTAÇÃO E TELA CHEIA
   ========================================================================== */

function telaCheiaDisponivel() {
  const el = document.documentElement;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

function emTelaCheia() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function solicitarTelaCheia() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return Promise.reject(new Error("indisponivel"));
  try {
    return Promise.resolve(req.call(el));
  } catch (e) {
    return Promise.reject(e);
  }
}

function sairTelaCheia() {
  const sair = document.exitFullscreen || document.webkitExitFullscreen;
  if (sair && emTelaCheia()) Promise.resolve(sair.call(document)).catch(() => {});
}

function alternarTelaCheia() {
  if (!telaCheiaDisponivel()) {
    mostrarMensagem("Tela cheia não é suportada neste navegador.");
    return;
  }
  if (emTelaCheia()) sairTelaCheia();
  else solicitarTelaCheia().catch(() => mostrarMensagem("Não foi possível abrir a tela cheia."));
}

function atualizarBotoesApresentacao() {
  const ativo = document.body.classList.contains("modo-apresentacao");
  $("btn-apresentacao").textContent = ativo ? "✖ SAIR DO MODO APRESENTAÇÃO" : "📺 MODO APRESENTAÇÃO";
  $("btn-apresentacao").setAttribute("aria-pressed", String(ativo));
  $("btn-tela-cheia").textContent = emTelaCheia() ? "⛶ Sair da Tela Cheia" : "⛶ Tela Cheia";
}

function entrarModoApresentacao() {
  document.body.classList.add("modo-apresentacao");
  if (telaCheiaDisponivel() && !emTelaCheia()) solicitarTelaCheia().catch(() => {});
  atualizarBotoesApresentacao();
}

function sairModoApresentacao() {
  if (!document.body.classList.contains("modo-apresentacao")) return;
  document.body.classList.remove("modo-apresentacao");
  sairTelaCheia();
  atualizarBotoesApresentacao();
}

function alternarModoApresentacao() {
  if (document.body.classList.contains("modo-apresentacao")) sairModoApresentacao();
  else entrarModoApresentacao();
}

/* ==========================================================================
   11. ÁUDIO, CONFETES E EVENTOS
   ========================================================================== */

function criarConfetes() {
  const container = $("confetti-container");
  const cores = ["#fbbf24", "#7c3aed", "#3b82f6", "#22c55e", "#ef4444", "#fde047"];
  for (let i = 0; i < 80; i++) {
    const el = criar("div", "confetti");
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

function inteiroNaoNegativo(valor) {
  return Math.max(0, Math.round(Number(valor)) || 0);
}

function registrarEventos() {
  document.querySelectorAll("[data-acao]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tocarSom("clique");
      const acao = btn.dataset.acao;
      if (acao === "jogar") configurarPartida();
      else if (acao === "regras") mostrarRegras();
      else mostrarTela(acao);
    });
  });

  document.querySelectorAll("[data-voltar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tocarSom("clique");
      mostrarTela(btn.dataset.voltar);
    });
  });

  // Configurar partida
  $("seletor-jogadores").addEventListener("change", atualizarCamposJogadores);
  $("partida-qtd-palavras").addEventListener("change", atualizarInfoPartida);
  $("partida-qtd-custom").addEventListener("input", atualizarInfoPartida);
  $("form-partida").addEventListener("submit", (e) => {
    e.preventDefault();
    iniciarPartida();
  });

  // Cadastro
  $("form-cadastro").addEventListener("submit", (e) => {
    e.preventDefault();
    const erroEl = $("cad-erro");
    const err = cadastrarPalavra({
      ...lerDesafio("cad"),
      categoria: $("cad-categoria").value,
      pontos: $("cad-pontos").value,
    });
    if (err) {
      erroEl.textContent = err;
      erroEl.hidden = false;
      return;
    }
    erroEl.hidden = true;
    $("form-cadastro").reset();
    atualizarCamposDesafio("cad");
    $("cad-pontos").value = config.pontosIniciais;
    mostrarMensagem("Palavra cadastrada com sucesso!");
  });

  // Edição
  $("form-editar").addEventListener("submit", (e) => {
    e.preventDefault();
    const erroEl = $("edit-erro");
    const err = editarPalavra(Number($("edit-id").value), {
      ...lerDesafio("edit"),
      categoria: $("edit-categoria").value,
      pontos: $("edit-pontos").value,
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

  // Configurações
  $("form-config").addEventListener("submit", (e) => {
    e.preventDefault();
    config.pontosIniciais = inteiroNaoNegativo($("cfg-pontos-iniciais").value);
    config.pontosPorLetra = inteiroNaoNegativo($("cfg-pontos-letra").value);
    config.penalidadeErro = inteiroNaoNegativo($("cfg-penalidade").value);
    config.penalidadeDica = inteiroNaoNegativo($("cfg-penalidade-dica").value);
    config.somAtivo = $("cfg-som").checked;
    config.animacoesAtivas = $("cfg-animacoes").checked;
    const tema = document.querySelector('input[name="tema"]:checked')?.value || "claro";
    salvarConfiguracoes();
    aplicarTema(tema);
    $("cad-pontos").value = config.pontosIniciais;
    mostrarMensagem("Configurações salvas!");
  });

  // Lista
  $("busca-palavra").addEventListener("input", renderizarLista);
  $("filtro-categoria").addEventListener("change", renderizarLista);
  $("btn-nova-palavra-lista").addEventListener("click", () => mostrarTela("cadastro"));

  // Jogo
  $("btn-pausar").addEventListener("click", pausarJogo);
  $("btn-resolver").addEventListener("click", resolverPalavra);
  $("btn-passar-vez").addEventListener("click", passarVez);
  $("btn-reiniciar-partida").addEventListener("click", reiniciarPartida);
  $("btn-outra-dica").addEventListener("click", mostrarProximaDica);
  $("btn-comecar-rodada").addEventListener("click", () => {
    tocarSom("clique");
    comecarRodadaDaTransicao();
  });
  $("btn-apresentacao").addEventListener("click", alternarModoApresentacao);
  $("btn-tela-cheia").addEventListener("click", alternarTelaCheia);
  if (!telaCheiaDisponivel()) $("btn-tela-cheia").classList.add("hidden");
  document.addEventListener("fullscreenchange", atualizarBotoesApresentacao);
  document.addEventListener("webkitfullscreenchange", atualizarBotoesApresentacao);

  // Final
  $("btn-nova-partida").addEventListener("click", novaPartida);
  $("btn-final-inicio").addEventListener("click", () => mostrarTela("inicio"));

  // Teclado físico (A–Z). Ignorado em modais, campos de texto e fora da vez de jogar.
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!acaoPermitida()) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (!/^[a-zA-Z]$/.test(e.key)) return;
    e.preventDefault();
    tentarLetra(e.key.toUpperCase());
  });
}

document.addEventListener("DOMContentLoaded", init);
