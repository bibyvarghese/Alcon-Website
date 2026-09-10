(() => {
    const install = () => {
        if (document.querySelector('#header.shared-site-header')) return;

        const currentHeader = document.querySelector('body > header');
        if (currentHeader) currentHeader.remove();

        document.body.insertAdjacentHTML('afterbegin', `
            <header id="header" class="shared-site-header">
                <div class="shared-site-header__inner">
                    <a class="shared-site-header__logo" href="Index.html" aria-label="Alcon home"><img src="images/logo.webp" alt="Alcon Logo"></a>
                    <nav class="shared-site-header__nav" aria-label="Primary navigation">
                        <a href="/#about">About Us</a>
                        <a href="/#products">Capabilities</a>
                        <a href="/#portfolio">Projects</a>
                        <a href="/#contact">Contact</a>
                    </nav>
                    <div class="shared-site-header__actions">
                        <a class="shared-site-header__inquire" href="/#contact">Inquire</a>
                        <button class="shared-site-header__menu" type="button" aria-label="Toggle Menu" aria-expanded="false"><span class="shared-site-header__bar shared-site-header__bar--top"></span><span class="shared-site-header__bar shared-site-header__bar--bottom"></span></button>
                    </div>
                </div>
            </header>
            <div class="shared-site-menu" aria-hidden="true">
                <nav class="shared-site-menu__links" aria-label="Menu navigation">
                    <a href="/">Home</a><a href="/#about">About</a><a href="/#products">Capabilities</a><a href="/#portfolio">Projects</a><a href="/#contact">Contact</a>
                </nav>
                <div class="shared-site-menu__footer">Alcon Concrete Products LLC / Dubai, UAE</div>
            </div>`);

        const menuButton = document.querySelector('.shared-site-header__menu');
        const menu = document.querySelector('.shared-site-menu');
        const bars = menuButton.querySelectorAll('.shared-site-header__bar');
        const closeMenu = () => {
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
            menuButton.setAttribute('aria-expanded', 'false');
            bars[0].style.transform = 'none';
            bars[1].style.transform = 'none';
        };
        menuButton.addEventListener('click', () => {
            const open = menu.classList.toggle('is-open');
            menu.setAttribute('aria-hidden', String(!open));
            menuButton.setAttribute('aria-expanded', String(open));
            bars[0].style.transform = open ? 'rotate(-45deg) translate(-2px, 4px)' : 'none';
            bars[1].style.transform = open ? 'rotate(45deg) translate(-2px, -4px)' : 'none';
        });
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMenu();
        });
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
    else install();
})();
