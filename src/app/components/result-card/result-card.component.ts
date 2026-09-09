import { Component, Input } from '@angular/core';
import { SearchHit } from '../../models/search-api.models';

@Component({ selector: 'app-result-card', templateUrl: './result-card.component.html', styleUrls: ['./result-card.component.css'] })
export class ResultCardComponent {
  @Input() hit!: SearchHit;
  @Input() fields: string[] = [];

  valueFor(field: string): string {
    const value = this.hit?.metadata?.[field];
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.map(item => this.displayValue(item)).join(', ') || '—';
    return this.displayValue(value);
  }

  private displayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return String(value);
  }
}
