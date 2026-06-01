/* ==========================================================================
   MUHAMMAD TAHA PORTFOLIO - CORE APPLICATION CONTROLLER
   ========================================================================== */

let lenisInstance;

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initial State & Theme Setup
    initializeTheme();
    
    // 2. Preloader Animation
    runPreloader(() => {
        // Callback after preloader completes:
        // 3. Smooth Scroll (Lenis)
        initSmoothScroll();

        // 4. Custom Cursor
        initCustomCursor();

        // 5. Magnetic Hover Effects
        initMagneticButtons();

        // 6. Navigation Logic & Mobile Toggling
        initNavigation();

        // 7. Dynamic Role Engine & Initial Rendering
        initRoleEngine();

        // 8. Scroll Spy & UI updates
        initScrollSpy();
        initBackToTop();

        // 9. Particle Background Canvas
        if (window.particlesModule && window.particlesModule.initializeParticles) {
            window.particlesModule.initializeParticles();
        }
    });
});

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Custom animation click pulse
        gsap.to(this, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 });
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (!icon) return;
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ===== AWWWARDS PRELOADER COUNTDOWN =====
function runPreloader(onCompleteCallback) {
    const percentageText = document.getElementById('preloaderPercentage');
    const barFill = document.getElementById('preloaderBarFill');
    const preloader = document.getElementById('preloader');
    
    let count = 0;
    const duration = 1500; // Total load time
    const intervalTime = 15;
    const increments = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
        count += increments;
        if (count >= 100) {
            count = 100;
            clearInterval(timer);
            
            // GSAP curtain preloader slide up
            gsap.to(preloader, {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut",
                onComplete: () => {
                    preloader.style.display = 'none';
                    if (onCompleteCallback) onCompleteCallback();
                }
            });
        }
        
        const displayVal = Math.floor(count);
        if (percentageText) percentageText.textContent = displayVal;
        if (barFill) barFill.style.width = displayVal + '%';
    }, intervalTime);
}

// ===== SMOOTH SCROLL (LENIS) =====
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard expo out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2
    });

    lenisInstance.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// ===== CUSTOM INTERPOLATED CURSOR =====
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;

    // Check if mobile device
    const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth <= 768;
    if (isTouch) {
        cursor.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instantly move inner dot
        gsap.set(".cursor-dot", { x: mouseX, y: mouseY });
    });

    // Animate outer ring with a slight lag (lerping)
    gsap.ticker.add(() => {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        gsap.set(".cursor-ring", { x: ringX, y: ringY });
    });

    // Add cursor hovers
    const hoverElements = 'a, button, .switcher-tab, .contact-item, input, textarea, .dropdown-item';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverElements)) {
            document.body.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverElements)) {
            document.body.classList.remove('cursor-hover');
        }
    });
}

// ===== MAGNETIC HOVER CONTROLLER =====
function initMagneticButtons() {
    const magneticTargets = document.querySelectorAll('.btn-magnetic');
    
    // Disable magnet on touch screens
    if (window.matchMedia('(hover: none)').matches) return;

    magneticTargets.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            // Calculate cursor offset relative to center of element
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Move button slightly towards cursor
            gsap.to(this, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', function() {
            // Spring back button to origin
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

// ===== NAVIGATION & MOBILE MENU =====
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Sticky Navbar shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Smooth scroll intercept
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                
                if (targetEl) {
                    if (lenisInstance) {
                        lenisInstance.scrollTo(targetEl, { offset: -80 });
                    } else {
                        window.scrollTo({
                            top: targetEl.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
                
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ===== SCROLL SPY =====
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 120; // offset navbar height

        sections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== DYNAMIC PROFILE SWITCH ENGINE =====
let currentRole = 'fullstack';

function initRoleEngine() {
    const navbarSwitcher = document.getElementById('navbarSwitcher');
    const resumeBtn = document.getElementById('downloadResumeBtn');
    const resumeDropdown = document.getElementById('resumeDropdown');

    // Get saved role state
    currentRole = localStorage.getItem('role') || 'fullstack';
    document.documentElement.setAttribute('data-role', currentRole);
    updateSwitcherState(currentRole);
    renderRoleData(currentRole);

    // Click trigger on navbar switches
    if (navbarSwitcher) {
        const tabs = navbarSwitcher.querySelectorAll('.switcher-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const selectedRole = tab.getAttribute('data-role');
                if (selectedRole === currentRole) return;
                triggerCurtainSwitch(selectedRole);
            });
        });
    }

    // Toggle resume dropdown on click
    if (resumeBtn && resumeDropdown) {
        resumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resumeDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            resumeDropdown.classList.remove('active');
        });
    }
}

// Update the switcher UI pills
function updateSwitcherState(role) {
    const tabs = document.querySelectorAll('.switcher-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-role') === role) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Play Awwwards Curtain Wipe & Update Content
function triggerCurtainSwitch(newRole) {
    const curtain = document.getElementById('pageCurtain');
    const curtainLogo = curtain.querySelector('.curtain-logo');
    
    // Lock scrolling
    if (lenisInstance) lenisInstance.stop();
    document.body.style.overflow = 'hidden';

    // GSAP curtain sequence
    const tl = gsap.timeline({
        onComplete: () => {
            if (lenisInstance) lenisInstance.start();
            document.body.style.overflow = '';
        }
    });

    tl.set(curtain, { yPercent: 100 })
      .to(curtain, {
          yPercent: 0,
          duration: 0.6,
          ease: "power3.inOut"
      })
      .to(curtainLogo, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
      })
      .add(() => {
          // Perform data swap and CSS properties variables updating
          currentRole = newRole;
          localStorage.setItem('role', newRole);
          document.documentElement.setAttribute('data-role', newRole);
          
          updateSwitcherState(newRole);
          renderRoleData(newRole);
          window.scrollTo(0, 0);

          // Google Analytics track toggle role event
          if (typeof gtag !== 'undefined') {
              gtag('event', 'role_switch', {
                  'event_category': 'Engagement',
                  'event_label': newRole
              });
          }
      })
      .to(curtainLogo, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          delay: 0.2
      })
      .to(curtain, {
          yPercent: -100,
          duration: 0.6,
          ease: "power3.inOut"
      })
      .set(curtain, { yPercent: 100 })
      .add(() => {
          // Re-initialize entrance reveals
          initScrollReveals();
      });
}

// Render dynamic profiles text & items based on selected role
function renderRoleData(role) {
    const data = window.profileData[role];
    if (!data) return;

    // 1. Hero text fields
    const badgeText = document.getElementById('badgeText');
    const heroBadgeIcon = document.querySelector('#heroBadge i');
    const roleTitle = document.getElementById('profileRoleTitle');
    const heroDesc = document.getElementById('profileHeroDesc');
    const statsContainer = document.getElementById('profileStats');

    if (badgeText) badgeText.textContent = role === 'fullstack' ? 'Full-Stack Engineering' : 'Technical Product/Agile PM';
    if (heroBadgeIcon) heroBadgeIcon.className = role === 'fullstack' ? 'fas fa-code-branch' : 'fas fa-list-check';
    if (roleTitle) roleTitle.textContent = data.role;
    if (heroDesc) heroDesc.textContent = data.description;

    // Render Stats
    if (statsContainer) {
        statsContainer.innerHTML = data.stats.map(s => `
            <div class="stat-item">
                <span class="stat-num" data-target="${parseInt(s.number)}">${s.number}</span>
                <span class="stat-lbl">${s.label}</span>
            </div>
        `).join('');
    }

    // 2. Orbiting Tech Icons inside Visual Image
    const orbitContainer = document.getElementById('orbitingIcons');
    if (orbitContainer) {
        const fsIcons = [
            { class: 'fab fa-react', top: '10%', left: '10%', delay: '0s' },
            { class: 'fab fa-node-js', top: '10%', right: '10%', delay: '1s' },
            { class: 'fab fa-python', top: '75%', left: '5%', delay: '2s' },
            { class: 'fa-solid fa-cube', top: '75%', right: '5%', delay: '1.5s' } // Solidity representation
        ];
        const pmIcons = [
            { class: 'fa-solid fa-square-poll-vertical', top: '10%', left: '10%', delay: '0s' }, // Jira board
            { class: 'fa-solid fa-trello', top: '10%', right: '10%', delay: '1.5s' },
            { class: 'fa-solid fa-diagram-project', top: '75%', left: '5%', delay: '2s' }, // System map
            { class: 'fab fa-docker', top: '75%', right: '5%', delay: '1s' }
        ];
        const activeIcons = role === 'fullstack' ? fsIcons : pmIcons;
        orbitContainer.innerHTML = activeIcons.map(icon => `
            <div class="orbiting-icon" style="top: ${icon.top}; left: ${icon.left || 'auto'}; right: ${icon.right || 'auto'}; animation-delay: ${icon.delay}">
                <i class="${icon.class}"></i>
            </div>
        `).join('');
    }

    // 3. About Section Contents
    const aboutTitle = document.getElementById('aboutTitle');
    const aboutParagraphs = document.getElementById('aboutParagraphs');
    const aboutHighlights = document.getElementById('aboutHighlights');

    if (aboutTitle) aboutTitle.textContent = data.about.title;
    if (aboutParagraphs) {
        aboutParagraphs.innerHTML = data.about.paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    if (aboutHighlights) {
        aboutHighlights.innerHTML = data.about.highlights.map(hl => `
            <div class="about-highlight-item btn-magnetic">
                <i class="fa-solid ${hl.icon}"></i>
                <span>${hl.text}</span>
            </div>
        `).join('');
        // Re-bind magnet hooks for new items
        initMagneticButtons();
    }

    // 4. Skills Section
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
        skillsGrid.innerHTML = data.skills.map(cat => `
            <div class="skill-category-card glass-panel reveal-slide">
                <div class="skill-card-header">
                    <i class="fa-solid ${cat.icon}"></i>
                    <h3>${cat.category}</h3>
                </div>
                <div class="skill-card-tags">
                    ${cat.tags.map(t => `<span class="skill-capsule-tag">${t}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    // 5. Experience Section
    const timelineContainer = document.getElementById('timelineContainer');
    if (timelineContainer) {
        timelineContainer.innerHTML = data.experience.map(exp => `
            <div class="experience-timeline-item reveal-slide">
                <div class="experience-card glass-panel">
                    <div class="exp-header">
                        <div class="exp-meta">
                            <h3>${exp.role}</h3>
                            <h4>${exp.company} (${exp.location})</h4>
                        </div>
                        <span class="exp-timeline-date">${exp.date}</span>
                    </div>
                    <ul>
                        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 6. Resume download target adjustments
    const dlFSBtn = document.getElementById('dlFSResume');
    const dlPMBtn = document.getElementById('dlPMResume');
    
    // Make main button trigger the active download directly or fallback
    const resumeBtnSpan = document.querySelector('#downloadResumeBtn span');
    if (resumeBtnSpan) {
        resumeBtnSpan.textContent = role === 'fullstack' ? 'Get Dev Resume' : 'Get PM Resume';
    }
    
    // Add direct event listener on main button to trigger specific file download
    const mainResumeBtn = document.getElementById('downloadResumeBtn');
    if (mainResumeBtn) {
        mainResumeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Track resume download click
            if (typeof gtag !== 'undefined') {
                gtag('event', 'resume_download', {
                    'event_category': 'Engagement',
                    'event_label': role
                });
            }

            const downloadLink = document.createElement('a');
            downloadLink.href = data.resumeFile;
            downloadLink.download = data.resumeFile.split('/').pop();
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
    }

    // 7. Projects rendering triggers
    if (window.projectsModule && window.projectsModule.render) {
        window.projectsModule.render(role);
    }
}

// ===== GSAP SCROLL TRIGGERS =====
function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Refresh ScrollTrigger to calculate offsets correctly
    ScrollTrigger.refresh();

    // Reveal headings, cards, and timelines on scroll
    const revealElements = document.querySelectorAll('.reveal-slide, .glass-panel, .skill-category-card, .experience-timeline-item, .project-card-custom');
    
    revealElements.forEach(el => {
        gsap.fromTo(el, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Animate hero texts on preloader completion
    gsap.fromTo(".hero-text-block > *", 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: "power3.out",
            delay: 0.2
        }
    );

    // Profile photo fade & scale
    gsap.fromTo(".visual-container", 
        { opacity: 0, scale: 0.85 },
        { 
            opacity: 1, 
            scale: 1, 
            duration: 1.2, 
            ease: "power4.out",
            delay: 0.4 
        }
    );
}

// ===== BACK TO TOP BUTTON =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        if (lenisInstance) {
            lenisInstance.scrollTo(0);
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}