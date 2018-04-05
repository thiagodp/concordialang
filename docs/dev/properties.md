# Properties

> User Interface Elements' properties

Operator precedence:

1. `equalTo`, `not` + `equalTo`
2. `in`, `not` + `in`
3. `computedBy`

Operator incompatibility:
```
Operator     | equalTo | not equalTo | in  | not in | computedBy |
-------------|---------|-------------|-----|--------|------------|
equalTo      | -       | no          | no  | no     | no         |
not equalTo  | no      | -           | no  | no     | no         |
in           | no      | no          | -   | yes    | no         |
not in       | no      | no          | yes | -      | no         |
computedBy   | no      | no          | no  | no     | -          |
```

Value-related properties precedence:

1. `value`
2. `min_value`, `max_value`, `min_length`, `max_length`
3. `format`
4. `required`

Value-related properties incompatibility:
```
Property     | value | min_value | max_value | min_length | max_length | format |
-------------|-------|-----------|-----------|------------|------------|--------|
value        | -     | no        | no        | no         | no         | no     |
min_value    | no    | -         | yes       | no         | no         | yes    |
max_value    | no    | yes       | -         | no         | no         | yes    |
min_length   | no    | no        | no        | -          | yes        | yes    |
max_length   | no    | no        | no        | yes        | -          | yes    |
format       | no    | yes       | yes       | yes        | yes        | -      |
```
Required is compatible with all properties.

**Note**: Since users do not enter other properties but those related to *value*,
          properties such as `color`, `width`, etc. **are not considered** but
          they can be used in Given/When/Then/Otherwise clausules as oracles.

## All properties:
- `id`
- `type`, defaults to `textbox`
- `editable`, defaults to `true` when editable `type`s are used (see [Editable Types](#EditableTypes)).
- `data type`, defaults to `string`
- `value`
- `min_length`
- `max_length`
- `min_value`
- `max_value`
- `format`
- `required`, defaults to `false`

## Editable Types:
- `checkbox`
- `fileInput`
- `select`
- `table`
- `textbox`
- `textarea`