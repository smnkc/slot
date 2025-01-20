// Sabitler
const INITIAL_BALANCE = 1000;
const SYMBOLS = ['7️⃣', '💎', '🍒', '🍇', '🍊', '🍎'];
const PAYOUTS = {
    '7️⃣': 40,
    '💎': 35,
    '🍒': 30,
    '🍇': 25,
    '🍊': 20,
    '🍎': 15
};

// Oyun Durumu
const gameState = {
    balance: INITIAL_BALANCE,
    currentBet: 0,
    isSpinning: false,
    autoPlayActive: false,
    soundEnabled: true,
    currentGame: 'slot',
    stats: {
        totalGames: 0,
        wonGames: 0,
        highScore: 0
    }
};

// DOM Elementleri
const elements = {
    // Genel
    balanceDisplay: document.getElementById('balanceAmount'),
    soundButton: document.getElementById('soundButton'),
    infoButton: document.getElementById('infoButton'),
    slotButton: document.getElementById('slotButton'),
    blackjackButton: document.getElementById('blackjackButton'),
    
    // Slot Oyunu
    slots: [
        document.getElementById('slot1'),
        document.getElementById('slot2'),
        document.getElementById('slot3')
    ],
    betAmount: document.getElementById('betAmount'),
    winAmount: document.getElementById('winAmount'),
    highScore: document.getElementById('highScore'),
    totalGames: document.getElementById('totalGames'),
    wonGames: document.getElementById('wonGames'),
    winRate: document.getElementById('winRate'),
    spinButton: document.getElementById('spinButton'),
    autoSpinButton: document.getElementById('autoSpinButton'),
    betButtons: document.querySelectorAll('.bet-button'),
    clearBetButton: document.getElementById('clearBetButton'),
    
    // Blackjack
    bjBetAmount: document.getElementById('bjBetAmount'),
    dealerCards: document.getElementById('dealerCards'),
    playerCards: document.getElementById('playerCards'),
    dealerTotal: document.getElementById('dealerTotal'),
    playerTotal: document.getElementById('playerTotal'),
    dealButton: document.getElementById('dealButton'),
    hitButton: document.getElementById('hitButton'),
    standButton: document.getElementById('standButton'),
    doubleButton: document.getElementById('doubleButton'),
    clearBjBetButton: document.getElementById('clearBjBetButton'),
    bjMessage: document.getElementById('bjMessage'),
    
    // Oyun Konteynerleri
    slotGame: document.getElementById('slotGame'),
    blackjackGame: document.getElementById('blackjackGame'),
    
    // Modal
    modal: document.getElementById('infoModal')
};

// Ses Efektleri
const sounds = {
    spin: document.getElementById('spinSound'),
    win: document.getElementById('winSound'),
    jackpot: document.getElementById('jackpotSound'),
    click: document.getElementById('clickSound'),
    coin: document.getElementById('coinSound'),
    card: document.getElementById('cardSound'),
    winGame: document.getElementById('winGameSound'),
    loseGame: document.getElementById('loseGameSound')
};

// Yardımcı Fonksiyonlar
function playSound(soundName) {
    if (!gameState.soundEnabled) return;
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

function updateDisplay() {
    // Bakiye güncelleme
    elements.balanceDisplay.textContent = gameState.balance;
    
    // Bahis butonlarını güncelle
    elements.betButtons.forEach(btn => {
        const amount = parseInt(btn.dataset.amount);
        btn.disabled = amount > gameState.balance;
        btn.classList.toggle('active', amount === gameState.currentBet);
    });
    
    if (gameState.currentGame === 'slot') {
        // Slot oyunu güncellemeleri
        elements.betAmount.textContent = gameState.currentBet;
        elements.totalGames.textContent = gameState.stats.totalGames;
        elements.wonGames.textContent = gameState.stats.wonGames;
        elements.winRate.textContent = gameState.stats.totalGames > 0 
            ? ((gameState.stats.wonGames / gameState.stats.totalGames) * 100).toFixed(1)
            : '0';
        
        // Buton durumları
        elements.spinButton.disabled = gameState.isSpinning || gameState.currentBet === 0 || gameState.balance < gameState.currentBet;
        elements.autoSpinButton.disabled = gameState.currentBet === 0 || gameState.balance < gameState.currentBet;
    } else {
        // Blackjack güncellemeleri
        elements.bjBetAmount.textContent = gameState.currentBet;
        elements.dealButton.disabled = gameState.currentBet === 0 || gameState.balance < gameState.currentBet || bjState.isPlaying;
    }
}

function showMessage(text, duration = 2000) {
    const oldMessage = document.querySelector('.message');
    if (oldMessage) oldMessage.remove();
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), duration);
}

// Slot Oyunu Fonksiyonları
function setBet(amount) {
    if (amount > gameState.balance) {
        showMessage('Yetersiz bakiye!');
        return;
    }
    
    playSound('click');
    gameState.currentBet = amount;
    updateDisplay();
}

function clearBet() {
    playSound('click');
    gameState.currentBet = 0;
    if (gameState.autoPlayActive) stopAutoPlay();
    updateDisplay();
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function checkWin(symbols) {
    const uniqueSymbols = new Set(symbols);
    
    if (uniqueSymbols.size === 1) {
        // Üç aynı sembol
        const symbol = symbols[0];
        const multiplier = PAYOUTS[symbol];
        const winAmount = gameState.currentBet * multiplier;
        
        elements.slots.forEach(slot => slot.classList.add('winner'));
        setTimeout(() => elements.slots.forEach(slot => slot.classList.remove('winner')), 2000);
        
        playSound(multiplier >= 35 ? 'jackpot' : 'win');
        return winAmount;
    } else if (uniqueSymbols.size === 2) {
        // İki aynı sembol
        playSound('coin');
        return gameState.currentBet * 2;
    }
    
    return 0;
}

function spin() {
    if (gameState.isSpinning || gameState.currentBet === 0) return;
    if (gameState.balance < gameState.currentBet) {
        showMessage('Yetersiz bakiye!');
        return;
    }
    
    // Bahisi düş
    gameState.balance -= gameState.currentBet;
    gameState.isSpinning = true;
    updateDisplay();
    
    // Spin animasyonu
    playSound('spin');
    
    // Sonuçları hesapla
    const results = elements.slots.map(() => getRandomSymbol());
    
    // Sıralı animasyon
    elements.slots.forEach((slot, index) => {
        slot.classList.add('spinning');
        slot.textContent = '🎰';
        
        // Her slot için farklı zamanlama
        setTimeout(() => {
            slot.classList.remove('spinning');
            slot.textContent = results[index];
            playSound('click');
            
            // Son slot döndükten sonra kazanç kontrolü
            if (index === 2) {
                const winAmount = checkWin(results);
                if (winAmount > 0) {
                    gameState.balance += winAmount;
                    gameState.stats.wonGames++;
                    elements.winAmount.textContent = winAmount;
                    
                    if (winAmount > gameState.stats.highScore) {
                        gameState.stats.highScore = winAmount;
                        elements.highScore.textContent = winAmount;
                    }
                } else {
                    elements.winAmount.textContent = '0';
                }
                
                gameState.stats.totalGames++;
                gameState.isSpinning = false;
                updateDisplay();
                
                // Otomatik oyun devam ediyorsa
                if (gameState.autoPlayActive && gameState.balance >= gameState.currentBet) {
                    setTimeout(spin, 1000);
                } else if (gameState.autoPlayActive) {
                    stopAutoPlay();
                    showMessage('Otomatik oyun durdu: Yetersiz bakiye!');
                }
            }
        }, 500 + (index * 500)); // Her slot 500ms arayla dönmeyi bitirsin
    });
}

function startAutoPlay() {
    if (gameState.currentBet === 0) {
        showMessage('Lütfen bahis miktarı seçin!');
        return;
    }
    
    gameState.autoPlayActive = true;
    elements.autoSpinButton.textContent = 'DURDUR';
    elements.autoSpinButton.classList.add('active');
    spin();
}

function stopAutoPlay() {
    gameState.autoPlayActive = false;
    elements.autoSpinButton.textContent = 'OTOMATİK';
    elements.autoSpinButton.classList.remove('active');
}

// Blackjack Sabitleri
const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Blackjack Durumu
const bjState = {
    deck: [],
    dealerCards: [],
    playerCards: [],
    isPlaying: false,
    isDealerTurn: false
};

// Blackjack Fonksiyonları
function createDeck() {
    bjState.deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            bjState.deck.push({ suit, value });
        }
    }
    // Desteyi karıştır
    for (let i = bjState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bjState.deck[i], bjState.deck[j]] = [bjState.deck[j], bjState.deck[i]];
    }
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateHand(cards) {
    let total = 0;
    let aces = 0;

    for (let card of cards) {
        if (card.value === 'A') {
            aces++;
        } else {
            total += getCardValue(card);
        }
    }

    // As'ları ekle
    for (let i = 0; i < aces; i++) {
        if (total + 11 <= 21) {
            total += 11;
        } else {
            total += 1;
        }
    }

    return total;
}

function drawCard() {
    if (bjState.deck.length === 0) createDeck();
    return bjState.deck.pop();
}

function displayCard(card, container) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card ' + (card.suit === '♥' || card.suit === '♦' ? 'red' : '');
    cardDiv.textContent = card.value + card.suit;
    container.appendChild(cardDiv);
    playSound('card');
}

function checkBlackjack(cards) {
    return cards.length === 2 && calculateHand(cards) === 21;
}

function updateTotals() {
    elements.playerTotal.textContent = calculateHand(bjState.playerCards);
    if (bjState.isDealerTurn) {
        elements.dealerTotal.textContent = calculateHand(bjState.dealerCards);
    } else {
        elements.dealerTotal.textContent = getCardValue(bjState.dealerCards[0]);
    }
}

function setBjBet(amount) {
    if (amount > gameState.balance) {
        showMessage('Yetersiz bakiye!');
        return;
    }
    
    playSound('click');
    gameState.currentBet = amount;
    updateDisplay();
}

function clearBjBet() {
    playSound('click');
    gameState.currentBet = 0;
    updateDisplay();
}

function startBjGame() {
    if (gameState.currentBet === 0) {
        showMessage('Lütfen bahis miktarı seçin!');
        return;
    }

    if (gameState.currentBet > gameState.balance) {
        showMessage('Yetersiz bakiye!');
        return;
    }

    // Bahisi düş
    gameState.balance -= gameState.currentBet;
    updateDisplay();

    // Oyunu başlat
    bjState.isPlaying = true;
    bjState.isDealerTurn = false;
    bjState.dealerCards = [];
    bjState.playerCards = [];

    // Masayı temizle
    elements.dealerCards.innerHTML = '';
    elements.playerCards.innerHTML = '';
    elements.bjMessage.textContent = '';

    // Yeni deste
    createDeck();

    // İlk kartları dağıt
    bjState.dealerCards.push(drawCard());
    bjState.playerCards.push(drawCard());
    bjState.dealerCards.push(drawCard());
    bjState.playerCards.push(drawCard());

    // Kartları göster
    displayCard(bjState.dealerCards[0], elements.dealerCards);
    const hiddenCard = document.createElement('div');
    hiddenCard.className = 'card';
    hiddenCard.textContent = '?';
    elements.dealerCards.appendChild(hiddenCard);

    bjState.playerCards.forEach(card => displayCard(card, elements.playerCards));

    // Toplam değerleri göster
    updateTotals();

    // Blackjack kontrolü
    if (checkBlackjack(bjState.playerCards)) {
        if (checkBlackjack(bjState.dealerCards)) {
            endBjGame('Berabere! İki taraf da Blackjack!', 'draw');
        } else {
            endBjGame('BLACKJACK! Kazandınız!', 'blackjack');
        }
        return;
    } else if (checkBlackjack(bjState.dealerCards)) {
        elements.dealerCards.innerHTML = '';
        bjState.dealerCards.forEach(card => displayCard(card, elements.dealerCards));
        endBjGame('Kurpiyer Blackjack! Kaybettiniz!', false);
        return;
    }

    // Butonları ayarla
    elements.dealButton.disabled = true;
    elements.hitButton.disabled = false;
    elements.standButton.disabled = false;
    elements.doubleButton.disabled = gameState.balance < gameState.currentBet;
}

function hit() {
    const card = drawCard();
    bjState.playerCards.push(card);
    displayCard(card, elements.playerCards);
    
    const total = calculateHand(bjState.playerCards);
    elements.playerTotal.textContent = total;
    
    if (total > 21) {
        endBjGame('21\'i Geçtiniz! Kaybettiniz!', false);
    } else if (total === 21) {
        stand();
    }
}

function stand() {
    bjState.isDealerTurn = true;
    elements.hitButton.disabled = true;
    elements.standButton.disabled = true;
    elements.doubleButton.disabled = true;
    
    // Kurpiyerin kartlarını göster
    elements.dealerCards.innerHTML = '';
    bjState.dealerCards.forEach(card => displayCard(card, elements.dealerCards));
    
    function dealerPlay() {
        const dealerTotal = calculateHand(bjState.dealerCards);
        elements.dealerTotal.textContent = dealerTotal;
        
        if (dealerTotal < 17) {
            setTimeout(() => {
                const card = drawCard();
                bjState.dealerCards.push(card);
                displayCard(card, elements.dealerCards);
                dealerPlay();
            }, 500);
        } else {
            checkWinner();
        }
    }
    
    dealerPlay();
}

function double() {
    if (gameState.balance < gameState.currentBet) {
        showMessage('İkiye katlamak için yeterli bakiye yok!');
        return;
    }
    
    gameState.balance -= gameState.currentBet;
    gameState.currentBet *= 2;
    updateDisplay();
    
    const card = drawCard();
    bjState.playerCards.push(card);
    displayCard(card, elements.playerCards);
    
    const total = calculateHand(bjState.playerCards);
    elements.playerTotal.textContent = total;
    
    if (total > 21) {
        endBjGame('21\'i Geçtiniz! Kaybettiniz!', false);
    } else {
        stand();
    }
}

function checkWinner() {
    const playerTotal = calculateHand(bjState.playerCards);
    const dealerTotal = calculateHand(bjState.dealerCards);
    
    if (dealerTotal > 21) {
        endBjGame('Kurpiyer 21\'i Geçti! Kazandınız!', true);
    } else if (dealerTotal > playerTotal) {
        endBjGame('Kurpiyer Kazandı!', false);
    } else if (dealerTotal < playerTotal) {
        endBjGame('Tebrikler! Kazandınız!', true);
    } else {
        endBjGame('Berabere!', 'draw');
    }
}

function endBjGame(message, playerWins) {
    bjState.isPlaying = false;
    elements.bjMessage.textContent = message;
    
    if (playerWins === 'blackjack') {
        gameState.balance += Math.floor(gameState.currentBet * 2.5);
        playSound('winGame');
    } else if (playerWins === true) {
        gameState.balance += gameState.currentBet * 2;
        playSound('winGame');
    } else if (playerWins === 'draw') {
        gameState.balance += gameState.currentBet;
    } else {
        playSound('loseGame');
    }
    
    updateDisplay();
    
    // Butonları sıfırla
    elements.hitButton.disabled = true;
    elements.standButton.disabled = true;
    elements.doubleButton.disabled = true;
    elements.dealButton.disabled = false;
}

// Event Listeners
// Genel Kontroller
elements.soundButton.onclick = () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    elements.soundButton.textContent = gameState.soundEnabled ? '🔊' : '🔈';
    playSound('click');
};

elements.infoButton.onclick = () => {
    playSound('click');
    elements.modal.style.display = 'block';
};

document.querySelector('.close').onclick = () => {
    playSound('click');
    elements.modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === elements.modal) {
        elements.modal.style.display = 'none';
    }
};

// Oyun Seçimi
elements.slotButton.onclick = () => {
    playSound('click');
    gameState.currentGame = 'slot';
    elements.slotGame.classList.add('active');
    elements.blackjackGame.classList.remove('active');
    elements.slotButton.classList.add('active');
    elements.blackjackButton.classList.remove('active');
    if (gameState.autoPlayActive) stopAutoPlay();
    clearBet();
};

elements.blackjackButton.onclick = () => {
    playSound('click');
    gameState.currentGame = 'blackjack';
    elements.blackjackGame.classList.add('active');
    elements.slotGame.classList.remove('active');
    elements.blackjackButton.classList.add('active');
    elements.slotButton.classList.remove('active');
    if (gameState.autoPlayActive) stopAutoPlay();
    clearBet();
};

// Slot Kontrolleri
elements.betButtons.forEach(button => {
    button.onclick = () => {
        if (gameState.currentGame === 'slot') {
            setBet(parseInt(button.dataset.amount));
        } else {
            setBjBet(parseInt(button.dataset.amount));
        }
    };
});

elements.clearBetButton.onclick = clearBet;
elements.clearBjBetButton.onclick = clearBjBet;

elements.spinButton.onclick = () => {
    playSound('click');
    spin();
};

elements.autoSpinButton.onclick = () => {
    playSound('click');
    if (gameState.autoPlayActive) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
};

// Blackjack Kontrolleri
elements.dealButton.onclick = () => {
    playSound('click');
    startBjGame();
};

elements.hitButton.onclick = () => {
    playSound('click');
    hit();
};

elements.standButton.onclick = () => {
    playSound('click');
    stand();
};

elements.doubleButton.onclick = () => {
    playSound('click');
    double();
};

// Başlangıç durumunu ayarla
updateDisplay(); 