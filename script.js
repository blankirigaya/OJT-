// Initialize issues array
let issues = JSON.parse(localStorage.getItem('issues')) || [];
let editingIssueId = null;

// DOM elements
const issueForm = document.getElementById('issueForm');
const issuesList = document.getElementById('issuesList');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');

// Event listeners
issueForm.addEventListener('submit', handleSubmit);
filterStatus.addEventListener('change', renderIssues);
filterPriority.addEventListener('change', renderIssues);

// Initialize app
renderIssues();

function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('issueTitle').value;
    const description = document.getElementById('issueDescription').value;
    const priority = document.getElementById('issuePriority').value;
    const status = document.getElementById('issueStatus').value;
    
    if (editingIssueId) {
        // Update existing issue
        const issueIndex = issues.findIndex(issue => issue.id === editingIssueId);
        if (issueIndex !== -1) {
            issues[issueIndex] = {
                ...issues[issueIndex],
                title,
                description,
                priority,
                status
            };
        }
        editingIssueId = null;
        document.querySelector('.btn-primary').textContent = 'Add Issue';
    } else {
        // Create new issue
        const newIssue = {
            id: Date.now(),
            title,
            description,
            priority,
            status,
            createdAt: new Date().toISOString()
        };
        issues.unshift(newIssue);
    }
    
    saveIssues();
    renderIssues();
    issueForm.reset();
}

function saveIssues() {
    localStorage.setItem('issues', JSON.stringify(issues));
}

function renderIssues() {
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    
    let filteredIssues = issues;
    
    if (statusFilter !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.priority === priorityFilter);
    }
    
    if (filteredIssues.length === 0) {
        issuesList.innerHTML = `
            <div class="empty-state">
                <h3>No issues found</h3>
                <p>Create your first issue or adjust your filters</p>
            </div>
        `;
        return;
    }
    
    issuesList.innerHTML = filteredIssues.map(issue => createIssueCard(issue)).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editIssue(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteIssue(parseInt(btn.dataset.id)));
    });
}

function createIssueCard(issue) {
    const date = new Date(issue.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="issue-card">
            <div class="issue-header">
                <div>
                    <div class="issue-title">${escapeHtml(issue.title)}</div>
                </div>
                <div class="issue-badges">
                    <span class="badge priority-${issue.priority}">${issue.priority}</span>
                    <span class="badge status-${issue.status}">${issue.status.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="issue-description">${escapeHtml(issue.description)}</div>
            <div class="issue-footer">
                <div class="issue-date">Created: ${date}</div>
                <div class="issue-actions">
                    <button class="btn-edit" data-id="${issue.id}">Edit</button>
                    <button class="btn-delete" data-id="${issue.id}">Delete</button>
                </div>
            </div>
        </div>
    `;
}

function editIssue(id) {
    const issue = issues.find(issue => issue.id === id);
    if (!issue) return;
    
    document.getElementById('issueTitle').value = issue.title;
    document.getElementById('issueDescription').value = issue.description;
    document.getElementById('issuePriority').value = issue.priority;
    document.getElementById('issueStatus').value = issue.status;
    
    editingIssueId = id;
    document.querySelector('.btn-primary').textContent = 'Update Issue';
    
    // Scroll to form
    document.querySelector('.add-issue-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteIssue(id) {
    if (confirm('Are you sure you want to delete this issue?')) {
        issues = issues.filter(issue => issue.id !== id);
        saveIssues();
        renderIssues();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}