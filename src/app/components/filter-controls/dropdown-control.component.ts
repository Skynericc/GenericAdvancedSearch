import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-dropdown-control', template: `<label [for]="id">{{ filter.label }}</label><select [id]="id" [ngModel]="value" [ngModelOptions]="{ standalone: true }" (ngModelChange)="select($event)" [required]="filter.required" [attr.aria-label]="filter.label"><option [ngValue]="null">{{ placeholder }}</option><option *ngFor="let option of options" [ngValue]="option.value">{{ optionLabel(option.value) }}<ng-container *ngIf="option.count !== undefined"> ({{ option.count }})</ng-container></option></select>`})
export class DropdownControlComponent extends BaseFilterControl {
  value: unknown = null;
  protected override restoreDefault(): void { this.value = this.filter.default ?? null; }
  select(value: unknown): void { this.value = value; this.emit(value === null || value === undefined || value === '' ? null : value as any); }
}
