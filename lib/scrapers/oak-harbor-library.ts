import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-library';

export async function scrapeOakHarborLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    branchCode: 'OHE',
    town: 'Oak Harbor',
    location: 'Oak Harbor Library',
    source: 'Oak Harbor Library',
  });
}
