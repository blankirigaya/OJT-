// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "issuelogger-522de.firebaseapp.com",
    projectId: "issuelogger-522de",
    storageBucket: "issuelogger-522de.firebasestorage.app",
    messagingSenderId: "964094432254",
    appId: "1:964094432254:web:c51ccade6af6bef5a0a6af",
    measurementId: "G-H92P42RJFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is already logged in, store info
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.uid);
        if (user.displayName) {
            localStorage.setItem('userName', user.displayName);
        }
    }
});

// Modal functions
function openAuthSelection() {
    // Check if user is already logged in
    const userId = localStorage.getItem('userId');
    if (userId) {
        // User is already logged in, go directly to app
        window.location.href = 'main.html';
    } else {
        // Show auth selection modal
        document.getElementById("authModal").style.display = "flex";
    }
}

function closeAuthSelection() {
    document.getElementById("authModal").style.display = "none";
}

function openLogin() { 
    closeAuthSelection();
    const modal = document.getElementById("loginModal");
    modal.style.display = "flex";
    
    // Add animated background
    if (!modal.querySelector('.animated-bg')) {
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        animatedBg.innerHTML = `
            <div class="floating-shapes">
                <div class="shape"></div>
                <div class="shape"></div>
                <div class="shape"></div>
            </div>
        `;
        modal.insertBefore(animatedBg, modal.firstChild);
    }
    
    clearMessages();
}

function closeLogin() { 
    document.getElementById("loginModal").style.display = "none";
    clearMessages();
    openAuthSelection();
}

function openSignup() { 
    closeAuthSelection();
    const modal = document.getElementById("signupModal");
    modal.style.display = "flex";
    
    // Add animated background
    if (!modal.querySelector('.animated-bg')) {
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        animatedBg.innerHTML = `
            <div class="floating-shapes">
                <div class="shape"></div>
                <div class="shape"></div>
                <div class="shape"></div>
            </div>
        `;
        modal.insertBefore(animatedBg, modal.firstChild);
    }
    
    clearMessages();
}

function closeSignup() { 
    document.getElementById("signupModal").style.display = "none";
    clearMessages();
    openAuthSelection();
}

function clearMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.textContent = message;
    successEl.style.display = 'block';
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    
    clearMessages();
    
    if (!email || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
    }
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showSuccess('loginSuccess', 'Login successful! Redirecting...');
        
        // Store user info in localStorage
        localStorage.setItem('userEmail', userCredential.user.email);
        localStorage.setItem('userId', userCredential.user.uid);
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        }
        
        showError('loginError', errorMessage);
    }
}

// Handle Google Login
async function handleGoogleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Store user info in localStorage
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.uid);
        if (user.displayName) {
            localStorage.setItem('userName', user.displayName);
        }
        
        // Redirect to main app
        window.location.href = 'main.html';
    } catch (error) {
        let errorMessage = 'Google sign-in failed. Please try again.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in popup was closed.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Sign-in popup was blocked. Please allow popups.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            return; // User cancelled, don't show error
        }
        
        alert(errorMessage);
        console.error('Google sign-in error:', error);
    }
}

// Handle Signup
async function handleSignup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    
    clearMessages();
    
    if (!name || !email || !password) {
        showError('signupError', 'Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showError('signupError', 'Password must be at least 6 characters');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });
        
        showSuccess('signupSuccess', 'Account created! Redirecting...');
        
        // Store user info in localStorage
        localStorage.setItem('userEmail', userCredential.user.email);
        localStorage.setItem('userId', userCredential.user.uid);
        localStorage.setItem('userName', name);
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
    } catch (error) {
        let errorMessage = 'Signup failed. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak.';
        }
        
        showError('signupError', errorMessage);
    }
}

// Make functions globally available
window.openAuthSelection = openAuthSelection;
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.openSignup = openSignup;
window.closeSignup = closeSignup;
window.handleLogin = handleLogin;
window.handleGoogleLogin = handleGoogleLogin;
window.handleSignup = handleSignup;

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('signupPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSignup();
    });
});

// Close modals when clicking outside
document.getElementById('authModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeAuthSelection();
    }
});
