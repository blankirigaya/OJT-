const issues = [
    {id:1, title:"Login button not responding", priority:"high", category:"Bug", date:"2h ago"},
    {id:2, title:"Add dark mode", priority:"medium", category:"Feature", date:"5h ago"},
];

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

function renderIssues(){
    const container = document.getElementById("issuesList");
    if(issues.length === 0){
        container.innerHTML = `<p class="empty-state">No issues reported yet</p>`;
        return;
    }
    container.innerHTML = issues.map(issue => `
        <div class="issue-card">
            <div class="issue-title">${issue.title}</div>
            <div class="issue-meta">${issue.priority} • ${issue.category} • ${issue.date}</div>
        </div>
    `).join("");
}

renderIssues();