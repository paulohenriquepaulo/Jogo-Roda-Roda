# Desafio das Palavras

Jogo de navegador inspirado na dinâmica de programas de adivinhação de palavras, com identidade visual própria. Desenvolvido com **HTML5**, **CSS3** e **JavaScript puro**, sem backend.

## Como executar

1. Abra a pasta `jogo-palavras`.
2. Dê duplo clique em `index.html` ou arraste o arquivo para o navegador (Chrome, Edge, Firefox, etc.).
3. Não é necessário servidor nem instalação de dependências.

## Como cadastrar palavras

1. Na tela inicial, clique em **Cadastrar Palavras**.
2. Preencha **categoria** (pode escolher uma sugestão ou digitar outra), **palavra**, **dica** e opcionalmente **pontos** (padrão: 100).
3. Clique em **CADASTRAR PALAVRA**.
4. Os dados são salvos automaticamente no **LocalStorage** do navegador.

## Como jogar

1. Clique em **Jogar** (é necessário ter ao menos uma palavra cadastrada).
2. Leia a **categoria** e a **dica**.
3. Clique nas letras do **teclado virtual** ou use o **teclado físico** (A–Z).
4. Letras corretas revelam todas as ocorrências na palavra; erros aplicam penalidade (se configurada).
5. Use **Resolver palavra** para tentar a resposta completa.
6. Ao revelar todas as letras ou acertar na resolução, aparece a tela de vitória com confetes.
7. **Próxima palavra** sorteia outra entrada sem repetir imediatamente a anterior; a partida embaralha todas as palavras antes de repetir o ciclo.

## LocalStorage

O jogo usa três chaves:

| Chave           | Conteúdo                          |
|-----------------|-----------------------------------|
| `palavrasJogo`  | Lista de palavras cadastradas     |
| `configJogo`    | Pontuação, som e animações        |
| `temaJogo`      | `claro` ou `escuro`               |

Na **primeira execução**, se não houver palavras salvas, três exemplos (ABACAXI, ELEFANTE, BRASIL) são inseridos automaticamente. Você pode excluí-los em **Palavras Cadastradas**.

## Pontuação

Em **Configurações** você pode alterar:

- Pontos iniciais (valor base da palavra sorteada ou padrão global)
- Pontos por letra correta
- Penalidade por letra errada

A pontuação nunca fica abaixo de zero.

Valores padrão no código (`CONFIG_PADRAO` em `script.js`):

```javascript
pontosIniciais: 100,
pontosPorAcerto: 10,
penalidadeErro: 5
```

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

Os efeitos usam **Web Audio API** (osciladores). Não há arquivos externos obrigatórios. Para usar arquivos `.mp3` ou `.wav` no futuro, estenda a função `tocarSom()` em `script.js` e mantenha a opção **Ativar sons** nas configurações.

## Palavras com acentos, espaços e símbolos

- A palavra é exibida **com acentos** (ex.: CORAÇÃO).
- Na adivinhação, **A** equivale a **A/Á/Ã**, **C** a **C/Ç**, etc., via `normalizarLetra()`.
- **Espaços**, **hífens** e **apóstrofos** aparecem fixos; o jogador não precisa “adivinhá-los”.
- Frases como `RIO DE JANEIRO` são suportadas.

## Múltiplas dicas (futuro)

O código usa `obterDicas()`, que aceita `dica` (string) ou `dicas` (array). Para testar várias dicas, edite um registro no LocalStorage:

```json
{
  "id": 1,
  "palavra": "ABACAXI",
  "dicas": ["Fruta tropical.", "Casca espinhosa."],
  "categoria": "Frutas",
  "pontos": 100
}
```

O botão **Mostrar outra dica** aparece quando há mais de uma dica.

## Estrutura do projeto

```
jogo-palavras/
├── index.html   # Telas e markup
├── style.css    # Visual e responsividade
├── script.js    # Lógica, LocalStorage, jogo
└── README.md
```

## Adicionar funcionalidades

- **Novas telas:** crie uma `<section class="tela">` e registre em `mostrarTela()`.
- **Modais:** use `mostrarModal({ titulo, corpoHtml, acoes })`.
- **Estado do jogo:** objeto `estadoJogo` no início de `script.js`.
- **Segurança:** textos do usuário são inseridos com `textContent`; evite `innerHTML` com dados cadastrados.

## Licença e identidade

Este projeto não utiliza logotipos, nomes ou elementos visuais de programas de TV existentes. A estética é genérica de “game show” para fins educacionais e de entretenimento.
