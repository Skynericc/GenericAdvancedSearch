# Admin panel decision

The legacy `AdminService` and `AdminComponent` remain available through
`/admin` until further notice. They still depend on the pre-factory Flask
application's upload, progress-stream, metadata-update, and filter-option
endpoints; those endpoints are **not** part of the Generic Search Factory HTTP
contract.

This keeps existing administration workflows working while clearly separating
them from the generic search frontend. A later Phase 6/7 decision can either
define a generic administration API with its own contracts and authorization
model, or move the legacy admin UI into the project that owns its legacy
backend.
