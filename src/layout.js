const NAV_LINKS = [
    {href: 'index.html', label: 'Print!'},
    {href: 'how-to-use.html', label: 'Instrukcja'},
    {href: 'faq.html', label: 'FAQ'},
]

function navLinkClass(active) {
    return active
        ? 'rounded-full bg-charcoal px-3 py-2 text-white'
        : 'rounded-full px-3 py-2 text-gray-600 transition hover:text-gray-900'
}

class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.style.display = 'contents'
        const active = this.getAttribute('active')
        this.innerHTML = `
<header class="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-gray-200 px-5 py-5 lg:px-8">
    <a href="index.html" class="text-lg font-black tracking-[-0.06em] text-gray-900">PRINT<span class="text-coral">!</span></a>
    <nav class="flex items-center gap-1 text-sm font-medium" aria-label="Główna nawigacja">
        ${NAV_LINKS.map(({href, label}) => `<a class="${navLinkClass(href === active)}" href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n        ')}
    </nav>
    <a class="hidden text-sm font-medium text-gray-600 transition hover:text-coral sm:block" href="https://github.com/atais/print-sticky-label" target="_blank" rel="noreferrer">GitHub ↗</a>
</header>`
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.style.display = 'contents'
        this.innerHTML = `
<footer class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between lg:px-8 border-t border-gray-200">
    <nav class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Nawigacja w stopce">${NAV_LINKS.map(({href, label}) => `<a class="transition hover:text-gray-900" href="${href}">${label}</a>`).join('')}<a class="transition hover:text-gray-900" href="https://github.com/atais/print-sticky-label" target="_blank" rel="noreferrer">GitHub</a></nav>
    <a class="text-coral transition hover:text-coral" href="https://github.com/atais/print-sticky-label/issues/new?template=bug_report.yml" target="_blank" rel="noreferrer">Zgłoś uwagę ↗</a>
</footer>`
    }
}

customElements.define('site-header', SiteHeader)
customElements.define('site-footer', SiteFooter)
