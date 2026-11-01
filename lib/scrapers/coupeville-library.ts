import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-common';

/**
 * Scrape Coupeville Library events from the Sno-Isle BiblioCommons SPA.
 */
export async function scrapeCoupevilleLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    pageUrl: 'https://sno-isle.bibliocommons.com/v2/events?location=coupeville',
    location: 'Coupeville Library',
    town: 'Coupeville',
    source: 'Coupeville Library',
    logPrefix: '[scrapeCoupevilleLibrary]',
  });
}
