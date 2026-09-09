export type ControlType =
  | 'text' | 'dropdown' | 'radio' | 'date' | 'date_range'
  | 'number' | 'number_range' | 'checkbox' | 'toggle'
  | 'multi_select' | 'checkbox_group';

/**
 * The frontend deliberately consumes the backend's resolved `control` value.
 * This table documents the complete config -> UI contract in one place; the
 * backend remains the source of truth for resolving a type/operation pair.
 */
export interface ControlMapping {
  type: string;
  operation: string;
  defaultControl: ControlType;
  allowedControls: readonly ControlType[];
  facetInput: 'none' | 'values' | 'bounds';
  payload: 'scalar' | 'range' | 'boolean' | 'list' | 'text';
}

export const CONTROL_MAPPING_TABLE: readonly ControlMapping[] = [
  { type: 'string', operation: 'equality', defaultControl: 'dropdown', allowedControls: ['dropdown', 'radio'], facetInput: 'values', payload: 'scalar' },
  { type: 'string', operation: 'contains', defaultControl: 'text', allowedControls: ['text'], facetInput: 'none', payload: 'text' },
  { type: 'date', operation: 'equality', defaultControl: 'date', allowedControls: ['date'], facetInput: 'bounds', payload: 'scalar' },
  { type: 'date', operation: 'range', defaultControl: 'date_range', allowedControls: ['date_range'], facetInput: 'bounds', payload: 'range' },
  { type: 'int', operation: 'equality', defaultControl: 'number', allowedControls: ['number', 'dropdown'], facetInput: 'values', payload: 'scalar' },
  { type: 'int', operation: 'range', defaultControl: 'number_range', allowedControls: ['number_range'], facetInput: 'bounds', payload: 'range' },
  { type: 'float', operation: 'equality', defaultControl: 'number', allowedControls: ['number'], facetInput: 'values', payload: 'scalar' },
  { type: 'float', operation: 'range', defaultControl: 'number_range', allowedControls: ['number_range'], facetInput: 'bounds', payload: 'range' },
  { type: 'bool', operation: 'equality', defaultControl: 'checkbox', allowedControls: ['checkbox', 'toggle'], facetInput: 'values', payload: 'boolean' },
  { type: 'list', operation: 'contains', defaultControl: 'multi_select', allowedControls: ['multi_select', 'checkbox_group'], facetInput: 'values', payload: 'list' },
];

export const CONTROL_TYPES: readonly ControlType[] = CONTROL_MAPPING_TABLE
  .flatMap(mapping => mapping.allowedControls)
  .filter((control, index, controls) => controls.indexOf(control) === index);

export interface BrandingConfig {
  title: string;
  subtitle?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  search_placeholder?: string | null;
  semantic_search_placeholder?: string | null;
  direction?: 'ltr' | 'rtl' | null;
}

export interface FrontendLabels {
  search_button: string;
  admin_link: string;
  show_filters: string;
  hide_filters: string;
  reset: string;
  apply_filters: string;
  export_full?: string;
  result_count: string;
  no_results: string;
  empty_state: string;
  previous: string;
  next: string;
  semantic_search?: string;
  semantic_search_hint?: string;
  semantic_search_placeholder?: string;
  facets_error?: string;
}

export interface FilterDefinition {
  name: string;
  label: string;
  control: ControlType;
  order: number;
  placeholder?: string | null;
  type: string;
  item_type?: string | null;
  operation: string;
  required: boolean;
  default?: unknown;
}

export interface FacetValue { value: string | number | boolean; count: number; }
export interface FilterFacet {
  available_count: number;
  values?: FacetValue[];
  min?: string | number | null;
  max?: string | number | null;
}

export interface AppConfig {
  branding: BrandingConfig;
  labels?: FrontendLabels;
  filters: FilterDefinition[];
  result_card_fields: string[];
  search: { lexical: boolean; semantic: boolean; semantic_text: boolean };
  pagination: { default_page_size: number; max_page_size: number };
}

export interface FacetsResponse { filters: Record<string, FilterFacet>; }
export interface SearchSnippet { text: string; highlight_ranges: Array<[number, number]>; }
export interface SearchHit {
  id: string;
  score?: number | null;
  matched_fields?: string[];
  snippet?: SearchSnippet | null;
  metadata: Record<string, unknown>;
  document_url?: string | null;
  source_url?: string | null;
}
export interface SearchResultPage {
  hits: SearchHit[];
  page: number;
  page_size: number;
  total_hits: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export type FilterValue = string | number | boolean | string[] | number[] |
  { min?: string | number; max?: string | number } | null;
