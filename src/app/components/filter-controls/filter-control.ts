import { Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FilterDefinition, FilterFacet, FilterValue } from '../../models/search-api.models';

/** The deliberately small contract shared by every config-driven control. */
export interface FilterControl {
  filter: FilterDefinition;
  facet?: FilterFacet;
  valueChange: EventEmitter<FilterValue>;
}

@Directive()
export abstract class BaseFilterControl implements FilterControl, OnChanges {
  @Input() filter!: FilterDefinition;
  @Input() facet?: FilterFacet;
  @Output() valueChange = new EventEmitter<FilterValue>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter']) this.restoreDefault();
  }

  protected emit(value: FilterValue): void { this.valueChange.emit(value); }
  protected restoreDefault(): void { /* concrete controls own their native value shape */ }
  get id(): string { return `filter-${this.filter.name}`; }
  get options() { return this.facet?.values || []; }
  get placeholder(): string { return this.filter.placeholder || ''; }
  get minBound(): string | number | null { return this.facet?.min ?? null; }
  get maxBound(): string | number | null { return this.facet?.max ?? null; }
}
