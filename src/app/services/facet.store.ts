import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { FacetsResponse } from '../models/search-api.models';
import { SearchService } from './search.service';

/**
 * Session cache for GET /facets.
 *
 * The generic backend currently returns corpus-wide facet summaries, not
 * filter-dependent counts. Loading once is therefore both correct and avoids
 * a redundant round trip on every search. Revisit this policy if the API adds
 * query-aware facets.
 */
@Injectable({ providedIn: 'root' })
export class FacetStore {
  readonly facets$: Observable<FacetsResponse> = this.searchService.getFacets().pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  constructor(private readonly searchService: SearchService) {}
}
