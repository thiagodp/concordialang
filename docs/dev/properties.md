# Properties

> User Interface Elements' properties

Operator precedence:

1. `is`, `is not`
2. `in`, `not in`

Operator incompatibility:
```
Operator | is  | is not | in  | not in |
---------|-----|--------|-----|--------|
is       | -   | no     | no  | no     |
is not   | no  | -      | no  | no     |
in       | no  | no     | -   | yes    |
not in   | no  | no     | yes | -      |
```

Value-related properties precedence:

1. `value`
2. `min value`, `max value`, `min length`, `max length`
3. `format`
4. `required`

Value-related properties incompatibility:
```
Property     | value | min value | max value | min length | max length | format |
-------------|-------|-----------|-----------|------------|------------|--------|
value        | -     | no        | no        | no         | no         | no     |
min value    | no    | -         | yes       | no         | no         | yes    |
max value    | no    | yes       | -         | no         | no         | yes    |
min length   | no    | no        | no        | -          | yes        | yes    |
max length   | no    | no        | no        | yes        | -          | yes    |
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
- `textbox`