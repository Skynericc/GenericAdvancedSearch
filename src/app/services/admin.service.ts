import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UpdateDocumentPayload = {
  filename: string;
  doctype?: string | null;
  lawnumber?: string | null;
  date?: string | null;
  subjects?: string[] | null;
  signatures?: string[] | null;
  path?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  startProcessDocuments(files: File[]): Observable<any> {
    const form = new FormData();
    for (const f of files) {
      form.append('files', f, f.name);
    }
    form.append('source', 'admin-ui');
    return this.http.post(`${this.apiUrl}/admin/process`, form);
  }

  openProgressStream(jobId: string): EventSource {
    return new EventSource(`${this.apiUrl}/admin/progress/${jobId}`);
  }

  getAdminStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/status`);
  }

  getJobSnapshot(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/job/${jobId}`);
  }

  getDocumentsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/documents/summary`);
  }

  updateDocumentMeta(payload: UpdateDocumentPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/documents/update`, payload);
  }

  getFilterOptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filters/options`);
  }
}