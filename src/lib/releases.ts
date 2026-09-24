// Build-time fetch of an artist's releases from Apple's public iTunes Search API (no key needed).
// If the API is unreachable the Studio still builds, just without the release list.

import { artist, promolinks } from '../data/music';

export interface Release {
  id: number;
  title: string;
  kind: 'Single' | 'EP' | 'Album';
  date: string; // ISO
  artwork: string;
  appleUrl: string;
  listenUrl: string; // LANDR Promolink when available, otherwise Apple Music
  hasPromolink: boolean;
  tracks: { title: string; previewUrl: string | null }[];
}

const API = 'https://itunes.apple.com/lookup';

async function lookup(entity: 'album' | 'song') {
  const res = await fetch(`${API}?id=${artist.appleArtistId}&entity=${entity}&limit=200&country=US`);
  if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
  const { results } = await res.json();
  return results as Record<string, any>[];
}

function kindOf(name: string, trackCount: number): Release['kind'] {
  if (/ - Single$/.test(name)) return 'Single';
  if (/ - EP$/.test(name)) return 'EP';
  return trackCount <= 3 ? 'Single' : trackCount <= 6 ? 'EP' : 'Album';
}

let cached: Promise<Release[]> | undefined;

export function getReleases(): Promise<Release[]> {
  cached ??= (async () => {
    try {
      const [albums, songs] = await Promise.all([lookup('album'), lookup('song')]);
      return albums
        .filter((a) => a.wrapperType === 'collection')
        .map((a): Release => {
          const appleUrl = String(a.collectionViewUrl).split('?')[0];
          const promo = promolinks[a.collectionId];
          return {
            id: a.collectionId,
            title: String(a.collectionName).replace(/ - (Single|EP)$/, ''),
            kind: kindOf(a.collectionName, a.trackCount),
            date: a.releaseDate,
            artwork: String(a.artworkUrl100).replace('100x100bb', '600x600bb'),
            appleUrl,
            listenUrl: promo ?? appleUrl,
            hasPromolink: Boolean(promo),
            tracks: songs
              .filter((s) => s.wrapperType === 'track' && s.collectionId === a.collectionId)
              .sort((x, y) => x.trackNumber - y.trackNumber)
              .map((s) => ({ title: s.trackName, previewUrl: s.previewUrl ?? null })),
          };
        })
        .sort((x, y) => y.date.localeCompare(x.date));
    } catch (e) {
      console.warn(`[studio] Couldn't load releases for ${artist.name}: ${(e as Error).message}`);
      return [];
    }
  })();
  return cached;
}
