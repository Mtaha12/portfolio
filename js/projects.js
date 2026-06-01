/* ==========================================================================
   MUHAMMAD TAHA PORTFOLIO - PROJECTS CONTROLLER
   ========================================================================== */

function renderProjects(role) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    // Grab projects based on the current role from global profileData
    const data = window.profileData[role];
    if (!data || !data.projects) return;

    grid.innerHTML = '';

    data.projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card-custom glass-panel reveal-slide btn-magnetic';
        
        // Dynamic folder icon depending on role
        const folderIcon = role === 'fullstack' ? 'fa-solid fa-code' : 'fa-solid fa-diagram-project';

        card.innerHTML = `
            <div class="project-header-row">
                <span class="project-tag-pill">${project.subtitle}</span>
                <i class="${folderIcon}" style="color: var(--accent-primary); font-size: 1.2rem;"></i>
            </div>
            <h3>${project.title}</h3>
            <span class="project-role-tag">${project.role}</span>
            <p>${project.description}</p>
            <div class="project-subdetails">
                ${project.details}
            </div>
            <div class="project-tech-tags-list">
                ${project.tech.map(t => `<span>${t}</span>`).join('')}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Export module
window.projectsModule = {
    render: renderProjects
};