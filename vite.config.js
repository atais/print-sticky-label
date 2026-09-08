import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import ejs from 'ejs'

const NAV_LINKS = [
    { href: 'index.html', label: 'Print!' },
    { href: 'how-to-use.html', label: 'Instrukcja' },
    { href: 'faq.html', label: 'FAQ' },
]

function htmlPartials() {
    return {
        name: 'html-partials',
        transformIndexHtml(html, ctx) {
            const active = basename(ctx.filename)
            return html.replace(/<!--\s*@include\s+(\w+)\s*-->/g, (_, name) => {
                const template = readFileSync(resolve('partials', `${name}.ejs`), 'utf-8')
                return ejs.render(template, { active, navLinks: NAV_LINKS, year: new Date().getFullYear() })
            })
        },
    }
}

export default defineConfig({
    base: './',
    plugins: [tailwindcss(), htmlPartials()],
    build: {
        rollupOptions: {
            input: {
                print: fileURLToPath(new URL('./index.html', import.meta.url)),
                howToUse: fileURLToPath(new URL('./how-to-use.html', import.meta.url)),
                faq: fileURLToPath(new URL('./faq.html', import.meta.url)),
            },
        },
    },
})
