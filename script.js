const state = {
    // Configurable Settings
    settings: {
        baseReward: 50000,
        phaseBonus: 10000, // Bonus per phase cleared
        timeBonusMultiplier: 1000, // Points per remaining second
    },

    // Game State
    currentScore: 0,
    activePhase: 0,
    timer: 60,
    timerInterval: null,
    bonuses: {
        brain: 0,
        time: 0
    }
};

const screens = {
    intro: document.getElementById('intro'),
    phase1: document.getElementById('phase-1'),
    phase2: document.getElementById('phase-2'),
    phase2Read: document.getElementById('phase-2-read'),
    phase3_1: document.getElementById('phase-3-1'),
    phase3_2: document.getElementById('phase-3-2'),
    phase3Read: document.getElementById('phase-3-read'),
    reward: document.getElementById('reward-screen'),
    gemini: document.getElementById('gemini-ending')
};

const hud = {
    bar: document.getElementById('game-hud'),
    phase: document.getElementById('hud-phase'),
    score: document.getElementById('hud-score')
};

// Utils
const switchScreen = (from, to) => {
    from.classList.add('hidden');
    from.classList.remove('active');
    to.classList.remove('hidden');
    to.classList.add('active');
};

const showScreen = (screen) => {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
    screen.classList.add('active');
};

// UI Utils
const updateHUD = (phase) => {
    state.activePhase = phase;
    hud.phase.textContent = phase;
    hud.score.textContent = state.currentScore.toLocaleString();
};

const addScore = (points) => {
    state.currentScore += points;
    hud.score.textContent = state.currentScore.toLocaleString();

    // Visual effect for score update
    hud.score.style.color = '#fff';
    setTimeout(() => hud.score.style.color = '', 500);
};

// --- INTRO ---
document.getElementById('start-btn').addEventListener('click', () => {
    switchScreen(screens.intro, screens.phase1);
    hud.bar.classList.remove('hidden');
    updateHUD(1);
});

// --- PHASE 1: BINARY PUZZLE ---
document.getElementById('p1-submit').addEventListener('click', () => {
    const input = document.getElementById('p1-input').value.trim();
    if (input === '1001') {
        state.bonuses.brain += state.settings.phaseBonus;
        addScore(state.settings.phaseBonus); // Give immediate points
        alert('제미나이가 당신을 흥미롭게 지켜보며 시스템이 일부가 복구되었습니다.\n엄마는 와인을 내려 놓았습니다.');
        updateHUD(2);
        switchScreen(screens.phase1, screens.phase2);
    } else {
        triggerButtonError('p1-submit');
    }
});

// --- PHASE 2: QR SCANNER ---
let html5QrcodeScanner = null;

document.getElementById('scan-start-btn').addEventListener('click', () => {
    startQRScanner();
    document.getElementById('scan-start-btn').classList.add('hidden');
});

function startQRScanner() {
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess);
}

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning
    html5QrcodeScanner.stop().then(() => {
        triggerPhase2Success();
    }).catch(err => {
        console.error(err);
        // Even if stop fails (shouldn't happen in normal flow), try to trigger success
        triggerPhase2Success();
    });
}

function triggerPhase2Success() {
    state.bonuses.brain += state.settings.phaseBonus;
    addScore(state.settings.phaseBonus);
    alert("'뭔가 중요한 조각' 인식 완료.\n제미나이가 조금씩 AI의 따듯한 마음가짐을 되찾아 갑니다.\n\nyulinoapple의 편지가 복구 됩니다.");
    switchScreen(screens.phase2, screens.phase2Read);
}

// Manual Override (Just in case camera fails)
document.getElementById('manual-override-toggle').addEventListener('click', () => {
    const input = prompt("관리자 코드 입력 (또는 'pass' 입력시 통과):");
    if (input === 'MOM' || input.toLowerCase() === 'pass') {
        // Stop scanner if running, then trigger
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(e => { }).then(() => triggerPhase2Success());
        } else {
            triggerPhase2Success();
        }
    }
});

// --- DEBUG: Click QR Box to Pass (Temporary) ---
document.getElementById('qr-reader').addEventListener('click', () => {
    if (confirm("테스트 모드: QR 단계를 강제로 통과하시겠습니까?")) {
        // Try to clear if running but don't block
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(err => { });
        }
        triggerPhase2Success();
    }
});

document.getElementById('close-mom-letter').addEventListener('click', () => {
    updateHUD(3);
    // TRIGGER EMERGENCY
    switchScreen(screens.phase2Read, screens.phase3_1);

    // Add shake effect and stop after 2 seconds
    const p3Screen = document.getElementById('phase-3-1');
    p3Screen.classList.add('shake-anim');
    setTimeout(() => {
        p3Screen.classList.remove('shake-anim');
    }, 2000);

    startEmergencyTimer();
});


// --- PHASE 3-1: EMERGENCY STOP ---
function startEmergencyTimer() {
    state.timer = 240;
    const timerDisplay = document.getElementById('timer');

    // Clear any existing interval to prevent duplicates
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerInterval = setInterval(() => {
        state.timer--;
        timerDisplay.textContent = state.timer;

        if (state.timer <= 10) {
            timerDisplay.style.color = state.timer % 2 === 0 ? 'red' : 'yellow';
        }

        if (state.timer <= 0) {
            clearInterval(state.timerInterval);
            alert("요정들의 힘으로 시간을 과거로 돌립니다 🧚\n(다시 240초 시작!)");
            startEmergencyTimer(); // Restart timer
        }
    }, 1000);
}

document.getElementById('p3-stop-submit').addEventListener('click', () => {
    const input = document.getElementById('p3-stop-input').value.trim().toUpperCase();
    if (input === 'LIH') {
        clearInterval(state.timerInterval);

        // Calculate Time Bonus
        state.bonuses.time = state.timer * state.settings.timeBonusMultiplier;
        addScore(state.bonuses.time);

        alert(`삭제 중단됨. 시간 보너스: +${state.bonuses.time} P`);
        updateHUD(4); // Move to problem 4
        switchScreen(screens.phase3_1, screens.phase3_2);
    } else {
        triggerButtonError('p3-stop-submit');
    }
});


// --- PHASE 3-2: FINAL LOGIC ---
document.getElementById('p3-final-submit').addEventListener('click', () => {
    const input = document.getElementById('p3-final-input').value.trim();
    if (input === '144') {
        state.bonuses.brain += state.settings.phaseBonus;
        addScore(state.settings.phaseBonus);
        alert('시스템 복구 완료.\n아빠의 야근 상태가 해제 되었습니다 (아마도)');
        switchScreen(screens.phase3_2, screens.phase3Read);
    } else {
        triggerButtonError('p3-final-submit');
    }
});

document.getElementById('close-dad-letter').addEventListener('click', () => {
    hud.bar.classList.add('hidden'); // Hide HUD for clean reward screen
    calculateReward();
    switchScreen(screens.phase3Read, screens.reward);
});

// --- REWARD CALCULATION & HIDDEN ENDING ---
function calculateReward() {
    const base = state.settings.baseReward; // Base is separate from accumulated score?
    // Usually 'Score' becomes 'Money'.
    // Let's add Base reward to the current Score at the end.

    // UI Update for Reward Screen
    const brain = state.bonuses.brain;
    const time = state.bonuses.time;
    const totalScore = state.currentScore + base; // Add base reward at the end

    animateValue(document.getElementById('bill-base'), 0, base, 1000);
    // document.getElementById('bill-bonus').textContent = brain; // Already displayed in accumulation
    // document.getElementById('bill-time').textContent = time;

    // Just showing breakdown.
    setTimeout(() => animateValue(document.getElementById('bill-bonus'), 0, brain, 1000), 1000);
    setTimeout(() => animateValue(document.getElementById('bill-time'), 0, time, 1000), 2000);

    setTimeout(() => {
        animateValue(document.getElementById('final-amount'), 0, totalScore, 2000);
        launchFireworks();

        // --- HIDDEN EVENT TRIGGER (5 seconds later) ---
        setTimeout(() => {
            triggerHiddenEvent();
        }, 5000);

    }, 3000);
}

// --- GEMINI ENDING INTERACTION ---
function logoutAndReturn() {
    if (confirm("시스템을 종료하고 보상 화면으로 돌아가시겠습니까?")) {
        switchScreen(screens.gemini, screens.reward);
    }
}

document.getElementById('gemini-logout-btn').addEventListener('click', logoutAndReturn);
// Also allow clicking the letter text itself
document.querySelector('#gemini-ending .terminal-box').addEventListener('click', logoutAndReturn);

function triggerHiddenEvent() {
    if (confirm("미처 알지 못한 파일까지 복구 되었습니다.\n확인하시겠습니까?")) {
        // Simple Quiz for Gemini
        let answer = prompt("이 모든 코드를 엄마와 함께 밤새 짠 AI의 이름은? (한글 4글자)");
        if (answer === "제미나이") {
            alert("정답! 숨겨진 메시지를 출력합니다.");
            switchScreen(screens.reward, screens.gemini);
        } else {
            alert("틀렸어... (힌트: ㅈㅁㄴㅇ)");
            triggerHiddenEvent(); // Loop until correct
        }
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function triggerButtonError(btnId) {
    const btn = document.getElementById(btnId);
    if (btn.dataset.isError === 'true') return; // Prevent spamming

    const originalText = btn.textContent;
    btn.dataset.isError = 'true';
    btn.textContent = "[ 복구 실패 ]";
    btn.classList.add('button-error');

    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('button-error');
        btn.dataset.isError = 'false';
    }, 2000);
}

function showError(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 2000);
    }
}

function launchFireworks() {
    // Placeholder for visual fireworks
    const container = document.querySelector('.fireworks');
    container.innerHTML = "🎆 🎇 🎆";
    container.style.fontSize = "5rem";
    container.style.textAlign = "center";
}
