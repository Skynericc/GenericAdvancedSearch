import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
import { parseCalendarDate } from './calendar-date.utils';

@Component({
  selector: 'app-date-range-control',
  template: `<fieldset [attr.aria-required]="filter.required">
    <legend>{{ filter.label }}</legend>
    <div class="range-field">
      <label [for]="id + '-min'">{{ placeholder || 'From' }}</label>
      <p-calendar
        [inputId]="id + '-min'"
        [(ngModel)]="minValue"
        [view]="'month'"
        [numberOfMonths]="1"
        [appendTo]="'body'"
        dateFormat="yy-mm"
        [showIcon]="true"
        [readonlyInput]="true"
        [placeholder]="placeholder"
        [attr.aria-label]="filter.label + ' ' + (placeholder || 'From')"
        (ngModelChange)="changedMin($event)">
      </p-calendar>
    </div>
    <div class="range-field">
      <label [for]="id + '-max'">{{ placeholder || 'To' }}</label>
      <p-calendar
        [inputId]="id + '-max'"
        [(ngModel)]="maxValue"
        [view]="'month'"
        [numberOfMonths]="1"
        [appendTo]="'body'"
        dateFormat="yy-mm"
        [showIcon]="true"
        [readonlyInput]="true"
        [placeholder]="placeholder"
        [attr.aria-label]="filter.label + ' ' + (placeholder || 'To')"
        (ngModelChange)="changedMax($event)">
      </p-calendar>
    </div>
  </fieldset>`
})
export class DateRangeControlComponent extends BaseFilterControl {
  minValue: Date | null = null;
  maxValue: Date | null = null;

  protected override restoreDefault(): void {
    const value = this.filter.default;
    const range = value && typeof value === 'object' && !Array.isArray(value) ? value as { min?: unknown; max?: unknown } : {};
    this.minValue = this.toDate(range.min);
    this.maxValue = this.toDate(range.max);
  }

  changedMin(value: Date | null): void { this.minValue = value; this.emitRange(); }
  changedMax(value: Date | null): void { this.maxValue = value; this.emitRange(); }

  private emitRange(): void {
    const range = {
      min: this.minValue ? this.toApiDate(this.minValue) : undefined,
      max: this.maxValue ? this.toApiDate(this.maxValue) : undefined,
    };
    this.emit(range.min || range.max ? range : null);
  }

  private toDate(value: unknown): Date | null { return parseCalendarDate(value); }

  private toApiDate(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
