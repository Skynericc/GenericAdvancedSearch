import { Component } from '@angular/core';
import { BaseFilterControl } from './filter-control';
@Component({selector: 'app-checkbox-control', template: `<div class="boolean-control"><input [id]="id" type="checkbox" [checked]="value" (change)="setValue($any($event.target).checked)" [attr.aria-label]="filter.label"><label [for]="id">{{ filter.label }}</label></div>`})
export class CheckboxControlComponent extends BaseFilterControl {
  value = false;
  protected override restoreDefault(): void { this.value = this.filter.default === true; }
  setValue(value: boolean): void { this.value = value; this.emit(value); }
}
