(() => {
    const start = () => {
        const lazyLoadImages = () => {
            document.querySelectorAll('img:not([loading]):not([data-lazy-disabled])').forEach((img) => {
                const isLogo = img.src && /logo(2)?\.(png|webp)/i.test(img.src);
                if (isLogo) {
                    img.loading = 'eager';
                    img.decoding = 'async';
                    return;
                }
                img.loading = 'lazy';
                img.decoding = 'async';
            });
        };

        lazyLoadImages();

        if (!document.querySelector('.concrete-grain')) {
            document.body.insertAdjacentHTML('afterbegin', '<div class="gallery-grain"></div>');
        }
        if (!document.querySelector('.structural-grid')) {
            document.body.insertAdjacentHTML('afterbegin', '<div class="gallery-grid"></div>');
        }
        if (!document.querySelector('.gallery-progress')) {
            document.body.insertAdjacentHTML('afterbegin', '<div class="gallery-progress"></div>');
        }

        if (!document.querySelector('.site-pointer-lens') && !document.querySelector('#torch-light')) {
            document.body.insertAdjacentHTML('beforeend', `
                <svg class="site-pointer-filter" aria-hidden="true" width="0" height="0">
                    <defs><filter id="gallery-torch-glitch"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" class="site-torch-displacement" /></filter></defs>
                </svg>
                <div class="site-pointer-lens" aria-hidden="true"></div>`);
        }

        const pointerLens = document.querySelector('.site-pointer-lens');
        if (pointerLens) {
            const displacement = document.querySelector('.site-torch-displacement');
            let targetX = 0;
            let targetY = 0;
            let lensX = 0;
            let lensY = 0;
            let lastX = 0;
            let lastY = 0;
            let glitchScale = 0;
            let pointerFrame;

            const renderPointerLens = () => {
                lensX += (targetX - lensX) * 0.12;
                lensY += (targetY - lensY) * 0.12;
                const speed = Math.hypot(targetX - lastX, targetY - lastY);
                lastX = targetX;
                lastY = targetY;
                glitchScale += (Math.min(speed * 1.5, 45) - glitchScale) * 0.15;
                pointerLens.style.left = `${lensX}px`;
                pointerLens.style.top = `${lensY}px`;
                if (displacement) displacement.setAttribute('scale', glitchScale);
                pointerFrame = requestAnimationFrame(renderPointerLens);
            };

            const movePointerLens = (event) => {
                targetX = event.clientX;
                // A small offset prevents the lens being covered by the user's finger.
                targetY = event.clientY + (event.pointerType === 'touch' ? -48 : 0);
                if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointerLens);
                pointerLens.classList.add('is-visible');
            };
            const hidePointerLens = () => pointerLens.classList.remove('is-visible', 'is-hovering');

            document.addEventListener('pointermove', movePointerLens, { passive: true });
            document.addEventListener('pointerdown', movePointerLens, { passive: true });
            document.addEventListener('pointerover', (event) => {
                pointerLens.classList.toggle('is-hovering', Boolean(event.target.closest('a, button, input, select, textarea')));
            });
            document.addEventListener('pointerout', (event) => {
                if (!event.relatedTarget) hidePointerLens();
            });
            document.addEventListener('pointerup', (event) => {
                if (event.pointerType === 'touch') hidePointerLens();
            }, { passive: true });
            document.addEventListener('pointercancel', hidePointerLens, { passive: true });
            window.addEventListener('blur', hidePointerLens);
        }

        const progress = document.querySelector('.gallery-progress');
        const images = [...document.querySelectorAll('.parallax-img')];
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768;
        let targetScroll = window.scrollY;
        let currentScroll = targetScroll;
        let pointerX = 0;
        let pointerY = 0;
        let frameRequested = false;

        document.querySelectorAll('.reveal').forEach((element) => element.classList.remove('active'));
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

        const render = () => {
            frameRequested = false;
            targetScroll = window.scrollY;
            currentScroll += (targetScroll - currentScroll) * 0.08;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.width = `${scrollHeight > 0 ? (targetScroll / scrollHeight) * 100 : 0}%`;

            if (!reduceMotion) {
                images.forEach((image) => {
                    if (!image || !image.parentElement) return;
                    const bounds = image.parentElement.getBoundingClientRect();
                    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
                        const shift = ((bounds.top - window.innerHeight) / (window.innerHeight + bounds.height)) * 28;
                        image.style.transform = `scale(1.12) translate3d(${pointerX * 2}px, ${shift + pointerY * 2}px, 0)`;
                    }
                });
            }
        };

        const requestRender = () => {
            if (reduceMotion) {
                if (progress) progress.style.width = '0%';
                return;
            }
            if (!frameRequested) {
                frameRequested = true;
                requestAnimationFrame(render);
            }
        };

        if (!reduceMotion) {
            window.addEventListener('scroll', requestRender, { passive: true });
            window.addEventListener('resize', requestRender, { passive: true });
            document.addEventListener('pointermove', (event) => {
                pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
                pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
                requestRender();
            }, { passive: true });
        }

        requestRender();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
