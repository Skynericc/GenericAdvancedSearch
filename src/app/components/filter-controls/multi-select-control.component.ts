import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-multi-select-control', template: `<label [for]="id">{{ filter.label }}</label><select [id]="id" class="multi-select-list" multiple [size]="listSize" [ngModel]="value" [ngModelOptions]="{ standalone: true }" (ngModelChange)="select($event)" [attr.aria-label]="filter.label" aria-multiselectable="true"><option *ngFor="let option of options" [ngValue]="option.value">{{ option.value }}<ng-container *ngIf="option.count !== undefined"> ({{ option.count }})</ng-container></option></select>`})
export class MultiSelectControlComponent extends BaseFilterControl {
  value: unknown[] = [];
  get listSize(): number { return Math.min(6, Math.max(3, this.options.length || 3)); }
  protected override restoreDefault(): void { this.value = Array.isArray(this.filter.default) ? [...this.filter.default] : []; }
  select(value: unknown[]): void { this.value = value || []; this.emit(this.value as any); }
}
