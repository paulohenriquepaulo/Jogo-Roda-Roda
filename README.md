# Desafio das Palavras

Jogo de navegador inspirado na dinâmica de programas de adivinhação de palavras, com identidade visual própria. Desenvolvido com **HTML5**, **CSS3** e **JavaScript puro**, sem backend. Agora para **1 a 8 jogadores**, jogando um por vez em ordem fixa.

## Como executar

1. Abra a pasta `jogo-palavras`.
2. Dê duplo clique em `index.html` ou arraste o arquivo para o navegador (Chrome, Edge, Firefox, etc.).
3. Não é necessário servidor nem instalação de dependências.

## Como iniciar uma partida

1. Na tela inicial, clique em **Jogar** (é preciso ter ao menos uma palavra cadastrada).
2. Em **CONFIGURAR PARTIDA**, escolha de **1 a 8 jogadores**. Os campos de nome aparecem e somem conforme a quantidade. Nome em branco vira `Jogador 1`, `Jogador 2`…
3. Escolha a **quantidade de palavras**: 5, 10, 15, 20, 25, 30, **Todas** ou **Outra quantidade…** (campo numérico).
4. Se pedir mais palavras do que existem, a partida não começa e o jogo mostra: *"Você possui apenas N palavras cadastradas. Cadastre mais palavras ou escolha uma quantidade menor."*
5. Clique em **INICIAR PARTIDA**.

## Como cadastrar palavras (até 3 dicas)

1. Na tela inicial, clique em **Cadastrar Palavras**.
2. Preencha **Palavra**, **Categoria**, **Dica 1** (obrigatória), **Dica 2** e **Dica 3** (opcionais) e **Pontos** (padrão: 100).
3. Clique em **CADASTRAR PALAVRA**. Dicas em branco não são gravadas: com uma só dica, o registro tem `dicas: ["..."]`.

Modelo salvo no LocalStorage:

```json
{
  "id": 1,
  "palavra": "ABACAXI",
  "categoria": "Frutas",
  "dicas": ["É uma fruta tropical.", "Possui uma casca áspera.", "Seu nome começa com a letra A."],
  "pontos": 100
}
```

**Compatibilidade:** palavras antigas (`dica: "..."`) são convertidas automaticamente para `dicas: ["..."]` ao abrir o jogo. Nada é apagado.

Em **Palavras Cadastradas** aparecem palavra, categoria, quantidade de dicas, pontos e as ações Editar/Excluir. Ao editar, é possível alterar as 3 dicas.

## Como funciona o jogo

- **Ordem dos jogadores:** fixa e circular (1 → 2 → 3 → 1…). Controlada por `partida.indiceJogadorAtual`, separada da palavra.
- **Uma palavra por rodada:** a rodada `k` começa com o jogador `k` (voltando ao 1º depois do último). Com 3 jogadores e 5 palavras: 1, 2, 3, 1, 2.
- **Palavras da partida:** as cadastradas são embaralhadas e só a quantidade escolhida é usada, sem repetição.
- **Letras:** teclado virtual ou físico (A–Z). Letra correta revela todas as ocorrências (A vale para Á/Ã, C vale para Ç…). Espaços, hífens e apóstrofos aparecem fixos.
- **Letra errada:** mostra `❌ LETRA INCORRETA!` e aplica a penalidade configurada **somente ao jogador atual**.
- **Resolver palavra:** aceita a resposta sem acentos e sem diferenciar maiúsculas/minúsculas. Se errar, mostra `❌ RESPOSTA INCORRETA!`, aplica a penalidade e **não passa a vez**.
- **Dicas:** a Dica 1 aparece sozinha; **PRÓXIMA DICA** revela as seguintes. Sem mais dicas, o botão é desabilitado e aparece *"Não há mais dicas disponíveis."*
- **⏭️ Passar a vez:** pede confirmação. A **mesma palavra** vai para o próximo jogador (letras e dicas já reveladas permanecem). Ninguém ganha pontos e a palavra não se perde.
- **Todos passaram:** se todos os jogadores passarem a vez na mesma palavra, ela é descartada sem pontos (regra de encerramento) e a partida segue. Com 1 jogador, passar a vez descarta a palavra.
- **Transição:** entre jogadores aparece a tela **PREPARE-SE!** com o nome de quem joga e o botão **COMEÇAR RODADA** (a palavra só aparece depois do clique). Com 1 jogador não há transição.
- **Fim:** quando a última palavra termina, aparece o ranking com 🥇🥈🥉. Jogadores empatados ficam na mesma posição e é exibido **EMPATE!** (sem critério de desempate). **NOVA PARTIDA** volta à configuração e zera tudo.

## Pontuação

- Todos começam com **0 pontos**, sempre.
- Cada palavra vale seus `pontos` cadastrados. Quem acerta (completando as letras ou resolvendo) soma `pontosDaPalavra` ao próprio placar.
- **Dicas:** cada dica exibida reduz o valor da palavra em *penalidade por dica* (0, 5 ou 10; padrão 5). Com 100 pontos e penalidade 5: Dica 1 → 95, Dica 2 → 90, Dica 3 → 85. Para a 1ª dica ser gratuita (100 → 95 → 90), altere `PRIMEIRA_DICA_GRATIS` para `true` no topo de `script.js`.
- **Erros** (letra ou resolução) tiram a *penalidade por erro* dos pontos do jogador atual (padrão 5).
- A pontuação nunca fica abaixo de zero.
- Se um jogador passa a vez depois de dicas usadas, o valor reduzido da palavra segue para o próximo jogador.

## Placar, modo apresentação e telas

- **Placar** sempre visível: à direita no computador; abaixo da palavra no celular (a *vez de* fica no topo). O jogador atual é marcado com 👉 e destacado.
- **📺 MODO APRESENTAÇÃO:** esconde título e botões administrativos (Pausar/Reiniciar), amplia palavra, letras, dica, jogador atual e placar, e tenta abrir tela cheia.
- **⛶ Tela Cheia:** usa a Fullscreen API quando disponível (no iPhone o Safari não suporta).

## LocalStorage

| Chave           | Conteúdo                                                        |
|-----------------|-----------------------------------------------------------------|
| `palavrasJogo`  | Lista de palavras cadastradas (modelo com `dicas`)              |
| `configJogo`    | Pontos sugeridos, penalidade por erro, penalidade por dica, som e animações |
| `temaJogo`      | `claro` ou `escuro`                                             |

A partida em andamento **não** é salva: placar e rodadas existem apenas enquanto a partida acontece. Na primeira execução, se não houver palavras, três exemplos (ABACAXI com 3 dicas, ELEFANTE com 2, BRASIL com 1) são inseridos.

## Configurações

- **Pontos sugeridos ao cadastrar uma palavra** (valor padrão do formulário; não é a pontuação inicial dos jogadores).
- **Penalidade por letra ou resposta errada.**
- **Penalidade por usar dica:** 0, 5 ou 10.
- Sons, animações e tema claro/escuro.

> O antigo campo "pontos por letra correta" foi removido: agora os pontos vêm somente da palavra.

## Personalizar cores

Edite as variáveis CSS em `style.css`:

```css
:root,
[data-tema="claro"] {
  --primary: #5b21b6;
  --secondary: #1e40af;
  --accent: #fbbf24;
  /* ... */
}
```

O tema escuro está em `[data-tema="escuro"]`.

## Sons

Os efeitos usam **Web Audio API** (osciladores). Não há arquivos externos. Para usar `.mp3`/`.wav`, estenda `tocarSom()` em `script.js` e mantenha a opção **Ativar sons**.

## Estrutura do projeto

```
jogo-palavras/
├── index.html   # Telas e markup
├── style.css    # Visual, responsividade e modo apresentação
├── script.js    # Lógica, LocalStorage, partida multijogador
└── README.md
```

`script.js` é dividido em seções comentadas: constantes/estado, utilitários, persistência, telas e modais, cadastro, configurar partida, fluxo da partida, renderização, resultado final, modo apresentação e eventos.

## Estado e funções principais

O estado da partida fica no objeto `partida` (`jogadores`, `indiceJogadorAtual`, `palavras`, `indicePalavraAtual`, `totalPalavras`, `palavraAtual`, `dicasExibidas`, `pontosDaPalavra`, `partidaAtiva` e campos de controle).

Funções: `configurarPartida`, `criarJogadores`, `iniciarPartida`, `sortearPalavrasDaPartida`, `embaralharPalavras`, `iniciarRodada`, `mostrarJogadorAtual`, `mostrarPlacar`, `mostrarDica`, `mostrarProximaDica`, `tentarLetra`, `resolverPalavra`, `passarVez`, `finalizarRodada`, `proximoJogador`, `proximaPalavra`, `finalizarPartida`, `mostrarResultadoFinal`, `novaPartida`, `calcularPontuacao`.

## Adicionar funcionalidades

- **Novas telas:** crie uma `<section class="tela" data-tela="nome">` e use `mostrarTela("nome")`.
- **Modais:** use `mostrarModal({ titulo, corpoHtml, acoes })`. Para texto com nomes digitados pelo usuário, monte o corpo com `criarCorpo([...])` (usa `textContent`).
- **Segurança:** textos do usuário (palavras, dicas, nomes de jogadores) são inseridos com `textContent`; evite `innerHTML` com dados cadastrados.

## Licença e identidade

Este projeto não utiliza logotipos, nomes ou elementos visuais de programas de TV existentes. A estética é genérica de “game show” para fins educacionais e de entretenimento.
