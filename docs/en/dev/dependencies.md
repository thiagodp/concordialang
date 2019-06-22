# Dependencies

About the virtual namespaces:
- `ast` depends on
  - `nlp`:
    - `Step` depends on `NLPResult`
    - `UIElement` depends on `Entities` and `NLPResult`
- `nlp` has no dependencies
- `req` depends on
  - `ast`:
    - `DatabaseInterface` depends on `Database`
    - `InMemoryTableInterface` depends on `Table`
    - `LocatedException` depends on `Location`
