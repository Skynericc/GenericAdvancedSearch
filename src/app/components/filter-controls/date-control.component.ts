import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';

@Component({
  selector: 'app-date-control',
  template: `<label [for]="id">{{ filter.label }}</label>
    <p-calendar
      [inputId]="id"
      [(ngModel)]="value"
      [view]="'month'"
      [numberOfMonths]="1"
      [appendTo]="'body'"
      dateFormat="yy-mm"
      [showIcon]="true"
      [readonlyInput]="true"
      [minDate]="minDate"
      [maxDate]="maxDate"
      [placeholder]="placeholder"
      [required]="filter.required"
      [attr.aria-label]="filter.label"
      (ngModelChange)="changed($event)">
    </p-calendar>`
})
export class DateControlComponent extends BaseFilterControl {
  value: Date | null = null;

  protected override restoreDefault(): void {
    this.value = this.toDate(this.filter.default);
  }

  get minDate(): Date { return this.toDate(this.minBound) as Date; }
  get maxDate(): Date { return this.toDate(this.maxBound) as Date; }

  changed(value: Date | null): void {
    this.value = value;
    this.emit(value ? this.toApiDate(value) : null);
  }

  private toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toApiDate(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
