import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://thapz123.github.io',
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
