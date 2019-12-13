# Versioning

Concordia's version numbering is based on [Semantic Versioning](https://semver.org).

Although Semantic Versioning is conceived for [API](https://en.wikipedia.org/wiki/Application_programming_interface)s instead of for  *Applications*, we adopt a very similar convention. Thus, changes become predictable and you can know, from the version numbers, when a version is no more compatible with a previous version.

Given a version `MAJOR`.`MINOR`.`UPDATE`:
- `MAIOR` is increased when the **Compiler** or the **Language** is no more compatible with the previous version.
- `MINOR` is increased when adding functionality in a backwards-compatible manner.
- `UPDATE` is in increased when there are fixes, little changes or little novelties, and all of them are backwards-compatible.

Examples:
- `0.2.0` is compatible with `0.1.0`
- `0.1.1` is compatible with `0.1.0`
- `1.0.0` is *not* compatible with `0.2.0`