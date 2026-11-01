import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-common';

/**
 * Scrape Langley Library events from the Sno-Isle BiblioCommons SPA.
 */
export async function scrapeLangleyLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    pageUrl: 'https://sno-isle.bibliocommons.com/v2/events?location=langley',
    location: 'Langley Library',
    town: 'Langley',
    source: 'Langley Library',
    logPrefix: '[scrapeLangleyLibrary]',
  });
}
