import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath, URL} from 'node:url'

export default defineConfig({
    base: './',
    plugins: [tailwindcss()],
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
