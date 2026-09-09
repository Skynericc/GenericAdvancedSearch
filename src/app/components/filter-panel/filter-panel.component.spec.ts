import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppConfig, FacetsResponse, FilterDefinition } from '../../models/search-api.models';
import { CheckboxControlComponent } from '../filter-controls/checkbox-control.component';
import { CheckboxGroupControlComponent } from '../filter-controls/checkbox-group-control.component';
import { DateControlComponent } from '../filter-controls/date-control.component';
import { DateRangeControlComponent } from '../filter-controls/date-range-control.component';
import { DropdownControlComponent } from '../filter-controls/dropdown-control.component';
import { FilterPanelComponent } from './filter-panel.component';
import { MultiSelectControlComponent } from '../filter-controls/multi-select-control.component';
import { NumberControlComponent } from '../filter-controls/number-control.component';
import { NumberRangeControlComponent } from '../filter-controls/number-range-control.component';
import { RadioControlComponent } from '../filter-controls/radio-control.component';
import { TextControlComponent } from '../filter-controls/text-control.component';
import { ToggleControlComponent } from '../filter-controls/toggle-control.component';

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<FilterPanelComponent>;

  const controls = ['text', 'dropdown', 'radio', 'date', 'date_range', 'number', 'number_range', 'checkbox', 'toggle', 'multi_select', 'checkbox_group'] as const;
  const filters: FilterDefinition[] = controls.map((control, order) => ({
    name: `field_${control}`,
    label: `Label ${control}`,
    control,
    order,
    type: 'string',
    operation: 'equality',
    required: false,
  }));
  const config: AppConfig = {
    branding: { title: 'Test' },
    filters,
    result_card_fields: [],
    search: { lexical: true, semantic: false, semantic_text: false },
    pagination: { default_page_size: 10, max_page_size: 20 },
  };
  const facets: FacetsResponse = {
    filters: Object.fromEntries(filters.map(filter => [filter.name, {
      available_count: 2,
      values: [{ value: 'A', count: 1 }, { value: 'B', count: 1 }],
      min: filter.control.includes('date') ? '2020-01-01' : 0,
      max: filter.control.includes('date') ? '2024-01-01' : 100,
    }])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [
        FilterPanelComponent,
        CheckboxControlComponent,
        CheckboxGroupControlComponent,
        DateControlComponent,
        DateRangeControlComponent,
        DropdownControlComponent,
        MultiSelectControlComponent,
        NumberControlComponent,
        NumberRangeControlComponent,
        RadioControlComponent,
        TextControlComponent,
        ToggleControlComponent,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilterPanelComponent);
    fixture.componentInstance.config = config;
    fixture.componentInstance.facets = facets;
    fixture.detectChanges();
  });

  it('renders every ControlType from config with facet-backed choices and bounds', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.filter-control').length).toBe(controls.length);
    expect(element.querySelectorAll('input, select').length).toBeGreaterThanOrEqual(controls.length);
    expect(element.querySelectorAll('select option').length).toBeGreaterThan(0);
    expect(element.querySelector('input[type="date"]')?.getAttribute('min')).toBe('2020-01-01');
    expect(element.querySelector('input[type="number"]')?.getAttribute('min')).toBe('0');
    expect(element.textContent).toContain('A');
    expect(element.textContent).toContain('Label checkbox_group');
  });
});
