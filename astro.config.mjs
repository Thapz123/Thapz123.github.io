import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tsebolai.com',
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
  // Remote images downloaded and optimized at build time: Apple Music artwork and TikTok thumbnails
  // (TikTok's thumbnail URLs are signed and expire, so they must be copied, not hotlinked).
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mzstatic.com' },
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.tiktokcdn-us.com' },
    ],
  },
});
