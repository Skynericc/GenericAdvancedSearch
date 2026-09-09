import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppConfig, FacetsResponse, SearchResultPage } from '../../models/search-api.models';
import { ConfigStore } from '../../services/config.store';
import { FacetStore } from '../../services/facet.store';
import { SearchService } from '../../services/search.service';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchComponent>;
  const config: AppConfig = {
    branding: { title: 'Generic search', search_placeholder: 'Search documents' },
    filters: [{ name: 'type', label: 'Type', control: 'dropdown', order: 1, type: 'string', operation: 'equality', required: false }],
    result_card_fields: ['title'],
    search: { lexical: true, semantic: false, semantic_text: false },
    pagination: { default_page_size: 10, max_page_size: 25 },
  };
  const facets: FacetsResponse = { filters: { type: { available_count: 1, values: [{ value: 'Report', count: 1 }] } } };
  const page: SearchResultPage = { hits: [{ id: 'doc-1', metadata: { title: 'Configured result' } }], page: 1, page_size: 10, total_hits: 1, total_pages: 1, has_previous: false, has_next: false };
  const search = jasmine.createSpy('search').and.returnValue(of(page));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SearchComponent],
      providers: [
        { provide: SearchService, useValue: { search } },
        { provide: ConfigStore, useValue: { config$: of(config) } },
        { provide: FacetStore, useValue: { facets$: of(facets) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchComponent);
  });

  it('renders the configured filter panel and result cards after a mocked search', () => {
    fixture.detectChanges();
    fixture.componentInstance.query = 'budget';
    fixture.componentInstance.search();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(search).toHaveBeenCalledWith(jasmine.objectContaining({ lexical: { first_of: ['budget'] }, page_size: 10 }));
    expect(element.querySelector('app-filter-panel')).not.toBeNull();
    expect(element.querySelector('app-result-card')).not.toBeNull();
    expect(element.textContent).toContain('1');
  });
});
