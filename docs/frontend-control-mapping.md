# Config to UI control mapping

The frontend does not infer a UI from a field name. `GET /api/config` returns a concrete `control` for every visible filter; `FilterPanelComponent` dispatches that value to the matching component below. `GET /api/facets` supplies all dynamic choices and bounds. The complete type/operation compatibility table is mirrored in `CONTROL_MAPPING_TABLE` in `src/app/models/search-api.models.ts`; the backend resolves the default before the response is sent.

| Config type + operation | Resolved default | Valid control overrides |
|---|---|---|
| `string` + `equality` | `dropdown` | `dropdown`, `radio` |
| `string` + `contains` | `text` | `text` |
| `date` + `equality` | `date` | `date` |
| `date` + `range` | `date_range` | `date_range` |
| `int` + `equality` | `number` | `number`, `dropdown` |
| `int` + `range` | `number_range` | `number_range` |
| `float` + `equality` | `number` | `number` |
| `float` + `range` | `number_range` | `number_range` |
| `bool` + `equality` | `checkbox` | `checkbox`, `toggle` |
| `list` + `contains` | `multi_select` | `multi_select`, `checkbox_group` |

| Config `control` | Component | Facet data consumed | Search payload |
|---|---|---|---|
| `text` | `TextControlComponent` | none | string |
| `dropdown` | `DropdownControlComponent` | `values` | scalar |
| `radio` | `RadioControlComponent` | `values` | scalar |
| `date` | `DateControlComponent` | `min`, `max` | ISO date |
| `date_range` | `DateRangeControlComponent` | `min`, `max` | `{ min?, max? }` |
| `number` | `NumberControlComponent` | `min`, `max` | number |
| `number_range` | `NumberRangeControlComponent` | `min`, `max` | `{ min?, max? }` |
| `checkbox` | `CheckboxControlComponent` | none | boolean |
| `toggle` | `ToggleControlComponent` | none | boolean |
| `multi_select` | `MultiSelectControlComponent` | `values` | list |
| `checkbox_group` | `CheckboxGroupControlComponent` | `values` | list |

Changing `frontend.filters` order, labels, control, placeholder, or defaults—or adding/removing a visible field—in YAML changes the next rendered panel without a frontend edit. Result cards independently render the ordered `result_card_fields` array from the same config.
