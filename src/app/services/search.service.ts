import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiError, AppConfig, DocumentDetail, FacetsResponse, SearchRequest, SearchResultPage } from '../models/search-api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // The generic HTTP blueprint is mounted under /api by the Phase 4 backend.
  private readonly apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getConfig(): Observable<AppConfig> {
    return this.handleErrors(this.http.get<AppConfig>(`${this.apiUrl}/config`));
  }

  getFacets(): Observable<FacetsResponse> {
    return this.handleErrors(this.http.get<FacetsResponse>(`${this.apiUrl}/facets`));
  }

  search(body: SearchRequest): Observable<SearchResultPage> {
    return this.handleErrors(this.http.post<SearchResultPage>(`${this.apiUrl}/search`, body));
  }

  getDocument(id: string): Observable<DocumentDetail> {
    return this.handleErrors(this.http.get<DocumentDetail>(`${this.apiUrl}/documents/${encodeURIComponent(id)}`));
  }

  getSourceUrl(id: string): string {
    return `${this.apiUrl}/documents/${encodeURIComponent(id)}/source`;
  }

  private handleErrors<T>(request: Observable<T>): Observable<T> {
    return request.pipe(catchError(error => throwError(() => this.toApiError(error))));
  }

  private toApiError(error: HttpErrorResponse): ApiError {
    const payload = error.error?.error;
    if (payload && typeof payload.type === 'string' && typeof payload.message === 'string') {
      return { type: payload.type, message: payload.message, details: payload.details, status: error.status };
    }

    return {
      type: error.status === 0 ? 'NetworkError' : 'HttpError',
      message: error.status === 0 ? 'Unable to reach the search service.' : 'The search service returned an unexpected error.',
      status: error.status,
    };
  }
}
