(() => {
    const addSignature = () => {
        if (document.querySelector('.site-signature')) return;

        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = 'site-signature.css';
        document.head.append(stylesheet);

        let footer = document.querySelector('footer');
        if (!footer) {
            footer = document.createElement('footer');
            footer.className = 'site-signature-only-footer';
            document.body.append(footer);
        }

        const signature = document.createElement('div');
        signature.className = 'site-signature';

        const image = document.createElement('img');
        image.src = 'images/Biby%20Varghese%20Signature%20Flourish.png';
        image.alt = 'Biby Varghese signature';
        image.width = 1774;
        image.height = 887;
        image.decoding = 'async';

        signature.append(image);
        footer.append(signature);
    };

    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', addSignature, { once: true });
    else
        addSignature();
})();
