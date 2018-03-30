# States

**Preconditions** are always denoted by a `Given` step. **State Calls** are always denoted by a `When` step. **Postconditions** are always denoted by a `Then` step. These steps are replaced as follows:

- A step with a **Precondition** is replaced by the steps from the Variant that produces the referred state. Whether that Variant also have Preconditions, they are replaced likewise.

- A step with a **State Call** is replaced by the steps from the Variant that produces the referred state, but the precondition steps of that Variant are *not* included.

- A step with a **Postcondition** is removed.