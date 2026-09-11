import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
import { parseCalendarDate } from './calendar-date.utils';

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

  changed(value: Date | null): void {
    this.value = value;
    this.emit(value ? this.toApiDate(value) : null);
  }

  private toDate(value: unknown): Date | null { return parseCalendarDate(value); }

  private toApiDate(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
