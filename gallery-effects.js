(() => {
    const start = () => {
        const lazyLoadImages = () => {
            document.querySelectorAll('img:not([loading]):not([data-lazy-disabled])').forEach((img) => {
                const isLogo = img.src && /logo(2)?\.png/i.test(img.src);
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
