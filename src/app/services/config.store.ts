import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { AppConfig } from '../models/search-api.models';
import { SearchService } from './search.service';

/**
 * Application-wide, read-only cache for the static config endpoint.
 * Facets are intentionally not cached here: their invalidation policy belongs
 * to the later facets-loading decision in Track B item 4.
 */
@Injectable({ providedIn: 'root' })
export class ConfigStore {
  readonly config$: Observable<AppConfig> = this.searchService.getConfig().pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  constructor(private readonly searchService: SearchService) {}
}
