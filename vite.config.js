import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

try {
  fs.copyFileSync(
    'C:/Users/jayse/.gemini/antigravity-ide/brain/2d8d86bc-c650-450e-88e0-3036ad5daf1d/media__1783844575079.jpg',
    'f:/ODOO/AssetFlow-Enterprise-Asset-Resource-Management-System/src/assets/sidebar_promo.jpg'
  );
  console.log('Successfully copied sidebar promo logo!');
} catch (e) {
  console.error('Failed to copy sidebar logo:', e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
