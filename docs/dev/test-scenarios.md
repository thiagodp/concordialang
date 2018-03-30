# Test Scenarios

- Features are traversed in [topological ordering](https://en.wikipedia.org/wiki/Topological_sorting), to start with those which do not have dependencies or references to others features.

- Features or Variants that have the tag `ignore` are included for *Test Scenario* generation, but ignored for *Test Case* generation. The corresponding Test Scenarios receive a flag `ignoreForTestCaseGeneration`.

- Test Scenarios are cached to be used when Variants include others, through Preconditions or State Calls.

- Test Scenarios do not receive test data.

## Paths

There may exist more than one Variant that produces a certain State. Thus, different Test Scenarios can be generated for a Precondition or for a State Call. The algorithm used to pick the State producer may vary:
- **Pick all**: produces all combinations
- **Pick the first one**: probably always the same Variant
- **Pick just one randomly**: vary according to the seed
- **Pick the first most important**: according to the tag `importance`
