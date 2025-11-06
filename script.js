// Select keyboard mapping based on page level
const currentLevel = (document.body && document.body.dataset && document.body.dataset.level === '2') ? 2 : 1;

function getKeyboardMap(level) {
    // Common punctuation mapping
    const punctuation = {
        ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?',
        "'": "'", '"': '"', ';': ';', ':': ':', '-': '-', '(': '(', ')': ')'
    };

    if (level === 2) {
        // Level 2: shuffled mapping (fixed, non-reversed)
        const level2Map = {
            'a': 'q', 'b': 'm', 'c': 'l', 'd': 'a', 'e': 'k',
            'f': 'z', 'g': 'p', 'h': 's', 'i': 'd', 'j': 'f',
            'k': 'g', 'l': 'h', 'm': 'j', 'n': 'w', 'o': 'e',
            'p': 'r', 'q': 't', 'r': 'y', 's': 'u', 't': 'i',
            'u': 'o', 'v': 'b', 'w': 'c', 'x': 'n', 'y': 'v',
            'z': 'x'
        };
        return { ...level2Map, ...punctuation };
    }

    // Level 1: reversed mapping (default)
    const level1Map = {
        'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v',
        'f': 'u', 'g': 't', 'h': 's', 'i': 'r', 'j': 'q',
        'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l',
        'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
        'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b',
        'z': 'a'
    };
    return { ...level1Map, ...punctuation };
}

const keyboardMap = getKeyboardMap(currentLevel);

// Sample texts for typing
const sampleTexts = [
    "only one",

    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.",
    
    "Technology has transformed modern life in countless ways. The rapid advancement of artificial intelligence and machine learning continues to revolutionize industries worldwide. From smartphones to smart homes, digital innovation shapes how we work, communicate, and live our daily lives.",
    
    "In the bustling city square, vendors display their colorful wares as morning sunlight streams between tall buildings. Children laugh and play near the fountain, while business professionals hurry past with steaming cups of coffee. The aroma of fresh bread wafts from nearby bakeries.",
    
    "Environmental conservation requires global cooperation and immediate action. Scientists worldwide study climate patterns, document species extinction rates, and develop sustainable solutions. Every individual's choices and actions contribute to the planet's future health and biodiversity.",
    
    "The ancient library held countless stories within its weathered walls. Dust-covered volumes lined towering shelves, their leather bindings cracked with age. Scholars whispered amongst themselves as they carefully turned fragile pages, discovering long-forgotten knowledge and wisdom.",
    
    "Physical exercise improves both mental and physical well-being. Regular workouts strengthen muscles, enhance cardiovascular health, and boost immune system function. Additionally, exercise releases endorphins, reduces stress levels, and promotes better sleep patterns throughout the week.",
    
    "The symphony orchestra prepared for their evening performance. Violinists tuned their instruments while the conductor reviewed final notes. In the grand concert hall, anticipation built as the audience members found their seats. The air buzzed with excitement before the first note.",
    
    "Space exploration continues to push the boundaries of human knowledge and capability. Advanced telescopes reveal distant galaxies, while robotic rovers explore Mars's rocky surface. International space stations conduct groundbreaking research, expanding our understanding of the cosmos.",
    
    "Culinary traditions vary dramatically across different cultures and regions. Each country's unique ingredients, cooking methods, and dining customs tell stories of its history and values. Sharing meals brings people together, creating bonds that transcend language and cultural barriers.",
    
    "The art museum's new exhibition showcased works from various contemporary artists. Abstract paintings hung alongside intricate sculptures, while digital installations occupied corner spaces. Visitors moved slowly between pieces, contemplating the diverse expressions of human creativity."
];

// DOM elements
const sampleTextElement = document.getElementById('sampleText');
const sampleTextContentElement = document.getElementById('sampleTextContent');
const sampleCodeElement = document.getElementById('sampleCode');
const userInputElement = document.getElementById('userInput');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('resetBtn');
const newTextButton = document.getElementById('newTextBtn');
const themeToggleBtn = document.getElementById('themeToggle');

// Variables for tracking
let startTime = null;
let timerInterval = null;
let isTestActive = false;
let timeLimit = 5; // 10 minutes in seconds
let typedText = '';

// Analytics tracking
const analytics = {
    testsCompleted: 0,
    totalTime: 0,
    totalWpm: 0,
    totalAccuracy: 0,
    bestWpm: 0
};

// ---------- Results helpers (persist across pages) ----------
function computeMetrics(originalText, typedTextValue, elapsedSeconds) {
    const accuracy = calculateAccuracy(originalText.toLowerCase(), typedTextValue);
    const wpm = calculateWPM(typedTextValue, elapsedSeconds);
    
    // Calculate based on letters (characters) instead of words
    const originalLower = originalText.toLowerCase();
    const typedLower = typedTextValue.toLowerCase();
    const totalLetters = originalLower.length;
    
    // Count correct letters
    let correctLetters = 0;
    let wrongLetters = 0;
    const minLen = Math.min(originalLower.length, typedLower.length);
    for (let i = 0; i < minLen; i++) {
        if (originalLower[i] === typedLower[i]) {
            correctLetters++;
        } else {
            wrongLetters++;
        }
    }
    const unattemptedLetters = Math.max(0, totalLetters - minLen);
    
    // Completion based on correct letters out of total letters
    const completion = totalLetters > 0 ? Math.max(0, Math.min(1, correctLetters / totalLetters)) : 0;
    
    // Total score factors in both accuracy and completion percentage (both based on letters)
    const score = Math.round(Math.max(0, Math.min(100, (accuracy * completion))));
    
    return { accuracy, wpm, score, elapsedSeconds, correctLetters, wrongLetters, unattemptedLetters, totalLetters, completion };
}

function saveLevelResult(levelNumber, metrics) {
    try {
        localStorage.setItem(`rk_result_level_${levelNumber}`, JSON.stringify(metrics));
    } catch (_) {}
}

function readLevelResult(levelNumber) {
    try {
        const raw = localStorage.getItem(`rk_result_level_${levelNumber}`);
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

function clearLevelResults() {
    try {
        localStorage.removeItem('rk_result_level_1');
        localStorage.removeItem('rk_result_level_2');
    } catch (_) {}
}

// Initialize keyboard map display
function initializeKeyboardMap() {
    Object.entries(keyboardMap).forEach(([key, value]) => {
        if (key !== ' ' && key !== '.' && key !== ',' && key !== '!' && 
            key !== '?' && key !== "'" && key !== '"' && key !== ';' && 
            key !== ':' && key !== '-' && key !== '(' && key !== ')') {
            const keyPairDiv = document.createElement('div');
            keyPairDiv.className = 'key-pair';
            keyPairDiv.textContent = `${key.toUpperCase()} → ${value.toUpperCase()}`;
            keyboardGrid.appendChild(keyPairDiv);
        }
    });
}

// Keyboard map is now on a separate page

// ---------- Theme handling ----------
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }
}

function initTheme() {
    try {
        const stored = localStorage.getItem('rk_theme');
        const theme = stored === 'dark' ? 'dark' : 'light';
        applyTheme(theme);
    } catch (_) {
        applyTheme('light');
    }
}

// Function to get a random sample text
function getRandomText() {
    const index = Math.floor(Math.random() * sampleTexts.length);
    return { text: sampleTexts[index], code: `CODE-${String(index + 1).padStart(3, '0')}` };
}

// Function to start the timer
function startTimer() {
    if (!isTestActive) {
        startTime = new Date();
        isTestActive = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Function to update the timer
function updateTimer() {
    if (startTime) {
        const currentTime = new Date();
        const timeElapsed = Math.floor((currentTime - startTime) / 1000);
        const timeRemaining = timeLimit - timeElapsed;
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // End test; compute metrics then show prompt/report
            const finalText = userInputElement.value;
            const sample = sampleTextContentElement ? sampleTextContentElement.textContent : sampleTextElement.textContent;
            const timeElapsed = timeLimit;
            const metrics = computeMetrics(sample, finalText, timeElapsed);
            if (currentLevel === 1) {
                saveLevelResult(1, metrics);
                showLevel2Prompt();
            } else {
                saveLevelResult(2, metrics);
                showCombinedReport();
            }
            isTestActive = false;
            return;
        }

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Add warning class when less than 1 minute remains
        if (timeRemaining <= 60) {
            timerElement.classList.add('time-warning');
        }
    }
}

// Function to show final analytics (disabled) — replaced by Level 2 prompt on Level 1
function showFinalAnalytics() {
    // Intentionally no-op
    isTestActive = false;
}

// Show a simple prompt with only the LEVEL 2 button (Level 1 only)
function showLevel2Prompt() {
    const modal = document.getElementById('analyticsModal');
    if (!modal) return;

    const titleEl = modal.querySelector('h2');
    if (titleEl) titleEl.textContent = 'Level 1 Results';

    // Show Level 1 analytics in the modal
    const analyticsContainer = modal.querySelector('.analytics-container');
    if (analyticsContainer) {
        analyticsContainer.style.display = 'grid';
        // Center the single analytics card in Level 1 result view
        analyticsContainer.style.gridTemplateColumns = '1fr';
        analyticsContainer.style.justifyItems = 'center';
        analyticsContainer.style.alignItems = 'center';
        analyticsContainer.style.margin = '0 auto';
        const level1 = readLevelResult(1);
        if (level1) {
            analyticsContainer.innerHTML = (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 1</span>` +
                `<div>Accuracy: ${Math.round(level1.accuracy)}%</div>` +
                `<div>Correct Letters: ${level1.correctLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>Wrong Letters: ${level1.wrongLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>Unattempted Letters: ${level1.unattemptedLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>WPM: ${Math.round(level1.wpm)}</div>` +
                `<div>Score: ${Math.round(level1.score)} / 100</div>` +
                `</div>`
            );
        } else {
            analyticsContainer.innerHTML = (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 1</span>` +
                `<div>Not available</div>` +
                `</div>`
            );
        }
    }

    // Ensure a Level 2 button exists; if not, create a minimal one
    let level2Btn = document.getElementById('level2Btn');
    if (!level2Btn) {
        const controls = document.createElement('div');
        controls.className = 'controls';
        level2Btn = document.createElement('a');
        level2Btn.id = 'level2Btn';
        level2Btn.className = 'button';
        level2Btn.href = 'level2.html';
        level2Btn.textContent = 'LEVEL 2';
        controls.appendChild(level2Btn);
        const content = modal.querySelector('.modal-content');
        if (content) content.appendChild(controls);
    } else {
        level2Btn.style.display = 'inline-block';
    }

    modal.style.display = 'block';
}

// Build and show combined report for Level 1 and Level 2
function showCombinedReport() {
    const modal = document.getElementById('analyticsModal');
    if (!modal) return;

    const titleEl = modal.querySelector('h2');
    if (titleEl) titleEl.textContent = 'Level 1 & Level 2 Results';

    const analyticsContainer = modal.querySelector('.analytics-container');
    if (analyticsContainer) {
        analyticsContainer.style.display = 'grid';
        const level1 = readLevelResult(1);
        const level2 = readLevelResult(2);

        const l1Html = level1
            ? (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 1</span>` +
                `<div>Accuracy: ${Math.round(level1.accuracy)}%</div>` +
                `<div>Correct Letters: ${level1.correctLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>Wrong Letters: ${level1.wrongLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>Unattempted Letters: ${level1.unattemptedLetters || 0} / ${level1.totalLetters || 0}</div>` +
                `<div>WPM: ${Math.round(level1.wpm)}</div>` +
                `<div>Score: ${Math.round(level1.score)} / 100</div>` +
                `</div>`
            ) : (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 1</span>` +
                `<div>Not available</div>` +
                `</div>`
            );

        const l2Html = level2
            ? (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 2</span>` +
                `<div>Accuracy: ${Math.round(level2.accuracy)}%</div>` +
                `<div>Correct Letters: ${level2.correctLetters || 0} / ${level2.totalLetters || 0}</div>` +
                `<div>Wrong Letters: ${level2.wrongLetters || 0} / ${level2.totalLetters || 0}</div>` +
                `<div>Unattempted Letters: ${level2.unattemptedLetters || 0} / ${level2.totalLetters || 0}</div>` +
                `<div>WPM: ${Math.round(level2.wpm)}</div>` +
                `<div>Score: ${Math.round(level2.score)} / 100</div>` +
                `</div>`
            ) : (
                `<div class="analytics-item">` +
                `<span class="analytics-label">Level 2</span>` +
                `<div>Not available</div>` +
                `</div>`
            );

        analyticsContainer.innerHTML = l1Html + l2Html;
    }

    // Hide Level 2 prompt button if present
    const level2Btn = document.getElementById('level2Btn');
    if (level2Btn) level2Btn.style.display = 'none';

    modal.style.display = 'block';
}

// Function to calculate WPM
function calculateWPM(text, timeInSeconds) {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
}

// Function to calculate accuracy
function calculateAccuracy(original, typed) {
    if (typed.length === 0) return 0;
    let correct = 0;
    const len = Math.min(original.length, typed.length);
    
    for (let i = 0; i < len; i++) {
        if (original[i] === typed[i]) correct++;
    }
    
    return Math.round((correct / typed.length) * 100);
}

// Function to reset the test
function resetTest() {
    userInputElement.value = '';
    startTime = null;
    isTestActive = false;
    clearInterval(timerInterval);
    timerElement.textContent = '01:00';
    timerElement.classList.remove('time-warning');
}

// Function to check if test is complete
function checkCompletion(userInput, sampleText) {
    if (userInput.length === sampleText.length) {
        clearInterval(timerInterval);
        // Compute metrics
        const timeElapsed = Math.floor((new Date() - startTime) / 1000);
        const metrics = computeMetrics(sampleTextElement.textContent, userInput, timeElapsed);
        if (currentLevel === 1) {
            saveLevelResult(1, metrics);
            showLevel2Prompt();
        } else {
            saveLevelResult(2, metrics);
            showCombinedReport();
        }
        isTestActive = false;
    }
}

// Event listeners
userInputElement.addEventListener('input', (e) => {
    if (!isTestActive && e.target.value.length > 0) {
        startTimer();
    }

    // Only transform the last character typed
    const inputValue = e.target.value.toLowerCase();
    if (inputValue.length > 0) {
        const lastChar = inputValue[inputValue.length - 1];
        const mappedChar = keyboardMap[lastChar] || lastChar;
        e.target.value = inputValue.slice(0, -1) + mappedChar;
    }

    typedText = e.target.value;
    
    // Check if the test is complete
    const sampleText = (sampleTextContentElement ? sampleTextContentElement.textContent : sampleTextElement.textContent).toLowerCase();
    checkCompletion(e.target.value, sampleText);
});

// Disable copy/paste on typing area
userInputElement.addEventListener('paste', (e) => {
    e.preventDefault();
});
userInputElement.addEventListener('copy', (e) => {
    e.preventDefault();
});
userInputElement.addEventListener('drop', (e) => {
    e.preventDefault();
});
userInputElement.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (key === 'v' || key === 'c')) {
        e.preventDefault();
    }
});

// Analytics modal setup
const analyticsModal = document.getElementById('analyticsModal');
const closeAnalyticsBtn = document.querySelector('.close-analytics');

closeAnalyticsBtn.onclick = () => {
    analyticsModal.style.display = "none";
    resetTest();
    const next = getRandomText();
    if (sampleTextContentElement) sampleTextContentElement.textContent = next.text;
    else sampleTextElement.textContent = next.text;
    if (sampleCodeElement) sampleCodeElement.textContent = next.code;
};

// Close analytics modal when clicking outside
window.onclick = (event) => {
    if (event.target === analyticsModal) {
        analyticsModal.style.display = "none";
    }
};

// Optional: wire LEVEL 2 button if present
const level2Btn = document.getElementById('level2Btn');
if (level2Btn) {
    level2Btn.addEventListener('click', (e) => {
        // If it's an anchor, let default proceed; this is just for safety
        if (level2Btn.tagName.toLowerCase() === 'button') {
            e.preventDefault();
            window.location.href = 'level2.html';
        }
    });
}

// Theme toggle button events
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('rk_theme', next); } catch (_) {}
    });
}

// Button event listeners
resetButton.addEventListener('click', () => {
    resetTest();
    analyticsModal.style.display = "none";
});

newTextButton.addEventListener('click', () => {
    resetTest();
    const next = getRandomText();
    if (sampleTextContentElement) sampleTextContentElement.textContent = next.text;
    else sampleTextElement.textContent = next.text;
    if (sampleCodeElement) sampleCodeElement.textContent = next.code;
    analyticsModal.style.display = "none";
});

// Initialize
const initRandom = getRandomText();
if (sampleTextContentElement) sampleTextContentElement.textContent = initRandom.text;
else sampleTextElement.textContent = initRandom.text;
if (sampleCodeElement) sampleCodeElement.textContent = initRandom.code;
initTheme();
