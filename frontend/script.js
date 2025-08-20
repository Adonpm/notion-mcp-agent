// Configuration
const CONFIG = {
    BACKEND_URL: "http://localhost:7001", // Change to ngrok URL if remote
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TYPING_DELAY: 1500
};

// Global state
let isTyping = false;
let messageHistory = [];
let devPanelClicks = 0;
let devPanelTimeout = null;

// DOM Elements
const elements = {
    messageInput: null,
    messagesContainer: null,
    welcomeSection: null,
    typingIndicator: null,
    sendButton: null,
    charCount: null,
    devPanel: null,
    statusIndicator: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    checkBackendConnection();
    autoResizeTextarea();
});

// Initialize DOM elements
function initializeElements() {
    elements.messageInput = document.getElementById('messageInput');
    elements.messagesContainer = document.getElementById('messagesContainer');
    elements.welcomeSection = document.getElementById('welcomeSection');
    elements.typingIndicator = document.getElementById('typingIndicator');
    elements.sendButton = document.getElementById('sendButton');
    elements.charCount = document.getElementById('charCount');
    elements.devPanel = document.getElementById('devPanel');
    elements.statusIndicator = document.getElementById('statusIndicator');
}

// Setup event listeners
function setupEventListeners() {
    // Message input handlers
    elements.messageInput.addEventListener('keydown', handleKeyDown);
    elements.messageInput.addEventListener('input', handleInputChange);
    
    // Prevent form submission on enter if shift is held
    elements.messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Handle input changes
function handleInputChange() {
    const input = elements.messageInput;
    const length = input.value.length;
    
    // Update character count
    elements.charCount.textContent = `${length}/1000`;
    
    // Update button state
    elements.sendButton.disabled = length === 0 || isTyping;
    
    // Auto-resize textarea
    autoResizeTextarea();
}

// Auto-resize textarea based on content
function autoResizeTextarea() {
    const input = elements.messageInput;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

// Send message function
async function sendMessage() {
    const input = elements.messageInput.value.trim();
    
    if (!input || isTyping) return;
    
    // Add user message to UI
    addMessage('user', input);
    
    // Clear input
    elements.messageInput.value = '';
    elements.charCount.textContent = '0/1000';
    elements.sendButton.disabled = true;
    autoResizeTextarea();
    
    // Hide welcome section and show messages
    showMessagesContainer();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to backend with retry logic
        const response = await sendWithRetry('/run', { task: input });
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (response.status === 'success') {
            addMessage('bot', response.result);
        } else {
            addMessage('bot', '❌ Sorry, I encountered an error processing your request.');
            showToast('Request failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();
        addMessage('bot', '⚠️ Unable to connect to the server. Please check your connection and try again.');
        showToast('Connection error. Please try again.', 'error');
        updateConnectionStatus(false);
    }
    
    // Re-enable send button
    elements.sendButton.disabled = false;
}

// Send suggestion from welcome pills
function sendSuggestion(suggestion) {
    elements.messageInput.value = suggestion;
    elements.charCount.textContent = `${suggestion.length}/1000`;
    sendMessage();
}

// Add message to the chat
function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="avatar ${type}-avatar">
            <i class="fas ${type === 'user' ? 'fa-user' : 'fa-brain'}"></i>
        </div>
        <div class="message-content">
            ${formatMessageContent(content)}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    // Add to history
    messageHistory.push({ type, content, time });
}

// Format message content (handle markdown, links, etc.)
function formatMessageContent(content) {
    // Basic markdown-like formatting
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    return formatted;
}

// Show messages container and hide welcome
function showMessagesContainer() {
    elements.welcomeSection.style.display = 'none';
    elements.messagesContainer.style.display = 'block';
    elements.messagesContainer.classList.add('active');
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    elements.typingIndicator.style.display = 'block';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    elements.typingIndicator.style.display = 'none';
}

// Scroll to bottom of messages
function scrollToBottom() {
    setTimeout(() => {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }, 100);
}

// Send request with retry logic
async function sendWithRetry(endpoint, data, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                timeout: 30000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed:`, error.message);
            
            if (i === retries - 1) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1)));
        }
    }
}

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            updateConnectionStatus(true);
            showToast('Connected to Notion AI Assistant', 'success');
        } else {
            updateConnectionStatus(false);
        }
    } catch (error) {
        console.warn('Backend connection check failed:', error);
        updateConnectionStatus(false);
    }
}

// Update connection status indicator
function updateConnectionStatus(isConnected) {
    const indicator = elements.statusIndicator;
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('span');
    
    if (isConnected) {
        dot.style.background = 'var(--success-color)';
        text.textContent = 'Connected';
        indicator.style.background = 'rgba(0, 208, 132, 0.1)';
        indicator.style.color = 'var(--success-color)';
    } else {
        dot.style.background = 'var(--error-color)';
        text.textContent = 'Disconnected';
        indicator.style.background = 'rgba(230, 57, 70, 0.1)';
        indicator.style.color = 'var(--error-color)';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Secret developer panel access
function handleSecretClick() {
    devPanelClicks++;
    
    // Clear previous timeout
    if (devPanelTimeout) {
        clearTimeout(devPanelTimeout);
    }
    
    // Reset click count after 2 seconds
    devPanelTimeout = setTimeout(() => {
        devPanelClicks = 0;
    }, 2000);
    
    // Show dev panel after 5 clicks
    if (devPanelClicks >= 5) {
        toggleDevPanel();
        devPanelClicks = 0;
        showToast('Developer panel activated', 'success');
    }
}

// Toggle developer panel
function toggleDevPanel() {
    elements.devPanel.classList.toggle('active');
}

// Test endpoint function
async function testEndpoint(endpoint) {
    const resultId = endpoint === '/health' ? 'healthResult' : 'rootResult';
    const resultElement = document.getElementById(resultId);
    
    resultElement.textContent = 'Testing...';
    
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
            method: 'GET',
            timeout: 10000
        });
        
        const data = await response.json();
        const result = {
            status: response.status,
            data: data
        };
        
        resultElement.textContent = JSON.stringify(result, null, 2);
        resultElement.style.color = response.ok ? 'var(--success-color)' : 'var(--error-color)';
        
    } catch (error) {
        resultElement.textContent = `Error: ${error.message}`;
        resultElement.style.color = 'var(--error-color)';
    }
}

// Export functions for global access
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
window.toggleDevPanel = toggleDevPanel;
window.testEndpoint = testEndpoint;
window.handleSecretClick = handleSecretClick;

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
function logPerformance(label, startTime) {
    const endTime = performance.now();
    console.log(`${label}: ${(endTime - startTime).toFixed(2)}ms`);
}

// Error boundary for unhandled errors
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle online/offline status
window.addEventListener('online', function() {
    updateConnectionStatus(true);
    showToast('Connection restored', 'success');
    checkBackendConnection();
});

window.addEventListener('offline', function() {
    updateConnectionStatus(false);
    showToast('Connection lost', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + / to focus input
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        elements.messageInput.focus();
    }
    
    // Escape to clear input
    if (event.key === 'Escape' && document.activeElement === elements.messageInput) {
        elements.messageInput.value = '';
        elements.charCount.textContent = '0/1000';
        autoResizeTextarea();
    }
});

// Initialize performance monitoring
const initTime = performance.now();
window.addEventListener('load', function() {
    logPerformance('Page Load', initTime);
});
