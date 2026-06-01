// ===== PARTICLE ANIMATION SYSTEM =====

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isMobile = window.innerWidth <= 768;
        this.config = {
            particleCount: this.isMobile ? 30 : 60,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.5, max: 1.5 },
            connectionDistance: this.isMobile ? 100 : 150,
            mouseInteractionDistance: this.isMobile ? 80 : 120,
            colors: {
                primary: '#3b82f6',
                secondary: '#60a5fa',
                accent: '#93c5fd',
                background: 'transparent'
            },
            opacity: {
                particle: 0.6,
                connection: 0.2,
                mouse: 0.8
            }
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    createCanvas() {
        const container = document.getElementById('particles');
        if (!container) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Style canvas
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        container.appendChild(this.canvas);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.width = rect.width;
        this.height = rect.height;
    }

    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed.max,
                vy: (Math.random() - 0.5) * this.config.particleSpeed.max,
                size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                color: this.getParticleColor(),
                opacity: this.config.opacity.particle,
                originalOpacity: this.config.opacity.particle
            });
        }
    }

    getParticleColor() {
        const colors = Object.values(this.config.colors);
        return colors[Math.floor(Math.random() * (colors.length - 1))];
    }

    bindEvents() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Touch events for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.config.particleCount = this.isMobile ? 30 : 60;
            this.config.connectionDistance = this.isMobile ? 100 : 150;
            this.config.mouseInteractionDistance = this.isMobile ? 80 : 120;
            
            this.resizeCanvas();
            this.createParticles();
        });

        // Dark theme & Role support
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'data-role') {
                    this.updateThemeColors();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
    }

    updateThemeColors() {
        const rootStyle = getComputedStyle(document.documentElement);
        const primary = rootStyle.getPropertyValue('--accent-primary').trim() || '#00e5ff';
        const secondary = rootStyle.getPropertyValue('--accent-secondary').trim() || '#3b82f6';
        
        this.config.colors.primary = primary;
        this.config.colors.secondary = secondary;
        this.config.colors.accent = primary;
        
        // Update existing particle colors
        this.particles.forEach(particle => {
            particle.color = this.getParticleColor();
        });
    }

    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update particles
        this.updateParticles();
        
        // Draw connections
        this.drawConnections();
        
        // Draw particles
        this.drawParticles();
        
        // Draw mouse interaction
        this.drawMouseInteraction();
        
        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off walls
            if (particle.x <= 0 || particle.x >= this.width) {
                particle.vx *= -1;
            }
            if (particle.y <= 0 || particle.y >= this.height) {
                particle.vy *= -1;
            }
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.width, particle.x));
            particle.y = Math.max(0, Math.min(this.height, particle.y));
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.config.mouseInteractionDistance) {
                const force = (this.config.mouseInteractionDistance - distance) / this.config.mouseInteractionDistance;
                particle.vx -= (dx / distance) * force * 0.5;
                particle.vy -= (dy / distance) * force * 0.5;
                particle.opacity = this.config.opacity.mouse;
            } else {
                particle.opacity = particle.originalOpacity;
            }
        });
    }

    drawConnections() {
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * this.config.opacity.connection;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = this.config.colors.primary;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            
            // Add glow effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity * 0.1;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    drawMouseInteraction() {
        if (this.mouse.x === 0 && this.mouse.y === 0) return;
        
        // Draw mouse cursor effect
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, this.config.mouseInteractionDistance, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.config.colors.primary;
        this.ctx.globalAlpha = 0.1;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('touchmove', this.touchMoveHandler);
        window.removeEventListener('resize', this.resizeHandler);
}
}
// ===== ADVANCED PARTICLE EFFECTS =====
class AdvancedParticleEffects {
constructor(canvas, ctx) {
this.canvas = canvas;
this.ctx = ctx;
this.effects = [];
}
createExplosion(x, y, color = '#3b82f6') {
    const particleCount = 20;
    const explosion = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 5 + 2;
        
        explosion.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1,
            decay: 0.02,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
    
    this.effects.push({
        type: 'explosion',
        particles: explosion
    });
}

createTrail(x, y, color = '#60a5fa') {
    const trail = [];
    
    for (let i = 0; i < 10; i++) {
        trail.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            life: 1 - (i * 0.1),
            size: (10 - i) * 0.5,
            color: color
        });
    }
    
    this.effects.push({
        type: 'trail',
        particles: trail
    });
}

update() {
    this.effects = this.effects.filter(effect => {
        if (effect.type === 'explosion') {
            effect.particles = effect.particles.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.life -= particle.decay;
                
                return particle.life > 0;
            });
            
            return effect.particles.length > 0;
        }
        
        if (effect.type === 'trail') {
            effect.particles = effect.particles.filter(particle => {
                particle.life -= 0.05;
                return particle.life > 0;
            });
            
            return effect.particles.length > 0;
        }
        
        return false;
    });
}

draw() {
    this.effects.forEach(effect => {
        if (effect.type === 'explosion') {
            effect.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.life;
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            });
        }
        
        if (effect.type === 'trail') {
            effect.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.life * 0.5;
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            });
        }
    });
}
}
// ===== PARTICLE TEXT EFFECT =====
class ParticleText {
constructor(canvas, ctx) {
this.canvas = canvas;
this.ctx = ctx;
this.particles = [];
this.text = '';
this.isAnimating = false;
}
setText(text, x = this.canvas.width / 2, y = this.canvas.height / 2) {
    this.text = text;
    this.createTextParticles(text, x, y);
    this.isAnimating = true;
}

createTextParticles(text, x, y) {
    this.particles = [];
    this.ctx.font = 'bold 48px Inter';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Get text metrics
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = 48;
    
    // Create particles along text path
    for (let i = 0; i < textWidth; i += 5) {
        for (let j = 0; j < textHeight; j += 5) {
            if (this.ctx.isPointInPath(x - textWidth/2 + i, y - textHeight/2 + j)) {
                this.particles.push({
                    x: x - textWidth/2 + i + (Math.random() - 0.5) * 20,
                    y: y - textHeight/2 + j + (Math.random() - 0.5) * 20,
                    targetX: x - textWidth/2 + i,
                    targetY: y - textHeight/2 + j,
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 2 + 1,
                    color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
                    life: 1,
                    decay: 0.01
                });
            }
        }
    }
}

update() {
    if (!this.isAnimating) return;
    
    this.particles.forEach(particle => {
        // Move towards target
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        particle.vx += dx * 0.05;
        particle.vy += dy * 0.05;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        particle.life -= particle.decay;
    });
    
    this.particles = this.particles.filter(particle => particle.life > 0);
    
    if (this.particles.length === 0) {
        this.isAnimating = false;
    }
}

draw() {
    if (!this.isAnimating) return;
    
    this.particles.forEach(particle => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.life;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    });
}
}
// ===== INITIALIZE PARTICLE SYSTEM =====
let particleSystem;
let advancedEffects;
let particleText;
function initializeParticles() {
const particlesContainer = document.getElementById('particles');
if (!particlesContainer) return;
particleSystem = new ParticleSystem();
advancedEffects = new AdvancedParticleEffects(particleSystem.canvas, particleSystem.ctx);
particleText = new ParticleText(particleSystem.canvas, particleSystem.ctx);

// Add click effects
particlesContainer.addEventListener('click', (e) => {
    const rect = particleSystem.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    advancedEffects.createExplosion(x, y);
});

// Add mouse trail effects
let lastTrailTime = 0;
particlesContainer.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 100) {
        const rect = particleSystem.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        advancedEffects.createTrail(x, y);
        lastTrailTime = now;
    }
});

// Animate advanced effects
function animateEffects() {
    advancedEffects.update();
    advancedEffects.draw();
    particleText.update();
    particleText.draw();
    
    requestAnimationFrame(animateEffects);
}

animateEffects();
}
// ===== DESTROY PARTICLE SYSTEM =====
function destroyParticles() {
if (particleSystem) {
particleSystem.destroy();
particleSystem = null;
}
}
// ===== EXPORT FUNCTIONS =====
window.particlesModule = {
initializeParticles,
destroyParticles,
createTextEffect: (text, x, y) => {
if (particleText) {
particleText.setText(text, x, y);
}
},
createExplosion: (x, y, color) => {
if (advancedEffects) {
advancedEffects.createExplosion(x, y, color);
}
}
};