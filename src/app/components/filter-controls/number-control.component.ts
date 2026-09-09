import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-number-control', template: `<label [for]="id">{{ filter.label }}</label><input [id]="id" type="number" [attr.min]="minBound" [attr.max]="maxBound" [ngModel]="value" [ngModelOptions]="{ standalone: true }" (ngModelChange)="value=$event; emit(value === '' || value === null ? null : value)" [placeholder]="placeholder" [required]="filter.required" [attr.aria-label]="filter.label">`})
export class NumberControlComponent extends BaseFilterControl { value: number | '' = ''; protected override restoreDefault(): void { this.value = typeof this.filter.default === 'number' ? this.filter.default : ''; } }
