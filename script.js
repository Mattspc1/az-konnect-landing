/* ═══════════════════════════════════════════ */
/*  AZ Konnect — script.js                    */
/* ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const stickyCta = document.getElementById('stickyCta');
    const heroEl = document.getElementById('hero');
    const scrollProgress = document.getElementById('scrollProgress');

    /* ── Scroll Progress Bar ────────────────── */
    const updateScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = pct + '%';
    };

    /* ── Navbar scroll + Sticky CTA ─────────── */
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 60);

        // Show sticky CTA once user scrolls past the hero
        if (heroEl) {
            const heroBottom = heroEl.offsetTop + heroEl.offsetHeight - 200;
            const isVisible = y > heroBottom;
            stickyCta.classList.toggle('visible', isVisible);
            document.body.classList.toggle('sticky-visible', isVisible);
        }

        updateScrollProgress();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check

    /* ── Intersection Observer — reveals ─────── */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Kick off counters inside this element
                    entry.target.querySelectorAll('.counter').forEach(startCounter);

                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => revealObserver.observe(el));

    /* ── Counter animation ──────────────────── */
    const started = new WeakSet();
    function startCounter(el) {
        if (started.has(el)) return;
        started.add(el);

        const target = +el.dataset.target;
        const duration = 2200; // ms
        const fps = 60;
        const totalFrames = Math.round(duration / (1000 / fps));
        let frame = 0;

        const tick = () => {
            frame++;
            const progress = frame / totalFrames;
            // EaseOutCubic for a satisfying slow-down
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();

            if (frame < totalFrames) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString();
            }
        };
        requestAnimationFrame(tick);
    }

    /* ── FAQ accordion ──────────────────────── */
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

            // Toggle current
            if (!wasOpen) item.classList.add('open');
        });
    });

    /* ── Steps hover interaction ─────────────── */
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('mouseenter', () => {
            document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
            step.classList.add('active');
        });
    });

    /* ── Smooth scroll for anchor links ──────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            const offset = navbar.offsetHeight + 20;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });

    /* ── Typing animation on hero chat ──────── */
    const chatMsgs = document.querySelectorAll('.msg[data-typed]');
    const bookedBar = document.querySelector('.booked-bar');
    let typingStarted = false;

    function typeMessage(el, text, speed = 28) {
        return new Promise(resolve => {
            el.textContent = '';
            el.classList.add('typing');
            el.style.opacity = '1';
            let i = 0;
            const interval = setInterval(() => {
                el.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    el.classList.remove('typing');
                    resolve();
                }
            }, speed);
        });
    }

    async function runTypingSequence() {
        if (typingStarted) return;
        typingStarted = true;

        // Hide booked bar during typing
        if (bookedBar) bookedBar.style.opacity = '0';

        // Hide all messages first
        chatMsgs.forEach(msg => {
            msg.style.opacity = '0';
        });

        // Type each message in sequence
        for (const msg of chatMsgs) {
            const text = msg.dataset.typed;
            await new Promise(r => setTimeout(r, 400));
            await typeMessage(msg, text, 22);
        }

        // Show booked bar with animation
        if (bookedBar) {
            await new Promise(r => setTimeout(r, 500));
            bookedBar.style.transition = 'opacity .5s ease';
            bookedBar.style.opacity = '1';
        }
    }

    // Trigger typing when mockup card is visible
    const mockupCard = document.querySelector('.mockup-card');
    if (mockupCard) {
        const typingObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(runTypingSequence, 600);
                    typingObserver.disconnect();
                }
            },
            { threshold: 0.4 }
        );
        typingObserver.observe(mockupCard);
    }

    /* ── Magnetic CTA buttons (desktop only) ── */
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.btn-primary.btn-lg, .btn-primary.glow-pulse').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });

        /* ── Tilt effect on feature cards ────── */
        document.querySelectorAll('.feat-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (y - 0.5) * -10;
                const rotateY = (x - 0.5) * 10;
                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ── Particle Canvas Background ─────────── */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;
        const isMobile = window.innerWidth < 768;
        const PARTICLE_COUNT = isMobile ? 25 : 60;
        const CONNECTION_DIST = isMobile ? 100 : 150;
        const PARTICLE_SPEED = 0.3;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * PARTICLE_SPEED,
                    vy: (Math.random() - 0.5) * PARTICLE_SPEED,
                    radius: Math.random() * 1.5 + 0.5
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DIST) {
                        const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.strokeStyle = `rgba(30, 64, 175, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw & move particles
            for (const p of particles) {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            }

            animId = requestAnimationFrame(drawParticles);
        }

        // Performance: pause when tab not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else {
                drawParticles();
            }
        });

        resize();
        createParticles();
        drawParticles();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                createParticles();
            }, 200);
        });
    }
});
