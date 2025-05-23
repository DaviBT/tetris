// Seleciona o canvas e configura o contexto 2D para desenhar
const canvas = document.getElementById("tetris");
const contexto = canvas.getContext("2d");

// Define constantes do jogo
const tamanhoBloco = 30;
const linhas = 20;
const colunas = 10;
const tabuleiro = [];

// Variáveis do jogo
let pecaAtual;
let intervalo;
let pontuacao = 0;
let pecaX, pecaY;
let gameOver = false;

// Define as peças disponíveis no jogo
const pecas = [
  { shape: [[1, 1, 1, 1]], name: "I" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    name: "O",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    name: "T",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    name: "S",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    name: "Z",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    name: "L",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    name: "J",
  },
];

// Carrega pontuação salva do navegador
function inicializarPontuacao() {
  const pontuacaoSalva = localStorage.getItem("pontuacao");
  if (pontuacaoSalva !== null) {
    pontuacao = parseInt(pontuacaoSalva);
  }
  document.getElementById("pontuacaoValor").textContent = pontuacao;
}

// Salva pontuação no navegador
function salvarPontuacao() {
  localStorage.setItem("pontuacao", pontuacao);
}

// Inicializa tabuleiro vazio
function inicializarTabuleiro() {
  for (let linha = 0; linha < linhas; linha++) {
    tabuleiro[linha] = [];
    for (let coluna = 0; coluna < colunas; coluna++) {
      tabuleiro[linha][coluna] = 0;
    }
  }
}

// Desenha um bloco na posição (x, y)
function desenharBloco(x, y, cor) {
  contexto.fillStyle = cor;
  contexto.fillRect(x * tamanhoBloco, y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
  contexto.strokeStyle = "black";
  contexto.strokeRect(x * tamanhoBloco, y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
}

// Desenha todas as peças fixas no tabuleiro
function desenharTabuleiro() {
  for (let linha = 0; linha < linhas; linha++) {
    for (let coluna = 0; coluna < colunas; coluna++) {
      if (tabuleiro[linha][coluna]) {
        desenharBloco(coluna, linha, tabuleiro[linha][coluna]);
      }
    }
  }
}

// Sorteia uma nova peça aleatoriamente
function gerarNovaPeca() {
  const indice = Math.floor(Math.random() * pecas.length);
  return pecas[indice].shape;
}

// Desenha a peça atual na tela
function desenharPeca() {
  for (let linha = 0; linha < pecaAtual.length; linha++) {
    for (let coluna = 0; coluna < pecaAtual[linha].length; coluna++) {
      if (pecaAtual[linha][coluna]) {
        desenharBloco(coluna + pecaX, linha + pecaY, "purple");
      }
    }
  }
}

// Move a peça para baixo
function moverPecaBaixo() {
  if (verificarColisao(0, 1)) {
    fixarPeca();
    pecaAtual = gerarNovaPeca();
    pecaX = Math.floor(colunas / 2) - Math.floor(pecaAtual[0].length / 2);
    pecaY = 0;
    if (verificarFimDeJogo() && !gameOver) {
      gameOver = true;
      alert("Fim de jogo!");
      window.location.href = "tetris.html";
      return;
    }
  } else {
    pecaY++;
  }
}

// Verifica se o topo do tabuleiro está ocupado
function verificarFimDeJogo() {
  for (let coluna = 0; coluna < colunas; coluna++) {
    if (tabuleiro[0][coluna]) {
      return true;
    }
  }
  return false;
}

// Remove linhas completas e atualiza pontuação
function limparLinhasCompletas() {
  let linhasEliminadas = 0;
  for (let linha = linhas - 1; linha >= 0; linha--) {
    if (tabuleiro[linha].every((bloco) => bloco)) {
      tabuleiro.splice(linha, 1);
      tabuleiro.unshift(Array(colunas).fill(0));
      linhasEliminadas++;
      linha++;
    }
  }
  pontuacao += linhasEliminadas;
  document.getElementById("pontuacaoValor").textContent = pontuacao;
  salvarPontuacao();
}

// Limpa a tela e redesenha tudo
function desenhar() {
  contexto.clearRect(0, 0, canvas.width, canvas.height);
  desenharTabuleiro();
  desenharPeca();
}

// Loop principal do jogo
function loopJogo() {
  moverPecaBaixo();
  desenhar();
  if (!gameOver) {
    intervalo = setTimeout(loopJogo, 500);
  }
}

// Cria miniaturas das peças para visualização
function inicializarPecasDisponiveis() {
  const pecasDiv = document.getElementById("pecas");
  pecas.forEach((peca, indice) => {
    const pecaDiv = document.createElement("div");
    pecaDiv.classList.add("peca");
    pecaDiv.dataset.indice = indice;
    pecaDiv.dataset.shape = pecas[indice].name;
    peca.shape.forEach((linha) => {
      linha.forEach((bloco) => {
        const blocoDiv = document.createElement("div");
        blocoDiv.style.backgroundColor = bloco ? "purple" : "white";
        pecaDiv.appendChild(blocoDiv);
      });
    });
    pecasDiv.appendChild(pecaDiv);

    // Permite selecionar manualmente uma peça
    pecaDiv.addEventListener("click", () => {
      pecaAtual = pecas[indice].shape;
      pecaX = Math.floor(colunas / 2) - Math.floor(pecaAtual[0].length / 2);
      pecaY = 0;
    });
  });
}

// Verifica colisão ao mover ou girar a peça
function verificarColisao(deslocX, deslocY) {
  for (let linha = 0; linha < pecaAtual.length; linha++) {
    for (let coluna = 0; coluna < pecaAtual[linha].length; coluna++) {
      if (pecaAtual[linha][coluna]) {
        const novoX = coluna + pecaX + deslocX;
        const novoY = linha + pecaY + deslocY;
        if (
          novoX < 0 ||
          novoX >= colunas ||
          novoY >= linhas ||
          tabuleiro[novoY][novoX]
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Fixa a peça no tabuleiro
function fixarPeca() {
  for (let linha = 0; linha < pecaAtual.length; linha++) {
    for (let coluna = 0; coluna < pecaAtual[linha].length; coluna++) {
      if (pecaAtual[linha][coluna]) {
        tabuleiro[linha + pecaY][coluna + pecaX] = "purple";
      }
    }
  }
  limparLinhasCompletas();
}

// Gira a peça atual no sentido horário
function rotacionarPeca() {
  const novaPeca = [];
  for (let coluna = 0; coluna < pecaAtual[0].length; coluna++) {
    const novaLinha = [];
    for (let linha = pecaAtual.length - 1; linha >= 0; linha--) {
      novaLinha.push(pecaAtual[linha][coluna]);
    }
    novaPeca.push(novaLinha);
  }
  if (!verificarColisao(0, 0, novaPeca)) {
    pecaAtual = novaPeca;
  }
}

// Captura teclas pressionadas e move/gira a peça
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft" && !verificarColisao(-1, 0)) {
    pecaX--;
  } else if (event.key === "ArrowRight" && !verificarColisao(1, 0)) {
    pecaX++;
  } else if (event.key === "ArrowDown") {
    moverPecaBaixo();
  } else if (event.key === "ArrowUp") {
    rotacionarPeca();
    event.preventDefault();
  }
  desenhar();
});

// Inicializa o jogo
inicializarTabuleiro();
inicializarPontuacao();
pecaAtual = gerarNovaPeca();
pecaX = Math.floor(colunas / 2) - Math.floor(pecaAtual[0].length / 2);
pecaY = 0;
inicializarPecasDisponiveis();
loopJogo();
