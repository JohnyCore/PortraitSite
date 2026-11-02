import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' -> relative asset paths, works on localhost and GitHub Pages (/portrait/) unchanged
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })
