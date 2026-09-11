import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchHit } from '../../models/search-api.models';
import { legalDisplayValue, legalFieldLabel } from '../../models/legal-display';

@Component({ selector: 'app-result-card', templateUrl: './result-card.component.html', styleUrls: ['./result-card.component.css'] })
export class ResultCardComponent {
  @Input() hit!: SearchHit;
  @Input() fields: string[] = [];
  @Output() documentOpen = new EventEmitter<string>();

  get documentIdentifier(): string { return this.hit?.id || '—'; }
  get sourceFile(): string | null {
    const value = this.hit?.metadata?.['source_file'];
    return typeof value === 'string' && value.trim() ? value : null;
  }
  get sourcePage(): string | null {
    const value = this.hit?.metadata?.['source_page'];
    return typeof value === 'number' || typeof value === 'string' ? String(value) : null;
  }

  fieldLabel(field: string): string { return legalFieldLabel(field); }

  valueFor(field: string): string {
    const value = this.hit?.metadata?.[field];
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.map(item => legalDisplayValue(field, item)).join(', ') || '—';
    return legalDisplayValue(field, value);
  }

  openDocument(): void {
    this.documentOpen.emit(this.hit.id);
  }
}
