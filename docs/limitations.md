# Known limitations

## Language

### Queries

- A query without a reference to a `Database` or a `Table` is not considered valid.
- More than one `Database` entity in the same query is not supported.
- More than one `Table` entity in the same query is not supported.


## Tool

### Language support

#### UI Elements
- Cannot handle **global** UI Elements, *i.e.*, those tagged with `@global` - Issue #19
  - Thus cannot refers to them in properties or queries or generate test cases from them
- Cannot **inherit** from other UI Elements, *i.e.*, use `@inherit` - Issue #17
- Cannot use properties inside messages - Issue #18
  - *E.g.*, `Otherwise I should see "${name} must have at least ${minlength} characters."` would receive the corresponding properties of the UI Element
- Queries must be declared in a single line
  - *E.g.*, `- value comes from "SELECT name FROM [MyDB].profession"`


#### Test Case Sentences
- Support to match tables - Issue #16
  - *E.g.*, `Then I see {My Table} as [Some Table]` would allow to assert whether the UI Element `My Table` has the same lines and columns as a declared table `Some Table`.