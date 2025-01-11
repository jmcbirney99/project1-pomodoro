let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const toggleButton = document.getElementById('toggle');
const resetButton = document.getElementById('reset');
const statusText = document.getElementById('status-text');

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const NOTIFICATION_MESSAGES = {
    work: {
        title: 'Break Time!',
        message: 'Great job! Time for a well-deserved break.'
    },
    break: {
        title: 'Work Time!',
        message: 'Break is over. Let\'s focus on the next task!'
    }
};

async function sendNotification(title, message) {
    // First try to get permission if we don't have it
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }

    // If we have permission, send notification
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else {
        // Fallback to alert if notifications are denied
        alert(message);
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Pomodoro`;
    
    const totalTime = isWorkTime ? WORK_TIME : BREAK_TIME;
    const progress = Math.round((timeLeft / totalTime) * 100);
    document.documentElement.style.setProperty('--progress', `${progress}%`);
    
    const nextUpSpan = document.getElementById('time-remaining');
    if (nextUpSpan) {
        nextUpSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function toggleTimer() {
    if (timerId === null) {
        // Start timer
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                isWorkTime = !isWorkTime;
                timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
                statusText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
                updateDisplay();
                toggleButton.textContent = 'Start';
                toggleButton.classList.remove('paused');
                
                const { title, message } = getNotificationMessage();
                sendNotification(title, message);
            }
        }, 1000);
        toggleButton.textContent = 'Pause';
        toggleButton.classList.add('paused');
    } else {
        // Pause timer
        clearInterval(timerId);
        timerId = null;
        toggleButton.textContent = 'Start';
        toggleButton.classList.remove('paused');
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    statusText.textContent = 'Work Time';
    toggleButton.textContent = 'Start';
    toggleButton.classList.remove('paused');
    updateDisplay();
}

function skipTimer() {
    if (timerId !== null) {  // Only work if timer is running
        clearInterval(timerId);
        timerId = null;
        timeLeft = 0;
        isWorkTime = !isWorkTime;
        timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
        statusText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
        toggleButton.textContent = 'Start';
        toggleButton.classList.remove('paused');
        updateDisplay();
        
        const { title, message } = getNotificationMessage();
        sendNotification(title, message);
    }
}

function getNotificationMessage() {
    const type = isWorkTime ? 'work' : 'break';
    return NOTIFICATION_MESSAGES[type];
}

// Initialize
timeLeft = WORK_TIME;
updateDisplay();

// Event listeners
toggleButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
document.getElementById('skip').addEventListener('click', skipTimer);

// Request notification permission
// if (Notification.permission !== 'granted') {
//     Notification.requestPermission();
// } 