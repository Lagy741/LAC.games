document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const minesButton = document.getElementById('mines-button');
    const mainMenu = document.getElementById('main-menu');
    const minesGame = document.getElementById('mines-game');
    const gameBoard = document.getElementById('game-board');
    const balanceElem = document.getElementById('balance');
    const betElem = document.getElementById('bet');
    const minesElem = document.getElementById('mines');
    const withdrawButton = document.getElementById('withdraw');
    const currentWinningsElem = document.getElementById('current-winnings');
    const gameMessageElem = document.getElementById('game-message');
    const startGameButton = document.getElementById('start-game');

    let gridItems = [];
    let mines = [];
    let currentWinnings = 0;
    let betAmount = 0;
    let multiplier = 1;
    let gameStarted = false;
    let correctClicks = 0;
    let gameOver = false; // Nová proměnná pro sledování konce hry

    // Nastavení počátečního zůstatku
    let balance = 1000;
    balanceElem.textContent = `Balance: ${balance.toFixed(2)}`;

    menuButton.addEventListener('click', () => {
        mainMenu.classList.add('active');
        minesGame.classList.remove('active');
    });

    minesButton.addEventListener('click', () => {
        mainMenu.classList.remove('active');
        minesGame.classList.add('active');
        setupGrid(true); // Zobrazit miny
        gameStarted = false;
    });

    function generateMines(numMines) {
        const positions = Array.from(Array(25).keys());
        mines = [];
        for (let i = 0; i < numMines; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            mines.push(positions.splice(randomIndex, 1)[0]);
        }
    }

    function setupGrid(showMines = false) {
        gameBoard.innerHTML = '';
        gridItems = [];
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;

            if (showMines && mines.includes(i)) {
                cell.classList.add('mine'); // Zobrazit miny okamžitě
            }

            cell.addEventListener('click', () => {
                if (gameStarted && !gameOver) {
                    handleCellClick(i);
                }
            });

            gameBoard.appendChild(cell);
            gridItems.push(cell);
        }
    }

    function handleCellClick(index) {
        if (mines.includes(index)) {
            gridItems[index].classList.add('mine');
            gameMessageElem.textContent = 'Prohra';
            gameOver = true; // Nastavit konec hry
            disableGrid();
            currentWinnings = 0; // Reset aktuálních výher na 0
            currentWinningsElem.textContent = '0';
            withdrawButton.disabled = true; // Zakázat tlačítko Withdraw po prohře
        } else {
            gridItems[index].classList.add('success');
            correctClicks++;
            updateWinnings();
        }
    }

    function updateWinnings() {
        const numMines = parseInt(minesElem.value);
        multiplier = 1 + numMines * 0.1; // Násobitel podle počtu min, *1.1, *1.2 atd.

        // Zvýšit aktuální výhry na základě násobitele při každém správném tahu
        if (correctClicks === 1) {
            currentWinnings = betAmount * multiplier; // První správný tah
        } else {
            currentWinnings *= multiplier; // Každý další správný tah se násobí
        }

        currentWinningsElem.textContent = currentWinnings.toFixed(2);
        withdrawButton.disabled = false; // Povolit tlačítko Withdraw pouze při výhře
    }

    function disableGrid() {
        gridItems.forEach(cell => cell.removeEventListener('click', handleCellClick));
    }

    startGameButton.addEventListener('click', () => {
        const numMines = parseInt(minesElem.value);
        betAmount = parseFloat(betElem.value);
        if (isNaN(numMines) || numMines < 1 || numMines > 24 || isNaN(betAmount) || betAmount < 10) {
            alert('Neplatné nastavení');
            return;
        }

        // Odečíst sázku z balance
        if (betAmount > balance) {
            alert('Nemáte dostatečný zůstatek!');
            return;
        }
        balance -= betAmount;
        balanceElem.textContent = `Balance: ${balance.toFixed(2)}`;

        generateMines(numMines);
        setupGrid();
        currentWinnings = 0; // Resetování aktuální výhry na začátku hry
        correctClicks = 0;    // Reset počtu správných kliknutí
        currentWinningsElem.textContent = currentWinnings.toFixed(2);
        gameMessageElem.textContent = '';
        gameOver = false; // Zrušit stav gameOver při startu nové hry
        withdrawButton.disabled = true; // Zakázat tlačítko Withdraw na začátku nové hry
        gameStarted = true; // Spustit hru
    });

    withdrawButton.addEventListener('click', () => {
        if (currentWinnings > 0 && !gameOver) { // Povolit výběr pouze při výhrách a pokud hra není ukončena
            balance += currentWinnings;
            balanceElem.textContent = `Balance: ${balance.toFixed(2)}`;
            currentWinnings = 0;
            currentWinningsElem.textContent = '0';
            withdrawButton.disabled = true;
        }
    });
});
