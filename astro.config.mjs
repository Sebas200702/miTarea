
import react from '@astrojs/react'

import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'


export default defineConfig({
    output: 'server',
    adapter: vercel(),
    integrations: [react()],

    vite: {
        plugins: [tailwindcss()],
    },
})
