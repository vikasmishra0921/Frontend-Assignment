import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites at /<repo-name>/; CI sets GITHUB_ACTIONS.
// Vercel/Netlify deploy at domain root — build there without GITHUB_ACTIONS so base stays "/".
const repoBase = '/frontend-interview/'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? repoBase : '/',
})
