import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterDefinition, FilterFacet } from '../../models/search-api.models';
import { BaseFilterControl } from './filter-control';
import { CheckboxControlComponent } from './checkbox-control.component';
import { CheckboxGroupControlComponent } from './checkbox-group-control.component';
import { DateControlComponent } from './date-control.component';
import { DateRangeControlComponent } from './date-range-control.component';
import { DropdownControlComponent } from './dropdown-control.component';
import { MultiSelectControlComponent } from './multi-select-control.component';
import { NumberControlComponent } from './number-control.component';
import { NumberRangeControlComponent } from './number-range-control.component';
import { RadioControlComponent } from './radio-control.component';
import { TextControlComponent } from './text-control.component';
import { ToggleControlComponent } from './toggle-control.component';

describe('config-driven filter controls', () => {
  const facet: FilterFacet = { available_count: 2, values: [{ value: 'A', count: 1 }, { value: 'B', count: 1 }], min: 1, max: 10 };
  const declarations = [CheckboxControlComponent, CheckboxGroupControlComponent, DateControlComponent, DateRangeControlComponent, DropdownControlComponent, MultiSelectControlComponent, NumberControlComponent, NumberRangeControlComponent, RadioControlComponent, TextControlComponent, ToggleControlComponent];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormsModule], declarations, schemas: [NO_ERRORS_SCHEMA] }).compileComponents();
  });

  function create<T extends BaseFilterControl>(component: Type<T>, control: FilterDefinition['control']): { fixture: ComponentFixture<T>; values: unknown[] } {
    const fixture = TestBed.createComponent(component);
    fixture.componentInstance.filter = { name: `field_${control}`, label: `Label ${control}`, control, order: 1, type: 'string', operation: 'equality', required: false };
    fixture.componentInstance.facet = facet;
    const values: unknown[] = [];
    fixture.componentInstance.valueChange.subscribe(value => values.push(value));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(`Label ${control}`);
    return { fixture, values };
  }

  it('text renders from config and emits text', () => { const { fixture, values } = create(TextControlComponent, 'text'); (fixture.componentInstance as any).emit('term'); expect(values).toEqual(['term']); });
  it('dropdown renders facet options and emits a scalar', () => { const { fixture, values } = create(DropdownControlComponent, 'dropdown'); fixture.componentInstance.select('A'); expect(values).toEqual(['A']); });
  it('radio renders facet options and emits a scalar', () => { const { fixture, values } = create(RadioControlComponent, 'radio'); fixture.componentInstance.select('A'); expect(values).toEqual(['A']); });
  it('date renders from config and emits an API date', () => { const { fixture, values } = create(DateControlComponent, 'date'); fixture.componentInstance.changed(new Date(2024, 0, 1)); expect(values).toEqual(['2024-01-01']); });
  it('date range renders from config and emits bounds', () => { const { fixture, values } = create(DateRangeControlComponent, 'date_range'); fixture.componentInstance.changedMin(new Date(2024, 0, 1)); expect(values).toEqual([{ min: '2024-01-01', max: undefined }]); });
  it('number renders bounds and emits a number', () => { const { fixture, values } = create(NumberControlComponent, 'number'); (fixture.componentInstance as any).emit(4); expect(values).toEqual([4]); });
  it('number range renders bounds and emits a range', () => { const { fixture, values } = create(NumberRangeControlComponent, 'number_range'); fixture.componentInstance.range = { min: 2, max: 8 }; fixture.componentInstance.changed(); expect(values).toEqual([{ min: 2, max: 8 }]); });
  it('checkbox renders from config and emits a boolean', () => { const { fixture, values } = create(CheckboxControlComponent, 'checkbox'); fixture.componentInstance.setValue(true); expect(values).toEqual([true]); });
  it('toggle renders from config and emits a boolean', () => { const { fixture, values } = create(ToggleControlComponent, 'toggle'); fixture.componentInstance.setValue(true); expect(values).toEqual([true]); });
  it('multi select renders facet options and emits a list', () => { const { fixture, values } = create(MultiSelectControlComponent, 'multi_select'); fixture.componentInstance.select(['A']); expect(values).toEqual([['A']]); });
  it('checkbox group renders facet options and emits a list', () => { const { fixture, values } = create(CheckboxGroupControlComponent, 'checkbox_group'); fixture.componentInstance.toggle('A', true); expect(values).toEqual([['A']]); });
});
