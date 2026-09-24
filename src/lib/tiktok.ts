// Build-time details for pinned TikTok videos via TikTok's public oEmbed endpoint (no key needed).
// Thumbnails come back as signed, expiring URLs, so they're downloaded into the site with astro:assets.

import { getImage } from 'astro:assets';
import { tiktokPinned } from '../data/music';

export interface TikTokVideo {
  id: string;
  url: string;
  caption: string;
  thumbnail: string | null; // local, optimized image
}

async function load(url: string): Promise<TikTokVideo | null> {
  const id = url.match(/\/video\/(\d+)/)?.[1];
  if (!id) {
    console.warn(`[studio] Not a TikTok video URL: ${url}`);
    return null;
  }
  const clean = url.split('?')[0];
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(clean)}`);
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const data = await res.json();
    let thumbnail: string | null = null;
    if (data.thumbnail_url) {
      try {
        const img = await getImage({ src: data.thumbnail_url, width: 360, height: 640, fit: 'cover', format: 'webp' });
        thumbnail = img.src;
      } catch (e) {
        console.warn(`[studio] Couldn't copy TikTok thumbnail for ${id}: ${(e as Error).message}`);
      }
    }
    return { id, url: clean, caption: String(data.title ?? '').trim(), thumbnail };
  } catch (e) {
    console.warn(`[studio] Couldn't load TikTok video ${id}: ${(e as Error).message}`);
    return { id, url: clean, caption: '', thumbnail: null };
  }
}

let cached: Promise<TikTokVideo[]> | undefined;

export function getPinnedVideos(): Promise<TikTokVideo[]> {
  cached ??= Promise.all(tiktokPinned.map(load)).then((vs) => vs.filter((v): v is TikTokVideo => v !== null));
  return cached;
}
