(() => {
    const modal = document.createElement('div');
    modal.className = 'privacy-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'privacy-modal-title');
    modal.innerHTML = `
        <div class="privacy-modal__panel" tabindex="-1" style="background:#111;color:#a3a3a3;max-height:85vh;overflow-y:auto;padding:2rem;width:min(100%,42rem);">
            <button type="button" class="privacy-modal__close" aria-label="Close privacy policy">&times;</button>
            <p class="privacy-modal__eyebrow">Legal / Privacy</p>
            <h2 id="privacy-modal-title" style="color:#fff;font-family:'Space Grotesk',sans-serif;font-size:clamp(2.25rem,7vw,4rem);line-height:.95;margin:0 0 2rem;">Privacy Policy.</h2>
            <div class="privacy-modal__content">
                <section><h3>Information we receive</h3><p>When you contact Alcon by email or telephone, we receive the information you choose to provide, such as your name, company, contact details, and project requirements.</p></section>
                <section><h3>How we use information</h3><p>We use enquiries to respond to requests, prepare project information, provide quotations, and deliver customer support. We do not sell personal information.</p></section>
                <section><h3>Cookies and third parties</h3><p>This static website does not intentionally set analytics or advertising cookies. Pages may load Google Fonts, Tailwind CDN, Google Maps, and externally hosted images, which may receive standard technical request data.</p></section>
                <section><h3>Contact</h3><p>For privacy questions or data requests, email <a href="mailto:sales@alcon.ae">sales@alcon.ae</a>.</p></section>
                <p class="privacy-modal__updated">Last updated: 8 September 2026.</p>
            </div>
        </div>`;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(modal);
        const panel = modal.querySelector('.privacy-modal__panel');
        const closeButton = modal.querySelector('.privacy-modal__close');
        let previouslyFocused;

        const close = () => {
            modal.hidden = true;
            document.body.style.overflow = '';
            if (previouslyFocused) previouslyFocused.focus();
        };

        document.querySelectorAll('.privacy-policy-trigger').forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                previouslyFocused = trigger;
                modal.removeAttribute('hidden');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                closeButton.focus();
            });
        });

        closeButton.addEventListener('click', close);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) close();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.hidden) close();
        });
        panel.addEventListener('keydown', (event) => {
            if (event.key !== 'Tab') return;
            const focusable = panel.querySelectorAll('button, a[href]');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    });
})();
