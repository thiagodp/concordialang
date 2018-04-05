# Test Cases

Data Test Case compatibility:

- `incompatible` whether a compatible UI Element Property is not defined;
- `invalid` whether a compatible UI Element Property is defined and there is space for the requested invalid value;
- `valid` whether a compatible UI Element Property is defined and there is space for the requested valid value;

Repeated test cases:

- Since Test Cases are both read and generated, **repeated test cases are prune**.
- Comparison to prune Test Cases must consider properties that identify them uniquely and ignore properties that vary according to the random seed (*e.g.,* values attributed to UI Elements).