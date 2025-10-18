// ===== PROJECTS DATA & FILTERING =====

// ===== PROJECTS DATA =====
const projectsData = [
    {
        id: 1,
        title: "E-Commerce Platform",
        category: "web",
        description: "A full-featured e-commerce platform with payment integration, inventory management, and real-time analytics.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        featured: true
    },
    {
        id: 2,
        title: "Task Management App",
        category: "web",
        description: "A collaborative task management application with real-time updates, team collaboration, and project tracking.",
        technologies: ["Vue.js", "Express", "PostgreSQL", "Socket.io"],
        featured: true
    },
    {
        id: 3,
        title: "Weather Dashboard",
        category: "web",
        description: "A beautiful weather dashboard with location-based forecasts, interactive maps, and weather alerts.",
technologies: ["JavaScript", "Weather API", "Chart.js", "CSS3"],
featured: false
},
{
id: 4,
title: "Dodge 'Em Game",
category: "game",
description: "An exciting arcade-style dodge game built with SFML and C++ using OOP principles.",
technologies: ["C++", "SFML", "OOP", "Game Development"],
featured: true
},
{
id: 5,
title: "Portfolio Website",
category: "web",
description: "A responsive portfolio website showcasing projects, skills, and professional experience.",
technologies: ["HTML5", "CSS3", "JavaScript", "AOS"],
featured: false
},
{
id: 6,
title: "Mobile Banking App",
category: "mobile",
description: "A secure mobile banking application with biometric authentication and real-time transactions.",
technologies: ["React Native", "Node.js", "JWT", "Biometrics"],
featured: true
},
{
id: 7,
title: "Blog Platform",
category: "web",
description: "A modern blog platform with markdown support, commenting system, and SEO optimization.",
technologies: ["Next.js", "GraphQL", "Prisma", "PostgreSQL"],
featured: false
},
{
id: 8,
title: "Fitness Tracker",
category: "mobile",
description: "A comprehensive fitness tracking app with workout plans, nutrition tracking, and progress analytics.",
technologies: ["Flutter", "Firebase", "Charts", "Health API"],
featured: false
},
{
id: 9,
title: "Chat Application",
category: "web",
description: "Real-time chat application with private messaging, group chats, and file sharing capabilities.",
technologies: ["Socket.io", "Express", "MongoDB", "Cloudinary"],
featured: true
},
{
id: 10,
title: "Puzzle Game",
category: "game",
description: "An interactive puzzle game with multiple difficulty levels and timer functionality.",
technologies: ["JavaScript", "Canvas API", "CSS3", "Local Storage"],
featured: false
},
{
id: 11,
title: "Expense Tracker",
category: "web",
description: "A personal finance management tool with expense categorization and budget tracking.",
technologies: ["React", "Chart.js", "Local Storage", "PWA"],
featured: false
},
{
id: 12,
title: "Music Player",
category: "mobile",
description: "A sleek music player app with playlist management and audio visualization.",
technologies: ["React Native", "Expo", "Audio API", "Animations"],
featured: false
}
];
// ===== PROJECTS FILTERING =====
let currentFilter = 'all';
let visibleProjects = 6;

// ===== INITIALIZE PROJECTS =====
function initializeProjects() {
    renderProjects();
    initializeFilters();
    initializeLoadMore();
    initializeProjectSearch();
    initializeProjectSorting();
}

// ===== RENDER PROJECTS =====
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const filteredProjects = getFilteredProjects();
    const projectsToShow = filteredProjects.slice(0, visibleProjects);

    projectsGrid.innerHTML = '';

    projectsToShow.forEach((project, index) => {
        const projectCard = createProjectCard(project);
        projectCard.style.animationDelay = `${index * 0.1}s`;
        projectCard.classList.add('fade-in-up');
        projectsGrid.appendChild(projectCard);
    });

    updateLoadMoreButton(filteredProjects.length);
}

// ===== GET FILTERED PROJECTS =====
function getFilteredProjects() {
    if (currentFilter === 'all') {
        return projectsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return projectsData
        .filter(project => project.category === currentFilter)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===== CREATE PROJECT CARD =====
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);
    
    card.innerHTML = `
        ${project.featured ? '<span class="featured-badge">Featured</span>' : ''}
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
            </div>
            <!-- Links and date removed per request -->
        </div>
    `;

    // Add click event for modal
    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on links
        if (e.target.closest('.project-links')) return;
        openProjectModal(project);
    });

    return card;
}

// ===== FORMAT DATE =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric' 
    });
}

// ===== INITIALIZE FILTERS =====
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            visibleProjects = 6; // Reset visible projects
            
            // Re-render projects
            renderProjects();
            
            // Add filter animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// ===== INITIALIZE LOAD MORE =====
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreProjects');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        visibleProjects += 3; // Load 3 more projects
        renderProjects();
        
        // Add loading animation
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.disabled = true;
        
        setTimeout(() => {
            this.innerHTML = 'Load More Projects';
            this.disabled = false;
        }, 500);
    });
}

// ===== UPDATE LOAD MORE BUTTON =====
function updateLoadMoreButton(totalProjects) {
    const loadMoreBtn = document.getElementById('loadMoreProjects');
    if (!loadMoreBtn) return;
    
    if (visibleProjects >= totalProjects) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// ===== PROJECT MODAL =====
function openProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeProjectModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeProjectModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-header">
                <div class="modal-title-section">
                    <h2>${project.title}</h2>
                    ${project.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
            </div>
            <div class="modal-body">
                <p class="modal-description">${project.description}</p>
                <div class="modal-tech">
                    <h3>Technologies Used</h3>
                    <div class="tech-tags">
                        ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
                <div class="modal-features">
                    <h3>Key Features</h3>
                    <ul>
                        ${generateProjectFeatures(project).map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-challenges">
                    <h3>Challenges & Solutions</h3>
                    <p>${generateProjectChallenges(project)}</p>
                </div>
            </div>
            <!-- Modal footer buttons removed per request -->
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeProjectModal() {
    const modal = document.querySelector('.project-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function generateProjectFeatures(project) {
    const features = {
        'web': ['Responsive Design', 'Cross-browser Compatibility', 'Performance Optimized', 'SEO Friendly', 'Modern UI/UX', 'Scalable Architecture'],
        'mobile': ['Native Performance', 'Intuitive UI/UX', 'Offline Support', 'Push Notifications', 'Cross-platform', 'Secure Authentication'],
        'game': ['Smooth Gameplay', 'Score System', 'Multiple Levels', 'High Score Saving', 'Interactive Graphics', 'Sound Effects'],
        'default': ['Clean Code', 'Well Documented', 'Easy to Use', 'Modern Design', 'Performance Optimized', 'User Friendly']
    };
    
    return features[project.category] || features.default;
}

function generateProjectChallenges(project) {
    const challenges = {
        'web': "One of the main challenges was ensuring optimal performance across different devices and browsers. I implemented lazy loading, code splitting, and various optimization techniques to achieve fast load times and smooth user experience.",
        'mobile': "Developing for multiple platforms while maintaining native performance was challenging. I used platform-specific optimizations and native modules to ensure smooth user experience across all devices.",
        'game': "Balancing game difficulty and ensuring smooth animations required careful tuning of game physics and frame rates. I implemented efficient collision detection and state management systems.",
        'default': "The project presented various technical challenges that were overcome through careful planning, research, and implementation of industry best practices and modern development techniques."
    };
    
    return challenges[project.category] || challenges.default;
}

// ===== PROJECT SEARCH =====
function initializeProjectSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search projects...';
    searchInput.className = 'project-search';
    
    const searchContainer = document.querySelector('.project-filters');
    if (!searchContainer) return;
    
    searchContainer.parentNode.insertBefore(searchInput, searchContainer.nextSibling);
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const title = card.querySelector('.project-title').textContent.toLowerCase();
            const description = card.querySelector('.project-description').textContent.toLowerCase();
            const techTags = Array.from(card.querySelectorAll('.project-tech span'))
                .map(span => span.textContent.toLowerCase()).join(' ');
            
            const isMatch = title.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          techTags.includes(searchTerm);
            
            card.style.display = isMatch ? 'block' : 'none';
        });
    });
}

// ===== PROJECT SORTING =====
function initializeProjectSorting() {
    const sortSelect = document.createElement('select');
    sortSelect.className = 'project-sort';
    sortSelect.innerHTML = `
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="title-asc">Title A-Z</option>
        <option value="title-desc">Title Z-A</option>
    `;
    
    const searchInput = document.querySelector('.project-search');
    if (!searchInput) return;
    
    searchInput.parentNode.insertBefore(sortSelect, searchInput.nextSibling);
    
    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        let sortedProjects = [...projectsData];
        
        switch(sortValue) {
            case 'date-desc':
                sortedProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sortedProjects.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title-asc':
                sortedProjects.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedProjects.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        
        // Update the global projects data
        projectsData.length = 0;
        projectsData.push(...sortedProjects);
        
        // Re-render projects
        renderProjects();
    });
}

// ===== PROJECT STATISTICS =====
function getProjectStatistics() {
    const stats = {
        total: projectsData.length,
        web: projectsData.filter(p => p.category === 'web').length,
        mobile: projectsData.filter(p => p.category === 'mobile').length,
        game: projectsData.filter(p => p.category === 'game').length,
        featured: projectsData.filter(p => p.featured).length,
        technologies: [...new Set(projectsData.flatMap(p => p.technologies))].length
    };
    
    return stats;
}

// ===== ADD MODAL STYLES =====
const modalStyles = `
<style>
.project-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.project-modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background: var(--bg-primary);
    border-radius: 16px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.project-modal.active .modal-content {
    transform: scale(1);
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: var(--primary-color);
    color: white;
    transform: rotate(90deg);
}

.modal-header {
    position: relative;
}

.modal-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 16px 16px 0 0;
}

.modal-title-section {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-title-section h2 {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
}

.modal-body {
    padding: 30px;
}

.modal-description {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 2rem;
}

.modal-tech h3,
.modal-features h3,
.modal-challenges h3 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.tech-tags span {
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
}

.modal-features ul {
    list-style: none;
    padding: 0;
}

.modal-features li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.modal-features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
}

.modal-challenges {
    margin-bottom: 2rem;
}

.modal-footer {
    padding: 0 30px 30px;
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.featured-badge {
    background: var(--gradient-primary);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Dark theme adjustments */
[data-theme="dark"] .modal-content {
    background: var(--bg-secondary);
}

[data-theme="dark"] .modal-close {
    background: var(--bg-tertiary);
}

/* Project Search and Sort Styles */
.project-search,
.project-sort {
    width: 100%;
    max-width: 300px;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-family: inherit;
    margin: 1rem auto;
    display: block;
    transition: var(--transition);
}

.project-search:focus,
.project-sort:focus {
    outline: none;
    border-color: var(--primary-color);
}

.project-sort {
    cursor: pointer;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 95vh;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        flex-direction: column;
        padding: 0 20px 20px;
    }
    
    .modal-footer .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
`;

// Add modal styles to head
document.head.insertAdjacentHTML('beforeend', modalStyles);

// ===== INITIALIZE PROJECTS SECTION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeProjects();
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});

// ===== EXPORT FUNCTIONS =====
window.projectsModule = {
    getProjectStatistics,
    renderProjects,
    openProjectModal,
    closeProjectModal,
    projectsData
};