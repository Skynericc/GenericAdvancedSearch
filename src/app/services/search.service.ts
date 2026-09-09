import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig, FacetsResponse, SearchResultPage } from '../models/search-api.models';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // The generic HTTP blueprint is mounted under /api by the Phase 4 backend.
  private readonly apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${this.apiUrl}/config`);
  }

  getFacets(): Observable<FacetsResponse> {
    return this.http.get<FacetsResponse>(`${this.apiUrl}/facets`);
  }

  search(body: {
    lexical?: { first_of: string[]; mandatory?: string[] };
    semantic_text?: string[];
    filters?: Record<string, unknown>;
    page?: number;
    page_size?: number;
  }): Observable<SearchResultPage> {
    return this.http.post<SearchResultPage>(`${this.apiUrl}/search`, body);
  }

  getDocument(id: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/documents/${encodeURIComponent(id)}`);
  }
}
