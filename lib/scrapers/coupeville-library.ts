import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-library';

export async function scrapeCoupevilleLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    branchCode: 'CPE',
    town: 'Coupeville',
    location: 'Coupeville Library',
    source: 'Coupeville Library',
  });
}
