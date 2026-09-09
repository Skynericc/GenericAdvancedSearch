import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppConfig, FacetsResponse, FilterDefinition, FilterValue } from '../../models/search-api.models';

@Component({ selector: 'app-filter-panel', templateUrl: './filter-panel.component.html', styleUrls: ['./filter-panel.component.css'] })
export class FilterPanelComponent {
  @Input() config?: AppConfig;
  @Input() facets?: FacetsResponse;
  @Input() values: Record<string, FilterValue> = {};
  @Output() valuesChange = new EventEmitter<Record<string, FilterValue>>();
  get orderedFilters(): FilterDefinition[] {
    return [...(this.config?.filters || [])].sort((left, right) => left.order - right.order);
  }
  onValue(name: string, value: FilterValue): void {
    const next = { ...this.values };
    if (value === null || (Array.isArray(value) && value.length === 0)) delete next[name];
    else next[name] = value;
    this.valuesChange.emit(next);
  }
  trackByName(_: number, filter: { name: string }): string { return filter.name; }
}
