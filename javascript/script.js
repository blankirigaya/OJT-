// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeqThBgikkUrn_HytZHFUxPs19kJsFHXo",
    authDomain: "issuelogger-522de.firebaseapp.com",
    databaseURL: "https://console.firebase.google.com/u/0/project/issuelogger-522de/database/issuelogger-522de-default-rtdb/data/~2F", // Add your database URL
    projectId: "issuelogger-522de",
    storageBucket: "issuelogger-522de.firebasestorage.app",
    messagingSenderId: "964094432254",
    appId: "1:964094432254:web:c51ccade6af6bef5a0a6af",
    measurementId: "G-H92P42RJFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        // Load user's issues
        loadUserIssues(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

// Hamburger menu functionality
const hamburgerBtn = document.getElementById("hamburgerBtn");
const overlay = document.getElementById("overlay");
const sidebar = document.getElementById("sidebar");

function toggleSidebar(){
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
}

hamburgerBtn.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", toggleSidebar);

// Load user's issues from Firebase
function loadUserIssues(userId) {
    const issuesRef = ref(database, `issues/${userId}`);
    const issuesQuery = query(issuesRef, orderByChild('timestamp'));
    
    onValue(issuesQuery, (snapshot) => {
        const issuesContainer = document.getElementById("issuesList");
        
        if (!snapshot.exists()) {
            issuesContainer.innerHTML = `<p class="empty-state">No issues reported yet</p>`;
            return;
        }
        
        const issues = [];
        snapshot.forEach((childSnapshot) => {
            const issue = childSnapshot.val();
            issue.id = childSnapshot.key;
            issues.push(issue);
        });
        
        // Reverse to show newest first
        issues.reverse();
        
        renderIssues(issues);
    });
}

// Render issues in sidebar
function renderIssues(issues){
    const container = document.getElementById("issuesList");
    
    if(issues.length === 0){
        container.innerHTML = `<p class="empty-state">No issues reported yet</p>`;
        return;
    }
    
    container.innerHTML = issues.map(issue => {
        const timeAgo = getTimeAgo(issue.timestamp);
        const priorityClass = issue.priority.toLowerCase();
        
        return `
            <div class="issue-card" data-id="${issue.id}">
                <div class="issue-title">${escapeHtml(issue.title)}</div>
                <div class="issue-meta">
                    <span class="priority-badge ${priorityClass}">${issue.priority}</span>
                    <span>•</span>
                    <span>${issue.category === 'bug' ? 'Bug' : 'Feature'}</span>
                    <span>•</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }).join("");
}

// Handle form submission
const issueForm = document.getElementById("issueForm");

issueForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert("You must be logged in to submit an issue");
        return;
    }
    
    // Get form values
    const title = document.getElementById("title").value.trim();
    const email = document.getElementById("email").value.trim();
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value.trim();
    
    // Validate
    if (!title || !email || !priority || !category || !description) {
        alert("Please fill in all required fields");
        return;
    }
    
    // Create issue object
    const issue = {
        title: title,
        email: email,
        priority: priority,
        category: category,
        description: description,
        timestamp: Date.now(),
        status: "open",
        userId: currentUser.uid
    };
    
    try {
        // Save to Firebase
        const issuesRef = ref(database, `issues/${currentUser.uid}`);
        const newIssueRef = push(issuesRef);
        await set(newIssueRef, issue);
        
        // Show success message
        showSuccessMessage("Issue submitted successfully!");
        
        // Reset form
        issueForm.reset();
        document.getElementById("email").value = currentUser.email; // Restore email
        
    } catch (error) {
        console.error("Error submitting issue:", error);
        alert("Failed to submit issue. Please try again.");
    }
});

// Utility function to calculate time ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// Add animations to document
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
    
    .priority-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }
    
    .priority-badge.high {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .priority-badge.medium {
        background: #fef3c7;
        color: #d97706;
    }
    
    .priority-badge.low {
        background: #dbeafe;
        color: #2563eb;
    }
`;
document.head.appendChild(style);