import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-radio-control', template: `<fieldset [attr.aria-required]="filter.required"><legend>{{ filter.label }}</legend><div *ngFor="let option of options; let i = index"><input type="radio" [id]="optionId(i)" [name]="id" [value]="option.value" [checked]="value === option.value" (change)="select(option.value)"><label [for]="optionId(i)">{{ optionLabel(option.value) }}<ng-container *ngIf="option.count !== undefined"> ({{ option.count }})</ng-container></label></div></fieldset>`})
export class RadioControlComponent extends BaseFilterControl {
  value: unknown = null;
  protected override restoreDefault(): void { this.value = this.filter.default ?? null; }
  optionId(index: number): string { return `${this.id}-option-${index}`; }
  select(value: unknown): void { this.value = value; this.emit(value as any); }
}
