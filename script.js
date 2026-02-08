// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'User' };
let selectedPriority = 'medium';
let selectedReminder = null;
let currentTaskId = null;
let currentCalendarDate = new Date();
let selectedDate = null;
let currentMood = 'normal';
let currentLayout = 'list';
let currentPersonality = 'buddy';
let rewardPoints = parseInt(localStorage.getItem('rewardPoints')) || 0;
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let energyLevel = 50;
let effortLevel = 50;
let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;
let lastCompletedDate = localStorage.getItem('lastCompletedDate') || null;
let selectedBucket = null;
let selectedTaskType = null;
let focusedTaskId = null;
let adDisplayCount = parseInt(localStorage.getItem('adDisplayCount')) || 0;
let lastAdShown = localStorage.getItem('lastAdShown') || null;
let userBehavior = JSON.parse(localStorage.getItem('userBehavior')) || { productivity: 0, study: 0, finance: 0 };
let interstitialCountdown = 5;
let interstitialTimer = null;

// Motivational Quotes
const motivationalQuotes = [
    "The way to get started is to quit talking and begin doing.",
    "Don't let yesterday take up too much of today.",
    "You learn more from failure than from success.",
    "If you are working on something exciting, you don't have to be pushed.",
    "People who are crazy enough to think they can change the world, are the ones who do.",
    "We may encounter many defeats but we must not be defeated.",
    "The only way to do great work is to love what you do.",
    "If you can dream it, you can do it."
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadTasks();
    updateProfileStats();
    updateRewardJar();
    updateHabitPlants();
    updateBrainLoad();
    updateLifeBuckets();
    updateStreak();
    renderCalendar(); // Initialize calendar
    switchLayout(currentLayout); // Initialize layout
    applyPersonality(currentPersonality); // Initialize personality
    
    // Initialize Ad System
    initializeAdSystem();
    
    // Setup AdMob listeners (for mobile)
    setupAdMobListeners();
});

// Initialize App
function initializeApp() {
    // Set user name
    const userName = prompt('Enter your name:', currentUser.name) || 'User';
    currentUser.name = userName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileInitial').textContent = userName.charAt(0).toUpperCase();
    
    // Set random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    document.getElementById('motivationalQuote').textContent = `"${randomQuote}"`;
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            switchScreen(screenId);
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Add Task Button
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        switchScreen('addTaskScreen');
        resetTaskForm();
    });
    
    // Back Button
    document.getElementById('backBtn').addEventListener('click', () => {
        switchScreen('homeScreen');
        resetTaskForm();
    });
    
    // Task Form
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // Priority Buttons
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPriority = btn.getAttribute('data-priority');
        });
    });
    
    // Set default priority
    document.querySelector('.priority-btn[data-priority="medium"]').classList.add('selected');
    
    // Reminder Toggle
    document.getElementById('reminderToggle').addEventListener('change', (e) => {
        const reminderOptions = document.getElementById('reminderOptions');
        reminderOptions.style.display = e.target.checked ? 'flex' : 'none';
        if (!e.target.checked) {
            selectedReminder = null;
            document.querySelectorAll('.reminder-btn').forEach(btn => btn.classList.remove('selected'));
        }
    });
    
    // Reminder Buttons
    document.querySelectorAll('.reminder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.reminder-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedReminder = parseInt(btn.getAttribute('data-minutes'));
        });
    });
    
    // Task Menu Modal
    document.getElementById('closeMenuBtn').addEventListener('click', closeTaskMenu);
    document.getElementById('deleteTaskBtn').addEventListener('click', handleDeleteTask);
    document.getElementById('editTaskBtn').addEventListener('click', handleEditTask);
    document.getElementById('shareTaskBtn').addEventListener('click', handleShareTask);
    
    // Close modal on outside click
    document.getElementById('taskMenuModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskMenuModal') {
            closeTaskMenu();
        }
    });
    
    // Calendar Navigation
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Date Events Modal
    document.getElementById('closeDateEventsBtn').addEventListener('click', closeDateEventsModal);
    document.getElementById('addEventFromCalendarBtn').addEventListener('click', () => {
        closeDateEventsModal();
        if (selectedDate) {
            document.getElementById('taskDate').value = selectedDate;
        }
        switchScreen('addTaskScreen');
        resetTaskForm();
    });
    
    // Close date events modal on outside click
    document.getElementById('dateEventsModal').addEventListener('click', (e) => {
        if (e.target.id === 'dateEventsModal') {
            closeDateEventsModal();
        }
    });
    
    // Mood Selector
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMood = btn.getAttribute('data-mood');
            applyMoodTheme(currentMood);
        });
    });
    
    // Layout Selector
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLayout = btn.getAttribute('data-layout');
            switchLayout(currentLayout);
        });
    });
    
    // Energy Slider
    setupEnergySlider();
    
    // Effort Slider
    setupEffortSlider();
    
    // Personality Toggle
    document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPersonality = btn.getAttribute('data-personality');
            applyPersonality(currentPersonality);
        });
    });
    
    // Bucket Selector
    document.querySelectorAll('.bucket-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bucket-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedBucket = btn.getAttribute('data-bucket');
        });
    });
    
    // Task Type Selector
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTaskType = btn.getAttribute('data-type');
        });
    });
    
    // Missed Task Modal
    document.getElementById('shiftTaskBtn')?.addEventListener('click', handleShiftTask);
    document.getElementById('dropTaskBtn')?.addEventListener('click', handleDropTask);
    
    // Surprise Modal
    document.getElementById('closeSurpriseBtn')?.addEventListener('click', () => {
        document.getElementById('surpriseModal').classList.remove('active');
    });
    
    // Ad System
    document.getElementById('adCTA')?.addEventListener('click', handleAdClick);
    document.getElementById('stickyAdCTA')?.addEventListener('click', handleAdClick);
    document.getElementById('stickyAdClose')?.addEventListener('click', closeBottomStickyAd);
    document.getElementById('watchAdBtn')?.addEventListener('click', handleWatchRewardedAd);
    document.getElementById('cancelRewardedAdBtn')?.addEventListener('click', closeRewardedAd);
    document.getElementById('interstitialCTA')?.addEventListener('click', handleAdClick);
    document.getElementById('interstitialSkip')?.addEventListener('click', skipInterstitialAd);
    
    // Memory Attach
    document.getElementById('attachEmojiBtn')?.addEventListener('click', () => {
        const emoji = prompt('Enter emoji:');
        if (emoji) {
            attachEmoji(emoji);
        }
    });
    
    document.getElementById('attachImageBtn')?.addEventListener('click', () => {
        document.getElementById('attachImage').click();
    });
    
    document.getElementById('attachImage')?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            attachImage(e.target.files[0]);
        }
    });
    
    // Focus Mode
    document.getElementById('focusDone')?.addEventListener('click', handleFocusDone);
    document.getElementById('focusSkip')?.addEventListener('click', handleFocusSkip);
    
    // Life Receipt
    document.getElementById('generateReceiptBtn')?.addEventListener('click', generateLifeReceipt);
    document.getElementById('shareReceiptBtn')?.addEventListener('click', shareReceipt);
}

// Switch Screen
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Render calendar when switching to calendar screen
    if (screenId === 'calendarScreen') {
        renderCalendar();
    }
    
    // Show interstitial occasionally when switching screens
    if (Math.random() < 0.15 && shouldShowAd() && !isFocusModeActive()) {
        setTimeout(() => {
            showInterstitialAd();
        }, 500);
    }
    
    // Hide ads when entering focus mode
    if (screenId === 'homeScreen' && currentLayout === 'focus') {
        hideAllAds();
    }
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Load Tasks
function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    let todayTasks = tasks.filter(task => task.date === today);
    
    // Filter night-only tasks
    todayTasks = filterNightTasks(todayTasks);
    
    if (todayTasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No tasks for today. Add one to get started!</p>';
        return;
    }
    
    // Sort by effort (low to high) instead of time
    todayTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return (a.effort || 50) - (b.effort || 50);
    });
    
    todayTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
    
    updateRemindersList();
    updateBrainLoad();
    updateLifeBuckets();
    updateStreak();
}

// Create Task Element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    let className = `task-item ${task.completed ? 'completed' : ''}`;
    
    // Add shape class
    if (task.taskType === 'quick') className += ' shape-circle';
    else if (task.taskType === 'long') className += ' shape-rectangle';
    else if (task.taskType === 'urgent') className += ' shape-triangle';
    
    // Add night-only class
    if (task.nightOnly) className += ' night-only';
    
    taskDiv.className = className;
    taskDiv.setAttribute('data-task-id', task.id);
    
    const priorityColors = {
        high: '#dc2626',
        medium: '#d97706',
        low: '#2563eb'
    };
    
    const priorityLabels = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    ${task.bucket ? `<span>${getBucketIcon(task.bucket)} ${task.bucket}</span>` : ''}
                    <span>🕐 ${formatTime(task.time)}</span>
                    ${addCountdownTimer(task)}
                    ${task.reminder ? `<span>🔔 ${formatReminder(task.reminder)}</span>` : ''}
                </div>
            </div>
            <button class="task-menu-btn" data-task-id="${task.id}">⋯</button>
        </div>
    `;
    
    // Add focus aura on click
    taskDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('task-checkbox') && !e.target.classList.contains('task-menu-btn')) {
            activateFocusAura(task.id);
            showWhyTaskBubble(task);
            setTimeout(() => deactivateFocusAura(), 3000);
        }
    });
    
    // Checkbox click
    const checkbox = taskDiv.querySelector('.task-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskComplete(task.id);
    });
    
    // Menu button click
    const menuBtn = taskDiv.querySelector('.task-menu-btn');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTaskId = task.id;
        openTaskMenu();
    });
    
    return taskDiv;
}

// Handle Task Submit
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        title,
        description,
        date,
        time: time || calculateTimeFromEnergy(energyLevel),
        priority: selectedPriority,
        effort: effortLevel,
        reminder: selectedReminder,
        energyLevel: energyLevel,
        place: document.getElementById('placeReminder').value.trim() || null,
        why: document.getElementById('taskWhy').value.trim() || null,
        bucket: selectedBucket || null,
        taskType: selectedTaskType || null,
        nightOnly: document.getElementById('nightOnlyToggle').checked,
        emoji: null,
        image: null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Get attached emoji/image
    const preview = document.getElementById('attachedPreview');
    if (preview.querySelector('.emoji-preview')) {
        task.emoji = preview.querySelector('.emoji-preview').textContent;
    }
    if (preview.querySelector('img')) {
        task.image = preview.querySelector('img').src;
    }
    
    if (currentTaskId) {
        // Edit existing task
        const index = tasks.findIndex(t => t.id === currentTaskId);
        if (index !== -1) {
            task.id = currentTaskId;
            task.completed = tasks[index].completed;
            tasks[index] = task;
        }
        currentTaskId = null;
    } else {
        // Add new task
        tasks.push(task);
    }
    
    saveTasks();
    loadTasks();
    updateProfileStats();
    updateRewardJar();
    updateHabitPlants();
    updateBrainLoad();
    updateLifeBuckets();
    updateStreak();
    
    // Refresh calendar if it's visible
    if (document.getElementById('calendarScreen').classList.contains('active')) {
        renderCalendar();
    }
    
    // Refresh current layout
    if (currentLayout === 'magnet') renderMagnetBoard();
    if (currentLayout === 'focus') loadFocusTask();
    if (currentLayout === 'memory') renderMemoryCards();
    if (currentLayout === 'wheel') renderTaskWheel();
    if (currentLayout === 'puzzle') renderPuzzleBoard();
    if (currentLayout === 'story') renderStoryMode();
    if (currentLayout === 'iceberg') renderIceberg();
    if (currentLayout === 'packing') renderPackingMode();
    
    switchScreen('homeScreen');
    resetTaskForm();
    
    // Random surprise reward
    if (Math.random() < 0.3) {
        setTimeout(() => showSurpriseReward(), 1000);
    }
    
    // Show notification
    showNotification('Task saved successfully!');
}

// Toggle Task Complete
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        loadTasks();
        updateProfileStats();
        updateRewardJar();
        updateHabitPlants();
        updateBrainLoad();
        updateLifeBuckets();
        updateStreak();
        
        // Check for missed tasks
        if (!task.completed) {
            handleMissedTask(taskId);
        }
        
        // Random surprise on completion
        if (task.completed && Math.random() < 0.2) {
            setTimeout(() => showSurpriseReward(), 500);
        }
        
        // Refresh calendar if it's visible
        if (document.getElementById('calendarScreen').classList.contains('active')) {
            renderCalendar();
        }
        
        // Refresh current layout
        if (currentLayout === 'magnet') {
            const magnetTask = document.querySelector(`.magnet-task[data-task-id="${taskId}"]`);
            if (magnetTask) {
                magnetTask.classList.add('completed');
                setTimeout(() => {
                    renderMagnetBoard();
                }, 500);
            }
        }
        if (currentLayout === 'focus') loadFocusTask();
        if (currentLayout === 'memory') renderMemoryCards();
        if (currentLayout === 'wheel') renderTaskWheel();
        if (currentLayout === 'puzzle') renderPuzzleBoard();
        if (currentLayout === 'story') renderStoryMode();
        if (currentLayout === 'iceberg') renderIceberg();
        if (currentLayout === 'packing') renderPackingMode();
        
        // Vibration for angry mood
        if (currentMood === 'angry' && task.completed && navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
}

function getBucketIcon(bucket) {
    const icons = {
        health: '🏥',
        paisa: '💰',
        family: '👨‍👩‍👧',
        growth: '🌱'
    };
    return icons[bucket] || '📦';
}

// Open Task Menu
function openTaskMenu() {
    document.getElementById('taskMenuModal').classList.add('active');
}

// Close Task Menu
function closeTaskMenu() {
    document.getElementById('taskMenuModal').classList.remove('active');
    currentTaskId = null;
}

// Handle Delete Task
function handleDeleteTask() {
    if (currentTaskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== currentTaskId);
            saveTasks();
            loadTasks();
            updateProfileStats();
            
            // Refresh calendar if it's visible
            if (document.getElementById('calendarScreen').classList.contains('active')) {
                renderCalendar();
            }
            
            closeTaskMenu();
            showNotification('Task deleted successfully!');
        }
    }
}

// Handle Edit Task
function handleEditTask() {
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDate').value = task.date;
            document.getElementById('taskTime').value = task.time;
            
            // Set priority
            document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
            document.querySelector(`.priority-btn[data-priority="${task.priority}"]`).classList.add('selected');
            selectedPriority = task.priority;
            
            // Set reminder
            if (task.reminder) {
                document.getElementById('reminderToggle').checked = true;
                document.getElementById('reminderOptions').style.display = 'flex';
                document.querySelectorAll('.reminder-btn').forEach(btn => {
                    if (parseInt(btn.getAttribute('data-minutes')) === task.reminder) {
                        btn.classList.add('selected');
                        selectedReminder = task.reminder;
                    }
                });
            }
            
            closeTaskMenu();
            switchScreen('addTaskScreen');
        }
    }
}

// Handle Share Task
function handleShareTask() {
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            const taskText = `Task: ${task.title}\n${task.description ? `Description: ${task.description}\n` : ''}Date: ${formatDate(task.date)}\nTime: ${formatTime(task.time)}\nPriority: ${task.priority}`;
            
            if (navigator.share) {
                navigator.share({
                    title: task.title,
                    text: taskText
                }).catch(err => {
                    copyToClipboard(taskText);
                });
            } else {
                copyToClipboard(taskText);
            }
            
            closeTaskMenu();
            showNotification('Task details copied to clipboard!');
        }
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// Reset Task Form
function resetTaskForm() {
    document.getElementById('taskForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
    
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector('.priority-btn[data-priority="medium"]').classList.add('selected');
    selectedPriority = 'medium';
    
    document.getElementById('reminderToggle').checked = false;
    document.getElementById('reminderOptions').style.display = 'none';
    document.querySelectorAll('.reminder-btn').forEach(btn => btn.classList.remove('selected'));
    selectedReminder = null;
    
    // Reset energy slider
    energyLevel = 50;
    document.getElementById('energyLevel').value = 50;
    const fill = document.getElementById('energyFill');
    const handle = document.getElementById('energyHandle');
    if (fill) fill.style.width = '50%';
    if (handle) handle.style.left = '50%';
    
    // Reset attachments
    document.getElementById('attachedPreview').innerHTML = '';
    
    // Reset effort slider
    effortLevel = 50;
    document.getElementById('effortLevel').value = 50;
    const effortFill = document.getElementById('effortFill');
    const effortHandle = document.getElementById('effortHandle');
    if (effortFill) effortFill.style.width = '50%';
    if (effortHandle) effortHandle.style.left = '50%';
    
    // Reset buckets and types
    selectedBucket = null;
    selectedTaskType = null;
    document.querySelectorAll('.bucket-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
    
    currentTaskId = null;
}

// Save Tasks
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update Profile Stats
function updateProfileStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// Update Reminders List
function updateRemindersList() {
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = '';
    
    const tasksWithReminders = tasks.filter(task => task.reminder && !task.completed);
    
    if (tasksWithReminders.length === 0) {
        remindersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No active reminders.</p>';
        return;
    }
    
    tasksWithReminders.forEach(task => {
        const reminderDiv = document.createElement('div');
        reminderDiv.className = 'reminder-item';
        reminderDiv.innerHTML = `
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-meta">
                <span>📅 ${formatDate(task.date)}</span>
                <span>🕐 ${formatTime(task.time)}</span>
                <span>🔔 Reminder: ${formatReminder(task.reminder)}</span>
            </div>
        `;
        remindersList.appendChild(reminderDiv);
    });
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
        return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Format Time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Format Reminder
function formatReminder(minutes) {
    if (minutes < 60) {
        return `${minutes} min before`;
    } else if (minutes < 1440) {
        return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''} before`;
    } else {
        return `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''} before`;
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// Calendar Functions
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month/year header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month's days to fill the grid
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const prevMonthNum = month === 0 ? 12 : month;
        const dateStr = `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = createCalendarDay(day, true, dateStr);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add current month's days
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const dayElement = createCalendarDay(day, false, dateStr, isToday);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add next month's leading days to fill the grid
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthNum = month === 11 ? 1 : month + 2;
    for (let day = 1; day <= remainingCells; day++) {
        const dateStr = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = createCalendarDay(day, true, dateStr);
        calendarGrid.appendChild(dayElement);
    }
}

function createCalendarDay(day, isOtherMonth, dateStr, isToday = false) {
    const dayDiv = document.createElement('div');
    dayDiv.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    dayDiv.setAttribute('data-date', dateStr);
    
    // Get tasks for this date
    const dateTasks = tasks.filter(task => task.date === dateStr);
    const completedCount = dateTasks.filter(t => t.completed).length;
    const pendingTasks = dateTasks.filter(t => !t.completed);
    
    // Create day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);
    
    // Create events container
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';
    
    if (pendingTasks.length > 0) {
        // Show priority dots for pending tasks
        const priorities = [...new Set(pendingTasks.map(t => t.priority))];
        priorities.forEach(priority => {
            const dot = document.createElement('div');
            dot.className = `event-dot ${priority}`;
            eventsContainer.appendChild(dot);
        });
        
        // If there are many tasks, show count
        if (dateTasks.length > 3) {
            const count = document.createElement('div');
            count.className = 'event-count';
            count.textContent = `${dateTasks.length}`;
            dayDiv.appendChild(count);
        }
    }
    
    if (completedCount > 0 && pendingTasks.length === 0) {
        // Only completed tasks
        const dot = document.createElement('div');
        dot.className = 'event-dot completed';
        eventsContainer.appendChild(dot);
    }
    
    dayDiv.appendChild(eventsContainer);
    
    // Add click handler
    dayDiv.addEventListener('click', () => {
        selectedDate = dateStr;
        showDateEvents(dateStr);
    });
    
    return dayDiv;
}

function showDateEvents(dateStr) {
    const modal = document.getElementById('dateEventsModal');
    const eventsList = document.getElementById('dateEventsList');
    const dateTitle = document.getElementById('selectedDateTitle');
    
    // Format date for display
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateDisplay = '';
    if (dateStr === today.toISOString().split('T')[0]) {
        dateDisplay = 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
        dateDisplay = 'Tomorrow';
    } else {
        dateDisplay = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    dateTitle.textContent = dateDisplay;
    
    // Get tasks for this date
    const dateTasks = tasks.filter(task => task.date === dateStr);
    
    eventsList.innerHTML = '';
    
    if (dateTasks.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No events for this date. Tap "Add Event/Task" to create one!</p>';
    } else {
        // Sort tasks: incomplete first, then by time
        dateTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return a.time.localeCompare(b.time);
        });
        
        dateTasks.forEach(task => {
            const eventItem = document.createElement('div');
            eventItem.className = `date-event-item ${task.completed ? 'completed' : ''}`;
            
            const priorityLabels = {
                high: 'High',
                medium: 'Medium',
                low: 'Low'
            };
            
            eventItem.innerHTML = `
                <div class="date-event-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${escapeHtml(task.description)}</div>` : ''}
                <div class="date-event-meta">
                    <span class="priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
                    <span>🕐 ${formatTime(task.time)}</span>
                    ${task.reminder ? `<span>🔔 ${formatReminder(task.reminder)}</span>` : ''}
                    ${task.completed ? '<span style="color: var(--success-color);">✓ Completed</span>' : ''}
                </div>
            `;
            
            // Add click handler to edit task
            eventItem.addEventListener('click', () => {
                currentTaskId = task.id;
                closeDateEventsModal();
                handleEditTask();
            });
            
            eventsList.appendChild(eventItem);
        });
    }
    
    modal.classList.add('active');
}

function closeDateEventsModal() {
    document.getElementById('dateEventsModal').classList.remove('active');
    selectedDate = null;
}

// Mood-Based UI Functions
function applyMoodTheme(mood) {
    document.body.className = '';
    document.body.classList.add(`mood-${mood}`);
    
    if (mood === 'tired') {
        // Bigger buttons, fewer tasks
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach((item, index) => {
            if (index > 2) item.style.display = 'none';
        });
    }
}

// Layout Switching
function switchLayout(layout) {
    document.querySelectorAll('[id$="View"]').forEach(view => {
        view.classList.remove('view-active');
        view.classList.add('view-hidden');
    });
    
    // Hide ads when entering focus mode
    if (layout === 'focus') {
        hideAllAds();
    }
    
    switch(layout) {
        case 'list':
            document.getElementById('listView').classList.remove('view-hidden');
            document.getElementById('listView').classList.add('view-active');
            loadTasks();
            break;
        case 'magnet':
            document.getElementById('magnetView').classList.remove('view-hidden');
            document.getElementById('magnetView').classList.add('view-active');
            renderMagnetBoard();
            break;
        case 'focus':
            document.getElementById('focusView').classList.remove('view-hidden');
            document.getElementById('focusView').classList.add('view-active');
            loadFocusTask();
            break;
        case 'memory':
            document.getElementById('memoryView').classList.remove('view-hidden');
            document.getElementById('memoryView').classList.add('view-active');
            renderMemoryCards();
            break;
        case 'wheel':
            document.getElementById('wheelView').classList.remove('view-hidden');
            document.getElementById('wheelView').classList.add('view-active');
            renderTaskWheel();
            break;
        case 'puzzle':
            document.getElementById('puzzleView').classList.remove('view-hidden');
            document.getElementById('puzzleView').classList.add('view-active');
            renderPuzzleBoard();
            break;
        case 'story':
            document.getElementById('storyView').classList.remove('view-hidden');
            document.getElementById('storyView').classList.add('view-active');
            renderStoryMode();
            break;
        case 'iceberg':
            document.getElementById('icebergView').classList.remove('view-hidden');
            document.getElementById('icebergView').classList.add('view-active');
            renderIceberg();
            break;
        case 'packing':
            document.getElementById('packingView').classList.remove('view-hidden');
            document.getElementById('packingView').classList.add('view-active');
            renderPackingMode();
            break;
    }
}

// Magnet Board Functions
function renderMagnetBoard() {
    const board = document.getElementById('magnetBoard');
    board.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => task.date === today && !task.completed);
    
    todayTasks.forEach((task, index) => {
        const magnetTask = document.createElement('div');
        magnetTask.className = 'magnet-task';
        magnetTask.setAttribute('data-task-id', task.id);
        magnetTask.style.left = `${20 + (index % 3) * 200}px`;
        magnetTask.style.top = `${50 + Math.floor(index / 3) * 150}px`;
        magnetTask.style.transform = `rotate(${-2 + Math.random() * 4}deg)`;
        magnetTask.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(task.title)}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${formatTime(task.time)}</div>
        `;
        
        makeDraggable(magnetTask);
        board.appendChild(magnetTask);
    });
}

function makeDraggable(element) {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    element.addEventListener('mousedown', dragStart);
    element.addEventListener('touchstart', dragStart);
    
    function dragStart(e) {
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - element.offsetLeft;
            initialY = e.touches[0].clientY - element.offsetTop;
        } else {
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
        }
        
        if (e.target === element || element.contains(e.target)) {
            isDragging = true;
            element.classList.add('dragging');
        }
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        
        element.style.left = currentX + 'px';
        element.style.top = currentY + 'px';
    }
    
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    
    function dragEnd() {
        isDragging = false;
        element.classList.remove('dragging');
    }
}

// Focus Mode Functions
function loadFocusTask() {
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.date === today && !t.completed);
    
    if (pendingTasks.length === 0) {
        document.getElementById('focusTaskTitle').textContent = 'No tasks! 🎉';
        document.getElementById('focusTaskDesc').textContent = 'All done for today!';
        return;
    }
    
    const task = pendingTasks[0];
    document.getElementById('focusTaskTitle').textContent = task.title;
    document.getElementById('focusTaskDesc').textContent = task.description || '';
    
    // Update progress ring
    const total = tasks.filter(t => t.date === today).length;
    const completed = tasks.filter(t => t.date === today && t.completed).length;
    const progress = (completed / total) * 565;
    document.querySelector('.progress-ring-circle').style.strokeDashoffset = 565 - progress;
}

function handleFocusDone() {
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.date === today && !t.completed);
    if (pendingTasks.length > 0) {
        toggleTaskComplete(pendingTasks[0].id);
        loadFocusTask();
        updateRewardJar();
    }
}

function handleFocusSkip() {
    loadFocusTask();
}

// Memory Cards Functions
function renderMemoryCards() {
    const stack = document.getElementById('memoryStack');
    stack.innerHTML = '';
    
    tasks.slice(-10).reverse().forEach(task => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.setAttribute('data-task-id', task.id);
        
        const hasImage = task.image;
        const hasEmoji = task.emoji;
        
        card.innerHTML = `
            ${hasImage ? `<img src="${task.image}" class="memory-card-image" alt="${task.title}">` : ''}
            ${hasEmoji ? `<div class="memory-card-emoji">${task.emoji}</div>` : ''}
            <div class="memory-card-title">${escapeHtml(task.title)}</div>
            <div class="memory-card-date">${formatDate(task.date)}</div>
        `;
        
        card.addEventListener('click', () => {
            currentTaskId = task.id;
            openTaskMenu();
        });
        
        stack.appendChild(card);
    });
}

// Task Wheel Functions
function renderTaskWheel() {
    const svg = document.getElementById('taskWheel');
    svg.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    if (todayTasks.length === 0) {
        document.getElementById('wheelTaskCount').textContent = '0';
        return;
    }
    
    document.getElementById('wheelTaskCount').textContent = todayTasks.length;
    
    const segments = todayTasks.length || 1;
    const angle = 360 / segments;
    const radius = 140;
    const centerX = 150;
    const centerY = 150;
    
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    
    todayTasks.forEach((task, index) => {
        const startAngle = (index * angle - 90) * Math.PI / 180;
        const endAngle = ((index + 1) * angle - 90) * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('class', 'wheel-segment');
        path.setAttribute('data-task-id', task.id);
        path.style.opacity = task.completed ? 0.5 : 1;
        
        path.addEventListener('click', () => {
            currentTaskId = task.id;
            openTaskMenu();
        });
        
        svg.appendChild(path);
    });
}

// Energy Slider Functions
function setupEnergySlider() {
    const track = document.querySelector('.energy-track');
    const handle = document.getElementById('energyHandle');
    const fill = document.getElementById('energyFill');
    const energyInput = document.getElementById('energyLevel');
    
    if (!track || !handle || !fill) return;
    
    // Initialize position
    fill.style.width = '50%';
    handle.style.left = '50%';
    
    let isDragging = false;
    
    function updateSlider(clientX) {
        const rect = track.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        
        fill.style.width = percent + '%';
        handle.style.left = percent + '%';
        energyLevel = Math.round(percent);
        energyInput.value = energyLevel;
        
        // Calculate time based on energy
        const time = calculateTimeFromEnergy(energyLevel);
        document.getElementById('taskTime').value = time;
    }
    
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e.clientX);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSlider(e.touches[0].clientX);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSlider(e.touches[0].clientX);
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function calculateTimeFromEnergy(energy) {
    // Low energy (0-33) = Morning (6-9 AM)
    // Medium energy (34-66) = Afternoon (12-3 PM)
    // High energy (67-100) = Evening (6-9 PM)
    let hour, minute;
    
    if (energy < 33) {
        hour = 6 + Math.floor((energy / 33) * 3);
        minute = Math.floor((energy % 11) * 5.45);
    } else if (energy < 67) {
        hour = 12 + Math.floor(((energy - 33) / 33) * 3);
        minute = Math.floor(((energy - 33) % 11) * 5.45);
    } else {
        hour = 18 + Math.floor(((energy - 67) / 33) * 3);
        minute = Math.floor(((energy - 67) % 11) * 5.45);
    }
    
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Effort Slider Functions
function setupEffortSlider() {
    const track = document.getElementById('effortTrack');
    const handle = document.getElementById('effortHandle');
    const fill = document.getElementById('effortFill');
    const effortInput = document.getElementById('effortLevel');
    
    if (!track || !handle || !fill) return;
    
    fill.style.width = '50%';
    handle.style.left = '50%';
    
    let isDragging = false;
    
    function updateSlider(clientX) {
        const rect = track.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        
        fill.style.width = percent + '%';
        handle.style.left = percent + '%';
        effortLevel = Math.round(percent);
        effortInput.value = effortLevel;
        
        // Auto-set priority based on effort
        if (effortLevel > 70) {
            selectedPriority = 'high';
        } else if (effortLevel > 40) {
            selectedPriority = 'medium';
        } else {
            selectedPriority = 'low';
        }
        
        document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`.priority-btn[data-priority="${selectedPriority}"]`).classList.add('selected');
    }
    
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e.clientX);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSlider(e.touches[0].clientX);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSlider(e.touches[0].clientX);
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Personality Functions
function applyPersonality(personality) {
    document.body.classList.remove('personality-boss', 'personality-buddy');
    document.body.classList.add(`personality-${personality}`);
}

// Puzzle Board Functions
function renderPuzzleBoard() {
    const board = document.getElementById('puzzleBoard');
    board.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    todayTasks.forEach((task, index) => {
        const piece = document.createElement('div');
        piece.className = `puzzle-piece ${task.completed ? 'completed' : ''}`;
        piece.setAttribute('data-task-id', task.id);
        piece.innerHTML = `
            <div style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(task.title)}</div>
        `;
        
        piece.addEventListener('click', () => {
            toggleTaskComplete(task.id);
            piece.classList.add('completed');
            // Play click sound (visual feedback)
            piece.style.transform = 'scale(1.1)';
            setTimeout(() => {
                piece.style.transform = 'scale(1)';
            }, 200);
        });
        
        board.appendChild(piece);
    });
}

// Story Mode Functions
function renderStoryMode() {
    const morningTasks = document.getElementById('morningTasks');
    const workTasks = document.getElementById('workTasks');
    const nightTasks = document.getElementById('nightTasks');
    
    morningTasks.innerHTML = '';
    workTasks.innerHTML = '';
    nightTasks.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    todayTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `story-task ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <div style="font-weight: 600;">${escapeHtml(task.title)}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${formatTime(task.time)}</div>
        `;
        
        taskDiv.addEventListener('click', () => {
            toggleTaskComplete(task.id);
            taskDiv.classList.toggle('completed');
        });
        
        const hour = parseInt(task.time.split(':')[0]);
        if (hour < 12) {
            morningTasks.appendChild(taskDiv);
        } else if (hour < 18) {
            workTasks.appendChild(taskDiv);
        } else {
            nightTasks.appendChild(taskDiv);
        }
    });
}

// Iceberg Functions
function renderIceberg() {
    const visible = document.getElementById('visibleTasks');
    const hidden = document.getElementById('hiddenTasks');
    
    visible.innerHTML = '<h3>Visible Tasks</h3>';
    hidden.innerHTML = '<h3>Hidden Stress Tasks</h3>';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    todayTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'iceberg-task';
        taskDiv.setAttribute('data-task-id', task.id);
        taskDiv.innerHTML = `
            <div style="font-weight: 600;">${escapeHtml(task.title)}</div>
            <div style="font-size: 0.85rem; opacity: 0.7;">${formatTime(task.time)}</div>
        `;
        
        // Tasks with high effort go to hidden
        if (task.effort > 70) {
            hidden.appendChild(taskDiv);
        } else {
            visible.appendChild(taskDiv);
        }
        
        makeDraggable(taskDiv);
    });
}

// Packing Mode Functions
function renderPackingMode() {
    const backpack = document.getElementById('backpackItems');
    const unpacked = document.getElementById('unpackedItems');
    
    backpack.innerHTML = '';
    unpacked.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today && !t.completed);
    
    const packed = todayTasks.slice(0, 10);
    const remaining = todayTasks.slice(10);
    
    document.getElementById('backpackCapacity').textContent = `${packed.length}/10`;
    
    packed.forEach(task => {
        const item = document.createElement('div');
        item.className = 'backpack-item';
        item.setAttribute('data-task-id', task.id);
        item.textContent = task.taskType === 'quick' ? '⭕' : task.taskType === 'long' ? '▭' : '▲';
        item.title = task.title;
        backpack.appendChild(item);
    });
    
    remaining.forEach(task => {
        const item = document.createElement('div');
        item.className = 'unpacked-item';
        item.setAttribute('data-task-id', task.id);
        item.innerHTML = `
            <div style="font-size: 2rem;">${task.taskType === 'quick' ? '⭕' : task.taskType === 'long' ? '▭' : '▲'}</div>
            <div style="font-size: 0.7rem; text-align: center; margin-top: 0.25rem;">${escapeHtml(task.title.substring(0, 10))}</div>
        `;
        item.addEventListener('click', () => {
            if (packed.length < 10) {
                item.remove();
                const newItem = document.createElement('div');
                newItem.className = 'backpack-item';
                newItem.setAttribute('data-task-id', task.id);
                newItem.textContent = task.taskType === 'quick' ? '⭕' : task.taskType === 'long' ? '▭' : '▲';
                backpack.appendChild(newItem);
                document.getElementById('backpackCapacity').textContent = `${backpack.children.length}/10`;
            }
        });
        unpacked.appendChild(item);
    });
}

// Memory Attach Functions
function attachEmoji(emoji) {
    const preview = document.getElementById('attachedPreview');
    preview.innerHTML = `<div class="emoji-preview">${emoji}</div>`;
    
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) task.emoji = emoji;
    }
}

function attachImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('attachedPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Task image">`;
        
        if (currentTaskId) {
            const task = tasks.find(t => t.id === currentTaskId);
            if (task) task.image = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// Reward Jar Functions
function updateRewardJar() {
    const completedToday = tasks.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return t.date === today && t.completed;
    }).length;
    
    const fillPercent = Math.min((completedToday / 5) * 100, 100);
    document.getElementById('jarFill').style.height = fillPercent + '%';
    document.getElementById('jarProgress').textContent = `${completedToday}/5`;
    
    if (completedToday >= 5) {
        rewardPoints++;
        localStorage.setItem('rewardPoints', rewardPoints);
        showNotification('🎉 Reward unlocked! Take a break!');
    }
}

// Habit Plant Functions
function updateHabitPlants() {
    const plantsContainer = document.getElementById('habitPlants');
    if (!plantsContainer) return;
    
    plantsContainer.innerHTML = '';
    
    // Group tasks by title to find habits
    const habitMap = {};
    tasks.forEach(task => {
        if (!habitMap[task.title]) {
            habitMap[task.title] = { count: 0, completed: 0 };
        }
        habitMap[task.title].count++;
        if (task.completed) habitMap[task.title].completed++;
    });
    
    Object.entries(habitMap).forEach(([title, data]) => {
        if (data.count >= 3) { // Habit = repeated 3+ times
            const plant = document.createElement('div');
            plant.className = 'habit-plant';
            
            const growth = Math.min(data.completed, 10);
            const plantEmoji = growth < 3 ? '🌱' : growth < 7 ? '🌿' : '🌳';
            
            plant.innerHTML = `
                <div class="plant-visual">${plantEmoji}</div>
                <div class="plant-name">${escapeHtml(title)}</div>
                <div class="plant-streak">${data.completed} completed</div>
            `;
            
            plantsContainer.appendChild(plant);
        }
    });
}

// Life Receipt Functions
function generateLifeReceipt() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const completed = todayTasks.filter(t => t.completed).length;
    
    const totalEnergy = todayTasks.reduce((sum, t) => {
        const energy = t.energyLevel || 50;
        return sum + (t.completed ? energy : 0);
    }, 0);
    
    const avgTime = todayTasks.length > 0 ? Math.round(30 * todayTasks.length) : 0;
    const timeSaved = completed * 30;
    
    document.getElementById('receiptDate').textContent = new Date().toLocaleDateString();
    document.getElementById('receiptCompleted').textContent = completed;
    document.getElementById('receiptEnergy').textContent = Math.round(totalEnergy / Math.max(completed, 1)) + '%';
    document.getElementById('receiptTime').textContent = timeSaved + ' min';
    document.getElementById('receiptRewards').textContent = rewardPoints;
    
    document.getElementById('receiptModal').classList.add('active');
}

function shareReceipt() {
    const receipt = document.getElementById('lifeReceipt');
    // Simple text-based sharing
    const receiptText = `
LIFE RECEIPT
${document.getElementById('receiptDate').textContent}

Tasks Completed: ${document.getElementById('receiptCompleted').textContent}
Energy Spent: ${document.getElementById('receiptEnergy').textContent}
Time Saved: ${document.getElementById('receiptTime').textContent}
Rewards Earned: ${document.getElementById('receiptRewards').textContent}

Thank you for being productive!
    `.trim();
    
    if (navigator.share) {
        navigator.share({
            title: 'Life Receipt',
            text: receiptText
        });
    } else {
        copyToClipboard(receiptText);
        showNotification('Receipt copied to clipboard!');
    }
}

// Countdown Timer Functions
function addCountdownTimer(task) {
    if (!task.time || task.completed) return '';
    
    const now = new Date();
    const taskTime = new Date(`${task.date}T${task.time}`);
    const diff = taskTime - now;
    
    if (diff <= 0) {
        return '<div class="countdown-timer urgent"><span class="melting-clock">⏰</span> Overdue</div>';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const isUrgent = hours < 1;
    return `<div class="countdown-timer ${isUrgent ? 'urgent' : ''}">
        <span class="melting-clock">⏰</span>
        ${hours}h ${minutes}m left
    </div>`;
}

// Brain Load Meter Functions
function updateBrainLoad() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today && !t.completed);
    
    const totalLoad = todayTasks.reduce((sum, t) => {
        return sum + (t.effort || 50);
    }, 0);
    
    const avgLoad = todayTasks.length > 0 ? totalLoad / todayTasks.length : 0;
    const loadPercent = Math.min(avgLoad, 100);
    
    const fill = document.getElementById('brainFill');
    const label = document.getElementById('brainLabel');
    
    if (fill) fill.style.width = loadPercent + '%';
    if (label) {
        if (loadPercent < 33) {
            label.textContent = 'Mental Load: Low';
        } else if (loadPercent < 67) {
            label.textContent = 'Mental Load: Medium';
        } else {
            label.textContent = 'Mental Load: High';
        }
    }
}

// Life Buckets Functions
function updateLifeBuckets() {
    const buckets = ['health', 'paisa', 'family', 'growth'];
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    buckets.forEach(bucket => {
        const bucketTasks = todayTasks.filter(t => t.bucket === bucket);
        const completed = bucketTasks.filter(t => t.completed).length;
        const total = bucketTasks.length;
        const percent = total > 0 ? (completed / total) * 100 : 0;
        
        const progress = document.querySelector(`#${bucket}Bucket .bucket-progress`);
        if (progress) {
            progress.style.height = percent + '%';
        }
    });
}

// Streak Functions
function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = tasks.filter(t => t.date === today && t.completed).length > 0;
    
    if (todayCompleted) {
        if (lastCompletedDate !== today) {
            if (lastCompletedDate && isConsecutiveDay(lastCompletedDate, today)) {
                streakCount++;
            } else {
                streakCount = 1;
            }
            lastCompletedDate = today;
            localStorage.setItem('streakCount', streakCount);
            localStorage.setItem('lastCompletedDate', lastCompletedDate);
        }
    } else {
        // Check for zero-day protection
        const allTodayTasks = tasks.filter(t => t.date === today);
        if (allTodayTasks.length > 0 && allTodayTasks.every(t => !t.completed)) {
            showStreakShield();
        }
    }
    
    document.getElementById('streakCount').textContent = streakCount;
}

function isConsecutiveDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff === 1;
}

function showStreakShield() {
    const shield = document.getElementById('streakShield');
    if (shield) {
        shield.style.display = 'block';
        // Suggest tiny task
        const tinyTask = tasks.find(t => {
            const today = new Date().toISOString().split('T')[0];
            return t.date === today && !t.completed && (t.effort || 50) < 30;
        });
        if (tinyTask) {
            showNotification(`🛡️ Save your streak! Complete: ${tinyTask.title}`);
        }
    }
}

// Missed Task Functions
function handleMissedTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const now = new Date();
    const taskTime = new Date(`${task.date}T${task.time}`);
    
    if (taskTime < now && !task.completed) {
        document.getElementById('missedTaskTitle').textContent = task.title;
        document.getElementById('missedTaskModal').classList.add('active');
        currentTaskId = taskId;
    }
}

function handleShiftTask() {
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            task.date = tomorrow.toISOString().split('T')[0];
            saveTasks();
            loadTasks();
            showNotification('Task shifted to tomorrow');
        }
    }
    document.getElementById('missedTaskModal').classList.remove('active');
}

function handleDropTask() {
    if (currentTaskId) {
        tasks = tasks.filter(t => t.id !== currentTaskId);
        saveTasks();
        loadTasks();
        showNotification('Task dropped');
    }
    document.getElementById('missedTaskModal').classList.remove('active');
}

// Surprise Reward Functions
function showSurpriseReward() {
    const rewards = [
        { type: 'quote', content: '"The only way to do great work is to love what you do." - Steve Jobs' },
        { type: 'joke', content: 'Why did the task cross the road? To get to the completed side! 😄' },
        { type: 'tip', content: '💡 Tip: Break big tasks into smaller ones. You\'ll feel more accomplished!' },
        { type: 'quote', content: '"Progress, not perfection." Keep going! 🌟' },
        { type: 'joke', content: 'What do you call a completed task? A success story! 📖' }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    document.getElementById('surpriseContent').textContent = reward.content;
    document.getElementById('surpriseModal').classList.add('active');
}

// Focus Aura Functions
function activateFocusAura(taskId) {
    focusedTaskId = taskId;
    const aura = document.getElementById('focusAura');
    if (aura) {
        aura.classList.add('active');
        
        // Hide ads during focus
        hideAllAds();
        
        // Fade other tasks
        document.querySelectorAll('.task-item').forEach(item => {
            if (item.getAttribute('data-task-id') !== taskId) {
                item.style.opacity = '0.3';
            }
        });
    }
}

function deactivateFocusAura() {
    focusedTaskId = null;
    const aura = document.getElementById('focusAura');
    if (aura) {
        aura.classList.remove('active');
        document.querySelectorAll('.task-item').forEach(item => {
            item.style.opacity = '1';
        });
    }
}

// Why Task Thought Bubble
function showWhyTaskBubble(task) {
    if (!task.why) return;
    
    const bubble = document.getElementById('whyTaskBubble');
    const content = document.getElementById('whyTaskContent');
    
    if (bubble && content) {
        content.textContent = `"${task.why}"`;
        bubble.classList.add('active');
        
        setTimeout(() => {
            bubble.classList.remove('active');
        }, 5000);
    }
}

// Night-Only Tasks Filter
function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
}

function filterNightTasks(tasks) {
    if (isNightTime()) {
        return tasks; // Show all at night
    }
    return tasks.filter(t => !t.nightOnly); // Hide night-only tasks during day
}

// AdMob/AdSense Integration Functions
function initializeAdMob() {
    // Check if ads are enabled
    if (!window.adConfig || !window.adConfig.enabled) {
        console.log('Ads are disabled');
        return;
    }
    
    // Initialize AdSense ads
    if (typeof adsbygoogle !== 'undefined') {
        // Ads will be automatically loaded by AdSense script
        console.log('AdSense initialized');
    }
    
    // For mobile apps, initialize AdMob SDK here
    // Example for Cordova/PhoneGap:
    /*
    if (window.AdMob) {
        AdMob.prepareInterstitial({
            adId: window.adConfig.adUnits.interstitial,
            autoShow: false
        });
    }
    */
}

function loadBannerAd() {
    if (!shouldShowAd() || isFocusModeActive()) return;
    
    const bannerAd = document.getElementById('nativeBannerAd');
    if (bannerAd && !bannerAd.classList.contains('ad-visible')) {
        bannerAd.classList.remove('ad-hidden');
        bannerAd.classList.add('ad-visible');
        
        // Refresh AdSense ad
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense error:', e);
        }
        
        updateAdDisplayCount();
    }
}

function loadStickyAd() {
    if (!shouldShowAd() || isFocusModeActive()) return;
    
    const stickyAd = document.getElementById('bottomStickyAd');
    if (stickyAd && !stickyAd.classList.contains('ad-visible')) {
        stickyAd.classList.remove('ad-hidden');
        stickyAd.classList.add('ad-visible');
        
        // Refresh AdSense ad
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense error:', e);
        }
        
        updateAdDisplayCount();
    }
}

function loadInterstitialAd() {
    if (!shouldShowAd() || isFocusModeActive()) return;
    
    // For web (AdSense)
    const interstitial = document.getElementById('interstitialAd');
    if (interstitial) {
        interstitial.classList.remove('ad-hidden');
        interstitial.classList.add('ad-visible');
        
        // Refresh AdSense ad
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense error:', e);
        }
        
        startInterstitialCountdown();
        updateAdDisplayCount();
    }
    
    // For mobile (AdMob)
    /*
    if (window.AdMob) {
        AdMob.showInterstitial();
    }
    */
}

function loadRewardedAd() {
    // For mobile (AdMob Rewarded Ad)
    /*
    if (window.AdMob) {
        AdMob.prepareRewardVideoAd({
            adId: window.adConfig.adUnits.rewarded,
            autoShow: true
        }, function() {
            // Ad loaded successfully
            console.log('Rewarded ad loaded');
        }, function() {
            // Ad failed to load
            console.log('Rewarded ad failed to load');
        });
    }
    */
    
    // For web, show modal (AdSense doesn't support rewarded ads)
    const modal = document.getElementById('rewardedAdModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Advertisement System Functions (Fallback for when AdMob/AdSense fails)
const adCampaigns = {
    productivity: [
        {
            icon: '📊',
            title: 'Boost Your Productivity',
            description: 'Try our premium task manager',
            cta: 'Try Now',
            category: 'productivity'
        },
        {
            icon: '⏰',
            title: 'Time Tracking Made Easy',
            description: 'Track your time and boost efficiency',
            cta: 'Install',
            category: 'productivity'
        },
        {
            icon: '🎯',
            title: 'Focus & Concentration',
            description: 'Block distractions and stay focused',
            cta: 'Get Started',
            category: 'productivity'
        }
    ],
    study: [
        {
            icon: '📚',
            title: 'Study Planner Pro',
            description: 'Organize your study schedule',
            cta: 'Try Now',
            category: 'study'
        },
        {
            icon: '✍️',
            title: 'Note-Taking Master',
            description: 'Take better notes, study smarter',
            cta: 'Install',
            category: 'study'
        }
    ],
    finance: [
        {
            icon: '💰',
            title: 'Budget Tracker',
            description: 'Manage your finances easily',
            cta: 'Try Now',
            category: 'finance'
        },
        {
            icon: '💳',
            title: 'Expense Manager',
            description: 'Track every expense effortlessly',
            cta: 'Get Started',
            category: 'finance'
        }
    ]
};

function initializeAdSystem() {
    // Initialize AdMob/AdSense
    initializeAdMob();
    
    // Show native banner ad after a delay
    setTimeout(() => {
        if (shouldShowAd() && !isFocusModeActive()) {
            loadBannerAd();
        }
    }, 3000);
    
    // Show bottom sticky ad after user interaction
    setTimeout(() => {
        if (shouldShowAd() && !isFocusModeActive()) {
            loadStickyAd();
        }
    }, 5000);
    
    // Track user behavior for ad targeting
    trackUserBehavior();
}

function shouldShowAd() {
    // Don't show ads too frequently
    const now = Date.now();
    const lastShown = lastAdShown ? parseInt(lastAdShown) : 0;
    const timeSinceLastAd = now - lastShown;
    
    // Show ad max once per 5 minutes
    if (timeSinceLastAd < 300000) {
        return false;
    }
    
    // Don't show if user has seen too many ads today
    const today = new Date().toDateString();
    const lastAdDate = localStorage.getItem('lastAdDate');
    if (lastAdDate === today && adDisplayCount >= 10) {
        return false;
    }
    
    return true;
}

function isFocusModeActive() {
    return currentLayout === 'focus' || focusedTaskId !== null;
}

function trackUserBehavior() {
    // Analyze user tasks to determine interests
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    todayTasks.forEach(task => {
        const title = task.title.toLowerCase();
        if (title.includes('study') || title.includes('learn') || title.includes('read')) {
            userBehavior.study++;
        }
        if (title.includes('budget') || title.includes('money') || title.includes('expense') || title.includes('bill')) {
            userBehavior.finance++;
        }
        if (title.includes('work') || title.includes('project') || title.includes('meeting')) {
            userBehavior.productivity++;
        }
    });
    
    localStorage.setItem('userBehavior', JSON.stringify(userBehavior));
}

function getTargetedAd() {
    // Determine which category to show based on user behavior
    const maxBehavior = Math.max(userBehavior.productivity, userBehavior.study, userBehavior.finance);
    
    let category = 'productivity'; // Default
    if (maxBehavior > 0) {
        if (userBehavior.study === maxBehavior) {
            category = 'study';
        } else if (userBehavior.finance === maxBehavior) {
            category = 'finance';
        }
    }
    
    const ads = adCampaigns[category];
    return ads[Math.floor(Math.random() * ads.length)];
}

function showNativeBannerAd() {
    // Use AdMob/AdSense banner ad
    loadBannerAd();
}

function showBottomStickyAd() {
    // Use AdMob/AdSense sticky ad
    loadStickyAd();
}

function closeBottomStickyAd() {
    const stickyAd = document.getElementById('bottomStickyAd');
    if (stickyAd) {
        stickyAd.classList.remove('ad-visible');
        stickyAd.classList.add('ad-hidden');
    }
}

function showRewardedAd(feature) {
    // Set feature name
    const featureEl = document.getElementById('rewardedAdFeature');
    if (featureEl) {
        featureEl.textContent = feature;
    }
    
    // Load rewarded ad (AdMob for mobile, modal for web)
    loadRewardedAd();
}

function closeRewardedAd() {
    const modal = document.getElementById('rewardedAdModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleWatchRewardedAd() {
    // For mobile (AdMob)
    /*
    if (window.AdMob) {
        AdMob.showRewardVideoAd(
            function() {
                // Ad watched successfully
                showNotification('🎉 Premium feature unlocked for 24 hours!');
                localStorage.setItem('premiumAccess', 'true');
                localStorage.setItem('premiumExpiry', Date.now() + 24 * 60 * 60 * 1000);
                closeRewardedAd();
            },
            function() {
                // Ad failed or user closed
                showNotification('Ad not completed');
            }
        );
        return;
    }
    */
    
    // For web (simulate watching)
    showNotification('🎉 Premium feature unlocked for 24 hours!');
    localStorage.setItem('premiumAccess', 'true');
    localStorage.setItem('premiumExpiry', Date.now() + 24 * 60 * 60 * 1000);
    closeRewardedAd();
}

function showInterstitialAd() {
    if (!shouldShowAd() || isFocusModeActive()) return;
    
    // Use AdMob/AdSense interstitial ad
    loadInterstitialAd();
}

function startInterstitialCountdown() {
    const skipBtn = document.getElementById('interstitialSkip');
    const countdownEl = document.getElementById('skipCountdown');
    interstitialCountdown = 5;
    
    skipBtn.disabled = true;
    
    interstitialTimer = setInterval(() => {
        interstitialCountdown--;
        if (countdownEl) {
            countdownEl.textContent = interstitialCountdown;
        }
        
        if (interstitialCountdown <= 0) {
            clearInterval(interstitialTimer);
            if (skipBtn) {
                skipBtn.disabled = false;
                skipBtn.innerHTML = 'Skip';
            }
        }
    }, 1000);
}

function skipInterstitialAd() {
    if (interstitialCountdown > 0) return;
    
    const interstitial = document.getElementById('interstitialAd');
    if (interstitial) {
        interstitial.classList.remove('ad-visible');
        interstitial.classList.add('ad-hidden');
    }
    
    if (interstitialTimer) {
        clearInterval(interstitialTimer);
    }
}

function handleAdClick() {
    // Track ad click (AdMob/AdSense handles clicks automatically)
    // This function is for custom tracking if needed
    
    // Hide ads after click (optional)
    // hideAllAds();
    updateAdDisplayCount();
}

function hideAllAds() {
    document.getElementById('nativeBannerAd')?.classList.remove('ad-visible');
    document.getElementById('nativeBannerAd')?.classList.add('ad-hidden');
    closeBottomStickyAd();
}

function updateAdDisplayCount() {
    const today = new Date().toDateString();
    const lastAdDate = localStorage.getItem('lastAdDate');
    
    if (lastAdDate !== today) {
        adDisplayCount = 0;
        localStorage.setItem('lastAdDate', today);
    }
    
    adDisplayCount++;
    localStorage.setItem('adDisplayCount', adDisplayCount);
    localStorage.setItem('lastAdShown', Date.now().toString());
}

// Note: switchScreen function already includes ad logic below

// Show rewarded ad when user tries to access premium features
function checkPremiumFeature(feature) {
    // Check if user has premium access
    const hasPremium = localStorage.getItem('premiumAccess');
    const premiumExpiry = localStorage.getItem('premiumExpiry');
    
    if (hasPremium && premiumExpiry) {
        const expiryTime = parseInt(premiumExpiry);
        if (Date.now() < expiryTime) {
            return true; // Premium still active
        } else {
            // Premium expired
            localStorage.removeItem('premiumAccess');
            localStorage.removeItem('premiumExpiry');
        }
    }
    
    if (!hasPremium) {
        showRewardedAd(feature);
        return false;
    }
    
    return true;
}

// AdMob Event Listeners (for mobile apps)
function setupAdMobListeners() {
    // For Cordova/PhoneGap AdMob plugin
    /*
    if (window.AdMob) {
        // Interstitial ad events
        document.addEventListener('onAdLoaded', function(data) {
            console.log('Ad loaded:', data);
        });
        
        document.addEventListener('onAdFailedToLoad', function(data) {
            console.log('Ad failed to load:', data);
        });
        
        document.addEventListener('onAdOpened', function(data) {
            console.log('Ad opened:', data);
        });
        
        document.addEventListener('onAdClosed', function(data) {
            console.log('Ad closed:', data);
            // Reload interstitial for next time
            AdMob.prepareInterstitial({
                adId: window.adConfig.adUnits.interstitial,
                autoShow: false
            });
        });
        
        // Rewarded ad events
        document.addEventListener('onRewardedVideoAdLoaded', function() {
            console.log('Rewarded ad loaded');
        });
        
        document.addEventListener('onRewardedVideoAdOpened', function() {
            console.log('Rewarded ad opened');
        });
        
        document.addEventListener('onRewardedVideoAdClosed', function() {
            console.log('Rewarded ad closed');
        });
        
        document.addEventListener('onRewardedVideoAdRewarded', function(data) {
            console.log('Reward earned:', data);
            showNotification('🎉 Premium feature unlocked for 24 hours!');
            localStorage.setItem('premiumAccess', 'true');
            localStorage.setItem('premiumExpiry', Date.now() + 24 * 60 * 60 * 1000);
        });
    }
    */
}
