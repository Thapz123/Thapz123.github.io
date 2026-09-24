// Music shown in the Studio. The release list itself is fetched from Apple's catalog at build time
// (src/lib/releases.ts), so a new release appears on the next deploy without editing anything here.

export const artist = {
  name: 'tndrheaded',
  genre: 'Soul',
  appleArtistId: 1848738515,
  profiles: [
    { label: 'Spotify', href: 'https://open.spotify.com/artist/3dHitVbo4xMhIxLsV04ZwN' },
    { label: 'Apple Music', href: 'https://music.apple.com/us/artist/tndrheaded/1848738515' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@tndrheaded' },
  ],
  tiktok: 'https://www.tiktok.com/@tndrheaded',
};

/**
 * The videos pinned on the TikTok profile, in the order they're pinned. Paste each video's link
 * (Share → Copy link, or the address bar on desktop). Thumbnails and captions are fetched at build time.
 */
export const tiktokPinned: string[] = [
  'https://www.tiktok.com/@tndrheaded/video/7525578141843164430',
  'https://www.tiktok.com/@tndrheaded/video/7525145157549722894',
];

/**
 * LANDR Promolinks: one landing page per release that sends listeners to Spotify, Apple Music, Deezer, TIDAL…
 * Find each in LANDR under My Releases → your release → Promolink. Keyed by the Apple Music album id
 * (the number at the end of the album's music.apple.com URL). Releases without one link to Apple Music.
 */
export const promolinks: Record<number, string> = {
  // 1848738640: 'https://…', // Cursed Existence
};
