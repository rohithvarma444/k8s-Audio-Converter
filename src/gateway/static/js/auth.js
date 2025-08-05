document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Clear messages
            document.getElementById('login-message').textContent = '';
            document.getElementById('register-message').textContent = '';
        });
    });
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/upload-page';
    }
    
    // Login functionality
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('login-message');
        
        if (!email || !password) {
            showMessage(messageEl, 'Please enter both email and password', 'error');
            return;
        }
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(email + ':' + password)
                }
            });
            
            if (response.ok) {
                const token = await response.text();
                localStorage.setItem('token', token);
                showMessage(messageEl, 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/upload-page';
                }, 1000);
            } else {
                const error = await response.text();
                showMessage(messageEl, error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage(messageEl, 'An error occurred. Please try again.', 'error');
            console.error(error);
        }
    });
    
    // Register functionality
    const registerBtn = document.getElementById('register-btn');
    registerBtn.addEventListener('click', async () => {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const messageEl = document.getElementById('register-message');
        
        if (!email || !password) {
            showMessage(messageEl, 'Please enter both email and password', 'error');
            return;
        }
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const message = await response.text();
            
            if (response.ok) {
                showMessage(messageEl, message || 'Registration successful! Please login.', 'success');
                // Switch to login tab after successful registration
                setTimeout(() => {
                    document.querySelector('.tab[data-tab="login"]').click();
                }, 1500);
            } else {
                showMessage(messageEl, message || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage(messageEl, 'An error occurred. Please try again.', 'error');
            console.error(error);
        }
    });
    
    // Helper function to show messages
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
    }
});