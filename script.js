/* ═══════════════════════════════════════════ */
/*  AZ Konnect — script.js                    */
/* ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const stickyCta = document.getElementById('stickyCta');
    const heroEl = document.getElementById('hero');

    /* ── Navbar scroll + Sticky CTA ─────────── */
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 60);

        // Show sticky CTA once user scrolls past the hero
        if (heroEl) {
            const heroBottom = heroEl.offsetTop + heroEl.offsetHeight - 200;
            stickyCta.classList.toggle('visible', y > heroBottom);
        }
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
});
