// Keyboard mapping (reversed layout)
const keyboardMap = {
    'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v',
    'f': 'u', 'g': 't', 'h': 's', 'i': 'r', 'j': 'q',
    'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l',
    'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
    'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b',
    'z': 'a', ' ': ' ', '.': '.', ',': ',', '!': '!',
    '?': '?', "'": "'", '"': '"', ';': ';', ':': ':',
    '-': '-', '(': '(', ')': ')'
};

// Sample texts for typing
const sampleTexts = [
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
const userInputElement = document.getElementById('userInput');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('resetBtn');
const newTextButton = document.getElementById('newTextBtn');

// Variables for tracking
let startTime = null;
let timerInterval = null;
let isTestActive = false;
let timeLimit = 60; // 10 minutes in seconds
let typedText = '';

// Analytics tracking
const analytics = {
    testsCompleted: 0,
    totalTime: 0,
    totalWpm: 0,
    totalAccuracy: 0,
    bestWpm: 0
};

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

// Function to get a random sample text
function getRandomText() {
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
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
            showFinalAnalytics();
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

// Function to show final analytics
function showFinalAnalytics() {
    const timeElapsed = timeLimit;
    const finalText = userInputElement.value;
    const currentWpm = calculateWPM(finalText, timeElapsed);
    const currentAccuracy = calculateAccuracy(sampleTextElement.textContent.toLowerCase(), finalText);

    // Update analytics
    analytics.testsCompleted++;
    analytics.totalTime += timeElapsed;
    analytics.totalWpm += currentWpm;
    analytics.totalAccuracy += currentAccuracy;
    analytics.bestWpm = Math.max(analytics.bestWpm, currentWpm);

    // Update analytics display
    document.getElementById('testsCompleted').textContent = analytics.testsCompleted;
    document.getElementById('averageWpm').textContent = Math.round(analytics.totalWpm / analytics.testsCompleted);
    document.getElementById('averageAccuracy').textContent = Math.round(analytics.totalAccuracy / analytics.testsCompleted) + '%';
    
    const totalMinutes = Math.floor(analytics.totalTime / 60);
    const totalSeconds = analytics.totalTime % 60;
    document.getElementById('totalTime').textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    document.getElementById('bestWpm').textContent = analytics.bestWpm;

    // Show analytics modal
    analyticsModal.style.display = "block";
    isTestActive = false;
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
        const timeElapsed = Math.floor((new Date() - startTime) / 1000);
        const currentWpm = calculateWPM(sampleText, timeElapsed);
        const currentAccuracy = calculateAccuracy(sampleText.toLowerCase(), userInput);

        // Update analytics
        analytics.testsCompleted++;
        analytics.totalTime += timeElapsed;
        analytics.totalWpm += currentWpm;
        analytics.totalAccuracy += currentAccuracy;
        analytics.bestWpm = Math.max(analytics.bestWpm, currentWpm);

        // Update analytics display
        document.getElementById('testsCompleted').textContent = analytics.testsCompleted;
        document.getElementById('averageWpm').textContent = Math.round(analytics.totalWpm / analytics.testsCompleted);
        document.getElementById('averageAccuracy').textContent = Math.round(analytics.totalAccuracy / analytics.testsCompleted) + '%';
        
        const totalMinutes = Math.floor(analytics.totalTime / 60);
        const totalSeconds = analytics.totalTime % 60;
        document.getElementById('totalTime').textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        document.getElementById('bestWpm').textContent = analytics.bestWpm;

        // Automatically show analytics modal
        analyticsModal.style.display = "block";
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
    const sampleText = sampleTextElement.textContent.toLowerCase();
    checkCompletion(e.target.value, sampleText);
});

// Analytics modal setup
const analyticsModal = document.getElementById('analyticsModal');
const closeAnalyticsBtn = document.querySelector('.close-analytics');

closeAnalyticsBtn.onclick = () => {
    analyticsModal.style.display = "none";
    resetTest();
    sampleTextElement.textContent = getRandomText();
};

// Close analytics modal when clicking outside
window.onclick = (event) => {
    if (event.target === analyticsModal) {
        analyticsModal.style.display = "none";
    }
};

// Button event listeners
resetButton.addEventListener('click', () => {
    resetTest();
    analyticsModal.style.display = "none";
});

newTextButton.addEventListener('click', () => {
    resetTest();
    sampleTextElement.textContent = getRandomText();
    analyticsModal.style.display = "none";
});

// Initialize
sampleTextElement.textContent = getRandomText();
