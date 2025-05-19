document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const gameBoard = document.getElementById('game-board');
    const attemptsElement = document.getElementById('attempts');
    const timerElement = document.getElementById('timer');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverScreen = document.getElementById('game-over');
    const finalTimeElement = document.getElementById('final-time');
    const finalAttemptsElement = document.getElementById('final-attempts');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Variáveis do jogo
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let attempts = 0;
    let matchedPairs = 0;
    let totalPairs = 8;
    let timer = 0;
    let timerInterval;
    
    // Emojis para as cartas
    const emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    
    // Iniciar jogo
    initGame();
    
    // Função para iniciar o jogo
    function initGame() {
        resetGame();
        createCards();
        shuffleCards();
        renderCards();
        startTimer();
    }
    
    // Função para criar as cartas
    function createCards() {
        cards = [];
        // Duplicar emojis para criar pares
        const allEmojis = [...emojis, ...emojis];
        
        for (let i = 0; i < allEmojis.length; i++) {
            cards.push({
                id: i,
                emoji: allEmojis[i],
                isFlipped: false,
                isMatched: false
            });
        }
    }
    
    // Função para embaralhar as cartas
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }
    
    // Função para renderizar as cartas no tabuleiro
    function renderCards() {
        gameBoard.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.id = card.id;
            
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.innerHTML = `<div class="card-content">${card.emoji}</div>`;
            
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            
            cardElement.appendChild(cardFront);
            cardElement.appendChild(cardBack);
            
            if (card.isFlipped) {
                cardElement.classList.add('flipped');
            }
            
            if (card.isMatched) {
                cardElement.classList.add('matched');
            }
            
            cardElement.addEventListener('click', () => flipCard(card, cardElement));
            
            gameBoard.appendChild(cardElement);
        });
    }
    
    // Função para virar a carta
    function flipCard(card, cardElement) {
        if (lockBoard) return;
        if (cardElement.classList.contains('flipped')) return;
        
        cardElement.classList.add('flipped');
        card.isFlipped = true;
        
        if (!hasFlippedCard) {
            // Primeira carta virada
            hasFlippedCard = true;
            firstCard = { card, element: cardElement };
            return;
        }
        
        // Segunda carta virada
        secondCard = { card, element: cardElement };
        attempts++;
        attemptsElement.textContent = attempts;
        
        checkForMatch();
    }
    
    // Função para verificar se há um par
    function checkForMatch() {
        lockBoard = true;
        
        if (firstCard.card.emoji === secondCard.card.emoji) {
            // É um par!
            firstCard.card.isMatched = true;
            secondCard.card.isMatched = true;
            
            firstCard.element.classList.add('matched');
            secondCard.element.classList.add('matched');
            
            matchedPairs++;
            
            resetBoardState();
            
            // Verificar se o jogo acabou
            if (matchedPairs === totalPairs) {
                endGame();
            }
        } else {
            // Não é um par
            setTimeout(() => {
                firstCard.element.classList.remove('flipped');
                secondCard.element.classList.remove('flipped');
                
                firstCard.card.isFlipped = false;
                secondCard.card.isFlipped = false;
                
                resetBoardState();
            }, 1000);
        }
    }
    
    // Função para resetar o estado do tabuleiro
    function resetBoardState() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // Função para iniciar o timer
    function startTimer() {
        timer = 0;
        timerElement.textContent = timer;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = timer;
        }, 1000);
    }
    
    // Função para terminar o jogo
    function endGame() {
        clearInterval(timerInterval);
        
        finalTimeElement.textContent = timer;
        finalAttemptsElement.textContent = attempts;
        
        setTimeout(() => {
            gameOverScreen.style.display = 'flex';
        }, 500);
        
        // Salvar recorde no localStorage (opcional)
        saveScore();
    }
    
    // Função para salvar a pontuação
    function saveScore() {
        const scores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
        scores.push({
            date: new Date(),
            time: timer,
            attempts: attempts
        });
        
        // Ordenar por tempo (menor primeiro)
        scores.sort((a, b) => a.time - b.time);
        
        // Manter apenas os 10 melhores
        const topScores = scores.slice(0, 10);
        
        localStorage.setItem('memoryGameScores', JSON.stringify(topScores));
    }
    
    // Função para resetar o jogo
    function resetGame() {
        cards = [];
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        attempts = 0;
        matchedPairs = 0;
        attemptsElement.textContent = attempts;
        gameOverScreen.style.display = 'none';
    }
    
    // Event listeners para os botões
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
});