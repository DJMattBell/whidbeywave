import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-library';

export async function scrapeSouthWhidbeyLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    branchCode: 'SWE',
    town: 'Freeland',
    location: 'South Whidbey Library',
    source: 'South Whidbey Library',
  });
}
