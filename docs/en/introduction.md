# Introduction

## Language

### Features

#### Improves the communication

Concordia is inspired in [Gherkin](), a language used by many BDD/ATDD/SbE tools. Unfortunately, Gherkin has no different terms to separate high-level, business-directed declarations from low-level, technology-directed declarations. For example, a `Scenario` is used to describe both of them.

Misunderstands leads to software that does not behave as intended.


#### Flexible

  For example, the following sentences are considered equal:

```gherkin
Given that I type "Alice" in <#name>
```
```gherkin
Given that I enter "Alice" in <#name>
```
```gherkin
Given that I fill <#name> with "Alice"
```

We use [NLP](https://en.wikipedia.org/wiki/Natural_language_processing) with a dictionary-based approach to try to understand what you mean. The Compiler will warn you when it can't understand something.

#### Adaptable

Since the language is based on dictionaries, new terms or new training sentences can be added by you (or your company) to improve its capacity to understand what you mean. You can also suggest new terms by [opening an Issue](https://github.com/thiagodp/concordialang/issues/new).

#### Translatable

New languages can be added easily by translating a JSON file (*e.g.*, `dist/data/en.json`) and putting it to the `dist/data` folder.

