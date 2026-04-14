/* ================================
   KLARAT CRÉATION — script.js
   ================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ════════════════════════════════
    // CURSEUR PERSONNALISÉ
    // Désactivé sur appareils tactiles
    // ════════════════════════════════
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (cursor && follower && !isTouchDevice) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        document.querySelectorAll('a, button, .card, .gallery-pro-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });
    }

    // ════════════════════════════════
    // HEADER AU SCROLL
    // ════════════════════════════════
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ════════════════════════════════
    // MENU BURGER MOBILE
    // ════════════════════════════════
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('nav-menu');

    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            burger.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ════════════════════════════════
    // ANIMATIONS REVEAL AU SCROLL
    // ════════════════════════════════
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // ════════════════════════════════
    // PARALLAX BLOB HERO (léger)
    // ════════════════════════════════
    const hero = document.querySelector('.hero');
    if (hero && !isTouchDevice) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                hero.style.backgroundPositionY = window.scrollY * 0.25 + 'px';
            }
        }, { passive: true });
    }

    // ════════════════════════════════
    // LAZY LOADING IMAGES
    // ════════════════════════════════
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imgObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    }

    // ════════════════════════════════
    // FORMULAIRE DE CONTACT
    // Validation + envoi async Formspree
    // ════════════════════════════════
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Affiche le message de succès si redirigé avec ?sent=1
    if (window.location.search.includes('sent=1')) {
        const successEl = document.getElementById('form-success');
        if (successEl) {
            successEl.hidden = false;
            history.replaceState(null, '', window.location.pathname);
        }
    }

    // ── Validation d'un champ unique ──
    function validateField(field) {
        const errorEl = document.getElementById(field.id + '-error');
        let message = '';

        if (field.required && !field.value.trim()) {
            message = 'Ce champ est requis.';
        } else if (field.type === 'email' && field.value.trim()) {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(field.value.trim())) {
                message = 'Adresse email invalide.';
            }
        } else if (field.tagName === 'SELECT' && field.required && !field.value) {
            message = 'Merci de choisir une option.';
        }

        if (errorEl) errorEl.textContent = message;
        field.classList.toggle('input-error', !!message);
        return !message;
    }

    // Validation en temps réel (blur)
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('input-error')) validateField(field);
        });
    });

    // ── Soumission async ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Valider tous les champs
        const fields = [...form.querySelectorAll('input[required], textarea[required], select[required]')];
        const allValid = fields.map(f => validateField(f)).every(Boolean);
        if (!allValid) {
            fields.find(f => f.classList.contains('input-error'))?.focus();
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const submitLabel = document.getElementById('submit-label');
        const successEl = document.getElementById('form-success');
        const errorEl = document.getElementById('form-error-global');

        // État de chargement
        submitBtn.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Envoi en cours…';
        if (successEl) successEl.hidden = true;
        if (errorEl) errorEl.hidden = true;

        try {
            const data = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                form.reset();
                if (successEl) successEl.hidden = false;
                successEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                throw new Error('Erreur serveur');
            }
        } catch {
            if (errorEl) errorEl.hidden = false;
        } finally {
            submitBtn.disabled = false;
            if (submitLabel) submitLabel.textContent = 'Envoyer ma demande';
        }
    });

});
