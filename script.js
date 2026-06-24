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

    const pN = window.innerWidth < 768 ? 500 : 1100;
    const pG  = new THREE.BufferGeometry();
    const pos = new Float32Array(pN * 3);
    const sz  = new Float32Array(pN);
    for (let i = 0; i < pN; i++) {
        pos[i*3]   = (Math.random()-.5)*110;
        pos[i*3+1] = (Math.random()-.5)*80;
        pos[i*3+2] = (Math.random()-.5)*55;
        sz[i]      = Math.random()*1.8 + .4;
    }
    pG.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pG.setAttribute('size',     new THREE.BufferAttribute(sz,  1));
    const pMat = new THREE.ShaderMaterial({
        uniforms:{ uTime:{value:0}, uMouse:{value:new THREE.Vector2(0,0)} },
        vertexShader:`
            attribute float size; uniform float uTime; uniform vec2 uMouse;
            varying float vA; varying float vR;
            void main(){
                vec3 p=position;
                p.y+=sin(p.x*.09+uTime*.38)*1.3;
                p.x+=cos(p.z*.07+uTime*.28)*.9;
                vec2 mw=uMouse*vec2(50.,36.);
                float md=length(p.xy-mw);
                float rep=max(0.,9.-md*.45)*2.2;
                if(md>.01) p.xy+=normalize(p.xy-mw)*rep;
                vec4 mv=modelViewMatrix*vec4(p,1.);
                gl_PointSize=size*(260./-mv.z);
                gl_Position=projectionMatrix*mv;
                vA=.25+.2*abs(sin(p.x*.13+uTime*.55));
                vR=step(.82,sin(p.x*.21+p.y*.16));
            }`,
        fragmentShader:`
            varying float vA; varying float vR;
            void main(){
                vec2 c=gl_PointCoord-.5; float d=length(c);
                if(d>.5) discard;
                float a=(1.-smoothstep(.25,.5,d))*vA;
                vec3 col=mix(vec3(.94,.93,.9),vec3(.84,.19,.19),vR);
                gl_FragColor=vec4(col,a);
            }`,
        transparent:true, blending:THREE.AdditiveBlending, depthWrite:false,
    });
    scene.add(new THREE.Points(pG, pMat));

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
        pMat.uniforms.uTime.value = t;
        pMat.uniforms.uMouse.value.set(m.tx, m.ty);
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

    /* Subtle background particles */
    const bgCanvas = document.createElement('canvas');
    bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.insertBefore(bgCanvas, document.body.firstChild);
    const ctx2 = bgCanvas.getContext('2d');
    let bW = bgCanvas.width = innerWidth, bH = bgCanvas.height = innerHeight;
    window.addEventListener('resize', () => { bW=bgCanvas.width=innerWidth; bH=bgCanvas.height=innerHeight; }, { passive:true });
    const bPts = Array.from({ length: bW<768?14:32 }, () => ({
        x:Math.random()*bW, y:Math.random()*bH,
        vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18,
        r:Math.random()*.8+.2, o:Math.random()*.12+.02,
    }));
    (function bgLoop() {
        ctx2.clearRect(0,0,bW,bH);
        bPts.forEach(p => {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0||p.x>bW) p.vx*=-1;
            if(p.y<0||p.y>bH) p.vy*=-1;
            ctx2.beginPath(); ctx2.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx2.fillStyle=`rgba(214,48,49,${p.o})`; ctx2.fill();
        });
        requestAnimationFrame(bgLoop);
    })();
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

/* ── Contenido filter ──────────────────────────── */
function initContenidoFilter() {
    const btns  = document.querySelectorAll('.cf-btn');
    const items = document.querySelectorAll('.cont-item');
    if (!btns.length) return;

    // Filter programmatically on load based on active button
    const activeBtn = document.querySelector('.cf-btn.active');
    const initialFilter = activeBtn ? activeBtn.dataset.filter : 'brand';

    // Set initial display and state for gallery items
    items.forEach(item => {
        const show = item.dataset.cat === initialFilter;
        if (show) {
            item.classList.remove('cf-hidden');
            if (window.gsap) {
                gsap.set(item, { opacity: 0, y: 15, scale: 0.95 });
            }
        } else {
            item.classList.add('cf-hidden');
        }
    });

    // Animate active items on scroll entry
    if (window.ScrollTrigger && window.gsap) {
        const activeItems = Array.from(items).filter(item => item.dataset.cat === initialFilter);
        ScrollTrigger.create({
            trigger: '#cont-grid',
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(activeItems, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.04,
                    ease: 'power2.out',
                    onComplete: () => {
                        ScrollTrigger.refresh();
                    }
                });
            }
        });
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const f = btn.dataset.filter;
            const toHide = [];
            const toShow = [];

            items.forEach(item => {
                const matches = f === 'all' || item.dataset.cat === f;
                const isHidden = item.classList.contains('cf-hidden');

                if (matches) {
                    if (isHidden) toShow.push(item);
                } else {
                    if (!isHidden) toHide.push(item);
                }
            });

            if (window.gsap) {
                // Kill active tweens on all items
                gsap.killTweensOf(items);

                // Sequential animation: Fade out old first, then show and fade in new
                if (toHide.length > 0) {
                    gsap.to(toHide, {
                        opacity: 0,
                        y: -10,
                        scale: 0.95,
                        duration: 0.22,
                        stagger: 0.015,
                        ease: 'power2.in',
                        onComplete: () => {
                            toHide.forEach(item => item.classList.add('cf-hidden'));
                            showAndAnimateNew();
                        }
                    });
                } else {
                    showAndAnimateNew();
                }

                function showAndAnimateNew() {
                    if (toShow.length > 0) {
                        toShow.forEach(item => item.classList.remove('cf-hidden'));
                        gsap.fromTo(toShow,
                            { opacity: 0, y: 15, scale: 0.95 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.45,
                                stagger: 0.03,
                                ease: 'power2.out',
                                onComplete: () => {
                                    if (typeof ScrollTrigger !== 'undefined') {
                                        ScrollTrigger.refresh();
                                    }
                                }
                            }
                        );
                    } else {
                        if (typeof ScrollTrigger !== 'undefined') {
                            ScrollTrigger.refresh();
                        }
                    }
                }
            } else {
                // Fallback without GSAP
                items.forEach(item => {
                    const matches = f === 'all' || item.dataset.cat === f;
                    item.classList.toggle('cf-hidden', !matches);
                });
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }
        });
    });
}

/* ── Boot ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initThreeHero();
    initPreloader(main);
    initContenidoFilter();
    initMediaLightbox();
});
