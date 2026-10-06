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

## Como cadastrar desafios (1 a 3 palavras e 1 a 3 dicas)

1. Na tela inicial, clique em **Cadastrar Palavras**.
2. Escolha **quantas palavras** o desafio terá (1, 2 ou 3) e preencha cada uma.
3. Escolha **quantas dicas** (1, 2 ou 3) e preencha cada uma. Os campos aparecem e somem conforme a escolha, e todos os campos visíveis são obrigatórios.
4. Informe a **Categoria** e os **Pontos** (padrão: 100) e clique em **CADASTRAR PALAVRA**.

Exemplo: um desafio com **3 palavras e 1 dica** (dica: "Frutas tropicais"; palavras: ABACAXI, MANGA, CAJU).

Modelo salvo no LocalStorage:

```json
{
  "id": 1,
  "palavra": "ABACAXI",
  "termos": ["ABACAXI", "MANGA", "CAJU"],
  "categoria": "Frutas",
  "dicas": ["Frutas tropicais."],
  "pontos": 100
}
```

`termos` guarda as palavras do desafio e `palavra` repete a primeira (compatibilidade). Registros antigos (`palavra` + `dica`) continuam funcionando e são convertidos automaticamente, sem perder dados.

Em **Palavras Cadastradas** aparecem as palavras (ex.: `ABACAXI + MANGA + CAJU`), categoria, quantidade de palavras e dicas, pontos e as ações Editar/Excluir. Ao editar, dá para mudar as quantidades e todos os campos.

## Como funciona o jogo

- **Uma letra por vez:** o jogador da vez escolhe uma letra. Acertando ou errando, a vez passa para o próximo jogador (ordem fixa e circular: 1 → 2 → 3 → 1…).
- **Desafio com várias palavras:** as palavras aparecem em linhas separadas e cada letra vale para todas ao mesmo tempo. O desafio termina quando todas estiverem reveladas.
- **Letras:** teclado virtual ou físico (A–Z). Letra correta revela todas as ocorrências (A vale para Á/Ã, C vale para Ç…). Espaços, hífens e apóstrofos aparecem fixos.
- **Palavras da partida:** as cadastradas são embaralhadas e só a quantidade escolhida é usada, sem repetição. Quando uma palavra termina, quem joga em seguida é o jogador seguinte ao que a completou.
- **Resolver palavra:** com várias palavras, o jogo mostra um campo para cada uma (em qualquer ordem). Aceita a resposta sem acentos e sem diferenciar maiúsculas/minúsculas. Se errar, mostra `❌ RESPOSTA INCORRETA!`, o jogador perde **metade dos próprios pontos** e a vez passa ao próximo jogador.
- **Dicas:** a Dica 1 aparece sozinha; **PRÓXIMA DICA** revela as seguintes.
- **⏭️ Passar a vez:** pede confirmação e passa a mesma palavra ao próximo jogador. Se todos passarem em sequência, a palavra é descartada sem pontos.
- **Fim:** o ranking mostra 🥇🥈🥉; empatados ficam na mesma posição (**EMPATE!**). **NOVA PARTIDA** zera tudo.

## Pontuação

- Todos começam com **0 pontos**.
- **Letra correta:** +5 pontos (configurável) para quem a escolheu, uma vez por letra.
- **Palavra completa:** quem a completa (última letra ou *Resolver palavra*) ganha os pontos da palavra proporcionais ao que ainda estava **oculto** (considerando as letras de todas as palavras do desafio). Palavra de 100 pontos com 90% já revelada rende 10. O cálculo usa as letras ocultas *antes* da jogada e o valor aparece em "Vale X pts".
- **Dicas:** cada dica exibida reduz o valor-base da palavra (0, 5 ou 10; padrão 5) antes do cálculo da porcentagem.
- **Letra errada** tira a penalidade por erro (padrão 5; use 0 para desativar) do jogador atual. **Resolver errado** tira metade dos pontos do jogador.
- A pontuação nunca fica abaixo de zero.

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

A partida em andamento **não** é salva: placar e rodadas existem apenas enquanto a partida acontece. Na primeira execução o jogo já vem com **50 desafios de tema bíblico** (personagens, livros, lugares e eventos), todos com a categoria "Bíblia". Quem já tinha o jogo salvo recebe esses desafios uma única vez e perde apenas os 3 exemplos antigos (ABACAXI, ELEFANTE, BRASIL); as palavras cadastradas por você não são alteradas. Você pode excluir qualquer uma em **Palavras Cadastradas**.

## Configurações

- **Pontos sugeridos ao cadastrar uma palavra** (valor padrão do formulário; não é a pontuação inicial dos jogadores).
- **Pontos por letra correta** (padrão 5).
- **Penalidade por letra ou resposta errada.**
- **Penalidade por usar dica:** 0, 5 ou 10.
- Sons, animações e tema claro/escuro.

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
