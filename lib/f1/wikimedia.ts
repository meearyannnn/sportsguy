/**
 * Wikimedia Commons Media & Legal Attribution Service
 * 
 * Sourcing Strategy:
 * 1. High-fidelity Wikimedia Commons images with CC-BY / CC-BY-SA licenses.
 * 2. Mandatory attribution metadata (photographer, license, source URL).
 * 3. Graceful fallback when no Commons image exists (handled by DriverAvatar component).
 * 4. Abstract representation for teams: no trademarked team logos, only team color accents.
 * 5. Caching in localStorage to avoid redundant network requests.
 */

export interface DriverAttribution {
  photographer: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  commonsTitle: string;
}

export interface DriverMedia {
  driverId: string;
  name: string;
  thumbUrl?: string;
  attribution: DriverAttribution;
}

// Curated verified Wikimedia Commons imagery with explicit CC licensing & attribution
export const CURATED_COMMONS_MEDIA: Record<string, DriverMedia> = {
  max_verstappen: {
    driverId: 'max_verstappen',
    name: 'Max Verstappen',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Max_Verstappen_2017_Malaysia_1.jpg/440px-Max_Verstappen_2017_Malaysia_1.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Max_Verstappen_2017_Malaysia_1.jpg',
      commonsTitle: 'Max Verstappen 2017 Malaysia',
    },
  },
  norris: {
    driverId: 'norris',
    name: 'Lando Norris',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Lando_Norris_2017_Formula_3_Masters_1.jpg/440px-Lando_Norris_2017_Formula_3_Masters_1.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lando_Norris_2017_Formula_3_Masters_1.jpg',
      commonsTitle: 'Lando Norris Formula 3 Masters',
    },
  },
  leclerc: {
    driverId: 'leclerc',
    name: 'Charles Leclerc',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Charles_Leclerc_2019_Formula_One_tests_Barcelona_%28cropped%29.jpg/440px-Charles_Leclerc_2019_Formula_One_tests_Barcelona_%28cropped%29.jpg',
    attribution: {
      photographer: 'Lukas Raich',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Charles_Leclerc_2019_Formula_One_tests_Barcelona_(cropped).jpg',
      commonsTitle: 'Charles Leclerc 2019 Formula One tests Barcelona',
    },
  },
  hamilton: {
    driverId: 'hamilton',
    name: 'Lewis Hamilton',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/440px-Lewis_Hamilton_2016_Malaysia_2.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lewis_Hamilton_2016_Malaysia_2.jpg',
      commonsTitle: 'Lewis Hamilton 2016 Malaysia',
    },
  },
  piastri: {
    driverId: 'piastri',
    name: 'Oscar Piastri',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Oscar_Piastri_2019_Formula_Renault_Eurocup_N%C3%BCrburgring.jpg/440px-Oscar_Piastri_2019_Formula_Renault_Eurocup_N%C3%BCrburgring.jpg',
    attribution: {
      photographer: 'Lukas Raich',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Oscar_Piastri_2019_Formula_Renault_Eurocup_N%C3%BCrburgring.jpg',
      commonsTitle: 'Oscar Piastri 2019 Nürburgring',
    },
  },
  russell: {
    driverId: 'russell',
    name: 'George Russell',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/George_Russell_2019_Formula_One_tests_Barcelona.jpg/440px-George_Russell_2019_Formula_One_tests_Barcelona.jpg',
    attribution: {
      photographer: 'Lukas Raich',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:George_Russell_2019_Formula_One_tests_Barcelona.jpg',
      commonsTitle: 'George Russell 2019 Formula One tests Barcelona',
    },
  },
  alonso: {
    driverId: 'alonso',
    name: 'Fernando Alonso',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Fernando_Alonso_2016_Malaysia_1.jpg/440px-Fernando_Alonso_2016_Malaysia_1.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fernando_Alonso_2016_Malaysia_1.jpg',
      commonsTitle: 'Fernando Alonso 2016 Malaysia',
    },
  },
  sainz: {
    driverId: 'sainz',
    name: 'Carlos Sainz',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Carlos_Sainz_Jr._2016_Malaysia_2.jpg/440px-Carlos_Sainz_Jr._2016_Malaysia_2.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Carlos_Sainz_Jr._2016_Malaysia_2.jpg',
      commonsTitle: 'Carlos Sainz Jr 2016 Malaysia',
    },
  },
  albon: {
    driverId: 'albon',
    name: 'Alexander Albon',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Alexander_Albon_2019_Formula_One_tests_Barcelona.jpg/440px-Alexander_Albon_2019_Formula_One_tests_Barcelona.jpg',
    attribution: {
      photographer: 'Lukas Raich',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alexander_Albon_2019_Formula_One_tests_Barcelona.jpg',
      commonsTitle: 'Alexander Albon 2019 Formula One tests Barcelona',
    },
  },
  gasly: {
    driverId: 'gasly',
    name: 'Pierre Gasly',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Pierre_Gasly_2019_Formula_One_tests_Barcelona.jpg/440px-Pierre_Gasly_2019_Formula_One_tests_Barcelona.jpg',
    attribution: {
      photographer: 'Lukas Raich',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pierre_Gasly_2019_Formula_One_tests_Barcelona.jpg',
      commonsTitle: 'Pierre Gasly 2019 Formula One tests Barcelona',
    },
  },
  senna: {
    driverId: 'senna',
    name: 'Ayrton Senna',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ayrton_Senna_8_%28cropped%29.jpg/440px-Ayrton_Senna_8_%28cropped%29.jpg',
    attribution: {
      photographer: 'Instituto Ayrton Senna',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ayrton_Senna_8_(cropped).jpg',
      commonsTitle: 'Ayrton Senna 8',
    },
  },
  michael_schumacher: {
    driverId: 'michael_schumacher',
    name: 'Michael Schumacher',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Michael_Schumacher_2012_Bahrain_GP_%28cropped%29.jpg/440px-Michael_Schumacher_2012_Bahrain_GP_%28cropped%29.jpg',
    attribution: {
      photographer: 'Morio',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Michael_Schumacher_2012_Bahrain_GP_(cropped).jpg',
      commonsTitle: 'Michael Schumacher 2012 Bahrain GP',
    },
  },
  prost: {
    driverId: 'prost',
    name: 'Alain Prost',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Alain_Prost_2011.jpg/440px-Alain_Prost_2011.jpg',
    attribution: {
      photographer: 'Guillaume Vachey',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alain_Prost_2011.jpg',
      commonsTitle: 'Alain Prost 2011',
    },
  },
  fangio: {
    driverId: 'fangio',
    name: 'Juan Manuel Fangio',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Juan_Manuel_Fangio_1952.jpg/440px-Juan_Manuel_Fangio_1952.jpg',
    attribution: {
      photographer: 'Public Domain / Wikimedia Commons',
      license: 'Public Domain',
      licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Juan_Manuel_Fangio_1952.jpg',
      commonsTitle: 'Juan Manuel Fangio 1952',
    },
  },
  lauda: {
    driverId: 'lauda',
    name: 'Niki Lauda',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Niki_Lauda_1982.jpg/440px-Niki_Lauda_1982.jpg',
    attribution: {
      photographer: 'Hans van Dijk / Anefo',
      license: 'CC0 / Public Domain',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Niki_Lauda_1982.jpg',
      commonsTitle: 'Niki Lauda 1982',
    },
  },
};

const CACHE_KEY = 'apex_driver_media_cache_v1';

function getLocalCache(): Record<string, DriverMedia> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCache(cache: Record<string, DriverMedia>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded or private mode
  }
}

/**
 * Retrieves driver photo and licensing attribution from Wikimedia Commons.
 * Fallbacks to live Wikimedia Commons Search API if unmapped, then caches locally.
 */
export async function getDriverMedia(
  driverId: string,
  driverName?: string
): Promise<DriverMedia | null> {
  // 1. Check curated verified dataset
  if (CURATED_COMMONS_MEDIA[driverId]) {
    return CURATED_COMMONS_MEDIA[driverId];
  }

  // 2. Check local client cache
  const cache = getLocalCache();
  if (cache[driverId]) {
    return cache[driverId];
  }

  // 3. If running in browser and search name provided, query Wikimedia Commons API
  if (typeof window !== 'undefined' && driverName) {
    try {
      const searchTerms = encodeURIComponent(`${driverName} Formula One driver`);
      const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${searchTerms}&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=400&format=json&origin=*`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const firstPage = Object.values(pages)[0] as any;
          const imgInfo = firstPage?.imageinfo?.[0];
          if (imgInfo?.thumburl) {
            const meta = imgInfo.extmetadata || {};
            const photographer =
              meta.Artist?.value?.replace(/<[^>]*>?/gm, '') || 'Wikimedia Commons Contributor';
            const license = meta.LicenseShortName?.value || 'Creative Commons';
            const licenseUrl =
              meta.LicenseUrl?.value || 'https://creativecommons.org/licenses/';
            const sourceUrl =
              imgInfo.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(firstPage.title)}`;

            const mediaRecord: DriverMedia = {
              driverId,
              name: driverName,
              thumbUrl: imgInfo.thumburl,
              attribution: {
                photographer: photographer.slice(0, 50),
                license,
                licenseUrl,
                sourceUrl,
                commonsTitle: firstPage.title,
              },
            };

            cache[driverId] = mediaRecord;
            setLocalCache(cache);
            return mediaRecord;
          }
        }
      }
    } catch {
      // Ignore network errors; fallback gracefully to abstract generated avatar
    }
  }

  return null;
}

/**
 * Returns all active image attributions for legal compliance / credits modal.
 */
export function getAllMediaAttributions(): DriverMedia[] {
  const cache = getLocalCache();
  const merged: Record<string, DriverMedia> = { ...CURATED_COMMONS_MEDIA, ...cache };
  return Object.values(merged);
}
