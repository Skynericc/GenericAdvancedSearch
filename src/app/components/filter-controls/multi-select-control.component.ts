import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-multi-select-control', template: `
  <label [for]="id">{{ filter.label }}</label>
  <details class="multi-select-dropdown">
    <summary [id]="id" [attr.aria-label]="filter.label">{{ selectedLabel }}</summary>
    <div class="multi-select-options" role="group" [attr.aria-label]="filter.label">
      <label *ngFor="let option of options; let i = index" [for]="optionId(i)">
        <input type="checkbox" [id]="optionId(i)" [checked]="isSelected(option.value)" (change)="toggle(option.value, $any($event.target).checked)">
        <span>{{ optionLabel(option.value) }}<ng-container *ngIf="option.count !== undefined"> ({{ option.count }})</ng-container></span>
      </label>
    </div>
  </details>`})
export class MultiSelectControlComponent extends BaseFilterControl {
  value: unknown[] = [];
  get selectedLabel(): string {
    return this.value.length ? this.value.map(value => this.optionLabel(value)).join('، ') : (this.placeholder || this.filter.label);
  }
  protected override restoreDefault(): void { this.value = Array.isArray(this.filter.default) ? [...this.filter.default] : []; }
  optionId(index: number): string { return `${this.id}-option-${index}`; }
  isSelected(option: unknown): boolean { return this.value.includes(option); }
  toggle(option: unknown, checked: boolean): void {
    this.value = checked ? [...this.value, option] : this.value.filter(value => value !== option);
    this.emit(this.value as any);
  }
  select(value: unknown[]): void { this.value = value || []; this.emit(this.value as any); }
}
