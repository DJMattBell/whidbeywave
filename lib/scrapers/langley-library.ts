import type { ScrapedEvent } from './types';
import { scrapeSnoIsleLibrary } from './sno-isle-library';

export async function scrapeLangleyLibrary(): Promise<ScrapedEvent[]> {
  return scrapeSnoIsleLibrary({
    branchCode: 'LAE',
    town: 'Langley',
    location: 'Langley Library',
    source: 'Langley Library',
  });
}
