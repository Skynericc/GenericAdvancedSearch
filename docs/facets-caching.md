# Facet caching policy

The frontend loads `GET /api/facets` once per browser session through
`FacetStore` and shares the result across components.

This is intentional: the current generic backend defines facets as summaries
of the full visible corpus, not counts narrowed by the active `SearchRequest`.
Refetching after a search would therefore not change the data and would only
add latency. If the backend later supports query-aware facets, replace this
store with a cache keyed by the active filters/query and refresh it after each
search.
