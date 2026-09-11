import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiError, AppConfig, FacetsResponse, FilterValue, SearchRequest, SearchResultPage } from '../../models/search-api.models';
import { ConfigStore } from '../../services/config.store';
import { FacetStore } from '../../services/facet.store';
import { SearchService } from '../../services/search.service';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

@Component({ selector: 'app-search', templateUrl: './search.component.html', styleUrls: ['./search.component.css'] })
export class SearchComponent implements OnInit {
  config?: AppConfig; facets?: FacetsResponse; results?: SearchResultPage;
  query = ''; useSemantic = false; showFilters = true; loading = true; error?: ApiError;
  pageSize = 1;
  filterValues: Record<string, FilterValue> = {};
  constructor(
    private readonly searchService: SearchService,
    private readonly configStore: ConfigStore,
    private readonly facetStore: FacetStore,
    private readonly dialog: MatDialog,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}
  get searchPlaceholder(): string {
    if (!this.config) return '';
    return this.useSemantic
      ? this.config.branding.semantic_search_placeholder || this.config.labels?.semantic_search_placeholder || this.config.branding.search_placeholder || ''
      : this.config.branding.search_placeholder || '';
  }
  get errorTitle(): string {
    switch (this.error?.type) {
      case 'BadQueryError': return 'Please revise your search';
      case 'DocumentNotFound': return 'Document unavailable';
      case 'BadConfigError':
      case 'InternalError': return 'Search is temporarily unavailable';
      default: return 'Search unavailable';
    }
  }
  get errorMessage(): string {
    if (!this.error) return '';
    if (this.error.type === 'BadQueryError') return this.error.message;
    if (this.error.type === 'DocumentNotFound') return 'The requested document is no longer available.';
    if (this.error.type === 'BadConfigError' || this.error.type === 'InternalError') return 'We could not complete that request. Please try again later.';
    return this.error.message;
  }
  ngOnInit(): void {
    forkJoin({ config: this.configStore.config$, facets: this.facetStore.facets$ }).subscribe({
      next: ({config, facets}) => {
        this.config = config;
        this.facets = facets;
        // A project can enable text semantics without lexical search.
        this.useSemantic = !config.search.lexical && config.search.semantic_text;
        this.pageSize = this.boundedPageSize(config.pagination.default_page_size);
        this.applyDefaults();
        this.loading = false;
      },
      error: (error: ApiError) => { this.error = error; this.loading = false; }
    });
  }
  search(page = 1): void {
    if (!this.config) return;
    const isPageChange = this.results?.page !== undefined && this.results.page !== page;
    const text = this.query.trim();
    this.pageSize = this.boundedPageSize(this.pageSize);
    const body: SearchRequest = { filters: this.filterValues, page, page_size: this.pageSize };
    if ((this.useSemantic || !this.config.search.lexical) && this.config.search.semantic_text && text) {
      body.semantic_text = [text];
    } else if (this.config.search.lexical) {
      body.lexical = { first_of: text ? [text] : [] };
    } else {
      this.error = { type: 'BadConfigError', message: 'No browser-supported search mode is configured.', status: 500 };
      return;
    }
    this.error = undefined; this.loading = true;
    this.searchService.search(body).subscribe({
      next: result => {
        this.results = result;
        this.loading = false;
        if (isPageChange) window.setTimeout(() => this.focusFirstResult(), 0);
      },
      error: (err: ApiError) => { this.error = err; this.loading = false; }
    });
  }
  reset(): void {
    const wasVisible = this.showFilters;
    this.filterValues = {};
    this.query = '';
    this.useSemantic = false;
    this.results = undefined;

    // Reset means clear the visible controls, including configured defaults.
    // Controls are recreated without defaults while preserving the shared
    // FilterControl interface (filter, facet, valueChange).
    if (this.config) {
      this.config = {
        ...this.config,
        filters: this.config.filters.map(filter => ({ ...filter, default: undefined }))
      };
    }

    this.showFilters = false;
    Promise.resolve().then(() => this.showFilters = wasVisible);
  }
  previous(): void { if (this.results?.has_previous) this.search(this.results.page - 1); }
  next(): void { if (this.results?.has_next) this.search(this.results.page + 1); }
  openDocument(id: string): void {
    this.dialog.open(PdfViewerComponent, {
      width: '90vw',
      height: '95vh',
      data: { documentId: id, searchTerms: this.query.trim() ? [this.query.trim()] : [] },
    });
  }
  private applyDefaults(): void { if (this.config) for (const f of this.config.filters) if (f.default !== null && f.default !== undefined) this.filterValues[f.name] = f.default as FilterValue; }
  private focusFirstResult(): void {
    const firstResult = this.document.getElementById('first-result');
    if (!firstResult) return;
    firstResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    firstResult.focus({ preventScroll: true });
  }
  private boundedPageSize(value: number): number {
    const max = this.config?.pagination.max_page_size || 1;
    return Math.min(Math.max(Math.floor(Number(value)) || 1, 1), max);
  }
}
