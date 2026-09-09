import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AppConfig, FacetsResponse, FilterValue, SearchResultPage } from '../../models/search-api.models';
import { SearchService } from '../../services/search.service';

@Component({ selector: 'app-search', templateUrl: './search.component.html', styleUrls: ['./search.component.css'] })
export class SearchComponent implements OnInit {
  config?: AppConfig; facets?: FacetsResponse; results?: SearchResultPage;
  query = ''; useSemantic = false; showFilters = true; loading = true; error = '';
  filterValues: Record<string, FilterValue> = {};
  constructor(private readonly searchService: SearchService) {}
  get searchPlaceholder(): string {
    if (!this.config) return '';
    return this.useSemantic
      ? this.config.branding.semantic_search_placeholder || this.config.labels?.semantic_search_placeholder || this.config.branding.search_placeholder || ''
      : this.config.branding.search_placeholder || '';
  }
  ngOnInit(): void {
    forkJoin({ config: this.searchService.getConfig(), facets: this.searchService.getFacets() }).subscribe({
      next: ({config, facets}) => { this.config = config; this.facets = facets; this.applyDefaults(); this.loading = false; },
      error: () => { this.error = 'Unable to load the search configuration.'; this.loading = false; }
    });
  }
  search(page = 1): void {
    if (!this.config) return;
    const text = this.query.trim();
    const body: any = { filters: this.filterValues, page, page_size: this.config.pagination.default_page_size };
    if (this.useSemantic && this.config.search.semantic_text && text) body.semantic_text = [text];
    else body.lexical = { first_of: text ? [text] : [] };
    this.error = ''; this.loading = true;
    this.searchService.search(body).subscribe({ next: result => { this.results = result; this.loading = false; }, error: err => { this.error = err?.error?.error?.message || 'Search failed.'; this.loading = false; } });
  }
  reset(): void {
    const wasVisible = this.showFilters;
    this.filterValues = {}; this.applyDefaults(); this.query = ''; this.useSemantic = false; this.results = undefined;
    // FilterControl intentionally has only filter/facet/valueChange. Recreate it
    // so its config default is restored without introducing a fourth input.
    this.showFilters = false;
    Promise.resolve().then(() => this.showFilters = wasVisible);
  }
  previous(): void { if (this.results?.has_previous) this.search(this.results.page - 1); }
  next(): void { if (this.results?.has_next) this.search(this.results.page + 1); }
  private applyDefaults(): void { if (this.config) for (const f of this.config.filters) if (f.default !== null && f.default !== undefined) this.filterValues[f.name] = f.default as FilterValue; }
}
