# Simulation Data Workflow

This simulation now uses a single feature data file:

- `features.txt`: authoritative dataset used by the UI

## Runtime loading

The JavaScript loader in `js/main.js` reads only `features.txt`.

## Maintenance policy

1. Make all data corrections directly in `features.txt`.
2. Keep roots, categories, and feature values consistent for every word form.
3. Preserve tab-separated column order for every row.

## Notes on grammatical display

English gender is normalized to `N/A` in the simulation logic to avoid incorrect labels such as male/female for English nouns and verbs.
