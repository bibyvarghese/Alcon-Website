(() => {
    const list = document.querySelector('[data-vacancies-list]');
    if (!list) return;

    const escapeHtml = (value) => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    fetch('vacancies.json')
        .then((response) => {
            if (!response.ok) throw new Error('Vacancies could not be loaded.');
            return response.json();
        })
        .then((vacancies) => {
            list.innerHTML = vacancies.length
                ? vacancies.map((vacancy) => `
                    <article class="grid gap-6 py-7 md:grid-cols-12 md:items-center">
                        <div class="md:col-span-7">
                            <h3 class="font-display text-2xl text-white">${escapeHtml(vacancy.title)}</h3>
                            <p class="mt-2 text-sm text-neutral-500">${escapeHtml(vacancy.department)} / ${escapeHtml(vacancy.location)}</p>
                        </div>
                        <p class="text-sm leading-relaxed text-neutral-400 md:col-span-3">${escapeHtml(vacancy.description)}</p>
                        <a href="mailto:sales@alcon.ae?subject=${encodeURIComponent(vacancy.emailSubject)}" class="text-xs uppercase tracking-[0.15em] text-white underline underline-offset-8 transition-colors hover:text-neutral-400 md:col-span-2 md:text-right">Apply</a>
                    </article>`).join('')
                : '<p class="py-7 text-sm text-neutral-400">There are no listed vacancies at this time. Please send your CV for future opportunities.</p>';
        })
        .catch(() => {
            list.innerHTML = '<p class="py-7 text-sm text-neutral-400">Vacancies are currently unavailable. Please email sales@alcon.ae with your CV.</p>';
        });
})();
