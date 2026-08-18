import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { SearchService } from 'src/app/services/search.service';
import { DescriptionDialogComponent } from '../description-dialog/description-dialog.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { DOCUMENT_TYPES, LEGAL_SUBJECTS, SelectOption } from 'src/app/constants/filters-data';

type SearchResultCard = {
  id: number;
  title: string;
  source: string;
  page: string | number;
  score?: number | null;
  snippet: string;

  filename?: string;
  doctype?: string;
  lawnumber?: string;
  date?: string;
  subjects?: string[];
  signatures?: string[];
  sourceRanges?: Array<[number, number] | number[] | { start: number; end: number }>;
};

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SearchComponent implements OnInit {
  allCards: SearchResultCard[] = [];

  searchQueries: string[] = [];
  searchQueryText = '';

  currentPage = 1;
  pageSize = 15;

  totalResults = 0;
  totalPages = 1;

  showFilters = false;

  mandatoryKeywords: string[] = [];
  isSemanticSearch = false;

  selectedSubjects: string[] = [];
  selectedSignatures: string[] = [];
  selectedFilenames: string[] = [];
  selectedDoctypes: string[] = [];
  selectedLawnumbers: string[] = [];

  // ✅ new: separate month/year boundaries
  selectedDateFromMonth: Date | null = null;
  selectedDateToMonth: Date | null = null;

  subjectOptions: SelectOption[] = [];
  signatureOptions: SelectOption[] = [];
  filenameOptions: SelectOption[] = [];
  doctypeOptions: SelectOption[] = [];

  // kept only if you still want raw options internally
  lawnumberOptions: SelectOption[] = [];

  // ✅ new: raw values + top-k filtered suggestions
  rawLawnumberValues: string[] = [];
  filteredLawnumberOptions: string[] = [];

  filtersLoading = false;
  filtersLoadError = '';

  expandedQueries: string[] = [];
  searchTerms: string[] = [];

  private _lastFilters: any = null;
  private expandedIds = new Set<number>();


  isExportingFull = false;

	minDate: Date | null = null;
	maxDate: Date | null = null;

  constructor(
    private searchService: SearchService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.enforceSemanticSearchRule();
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  toggleExpanded(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  copySnippet(text: string): void {
    const value = text || '';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
      return;
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {}
  }

  get cleanQueryCount(): number {
    return this.getCleanQueryList().length;
  }

  onSearchQueryTextChange(value: string): void {
    this.searchQueryText = value ?? '';
  }

  onSearchQueriesChipsChange(value: string[]): void {
    this.searchQueries = Array.isArray(value) ? value : [];
    this.enforceSemanticSearchRule();
  }

  onSemanticToggle(next: boolean): void {
    this.isSemanticSearch = !!next;

    if (this.isSemanticSearch) {
      const chips = (this.searchQueries || [])
        .map(q => (q || '').trim())
        .filter(q => q.length > 0);

      this.searchQueryText = chips[0] ?? this.searchQueryText ?? '';
    } else {
      const chips = this.parseQueries(this.searchQueryText || '');
      this.searchQueries = chips;
      this.searchQueryText = '';
    }

    this.enforceSemanticSearchRule();
  }

  // ✅ new: from-month changed
  onDateFromMonthChange(value: Date | null): void {
    this.selectedDateFromMonth = value ? this.startOfMonth(value) : null;
    this.normalizeMonthRange();
  }

  // ✅ new: to-month changed
  onDateToMonthChange(value: Date | null): void {
    this.selectedDateToMonth = value ? this.startOfMonth(value) : null;
    this.normalizeMonthRange();
  }

  // ✅ new: autocomplete search for law numbers
  onLawnumberSearch(event: any): void {
    const query = (event?.query || '').trim();

    if (!query) {
      this.filteredLawnumberOptions = [];
      return;
    }

    const normalizedQuery = this.normalizeForSearch(query);

    const startsWithMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const value of this.rawLawnumberValues) {
      if (this.selectedLawnumbers.includes(value)) continue;

      const normalizedValue = this.normalizeForSearch(value);

      if (normalizedValue.startsWith(normalizedQuery)) {
        startsWithMatches.push(value);
      } else if (normalizedValue.includes(normalizedQuery)) {
        containsMatches.push(value);
      }
    }

    this.filteredLawnumberOptions = [...startsWithMatches, ...containsMatches].slice(0, 100);
  }

  private parseQueries(text: string): string[] {
    const raw = (text || '')
      .split(/[\r\n,،]+/g)
      .map(q => q.trim())
      .filter(q => q.length > 0);

    return Array.from(new Set(raw));
  }

  get canUseSemanticSearch(): boolean {
    if (this.isSemanticSearch) return true;

    const chipsCount = (this.searchQueries || [])
      .map(q => (q || '').trim())
      .filter(q => q.length > 0).length;

    return chipsCount <= 1;
  }

  private enforceSemanticSearchRule(): void {
    const chipsCount = (this.searchQueries || [])
      .map(q => (q || '').trim())
      .filter(q => q.length > 0).length;

    if (chipsCount > 1 && this.isSemanticSearch) {
      this.isSemanticSearch = false;
    }
  }

  private getCleanQueryList(): string[] {
    if (this.isSemanticSearch) {
      const one = (this.searchQueryText || '').trim();
      return one.length ? [one] : [];
    }

    const cleaned = (this.searchQueries || [])
      .map(q => (q || '').trim())
      .filter(q => q.length > 0);

    return Array.from(new Set(cleaned));
  }

  applyFilters(): void {
    this.enforceSemanticSearchRule();
    this.normalizeMonthRange();
    this.currentPage = 1;
    this._lastFilters = this.buildFiltersPayload();
    this.fetchPage(this.currentPage);
  }

  hideResult(id: number): void {
    this.allCards = this.allCards.filter(x => x.id !== id);
    this.expandedIds.delete(id);
  }

  get pagedCards(): SearchResultCard[] {
    return this.allCards;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  openDialogById(cardId: number): void {
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    const mergedTerms = Array.from(
      new Set([...(this.searchTerms ?? []), ...(this.mandatoryKeywords ?? [])])
    );

    const titleParts = [card.filename || card.title];
    const metaParts = [
      card.doctype || '',
      card.lawnumber || '',
      card.date || '',
      card.page !== undefined && card.page !== null ? `صفحة ${card.page}` : ''
    ].filter(Boolean);

    this.dialog.open(DescriptionDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: {
        title: titleParts.join(''),
        subtitle: metaParts.join(' • '),
        description: card.snippet,
        searchTerms: mergedTerms,
        sourceRanges: card.sourceRanges || [],
        metadata: {
          filename: card.filename,
          doctype: card.doctype,
          lawnumber: card.lawnumber,
          date: card.date,
          subjects: card.subjects || [],
          signatures: card.signatures || [],
          page: card.page
        }
      }
    });
  }

  openDialog(card: any): void {
    const mergedTerms = Array.from(
      new Set([...(this.searchTerms ?? []), ...(this.mandatoryKeywords ?? [])])
    );

    this.dialog.open(DescriptionDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: {
        title: card.title || card.filename || 'تفاصيل النتيجة',
        subtitle: card.source || '',
        description: card.description || card.snippet || '',
        searchTerms: mergedTerms,
        sourceRanges: card.sourceRanges || []
      }
    });
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  openDocument(chunkId: number): void {
    this.searchService.openDocument(chunkId).subscribe({
      next: (res) => {
        const docType = (res?.type || '').toLowerCase();

        if (docType === 'pdf' && res?.file_url) {
          const mergedTerms = Array.from(
            new Set([...(this.searchTerms ?? []), ...(this.mandatoryKeywords ?? [])])
          );

          const page = this.coercePositivePage(res?.page);

          this.dialog.open(PdfViewerComponent, {
            width: '90vw',
            height: '95vh',
            data: {
              fileUrl: res.file_url,
              page,
              searchTerms: mergedTerms
            }
          });
          return;
        }

        alert('الملف الحالي غير مدعوم أو لا يحتوي على رابط PDF صالح.');
      },
      error: (err) => {
        console.error('❌ Error opening document:', err);
        if (err.status === 404) {
          alert('الملف غير موجود');
        } else {
          alert('خطأ في فتح الملف');
        }
      }
    });
  }

  private buildFiltersPayload() {
    const dateFrom = this.selectedDateFromMonth
      ? this.formatDateForBackend(this.startOfMonth(this.selectedDateFromMonth))
      : null;

    const dateTo = this.selectedDateToMonth
      ? this.formatDateForBackend(this.endOfMonth(this.selectedDateToMonth))
      : null;

    return {
      isSemanticSearch: this.isSemanticSearch,
      mandatoryKeywords: this.cleanStringList(this.mandatoryKeywords),
      filename: this.cleanStringList(this.selectedFilenames).length ? this.cleanStringList(this.selectedFilenames) : null,
      subjects: this.cleanStringList(this.selectedSubjects).length ? this.cleanStringList(this.selectedSubjects) : null,
      signatures: this.cleanStringList(this.selectedSignatures).length ? this.cleanStringList(this.selectedSignatures) : null,
      doctype: this.cleanStringList(this.selectedDoctypes).length ? this.cleanStringList(this.selectedDoctypes) : null,
      lawnumber: this.cleanStringList(this.selectedLawnumbers).length ? this.cleanStringList(this.selectedLawnumbers) : null,
      date_from: dateFrom,
      date_to: dateTo
    };
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;

    if (!this._lastFilters) {
      this._lastFilters = this.buildFiltersPayload();
    }
    this.fetchPage(this.currentPage);
  }

  private fetchPage(page: number): void {
    const filters = this._lastFilters ?? this.buildFiltersPayload();
    const queryList = this.getCleanQueryList();

    this.searchService.searchWithFilters(queryList, filters, page, this.pageSize).subscribe({
      next: (res) => {
        const results = res?.results || [];

        this.allCards = results.map((item: any) => {
          const pageToShow = item?.page_number ?? '-';

          const scoreCandidate =
            item?.semantic_score ?? item?.score ?? item?.similarity ?? item?.rerank_score ?? item?.distance;

          const score =
            typeof scoreCandidate === 'number' && !Number.isNaN(scoreCandidate)
              ? scoreCandidate
              : null;

          const title = item?.filename || 'وثيقة قانونية';
          const source = this.buildSourceLabel(item);

          return {
            id: item.id,
            title,
            source,
            page: pageToShow,
            score,
            snippet: item?.chunk || '',
            filename: item?.filename || '',
            doctype: item?.doctype || '',
            lawnumber: item?.lawnumber || '',
            date: item?.date || '',
            subjects: Array.isArray(item?.subjects) ? item.subjects : [],
            signatures: Array.isArray(item?.signatures) ? item.signatures : [],
            sourceRanges: Array.isArray(item?.source_ranges) ? item.source_ranges : []
          } as SearchResultCard;
        });

        this.expandedIds.clear();

        this.totalResults = res?.total_results ?? (results.length ?? 0);
        this.totalPages = res?.total_pages ?? (Math.ceil(this.totalResults / this.pageSize) || 1);
        this.expandedQueries = Array.isArray(res?.expanded_queries) ? res.expanded_queries : [];

        const combinedSearchTerms = [
          ...queryList,
          ...(this.expandedQueries || []),
          ...(this.mandatoryKeywords || [])
        ]
          .map((t: string) => (t || '').trim())
          .filter((t: string) => t.length > 0);

        this.searchTerms = Array.from(new Set(combinedSearchTerms));
      },
      error: (err) => {
        console.error('❌ Erreur backend :', err);
        this.allCards = [];
        this.totalResults = 0;
        this.totalPages = 1;
      }
    });
  }

  resetFilters(): void {
    this.mandatoryKeywords = [];
    this.selectedSubjects = [];
    this.selectedSignatures = [];
    this.selectedFilenames = [];
    this.selectedDoctypes = [];
    this.selectedLawnumbers = [];
    this.filteredLawnumberOptions = [];

    this.selectedDateFromMonth = null;
    this.selectedDateToMonth = null;

    this.searchQueries = [];
    this.searchQueryText = '';
    this.isSemanticSearch = false;

    this.currentPage = 1;
    this.totalResults = 0;
    this.totalPages = 1;
    this.allCards = [];
    this.searchTerms = [];
    this.expandedQueries = [];
    this._lastFilters = null;

    this.expandedIds.clear();
  }

  get visiblePages(): number[] {
    const maxVisible = 15;
    const pages: number[] = [];
    let startPage = Math.max(this.currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  exportFull(): void {
    if (this.totalResults === 0) return;

    const queries = this.getCleanQueryList();
    const filters = this._lastFilters ?? this.buildFiltersPayload();

    this.isExportingFull = true;

    this.searchService.exportFull(queries, filters).subscribe({
      next: (blob) => {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        this.downloadBlob(blob, `تصدير_كامل_${ts}.txt`);
        this.isExportingFull = false;
      },
      error: (err) => {
        console.error('❌ Export full failed:', err);
        alert('حدث خطأ أثناء التصدير الكامل');
        this.isExportingFull = false;
      }
    });
  }


	private loadFilterOptions(): void {
	  this.filtersLoading = true;
	  this.filtersLoadError = '';

	  this.searchService.getFilterOptions().subscribe({
		next: (res: any) => {
		  const backendSubjects: string[] = Array.isArray(res?.subjects) ? res.subjects : [];
		  const backendSignatures: string[] = Array.isArray(res?.signatures) ? res.signatures : [];
		  const backendFilenames: string[] = Array.isArray(res?.filenames) ? res.filenames : [];
		  const backendDoctypes: string[] = Array.isArray(res?.doctypes) ? res.doctypes : [];
		  const backendLawnumbers: string[] = Array.isArray(res?.lawnumbers) ? res.lawnumbers : [];
		  const dateBounds = res?.date_bounds || {};

		  this.subjectOptions = this.mergeOptions(LEGAL_SUBJECTS, backendSubjects);
		  this.doctypeOptions = this.mergeOptions(DOCUMENT_TYPES, backendDoctypes);
		  this.signatureOptions = this.toOptions(backendSignatures);
		  this.filenameOptions = this.toOptions(backendFilenames);

		  this.rawLawnumberValues = Array.from(
			new Set(
			  backendLawnumbers
				.map((x: string) => (x || '').trim())
				.filter((x: string) => !!x)
			)
		  ).sort((a: string, b: string) => a.localeCompare(b, 'ar'));

		  this.lawnumberOptions = this.rawLawnumberValues.map((v: string) => ({ label: v, value: v }));
		  this.filteredLawnumberOptions = [];

		  this.minDate = this.parseBackendDate(dateBounds?.min) ?? null;
		  this.maxDate = this.parseBackendDate(dateBounds?.max) ?? null;

		  this.filtersLoading = false;
		},
		error: (err) => {
		  console.error('❌ Failed to load filter options:', err);
		  this.filtersLoadError = 'تعذر تحميل خيارات الفلاتر من الخادم.';
		  this.subjectOptions = [...LEGAL_SUBJECTS];
		  this.doctypeOptions = [...DOCUMENT_TYPES];
		  this.signatureOptions = [];
		  this.filenameOptions = [];
		  this.rawLawnumberValues = [];
		  this.lawnumberOptions = [];
		  this.filteredLawnumberOptions = [];
		  this.minDate = null;
		  this.maxDate = null;
		  this.filtersLoading = false;
		}
	  });
	}
  
  
  

  private mergeOptions(preferred: SelectOption[], backendValues: string[]): SelectOption[] {
    const map = new Map<string, SelectOption>();

    for (const item of preferred || []) {
      const value = (item?.value || '').trim();
      if (!value) continue;
      map.set(value, { label: item.label, value: item.value });
    }

    for (const raw of backendValues || []) {
      const value = (raw || '').trim();
      if (!value) continue;
      if (!map.has(value)) {
        map.set(value, { label: value, value });
      }
    }

    const preferredValues = new Set((preferred || []).map(x => x.value));
    const preferredPart = (preferred || []).filter(x => map.has(x.value));
    const extraPart = Array.from(map.values())
      .filter(x => !preferredValues.has(x.value))
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'));

    return [...preferredPart, ...extraPart];
  }

  private toOptions(values: string[]): SelectOption[] {
    return Array.from(
      new Set((values || []).map(x => (x || '').trim()).filter(Boolean))
    )
      .sort((a, b) => a.localeCompare(b, 'ar'))
      .map(v => ({ label: v, value: v }));
  }

	private parseBackendDate(value: string | null | undefined): Date | null {
	  if (!value) return null;

	  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	  if (m) {
		const y = Number(m[1]);
		const mo = Number(m[2]) - 1;
		const d = Number(m[3]);
		return new Date(y, mo, d);
	  }

	  const parsed = new Date(value);
	  return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

  private formatDateForBackend(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildSourceLabel(item: any): string {
    const parts: string[] = [];

    if (item?.doctype) parts.push(item.doctype);
    if (item?.lawnumber) parts.push(item.lawnumber);
    if (item?.date) parts.push(item.date);

    return parts.length ? parts.join(' • ') : 'وثيقة قانونية';
  }

  private cleanStringList(values: string[] | null | undefined): string[] {
    return Array.from(
      new Set((values || []).map(v => (v || '').trim()).filter(v => v.length > 0))
    );
  }

  private coercePositivePage(value: any): number {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  // -------------------------
  // helpers for month range
  // -------------------------

  private normalizeMonthRange(): void {
    if (!this.selectedDateFromMonth || !this.selectedDateToMonth) return;

    const fromKey = this.monthKey(this.selectedDateFromMonth);
    const toKey = this.monthKey(this.selectedDateToMonth);

    if (fromKey > toKey) {
      const tmp = this.selectedDateFromMonth;
      this.selectedDateFromMonth = this.selectedDateToMonth;
      this.selectedDateToMonth = tmp;
    }
  }

  private monthKey(date: Date): number {
    return date.getFullYear() * 12 + date.getMonth();
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  // -------------------------
  // helpers for lawnumber autocomplete
  // -------------------------

  private normalizeForSearch(value: string): string {
    return (value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
}