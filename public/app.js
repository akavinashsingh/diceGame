// API URL - Works both locally and on Railway
const API_URL = `${window.location.origin}/api`;

// State
let token = localStorage.getItem('token');
let currentUser = null;
let isWatchMode = false;
let gameOnCooldown = false;
let cooldownTimer = 10;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (token) {
        loadUserData();
    }
    updateUI();
});

// Update UI based on auth state
function updateUI() {
    const authButtons = document.getElementById('authButtons');
    const walletInfo = document.getElementById('walletInfo');
    const gameControls = document.getElementById('gameControls');
    const watchControls = document.getElementById('watchControls');
    const statsCard = document.getElementById('statsCard');
    const historyCard = document.getElementById('historyCard');

    if (token && currentUser) {
        authButtons.style.display = 'none';
        walletInfo.style.display = 'flex';
        gameControls.style.display = 'block';
        watchControls.style.display = 'none';
        statsCard.style.display = 'block';
        historyCard.style.display = 'block';
        isWatchMode = false;
        
        document.getElementById('balance').textContent = currentUser.walletBalance.toFixed(2);
        loadStats();
        loadHistory();
    } else if (isWatchMode) {
        authButtons.style.display = 'none';
        walletInfo.style.display = 'none';
        gameControls.style.display = 'none';
        watchControls.style.display = 'block';
        statsCard.style.display = 'none';
        historyCard.style.display = 'none';
    } else {
        authButtons.style.display = 'flex';
        walletInfo.style.display = 'none';
        gameControls.style.display = 'none';
        watchControls.style.display = 'none';
        statsCard.style.display = 'none';
        historyCard.style.display = 'none';
    }
}

// Authentication
async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            closeModal('registerModal');
            showNotification(data.message, 'success');
            updateUI();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            closeModal('loginModal');
            showNotification(data.message, 'success');
            updateUI();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    isWatchMode = false;
    updateUI();
    showNotification('Logged out successfully', 'success');
}

async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

// Game Functions
async function playGame(prediction) {
    if (!token) {
        showNotification('Please login to play', 'error');
        return;
    }

    if (gameOnCooldown) {
        showNotification(`Please wait ${cooldownTimer} seconds before playing again`, 'error');
        return;
    }

    const betAmount = parseFloat(document.getElementById('betAmount').value);

    if (!betAmount || betAmount < 1) {
        showNotification('Please enter a valid bet amount (minimum $1)', 'error');
        return;
    }

    if (betAmount > currentUser.walletBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }

    try {
        // Animate dice
        const dice = document.getElementById('dice');
        dice.classList.add('rolling');

        const response = await fetch(`${API_URL}/game/play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ betAmount, prediction })
        });

        const data = await response.json();

        // Wait for animation
        setTimeout(() => {
            dice.classList.remove('rolling');
            
            if (data.success) {
                // Update dice display
                document.querySelector('.dice-face').textContent = data.diceRoll;
                
                // Update balance
                currentUser.walletBalance = data.newBalance;
                updateUI();

                // Show result
                showResult(data);
                
                // Reload stats and history
                loadStats();
                loadHistory();

                // Start cooldown
                startGameCooldown();
            } else {
                showNotification(data.message, 'error');
            }
        }, 600);

    } catch (error) {
        showNotification('Game play failed. Please try again.', 'error');
        dice.classList.remove('rolling');
    }
}

async function watchRoll() {
    if (gameOnCooldown) {
        showNotification(`Please wait ${cooldownTimer} seconds before rolling again`, 'error');
        return;
    }

    try {
        // Animate dice
        const dice = document.getElementById('dice');
        dice.classList.add('rolling');

        const response = await fetch(`${API_URL}/game/watch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // Wait for animation
        setTimeout(() => {
            dice.classList.remove('rolling');
            
            if (data.success) {
                // Update dice display
                document.querySelector('.dice-face').textContent = data.diceRoll;
                
                // Show result
                const resultContainer = document.getElementById('resultContainer');
                const resultMessage = document.getElementById('resultMessage');
                
                resultMessage.textContent = data.message;
                resultMessage.className = 'result-message';
                resultContainer.style.display = 'block';

                setTimeout(() => {
                    resultContainer.style.display = 'none';
                }, 5000);

                // Start cooldown
                startGameCooldown();
            }
        }, 600);

    } catch (error) {
        showNotification('Watch mode failed. Please try again.', 'error');
        dice.classList.remove('rolling');
    }
}

// Cooldown timer for dice rolls
function startGameCooldown() {
    gameOnCooldown = true;
    cooldownTimer = 10;

    const cooldownInterval = setInterval(() => {
        cooldownTimer--;
        
        if (cooldownTimer <= 0) {
            clearInterval(cooldownInterval);
            gameOnCooldown = false;
            cooldownTimer = 10;
        }
    }, 1000);
}

function showResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    const resultMessage = document.getElementById('resultMessage');
    
    if (data.won) {
        resultMessage.textContent = data.message;
        resultMessage.className = 'result-message win';
    } else {
        resultMessage.textContent = data.message;
        resultMessage.className = 'result-message lose';
    }
    
    resultContainer.style.display = 'block';

    setTimeout(() => {
        resultContainer.style.display = 'none';
    }, 5000);
}

function watchMode() {
    isWatchMode = true;
    updateUI();
    showNotification('Watch mode activated - Roll the dice for free!', 'success');
}

// Stats and History
async function loadStats() {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/game/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalGames').textContent = stats.totalGames;
            document.getElementById('gamesWon').textContent = stats.gamesWon;
            document.getElementById('winRate').textContent = stats.winRate + '%';
            document.getElementById('netProfit').textContent = '$' + stats.netProfit;
        }
    } catch (error) {
        console.error('Failed to load stats');
    }
}

async function loadHistory() {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/game/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';

            if (data.history.length === 0) {
                historyList.innerHTML = '<p style="text-align: center; color: #aaa;">No games played yet</p>';
                return;
            }

            data.history.slice(0, 10).forEach(game => {
                const item = document.createElement('div');
                item.className = `history-item ${game.won ? 'win' : 'lose'}`;
                item.innerHTML = `
                    <div><strong>${game.prediction.toUpperCase()}</strong> - Dice: ${game.diceRoll} (${game.result})</div>
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">
                        Bet: $${game.betAmount} | ${game.won ? `Won: $${game.winAmount}` : 'Lost'}
                    </div>
                `;
                historyList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Failed to load history');
    }
}

// Modal Functions
function showLoginModal() {
    closeAllModals();
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    closeAllModals();
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Notifications
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
