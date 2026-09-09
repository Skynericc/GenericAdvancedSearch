import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-number-range-control', template: `<fieldset [attr.aria-required]="filter.required"><legend>{{ filter.label }}</legend><div class="range-field"><label [for]="id + '-min'">{{ placeholder || 'Minimum' }}</label><input [id]="id + '-min'" type="number" [attr.min]="minBound" [attr.max]="maxBound" [(ngModel)]="range.min" [ngModelOptions]="{ standalone: true }" (ngModelChange)="changed()"></div><div class="range-field"><label [for]="id + '-max'">{{ placeholder || 'Maximum' }}</label><input [id]="id + '-max'" type="number" [attr.min]="minBound" [attr.max]="maxBound" [(ngModel)]="range.max" [ngModelOptions]="{ standalone: true }" (ngModelChange)="changed()"></div></fieldset>`})
export class NumberRangeControlComponent extends BaseFilterControl {
  range: { min?: number; max?: number } = {};
  protected override restoreDefault(): void { const d = this.filter.default; this.range = d && typeof d === 'object' && !Array.isArray(d) ? { ...(d as any) } : {}; }
  changed(): void { this.emit(this.range.min != null || this.range.max != null ? { ...this.range } : null); }
}
