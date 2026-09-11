import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-checkbox-group-control', template: `<fieldset [attr.aria-required]="filter.required"><legend>{{ filter.label }}</legend><div *ngFor="let option of options; let i = index"><input type="checkbox" [id]="optionId(i)" [checked]="isSelected(option.value)" (change)="toggle(option.value, $any($event.target).checked)"><label [for]="optionId(i)">{{ optionLabel(option.value) }}<ng-container *ngIf="option.count !== undefined"> ({{ option.count }})</ng-container></label></div></fieldset>`})
export class CheckboxGroupControlComponent extends BaseFilterControl {
  value: unknown[] = [];
  protected override restoreDefault(): void { this.value = Array.isArray(this.filter.default) ? [...this.filter.default] : []; }
  optionId(index: number): string { return `${this.id}-option-${index}`; }
  isSelected(option: unknown): boolean { return this.value.includes(option); }
  toggle(option: unknown, checked: boolean): void {
    this.value = checked ? [...this.value, option] : this.value.filter(value => value !== option);
    this.emit(this.value as any);
  }
}
