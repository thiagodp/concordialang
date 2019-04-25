# Test Scenarios

- Features are traversed in [topological ordering](https://en.wikipedia.org/wiki/Topological_sorting), to start with those which do not have dependencies or references to others features.

- Features or Variants that have the tag `ignore` are included for *Test Scenario* generation, but ignored for *Test Case* generation. The corresponding Test Scenarios receive a flag `ignoreForTestCaseGeneration`.

- Test Scenarios are cached to be used when Variants include others, through Preconditions or State Calls.

- Test Scenarios do not receive test data.

## Paths

There may exist more than one Variant that produces a certain State. Thus, different Test Scenarios can be generated for a Precondition or for a State Call. The *algorithm* used to **pick the State producer** may vary:
- **Pick all**: produces all combinations
- **Pick the first one**: probably always the same Variant
- **Pick just one randomly**: vary according to the seed
- **Pick the first most important**: according to the tag `importance`

Since a Variant may have Preconditions and State Calls at the same time, there can be many combinations to cover, even after applying the prior algorithms. Thus, additional *algorithms*, like the **n-wise** ones may apply to form Test Scenarios. For instance, after picking all combinations of state producers, a *1-wise* algorithm could be applied to reduce combinations.

Example:
```
Given that ~A~
  and ~B~
When ~C~
  and ~D~
Then ~E~
```
In the example, `A`..`D` are states that can be produced by *one or more* Variants. Whether `A` is produced by `3` Variants, `B` is produced by `2`, `C` is produced by `1`, and `D` is produced by `2`, we shall have `3 x 2 x 1 x 2 = 12` different Test Scenarios. By applying any algorithm that picks one of each, we will have just `1` Test Scenario. A `1-wise` algorithm will result in `3` Test Scenarios, and a `2-wise` in `6`. A good `n-wise` algorithm could allow one to inform the used **random seed** aiming to guarantee that the generated Test Scenarios are both predictable and changeables.

# Path Reuse Effect

When an algorithm to reduce path combinations is used *and* previously selected Test Scenarios are reused (*e.g.,* cached) to form new ones, the reduction is greater and the selection is quicker because the selector does not have to perform combinations of Preconditions again and their paths to combine were already pruned.

In the prior example, whether the paths of `A` and `B` were both reduced and reused, the current Variant would have less combinations to process. For instance, whether their reduction culminated in just one path for each, we shall have at most `1 x 1 x 1 x 2 = 2` different Test Scenarios, instead of `12`, to reduce.