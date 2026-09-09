import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { ApiError, DocumentDetail } from '../../models/search-api.models';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-pdf-viewer',
  template: `
    <p *ngIf="loading">Loading document…</p>
    <p *ngIf="error" role="alert">{{ error }}</p>
    <ngx-extended-pdf-viewer *ngIf="fileUrl"
      #pdfViewer
      [src]="fileUrl"
      [useBrowserLocale]="true"
      [textLayer]="true"
      [zoom]="'page-width'"
      [page]="data.page"
      [showSidebarButton]="true"
      [showFindButton]="true"
      language="ar"
      (pdfLoaded)="onPdfLoaded()"
      (pageRendered)="onPageRendered($event)">
    </ngx-extended-pdf-viewer>
  `,
  styles: [`
    ngx-extended-pdf-viewer { width: 100%; height: 90vh; }
  `]
})
export class PdfViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pdfViewer') pdfViewer!: NgxExtendedPdfViewerComponent;

  private isPdfLoaded = false;
  private targetPage: number;
  loading = true;
  error = '';
  fileUrl?: string;
  document?: DocumentDetail;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { documentId: string; searchTerms?: string[]; page?: number },
    private readonly searchService: SearchService,
  ) {
    this.targetPage = this.data?.page || 1;
  }

  ngOnInit(): void {
    this.searchService.getDocument(this.data.documentId).subscribe({
      next: document => {
        this.document = document;
        const sourceEndpoint = this.searchService.getSourceUrl(document.id);
        if (!document.source_url) {
          this.error = 'The source file is not available for this document.';
        } else {
          // Keep document URL construction inside the generic API service.
          this.fileUrl = document.source_url || sourceEndpoint;
        }
        this.loading = false;
      },
      error: (error: ApiError) => { this.error = error.message; this.loading = false; },
    });
  }

  ngAfterViewInit(): void {
    // nothing here
  }

  onPdfLoaded(): void {
    this.isPdfLoaded = true;

    const pdfApplication = (window as any).PDFViewerApplication;
    const eventBus = pdfApplication?.eventBus;

    // Re-apply when the search bar is opened
    eventBus?.on("findbaropen", () => {
      if (this.data?.searchTerms?.length) {
        this.tryBuiltInSearch(this.data.searchTerms || []);
      }
    });

    // Restore when the user clears the search box
    eventBus?.on("find", (evt: any) => {
      if ((!evt.query || evt.query.trim() === "") && this.data?.searchTerms?.length) {
        setTimeout(() => {
          this.tryBuiltInSearch(this.data.searchTerms || []);
        }, 100);
      }
    });

    setTimeout(() => {
      if (pdfApplication?.pdfViewer && pdfApplication.pdfViewer.currentPageNumber !== this.targetPage) {
        pdfApplication.pdfViewer.currentPageNumber = this.targetPage;
      }

      if (this.data?.searchTerms?.length) {
        setTimeout(() => {
          this.tryBuiltInSearch(this.data.searchTerms || []);
        }, 200);
      }
    }, 100);
  }

  onPageRendered(event: any): void {
    // no custom logic needed
  }

  ngOnDestroy(): void {
    // no cleanup needed
  }

  // 🔎 Main search logic - now handles ALL terms
  private async tryBuiltInSearch(terms: string[]) {
    if (!this.isPdfLoaded || !terms.length) return;

    const pdfApplication = (window as any).PDFViewerApplication;
    const pdfViewer = pdfApplication?.pdfViewer;

    if (!pdfViewer) return;

    // Find the best page (based on first term) and collect all matched texts
    const firstTerm = terms[0];
    const match = await this.findNearestPage(pdfViewer, firstTerm, this.targetPage);
    
    if (match) {
      pdfViewer.currentPageNumber = match.page;
      
      // Collect all search terms (with their original text including Tatweel)
      const allMatchedTexts: string[] = [];
      
      for (const term of terms) {
        const matchedText = await this.findInPage(pdfViewer, term, match.page);
        if (matchedText) {
          allMatchedTexts.push(matchedText);
        } else {
          // If not found on current page, use the normalized term
          allMatchedTexts.push(term);
        }
      }
      
      // Dispatch search with all terms (no spaces between them, joined directly)
      setTimeout(() => this.dispatchMultipleSearch(allMatchedTexts), 300);
    } else {
      console.warn("Search term not found in document");
    }
  }

  // Search one page and return first matching substring (with Tatweel)
  private async findInPage(pdfViewer: any, term: string, pageNumber: number): Promise<string | null> {
    try {
      const page = await pdfViewer.pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const rawText = textContent.items.map((i: any) => i.str).join(" ");

      const normalizedRaw = this.normalizeArabic(rawText);
      const normalizedTerm = this.normalizeArabic(term);

      if (normalizedRaw.includes(normalizedTerm)) {
        // Extract substring with Tatweel
        const regex = new RegExp(normalizedTerm.replace(/\s+/g, "\\s*"), "g");

        // Walk through words to find original substring
        const words = rawText.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
          const candidate = words.slice(i, i + term.split(" ").length).join(" ");
          if (this.normalizeArabic(candidate) === normalizedTerm) {
            return candidate; // return with Tatweel
          }
        }
        return term; // fallback
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  // Search multiple pages around current
  private async findNearestPage(pdfViewer: any, term: string, fromPage: number): Promise<{ page: number, text: string } | null> {
    const totalPages = pdfViewer.pagesCount;

    for (let offset = 0; offset < totalPages; offset++) {
      const prev = fromPage - offset;
      if (prev >= 1) {
        const match = await this.findInPage(pdfViewer, term, prev);
        if (match) return { page: prev, text: match };
      }

      const next = fromPage + offset;
      if (next <= totalPages) {
        const match = await this.findInPage(pdfViewer, term, next);
        if (match) return { page: next, text: match };
      }
    }
    return null;
  }

  // Dispatch multiple search terms to PDF.js event bus
  // Terms are joined with NEWLINE separator (no spaces)
  private dispatchMultipleSearch(searchTerms: string[]) {
    const pdfApplication = (window as any).PDFViewerApplication;
    const eventBus = pdfApplication?.eventBus;
    if (!eventBus) return;

    // For single term: use the term directly with phraseSearch=true
    // For multiple terms: join with newline and use phraseSearch=false
    const isSingleTerm = searchTerms.length === 1;
    const combinedQuery = isSingleTerm ? searchTerms[0] : searchTerms.join('\n');

    console.log('Combined Query:', combinedQuery);
    console.log('Search terms array:', searchTerms);
    console.log('Phrase search mode:', isSingleTerm);

    eventBus.dispatch("find", {
      source: this,
      type: "find",
      query: combinedQuery,
      phraseSearch: isSingleTerm,  // 🔑 true for single term, false for multiple
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,          // 🔑 Highlight all occurrences
      findPrevious: false
    });
  }

  // Remove Tatweel + diacritics for comparison
  private normalizeArabic(text: string): string {
    return text
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // remove harakat
      .replace(/ـ/g, "") // remove Tatweel
      .replace(/\s+/g, " ") // normalize spaces
      .trim();
  }
}
