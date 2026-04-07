document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════
    // 1. CUSTOM CURSOR
    // ═══════════════════════════════════════════════════
    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left  = e.clientX + 'px';
            cursorDot.style.top   = e.clientY + 'px';
            cursorRing.style.left = e.clientX + 'px';
            cursorRing.style.top  = e.clientY + 'px';
        });

        const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .tilt-card-featured, .skill-card, .project-card, .timeline-content');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
        });
    }

    // ═══════════════════════════════════════════════════
    // 2. PARTICLE SYSTEM
    // ═══════════════════════════════════════════════════
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W = canvas.width  = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        });

        const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 60;
        const particles = [];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x  = Math.random() * W;
                this.y  = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r  = Math.random() * 1.5 + 0.5;
                this.o  = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(239, 68, 68, ${this.o})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x;
                    const dy   = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(239, 68, 68, ${0.12 * (1 - dist / 130)})`;
                        ctx.lineWidth   = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ═══════════════════════════════════════════════════
    // 3. TYPING EFFECT
    // ═══════════════════════════════════════════════════
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
        const texts = [
            'Full-Stack Developer.',
            'Data Analyst & BI.',
            'AI Builder.',
            'Problem Solver.',
        ];
        let tIdx = 0, cIdx = 0, deleting = false;

        function type() {
            const current = texts[tIdx];
            typedEl.textContent = deleting
                ? current.substring(0, cIdx - 1)
                : current.substring(0, cIdx + 1);

            deleting ? cIdx-- : cIdx++;

            if (!deleting && cIdx === current.length) {
                setTimeout(() => { deleting = true; type(); }, 2200);
                return;
            }
            if (deleting && cIdx === 0) {
                deleting = false;
                tIdx = (tIdx + 1) % texts.length;
            }
            setTimeout(type, deleting ? 45 : 95);
        }
        setTimeout(type, 800);
    }

    // ═══════════════════════════════════════════════════
    // 4. 3D TILT EFFECT
    // ═══════════════════════════════════════════════════
    function initTilt(selector, intensity = 8) {
        document.querySelectorAll(selector).forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect    = card.getBoundingClientRect();
                const x       = e.clientX - rect.left;
                const y       = e.clientY - rect.top;
                const cx      = rect.width  / 2;
                const cy      = rect.height / 2;
                const rotateX = ((y - cy) / cy) * -intensity;
                const rotateY = ((x - cx) / cx) *  intensity;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            });
        });
    }

    if (window.innerWidth > 768) {
        initTilt('.tilt-card', 7);
        initTilt('.tilt-card-featured', 4);
    }

    // ═══════════════════════════════════════════════════
    // 5. SCROLL REVEAL (IntersectionObserver)
    // ═══════════════════════════════════════════════════
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ═══════════════════════════════════════════════════
    // 6. SMART NAVBAR (hide on scroll down)
    // ═══════════════════════════════════════════════════
    const navbar = document.querySelector('.navbar');
    let lastY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        if (currentY > lastY && currentY > 120) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastY = currentY;
    });

    // ═══════════════════════════════════════════════════
    // 7. MOBILE MENU TOGGLE
    // ═══════════════════════════════════════════════════
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks   = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close menu on nav link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });
    }

    // ═══════════════════════════════════════════════════
    // 8. SMOOTH SCROLL
    // ═══════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ═══════════════════════════════════════════════════
    // 9. HERO STATS COUNTER ANIMATION
    // ═══════════════════════════════════════════════════
    function animateCounter(el, target, suffix = '') {
        const isDecimal = String(target).includes('.');
        let start = 0;
        const duration = 1800;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const value    = isDecimal
                ? (eased * target).toFixed(1)
                : Math.floor(eased * target);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.stat-number');
                const targets = [8, 3, 3.5];
                numbers.forEach((el, i) => animateCounter(el, targets[i]));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

});
