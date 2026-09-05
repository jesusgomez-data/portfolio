/* ══════════════════════════════════════════════════
   JGStudio · script.js  v4.0
   Three.js · GSAP + ScrollTrigger · Lenis · SplitType
══════════════════════════════════════════════════ */

/* ── Scramble text utility ─────────────────────── */
function scramble(el, opts) {
    if (!el) return;
    const text = opts.text || el.textContent;
    const dur  = opts.duration || 900;
    const delay = opts.delay || 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!?&';
    setTimeout(() => {
        let t0 = null;
        (function frame(ts) {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / dur, 1);
            el.textContent = text.split('').map((c, i) => {
                if (c === ' ') return ' ';
                if (i / text.length < p) return c;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            if (p < 1) requestAnimationFrame(frame);
            else el.textContent = text;
        })(performance.now());
    }, delay);
}

/* ── Preloader ─────────────────────────────────── */
function initPreloader(onDone) {
    const el    = document.getElementById('preloader');
    const word  = document.getElementById('preloader-wordmark');
    const fill  = document.getElementById('preloader-fill');
    const label = document.getElementById('preloader-label');
    if (!el) { onDone(); return; }

    scramble(word, { text:'JGStudio', duration:650, delay:120 });
    setTimeout(() => { if (fill) fill.style.width = '100%'; }, 60);

    const labels = ['Cargando', 'Preparando', 'JGStudio'];
    let li = 0;
    const iv = setInterval(() => { li++; if (label && li < labels.length) label.textContent = labels[li]; }, 580);

    setTimeout(() => {
        clearInterval(iv);
        el.classList.add('hidden');
        setTimeout(onDone, 700);
    }, 1900);
}

/* ── Three.js hero scene ───────────────────────── */
function initThreeHero() {
    const canvas = document.getElementById('hero-3d');
    const hero   = document.querySelector('.hero');
    if (!canvas || !hero || !window.THREE) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, hero.offsetHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / hero.offsetHeight, 0.1, 1000);
    camera.position.set(0, 6, 32);
    camera.lookAt(0, 0, 0);

    const gridGeo = new THREE.PlaneGeometry(90, 65, 52, 36);
    const gridMat = new THREE.ShaderMaterial({
        uniforms: { uTime:{ value:0 }, uMouse:{ value:new THREE.Vector2(0,0) }, uColor:{ value:new THREE.Color(0xD63031) } },
        vertexShader:`
            uniform float uTime; uniform vec2 uMouse;
            void main(){
                vec3 p=position;
                float w=sin(p.x*.22+uTime*.65)*cos(p.y*.18+uTime*.48)+sin(p.x*.13-uTime*.38)*sin(p.y*.26+uTime*.3)*.55;
                p.z=w*3.2;
                vec2 mw=uMouse*vec2(44.,28.);
                float md=length(p.xy-mw);
                p.z+=exp(-md*.07)*sin(md*.38-uTime*2.8)*3.5;
                gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
            }`,
        fragmentShader:`uniform vec3 uColor; void main(){ gl_FragColor=vec4(uColor,.14); }`,
        wireframe:true, transparent:true,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI * .36;
    grid.position.set(0, -14, -4);
    scene.add(grid);

    const t1 = new THREE.Mesh(new THREE.TorusGeometry(11,.27,8,64), new THREE.MeshBasicMaterial({ color:0xD63031, wireframe:true, transparent:true, opacity:.18 }));
    t1.position.set(22, 4, -8); scene.add(t1);
    const t2 = new THREE.Mesh(new THREE.TorusGeometry(6.5,.18,6,40), new THREE.MeshBasicMaterial({ color:0xF0ECE5, wireframe:true, transparent:true, opacity:.06 }));
    t2.position.set(-20,-2,-6); t2.rotation.z = Math.PI*.4; scene.add(t2);
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(4.2,1), new THREE.MeshBasicMaterial({ color:0xD63031, wireframe:true, transparent:true, opacity:.14 }));
    ico.position.set(-24,8,-5); scene.add(ico);

    const m = { x:0,y:0,tx:0,ty:0 };
    window.addEventListener('mousemove', e => { m.x=(e.clientX/innerWidth)*2-1; m.y=-(e.clientY/innerHeight)*2+1; }, { passive:true });

    const clock = new THREE.Clock();
    (function loop() {
        const t = clock.getElapsedTime();
        m.tx += (m.x-m.tx)*.04; m.ty += (m.y-m.ty)*.04;
        gridMat.uniforms.uTime.value = t;
        gridMat.uniforms.uMouse.value.set(m.tx, m.ty);
        t1.rotation.x = t*.14+m.ty*.28; t1.rotation.y = t*.19+m.tx*.28;
        t2.rotation.x = -t*.09-m.ty*.18; t2.rotation.z = t*.12+Math.PI*.4;
        ico.rotation.y = t*.17+m.tx*.2; ico.rotation.x = t*.1-m.ty*.15;
        camera.position.x = m.tx*2.6; camera.position.y = m.ty*1.6+6;
        camera.lookAt(0,0,0);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    })();

    window.addEventListener('resize', () => {
        const w = innerWidth, h = hero.offsetHeight;
        camera.aspect = w/h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, { passive:true });
}

/* ── Main ──────────────────────────────────────── */
function main() {

    /* Smooth scroll desactivado por lentitud. Usando scroll nativo ultra responsivo. */
    let lenis = null;

    /* GSAP */
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(t => lenis.raf(t*1000));
            gsap.ticker.lagSmoothing(0);
        }

        /* Scroll progress bar */
        gsap.to('#scroll-progress', { width:'100%', ease:'none', scrollTrigger:{ start:'top top', end:'bottom bottom', scrub:.3 } });

        /* Hero entrance */
        const heroTL = gsap.timeline({ defaults:{ ease:'power4.out' } });

        // Revelar foto (deslizamiento de clip-path y escala inversa suave)
        if (document.querySelector('.hero-photo-inner')) {
            heroTL.fromTo('.hero-photo-inner', 
                { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
                { clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)', duration: 1.5, ease: 'power4.out' },
                .2
            );
            heroTL.fromTo('.hero-photo img',
                { scale: 1.2 },
                { scale: 1, duration: 1.8, ease: 'power3.out' },
                .2
            );
        }

        heroTL.to('#hero-kicker', { opacity:1, y:0, duration:.7 }, .3);
        if (document.querySelector('.hero-proof-strip')) {
            heroTL.fromTo('.hero-proof-strip', { opacity:0, y:10 }, { opacity:1, y:0, duration:.7 }, .38);
        }
        if (window.SplitType) {
            const h1 = document.getElementById('hero-mega');
            if (h1) {
                const sp = new SplitType(h1, { types:'words' });
                gsap.set(sp.words, { y:80, opacity:0 });
                heroTL.to(sp.words, { y:0, opacity:1, stagger:.05, duration:.85, ease:'power3.out' }, .45);
            }
        }

        // Logo flotante con sutil efecto rebote (escala)
        if (document.querySelector('.hero-logo-float')) {
            heroTL.fromTo('.hero-logo-float',
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.5)' },
                .65
            );
        }

        heroTL.to('.hero-bottom', { opacity:1, y:0, duration:.8 }, .9);

        // Stagger premium de los indicadores de servicios
        if (document.querySelector('.hero-indicator-item')) {
            heroTL.fromTo('.hero-indicator-item',
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out' },
                1.05
            );
        }

        /* [data-reveal-l] — slide from left */
        gsap.utils.toArray('[data-reveal-l]').forEach(el =>
            gsap.fromTo(el, { x:-18,opacity:0 }, { x:0,opacity:1,duration:.65,ease:'power2.out', scrollTrigger:{ trigger:el, start:'top 90%', once:true } })
        );

        /* [data-title] — split lines */
        gsap.utils.toArray('[data-title]').forEach(el => {
            if (window.SplitType) {
                const sp = new SplitType(el, { types:'lines' });
                gsap.set(sp.lines, { y:48,opacity:0 });
                gsap.to(sp.lines, { y:0,opacity:1,stagger:.08,duration:.9,ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
            } else {
                gsap.fromTo(el, { y:32,opacity:0 }, { y:0,opacity:1,duration:.9, scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
            }
        });

        /* [data-reveal] — staggered reveals grouped by section context */
        gsap.utils.toArray('.about-section [data-reveal], .contact-section [data-reveal]').forEach(el =>
            gsap.fromTo(el,
                { y:28, opacity:0 },
                { y:0, opacity:1, duration:.85, ease:'power3.out',
                  scrollTrigger:{ trigger:el, start:'top 90%', once:true } }
            )
        );
        /* Generic [data-reveal] outside named sections (excluding cont-item to manage its filter animations separately) */
        gsap.utils.toArray('[data-reveal]').forEach(el => {
            if (!el.closest('.about-section') && !el.closest('.contact-section') && !el.classList.contains('cont-item')) {
                gsap.fromTo(el,
                    { y:20, opacity:0 },
                    { y:0, opacity:1, duration:.75, ease:'power3.out',
                      scrollTrigger:{ trigger:el, start:'top 89%', once:true } }
                );
            }
        });

        /* Services columns stagger */
        const svcCols = document.querySelectorAll('.svc-col');
        if (svcCols.length) {
            gsap.fromTo(svcCols,
                { y:24, opacity:0 },
                { y:0, opacity:1, stagger:.12, duration:.75, ease:'power2.out',
                  scrollTrigger:{ trigger:'.svc-grid', start:'top 84%', once:true } }
            );
        }

        /* Project list items — polished entrance with clip-path reveal */
        const projItems = document.querySelectorAll('.proj-item');
        if (projItems.length) {
            gsap.fromTo(projItems,
                { y:32, opacity:0, clipPath:'inset(0 0 100% 0)' },
                { y:0, opacity:1, clipPath:'inset(0 0 0% 0)',
                  stagger:.07, duration:.7, ease:'power2.out',
                  scrollTrigger:{ trigger:'.proj-list', start:'top 82%', once:true } }
            );
        }

        /* Hero photo parallax */
        if (document.querySelector('.hero-photo-inner')) {
            gsap.fromTo('.hero-photo img', 
                { yPercent: -8 },
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
                }
            );
        }

        /* IA cards stagger */
        const iaCards = document.querySelectorAll('.ia-card');
        if (iaCards.length) {
            gsap.fromTo(iaCards,
                { y:28, opacity:0 },
                { y:0, opacity:1, stagger:.08, duration:.7, ease:'power2.out',
                  scrollTrigger:{ trigger:'.ia-grid', start:'top 85%', once:true } }
            );
        }
        const iaStats = document.querySelectorAll('.ia-stat');
        if (iaStats.length) {
            gsap.fromTo(iaStats,
                { y:20, opacity:0 },
                { y:0, opacity:1, stagger:.1, duration:.65, ease:'power2.out',
                  scrollTrigger:{ trigger:'.ia-stats', start:'top 88%', once:true } }
            );
        }

        /* Stack rows stagger */
        const stackRows = document.querySelectorAll('.stack-row');
        if (stackRows.length) {
            gsap.fromTo(stackRows,
                { x:-20, opacity:0 },
                { x:0, opacity:1, stagger:.06, duration:.65, ease:'power2.out',
                  scrollTrigger:{ trigger:'.stack-rows', start:'top 85%', once:true } }
            );
        }

        /* About numbers count-up */
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const isF    = el.dataset.count.includes('.');
            ScrollTrigger.create({ trigger:el, start:'top 88%', once:true, onEnter:() => {
                const obj = { v:0 };
                gsap.to(obj, { v:target, duration:1.8, ease:'power2.out', onUpdate:() => { el.textContent = isF ? obj.v.toFixed(1) : Math.ceil(obj.v); } });
            }});
        });
    }

    /* Theme toggle (sol / luna) */
    (function initTheme() {
        const btn  = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');
        const saved = localStorage.getItem('jgs-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        if (icon) icon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        btn?.addEventListener('click', () => {
            const curr = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = curr === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('jgs-theme', next);
            if (icon) {
                icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    })();

    /* Navbar subtle scroll effect */
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        const y = scrollY;
        nav.classList.toggle('scrolled', y > 40);
    }, { passive:true });

    /* Mobile menu */
    const tog   = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    const icon  = document.getElementById('menu-icon');
    if (tog && links) {
        tog.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            icon.className = open ? 'fas fa-times' : 'fas fa-bars';
            if (open && window.gsap) {
                gsap.fromTo(links.querySelectorAll('li'), { x:40,opacity:0 }, { x:0,opacity:1,stagger:.06,duration:.4,ease:'power3.out',delay:.08 });
            }
        });
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); icon.className='fas fa-bars'; }));
    }

    /* Smooth anchor scroll */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (!t) return; e.preventDefault();
            if (lenis) lenis.scrollTo(t, { offset:-80 });
            else t.scrollIntoView({ behavior:'smooth' });
        });
    });

    /* Magnetic buttons */
    if (window.gsap) {
        document.querySelectorAll('.magnetic').forEach(b => {
            b.addEventListener('mousemove', e => {
                const r = b.getBoundingClientRect();
                gsap.to(b, { x:(e.clientX-r.left-r.width/2)*.25, y:(e.clientY-r.top-r.height/2)*.25, duration:.3, ease:'power2.out' });
            });
            b.addEventListener('mouseleave', () => gsap.to(b, { x:0,y:0,duration:.6,ease:'elastic.out(1,.5)' }));
        });
    }
}

/* ── Media Lightbox ────────────────────────────── */
function initMediaLightbox() {
    const vlb      = document.getElementById('vlb');
    const vid      = document.getElementById('vlb-video');
    const img      = document.getElementById('vlb-img');
    const closeBtn = document.getElementById('vlb-close');
    const backdrop = document.getElementById('vlb-backdrop');
    if (!vlb || !vid || !img) return;

    function open(src, type) {
        if (type === 'video') {
            vid.src = src;
            vid.style.display = 'block';
            img.style.display = 'none';
            vid.load();
            vid.play().catch(() => {});
        } else {
            img.src = src;
            img.style.display = 'block';
            vid.style.display = 'none';
        }
        vlb.classList.add('vlb-open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        vlb.classList.remove('vlb-open');
        vid.pause();
        setTimeout(() => { vid.src = ''; img.src = ''; }, 300);
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.cont-item--video[data-video]').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => open(item.dataset.video, 'video'));
    });

    document.querySelectorAll('[data-img]').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => open(item.dataset.img, 'img'));
    });

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && vlb.classList.contains('vlb-open')) close(); });
}

/* ── Contenido filter (con paginación) ──────────── */
function initContenidoFilter() {
    const PAGE_SIZE = 6;
    const btns   = document.querySelectorAll('.cf-btn');
    const items  = Array.from(document.querySelectorAll('.cont-item'));
    const pager  = document.getElementById('cont-pagination');
    const prevBtn = document.getElementById('cont-prev');
    const nextBtn = document.getElementById('cont-next');
    const status  = document.getElementById('cont-page-status');
    if (!btns.length) return;

    const activeBtn = document.querySelector('.cf-btn.active');
    let currentFilter = activeBtn ? activeBtn.dataset.filter : 'brand';
    let currentPage = 0;

    function itemsForFilter(f) {
        return items.filter(item => f === 'all' || item.dataset.cat === f);
    }

    function renderPage(animate) {
        const filtered = itemsForFilter(currentFilter);
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages - 1);

        const start = currentPage * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);
        const pageItemsSet = new Set(pageItems);

        const toShow = [];
        const toHide = [];
        items.forEach(item => {
            const shouldShow = pageItemsSet.has(item);
            const isHidden = item.classList.contains('cf-hidden');
            if (shouldShow && isHidden) toShow.push(item);
            if (!shouldShow && !isHidden) toHide.push(item);
        });

        if (pager) {
            pager.classList.toggle('cont-pagination--hidden', filtered.length <= PAGE_SIZE);
        }
        if (status) status.textContent = `${currentPage + 1} / ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;

        if (window.gsap && animate) {
            gsap.killTweensOf(items);
            if (toHide.length > 0) {
                gsap.to(toHide, {
                    opacity: 0, y: -10, scale: 0.95, duration: 0.22, stagger: 0.015, ease: 'power2.in',
                    onComplete: () => {
                        toHide.forEach(item => item.classList.add('cf-hidden'));
                        showNew();
                    }
                });
            } else {
                showNew();
            }
            function showNew() {
                if (toShow.length > 0) {
                    toShow.forEach(item => item.classList.remove('cf-hidden'));
                    gsap.fromTo(toShow,
                        { opacity: 0, y: 15, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.03, ease: 'power2.out',
                          onComplete: () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); } }
                    );
                } else if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }
        } else {
            toHide.forEach(item => item.classList.add('cf-hidden'));
            toShow.forEach(item => item.classList.remove('cf-hidden'));
            if (window.gsap) gsap.set(toShow, { opacity: 0, y: 15, scale: 0.95 });
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
    }

    // Estado inicial
    items.forEach(item => item.classList.add('cf-hidden'));
    renderPage(false);

    // Animar entrada de los items visibles al hacer scroll
    if (window.ScrollTrigger && window.gsap) {
        ScrollTrigger.create({
            trigger: '#cont-grid',
            start: 'top 85%',
            once: true,
            onEnter: () => {
                const visible = items.filter(item => !item.classList.contains('cf-hidden'));
                gsap.to(visible, {
                    opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.04, ease: 'power2.out',
                    onComplete: () => ScrollTrigger.refresh()
                });
            }
        });
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 0;
            renderPage(true);
        });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage -= 1;
            renderPage(true);
            document.getElementById('cont-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(itemsForFilter(currentFilter).length / PAGE_SIZE));
        if (currentPage < totalPages - 1) {
            currentPage += 1;
            renderPage(true);
            document.getElementById('cont-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

/* ── Card Spotlight Glow ───────────────────────── */
function initCardSpotlight() {
    const cards = document.querySelectorAll('.cap-card, .prc, .price-card, .results-card, .svc-col');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ── Region Switch (discreto y expandible) ─────────── */
function initRegionSwitch() {
    const toggle = document.getElementById('region-switch-toggle');
    const wrap = document.querySelector('.region-switch');
    if (!toggle || !wrap) return;

    const close = () => {
        wrap.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = wrap.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

/* ── Boot ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initThreeHero();
    initPreloader(main);
    initCardSpotlight();
    initContenidoFilter();
    initMediaLightbox();
    initAssistant();
    initRegionSwitch();
});

/* ── Assistant Mini ─────────────────────────────────── */
function initAssistant() {
    const trigger = document.getElementById('assistant-trigger');
    const chatbox = document.getElementById('assistant-chatbox');
    const closeBtn = document.getElementById('chatbox-close');
    const tooltip = document.getElementById('assistant-tooltip');
    const messagesContainer = document.getElementById('chatbox-messages');
    const quickOptions = document.getElementById('quick-options');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!trigger || !chatbox || !closeBtn) return;

    // Show tooltip after 3s, then re-show every 45s if chat is still closed
    function showTooltip() {
        if (!tooltip || chatbox.classList.contains('open')) return;
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 5500);
    }
    setTimeout(showTooltip, 3000);
    setInterval(showTooltip, 45000);

    // Toggle chatbox
    trigger.addEventListener('click', () => {
        chatbox.classList.add('open');
        if (tooltip) tooltip.classList.remove('show');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
        chatInput.focus();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbox.classList.remove('open');
    });

    // Answers database
    const answers = {
        servicios: "En <strong>JGStudio</strong> cubrimos todo el ciclo digital para impulsar tus ventas. Ofrecemos:<br><br>" +
                   "• <strong>Desarrollo Web & Apps:</strong> Desde landings de alta conversión hasta plataformas SaaS y apps móviles a medida.<br>" +
                   "• <strong>Automatización con IA:</strong> Conectamos tus herramientas, creamos chatbots inteligentes y automatizamos flujos repetitivos para ahorrarte horas de trabajo.<br>" +
                   "• <strong>Branding & Contenido Visual:</strong> Diseño de identidad corporativa y producción de vídeo comercial optimizado para redes y ventas.<br><br>" +
                   "¿Te interesa alguna de estas áreas en particular?",
        
        ia: "La <strong>automatización con Inteligencia Artificial</strong> te permite delegar tareas repetitivas y liberar tiempo. Por ejemplo:<br><br>" +
            "• Respuestas automáticas e inteligentes a clientes por WhatsApp o email.<br>" +
            "• Web scraping y recopilación automatizada de datos de competidores.<br>" +
            "• Sincronización automática de tu CRM, facturación y bases de datos.<br><br>" +
            "Hacemos que tu tecnología trabaje para ti en piloto automático.",
        
        tiempos: "Al ser un estudio ágil e integrado con herramientas de IA de última generación, entregamos mucho más rápido que una agencia tradicional:<br><br>" +
                 "• <strong>Páginas web y landings:</strong> 1 a 2 semanas.<br>" +
                 "• <strong>Automatizaciones IA:</strong> 1 a 3 semanas.<br>" +
                 "• <strong>Plataformas y Apps a medida:</strong> 4 a 8 semanas.<br><br>" +
                 "Fijamos plazos de entrega exactos en la propuesta inicial.",
        
        precios: "Trabajamos con total claridad según tus necesidades:<br><br>" +
                 "• <strong>Presupuesto Cerrado:</strong> Ideal para proyectos específicos con objetivos concretos y entrega llave en mano.<br>" +
                 "• <strong>Suscripción Mensual:</strong> Ideal si necesitas un flujo constante de diseño, desarrollo y soporte sin contratar personal a tiempo completo.<br><br>" +
                 "Si quieres un presupuesto a medida, haz clic en <strong>Precios</strong> en el menú superior o solicita una propuesta en la sección de [Presupuesto](presupuesto.html).",
        
        quien: "<strong>Jesús Gómez</strong> es el fundador y especialista de JGStudio. Desarrollador full-stack, experto en automatización de procesos mediante IA y creador de contenido visual. Fundó el estudio con una idea simple: eliminar las agencias tradicionales lentas y costosas, entregando soluciones técnicas de primer nivel a través de un único canal directo, rápido y eficiente.",
        
        empezar: "¡Empezar es súper sencillo! Puedes:<br><br>" +
                 "1. Rellenar nuestro breve formulario haciendo clic en **Hablemos →** en el menú de arriba.<br>" +
                 "2. Detallar tu proyecto en la página de [Solicitud de Presupuesto](presupuesto.html) para recibir una propuesta en 24h.<br>" +
                 "3. O si prefieres, déjame tu <strong>correo electrónico</strong> aquí en el chat y Jesús se pondrá en contacto contigo directamente."
    };

    // Handle Quick Option clicks
    quickOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.opt-btn');
        if (!btn) return;

        const questionKey = btn.dataset.question;
        const questionText = btn.textContent;

        addUserMessage(questionText);
        quickOptions.style.display = 'none';

        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addAssistantMessage(answers[questionKey] || "Disculpa, ha ocurrido un error. ¿En qué más puedo ayudarte?");
            showRemainingOptions(questionKey);
        }, 1000);
    });

    // Handle input field send
    function handleSend() {
        const query = chatInput.value.trim();
        if (!query) return;

        addUserMessage(query);
        chatInput.value = '';
        quickOptions.style.display = 'none';

        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const response = processCustomQuery(query);
            addAssistantMessage(response);
            showRemainingOptions();
        }, 1200);
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function getTime() {
        return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-msg';
        msgDiv.innerHTML = `<div class="msg-bubble">${text}</div><span class="msg-time">${getTime()}</span>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addAssistantMessage(htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant-msg';
        msgDiv.innerHTML = `<div class="msg-bubble">${htmlContent}</div><span class="msg-time">${getTime()}</span>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    let typingIndicator = null;
    function showTypingIndicator() {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-msg typing-indicator-msg';
        typingIndicator.innerHTML = `<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    }

    function showRemainingOptions(lastKey = '') {
        quickOptions.innerHTML = '';
        
        const opts = [
            { key: 'servicios', text: 'Servicios disponibles' },
            { key: 'ia', text: 'Automatización con IA' },
            { key: 'tiempos', text: 'Tiempos de entrega' },
            { key: 'precios', text: 'Tarifas y precios' },
            { key: 'quien', text: '¿Quién es Jesús?' },
            { key: 'empezar', text: '¿Cómo empezamos?' }
        ];

        opts.forEach(opt => {
            if (opt.key !== lastKey) {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.dataset.question = opt.key;
                btn.textContent = opt.text;
                quickOptions.appendChild(btn);
            }
        });
        
        quickOptions.style.display = 'flex';
        messagesContainer.appendChild(quickOptions);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function processCustomQuery(q) {
        q = q.toLowerCase();
        
        if (q.includes('servicio') || q.includes('ofrece') || q.includes('hace') || q.includes('hacen') || q.includes('web') || q.includes('desarrollo') || q.includes('app') || q.includes('pagina') || q.includes('página') || q.includes('diseñ') || q.includes('video') || q.includes('vídeo') || q.includes('branding')) {
            return answers.servicios;
        }
        if (q.includes('ia') || q.includes('inteligencia') || q.includes('gpt') || q.includes('bot') || q.includes('automatiz') || q.includes('agent') || q.includes('flow') || q.includes('scrap')) {
            return answers.ia;
        }
        if (q.includes('tiempo') || q.includes('plazo') || q.includes('tard') || q.includes('entrega') || q.includes('dias') || q.includes('días') || q.includes('semana')) {
            return answers.tiempos;
        }
        if (q.includes('precio') || q.includes('cuanto') || q.includes('cuánto') || q.includes('tarifa') || q.includes('presupuesto') || q.includes('cost') || q.includes('vale') || q.includes('cuesta')) {
            return answers.precios;
        }
        if (q.includes('jesus') || q.includes('jesús') || q.includes('gomez') || q.includes('gómez') || q.includes('quien') || q.includes('quién') || q.includes('creador') || q.includes('fundador')) {
            return answers.quien;
        }
        if (q.includes('empezar') || q.includes('contacto') || q.includes('reunion') || q.includes('reunión') || q.includes('llamada') || q.includes('contratar') || q.includes('correo') || q.includes('email') || q.includes('mail')) {
            return answers.empezar;
        }
        
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        if (emailRegex.test(q)) {
            return "¡Muchas gracias! He registrado tu correo. Jesús se pondrá en contacto contigo directamente en menos de 24 horas para resolver tus dudas o agendar una llamada. Si necesitas algo más, aquí estaré.";
        }

        return "Entiendo. No estoy seguro de tener una respuesta exacta para eso, pero si me dejas tu **correo electrónico (email)** aquí mismo o nos escribes a través de la sección de **Contacto**, Jesús te responderá personalmente en menos de 24 horas.";
    }
}

/* ══════════════════════════════════════════════════
   LOGICA: STICKY CTA MOVIL Y DIAGNÓSTICO EXPRESS QUIZ
══════════════════════════════════════════════════ */

function initMobileStickyCTA() {
    const bar = document.getElementById('mobile-sticky-cta');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 350) {
            bar.classList.add('show');
        } else {
            bar.classList.remove('show');
        }
    }, { passive: true });
}

function initExpressQuiz() {
    const quizSection = document.getElementById('express-quiz');
    if (!quizSection) return;

    const steps = quizSection.querySelectorAll('.quiz-step');
    const fill = document.getElementById('quiz-progress-fill');
    const answers = { q1: '', q2: '', q3: '' };

    const opts = quizSection.querySelectorAll('.quiz-opt-btn');
    opts.forEach(opt => {
        opt.addEventListener('click', () => {
            const stepNum = parseInt(opt.dataset.quizQ, 10);
            const val = opt.dataset.quizVal;
            answers[`q${stepNum}`] = val;

            if (stepNum < 3) {
                steps.forEach(s => s.classList.remove('active'));
                const nextStep = quizSection.querySelector(`.quiz-step[data-step="${stepNum + 1}"]`);
                if (nextStep) nextStep.classList.add('active');
                if (fill) fill.style.width = `${((stepNum + 1) / 3) * 100}%`;
            } else {
                showQuizResults(answers);
            }
        });
    });

    const resetBtn = document.getElementById('quiz-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            answers.q1 = ''; answers.q2 = ''; answers.q3 = '';
            steps.forEach(s => s.classList.remove('active'));
            const firstStep = quizSection.querySelector('.quiz-step[data-step="1"]');
            if (firstStep) firstStep.classList.add('active');
            if (fill) fill.style.width = '33.33%';
        });
    }

    function showQuizResults(ans) {
        steps.forEach(s => s.classList.remove('active'));
        const resultStep = quizSection.querySelector('.quiz-step[data-step="result"]');
        if (!resultStep) return;

        resultStep.classList.add('active');
        if (fill) fill.style.width = '100%';

        let res = {
            title: "Web Corporativa & Autoridad",
            desc: "Tu negocio necesita una presencia digital sólida, de alto impacto y orientada a transmitir confianza absoluta y captar clientes en piloto automático.",
            tipoParam: "web",
            priceTag: "Desde $350 USD",
            features: ["Diseño exclusivo responsive", "SEO & Analítica configurada", "Formulario & WhatsApp directo", "100% Adaptada a móvil"]
        };

        if (ans.q1 === 'manual' || ans.q2 === 'auto') {
            res = {
                title: "Sistema de Automatización con IA",
                desc: "Tu principal cuello de botella es la pérdida de tiempo en tareas repetitivas. Diseñamos e integramos flujos inteligentes con n8n, Make e IA para liberar más de 15h a la semana.",
                tipoParam: "automatizacion",
                priceTag: "Desde $750 USD",
                features: ["Integración de herramientas (CRM, Email)", "Agentes IA conversacionales 24/7", "Eliminación de tareas repetitivas", "Optimización de operativa interna"]
            };
        } else if (ans.q1 === 'app' || ans.q2 === 'app') {
            res = {
                title: "Desarrollo de App / Plataforma SaaS",
                desc: "Necesitas una arquitectura a medida escalable. Desarrollamos portales web privados, CRMs personalizados o plataformas SaaS con Next.js y Supabase.",
                tipoParam: "app",
                priceTag: "Desde $1.500 USD",
                features: ["Panel de control interactivo", "Base de datos segura & APIs", "Gestión de usuarios y pagos", "Código propio 100% escalable"]
            };
        } else if (ans.q1 === 'leads' && ans.q2 === 'sales') {
            res = {
                title: "Landing Page de Alta Conversión",
                desc: "Ideal para captar clientes inmediatos y maximizar el retorno de tu publicidad. Una estructura diseñada 100% para transformar visitas en mensajes directos.",
                tipoParam: "landing",
                priceTag: "Desde $350 USD",
                features: ["Estructura orientada a ventas", "Carga ultrarrápida (<1s)", "Integración con WhatsApp & CRM", "Optimización móvil avanzada"]
            };
        } else if (ans.q1 === 'leads' || ans.q2 === 'sales') {
            res = {
                title: "Tienda Online / E-Commerce",
                desc: "Tu prioridad es impulsar las ventas. Una plataforma e-commerce completa con catálogo, pagos automatizados y checkout sin fricción.",
                tipoParam: "ecom",
                priceTag: "Desde $1.200 USD",
                features: ["Catálogo dinámico de productos", "Pasarelas de pago (Stripe/Zelle)", "Panel de control de pedidos", "Sin comisiones por venta"]
            };
        }

        // Incorporar el plazo seleccionado en la pregunta 3
        if (ans.q3 === 'urgent') {
            res.features.unshift("Entrega prioritaria (1 - 2 semanas)");
        } else if (ans.q3 === 'month') {
            res.features.unshift("Plazo estimado (3 - 4 semanas)");
        } else if (ans.q3 === 'flexible') {
            res.features.unshift("Propuesta & alcance a medida");
        }

        const titleEl = document.getElementById('quiz-res-title');
        const descEl = document.getElementById('quiz-res-desc');
        const featsEl = document.getElementById('quiz-res-features');
        const ctaBtn = document.getElementById('quiz-res-cta');
        const badgeEl = quizSection.querySelector('.quiz-result-badge');

        if (titleEl) titleEl.textContent = res.title;
        if (descEl) descEl.textContent = res.desc;
        if (badgeEl) {
            badgeEl.innerHTML = `<i class="fas fa-star"></i> Solución Recomendada (${res.priceTag})`;
        }
        if (featsEl) {
            featsEl.innerHTML = res.features.map(f => `<span class="quiz-rf-item"><i class="fas fa-check"></i> ${f}</span>`).join('');
        }
        if (ctaBtn) {
            ctaBtn.href = `presupuesto.html?tipo=${res.tipoParam}`;
            ctaBtn.textContent = `Solicitar propuesta para ${res.title} →`;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMobileStickyCTA();
        initExpressQuiz();
    });
} else {
    initMobileStickyCTA();
    initExpressQuiz();
}

/* ── Global CTA Select Project Type Handler (venezuela.html style) ── */
window.selectChip = function(btn, value) {
    if (!btn) return;
    const parent = btn.parentElement;
    if (parent) {
        parent.querySelectorAll('.vz-chip-btn, .chip-btn').forEach(el => el.classList.remove('selected'));
    }
    btn.classList.add('selected');
    const input = document.getElementById('form-project-type');
    if (input) input.value = value;
};

window.selectProjectType = function(typeName, sourceId) {
    if (typeof trackConversionEvent === 'function') {
        trackConversionEvent('click_proposal', { source: sourceId || 'cta', preselected_type: typeName });
    }

    const map = {
        'Página web': 'Página web',
        'Landing Page': 'Página web',
        'Web Corporativa': 'Página web',
        'E-commerce': 'E-commerce',
        'Tienda Online': 'E-commerce',
        'Automatización / IA': 'Automatización / IA',
        'Automatización & IA': 'Automatización / IA',
        'Software a medida': 'Software a medida',
        'App / SaaS': 'Software a medida'
    };
    const targetType = map[typeName] || typeName;

    // Highlight chip in contact form
    const chips = document.querySelectorAll('#project-chips .vz-chip-btn, #project-chips .chip-btn');
    chips.forEach(btn => {
        const txt = btn.innerText.trim();
        if (txt === targetType || txt === typeName) {
            window.selectChip(btn, targetType);
        }
    });

    const hiddenInput = document.getElementById('form-project-type');
    if (hiddenInput) hiddenInput.value = targetType;

    // Pre-fill message textarea if appropriate
    const textarea = document.getElementById('cf-msg') || document.getElementById('form-details');
    if (textarea && (!textarea.value || textarea.value.startsWith('Hola, me interesa solicitar propuesta para:'))) {
        textarea.value = `Hola, me interesa solicitar propuesta para: ${targetType}. `;
    }

    // Smooth scroll down to contact section
    const target = document.getElementById('contacto') || document.getElementById('contact');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
};


