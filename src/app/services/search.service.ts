import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type LegalFiltersPayload = {
  isSemanticSearch?: boolean;
  mandatoryKeywords?: string[];
  filename?: string[] | null;
  subjects?: string[] | null;
  signatures?: string[] | null;
  doctype?: string[] | null;
  lawnumber?: string[] | null;
  date?: { from?: string | null; to?: string | null } | null;
  date_from?: string | null;
  date_to?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getChunk(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chunk/${id}`);
  }

  openDocument(chunkId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/open/${chunkId}`);
  }

  openPdf(chunkId: number): Observable<any> {
    return this.openDocument(chunkId);
  }

  getFilterOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/filters/options`);
  }

  searchWithFilters(
    queries: string[] | string,
    filters: LegalFiltersPayload,
    page: number,
    pageSize: number
  ): Observable<any> {
    const qList = Array.isArray(queries)
      ? queries
      : ((queries || '').trim() ? [(queries || '').trim()] : []);

    const body: any = {
      queries: qList,
      query: Array.isArray(queries) ? '' : (queries || ''),
      ...filters,
      page,
      page_size: pageSize
    };

    return this.http.post<any>(`${this.apiUrl}/search-with-filters`, body);
  }


  exportFull(queries: string[], filters: LegalFiltersPayload): Observable<Blob> {
    const body: any = {
      queries,
      query: '',
      ...filters
    };
    return this.http.post(`${this.apiUrl}/export/full`, body, { responseType: 'blob' });
  }

  searchAdvanced(
    query: string,
    page: number,
    pageSize: number,
    isSemanticSearch: boolean = false
  ): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search-advanced`, {
      params: {
        q: query,
        page: String(page),
        page_size: String(pageSize),
        isSemanticSearch: String(isSemanticSearch)
      }
    });
  }
}