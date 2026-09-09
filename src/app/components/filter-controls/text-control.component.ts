import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-text-control', template: `<label [for]="id">{{ filter.label }}</label><input [id]="id" type="text" [ngModel]="value" [ngModelOptions]="{ standalone: true }" (ngModelChange)="value=$event; emit($event || null)" [placeholder]="placeholder" [required]="filter.required" [attr.aria-label]="filter.label">`})
export class TextControlComponent extends BaseFilterControl { value = ''; protected override restoreDefault(): void { this.value = this.filter.default == null ? '' : String(this.filter.default); } }
