document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const passwordManager = document.getElementById('passwordManager');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    
    // Password Manager elements
    const addPasswordBtn = document.getElementById('addPasswordBtn');
    const addPasswordForm = document.getElementById('addPasswordForm');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passwordList = document.getElementById('passwordList');
    const userNameElement = document.getElementById('userName');
    
    // Initialize Google API client with credentials from config.js
    function initializeGoogleAPI() {
        // Replace dummy client ID with the one from config
        if (typeof config !== 'undefined' && config.googleClientId) {
            const googleSignInElements = document.querySelectorAll('[data-client_id="YOUR_GOOGLE_CLIENT_ID"]');
            googleSignInElements.forEach(element => {
                element.setAttribute('data-client_id', config.googleClientId);
            });
        }
    }
    
    // Check if user is logged in
    function checkUserLoggedIn() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            const user = JSON.parse(userData);
            userNameElement.textContent = user.name || 'User';
            showPasswordManager();
            loadSavedPasswords();
            return true;
        }
        return false;
    }
    
    // Random bubble animation
    const bubbles = document.querySelectorAll('.bubbles span');
    bubbles.forEach(bubble => {
        const size = Math.random() * 60 + 20;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 4}s`;
        bubble.style.animationDuration = `${Math.random() * 4 + 6}s`;
    });

    // Google Sign-In handlers
    window.handleGoogleSignIn = function(response) {
        // Parse JWT token from Google response
        const token = parseJwt(response.credential);
        console.log("Google Sign-In successful: ", token);
        
        // Save user info for later use
        localStorage.setItem('authToken', response.credential);
        localStorage.setItem('userData', JSON.stringify({
            name: token.name,
            email: token.email,
            picture: token.picture
        }));
        
        // Show password manager
        userNameElement.textContent = token.name;
        showPasswordManager();
        
        // You could also send the token to your backend for verification
        // and to get saved passwords for this user
    };
    
    window.handleGoogleSignUp = function(response) {
        // Similar to sign in, but might handle differently for new users
        window.handleGoogleSignIn(response);
    };
    
    // Parse JWT token helper
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error parsing JWT token", e);
            return {};
        }
    }
    
    // Show password manager view
    function showPasswordManager() {
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        
        setTimeout(() => {
            passwordManager.classList.add('active');
        }, 300);
    }
    
    // Load saved passwords (would connect to backend API in real implementation)
    function loadSavedPasswords() {
        // In a real app, you'd fetch this from your backend API
        let savedPasswords = localStorage.getItem('savedPasswords');
        
        if (savedPasswords) {
            try {
                savedPasswords = JSON.parse(savedPasswords);
                renderPasswordList(savedPasswords);
            } catch (e) {
                console.error("Error parsing saved passwords", e);
                savedPasswords = [];
                localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
            }
        } else {
            savedPasswords = [];
            localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
            renderPasswordList(savedPasswords);
        }
    }
    
    // Render password list in the UI
    function renderPasswordList(passwords) {
        passwordList.innerHTML = '';
        
        if (passwords.length === 0) {
            passwordList.innerHTML = '<div class="empty-list">No saved passwords yet</div>';
            return;
        }
        
        passwords.forEach((password, index) => {
            const item = document.createElement('div');
            item.className = 'password-item';
            
            const siteInitial = password.site.charAt(0).toUpperCase();
            
            item.innerHTML = `
                <div class="site-info">
                    <div class="site-icon">${siteInitial}</div>
                    <div class="site-details">
                        <div class="site-url">${password.site}</div>
                        <div class="site-username">${password.username}</div>
                    </div>
                </div>
                <div class="password-actions">
                    <button class="action-btn view-password" data-index="${index}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn copy-password" data-index="${index}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn delete-password" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            passwordList.appendChild(item);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-password').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewPassword(index);
            });
        });
        
        document.querySelectorAll('.copy-password').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                copyPassword(index);
            });
        });
        
        document.querySelectorAll('.delete-password').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deletePassword(index);
            });
        });
    }
    
    // Password actions
    function viewPassword(index) {
        const passwords = JSON.parse(localStorage.getItem('savedPasswords'));
        alert(`Password: ${passwords[index].password}`);
        // In a real app, you'd use a more secure way to display this
    }
    
    function copyPassword(index) {
        const passwords = JSON.parse(localStorage.getItem('savedPasswords'));
        navigator.clipboard.writeText(passwords[index].password)
            .then(() => alert('Password copied to clipboard!'))
            .catch(err => console.error('Could not copy password: ', err));
    }
    
    function deletePassword(index) {
        if (confirm('Are you sure you want to delete this password?')) {
            const passwords = JSON.parse(localStorage.getItem('savedPasswords'));
            passwords.splice(index, 1);
            localStorage.setItem('savedPasswords', JSON.stringify(passwords));
            renderPasswordList(passwords);
        }
    }
    
    // Add new password
    function saveNewPassword() {
        const site = document.getElementById('newSite').value;
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        
        if (!site || !username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        const passwords = JSON.parse(localStorage.getItem('savedPasswords'));
        passwords.push({ site, username, password });
        localStorage.setItem('savedPasswords', JSON.stringify(passwords));
        
        // Clear form and hide it
        document.getElementById('newSite').value = '';
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        addPasswordForm.style.display = 'none';
        
        // Refresh password list
        renderPasswordList(passwords);
    }
    
    // Event Listeners
    
    // Toggle between login and registration forms
    showRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.remove('active');
        setTimeout(() => {
            registerForm.classList.add('active');
        }, 300);
    });
    
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.remove('active');
        setTimeout(() => {
            loginForm.classList.add('active');
        }, 300);
    });

    // Password manager events
    if (addPasswordBtn) {
        addPasswordBtn.addEventListener('click', function() {
            addPasswordForm.style.display = 'block';
        });
    }
    
    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', function() {
            addPasswordForm.style.display = 'none';
        });
    }
    
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', saveNewPassword);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            passwordManager.classList.remove('active');
            setTimeout(() => {
                loginForm.classList.add('active');
            }, 300);
        });
    }
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset all error states
            form.querySelectorAll('.input-group.error').forEach(el => {
                el.classList.remove('error');
                const errorMsg = el.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            // Validate all required fields
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    showError(input, 'This field is required');
                    isValid = false;
                } else if (input.type === 'email' && !validateEmail(input.value)) {
                    showError(input, 'Please enter a valid email');
                    isValid = false;
                }
            });
            
            // Submit the form if valid
            if (isValid) {
                // For demo purposes, show the password manager if login is successful
                if (form.closest('.login-form')) {
                    localStorage.setItem('userData', JSON.stringify({name: "Demo User"}));
                    userNameElement.textContent = "Demo User";
                    showPasswordManager();
                } else {
                    // Register form handling
                    alert('Registration successful! Please login.');
                    registerForm.classList.remove('active');
                    setTimeout(() => {
                        loginForm.classList.add('active');
                    }, 300);
                }
            }
        });
    });
    
    // Helper functions
    function showError(input, message) {
        const inputGroup = input.closest('.input-group');
        inputGroup.classList.add('error');
        
        // Create error message if it doesn't exist
        if (!inputGroup.querySelector('.error-message')) {
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.textContent = message;
            inputGroup.appendChild(errorMsg);
        }
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Initialize app
    initializeGoogleAPI();
    if (!checkUserLoggedIn()) {
        loginForm.classList.add('active');
    }
});
