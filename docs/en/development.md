# Development guidelines

## Directories

- `__tests__` - test scripts
- `bin` - executable script
- `data` - data files used by the tool
- `dist` - output directory - contains generated js and json files
- `docs` - documentation files
- `lib` - adapted third party libraries
- `media` - images or any other multimedia files
- `modules` - modules of the project


## Getting started

### Install dependencies
```shell
npm install
```

### Build
```shell
npm run build
```

### Run
```shell
npm run start
```

### Test
```shell
npm run test
```

### Sonar

* Install [sonar](https://www.sonarqube.org/)
* Start sonar server
* Run `sonar-scanner` in the projects' root

## Linking the command to the source code

Whether you wish the command `concordia` to execute directly from **your** source code, go to the project root folder then run
```shell
npm link
```

To unlink it later, go to the project root folder then run
```shell
npm unlink
```


## Pull Requests

Before submitting a Pull Request, make sure that:
1. You added tests that verify the change or the new feature.
2. All the test pass.
3. You have updated the language files, if the language changed.
4. You have updated the language documentation files, if the language changed:
  - Language file `language.md` is updated, if the language changed.
    - Please update translations (e.g., `docs/pt/language.md`) if you can.
  - Actions file `actions.md` is updated, if some action was added.
    - Please update translations (e.g., `docs/pt/actions.md`) if you can.
5. You have updated all the corresponding JavaScript and JSON files to `/dist`.
6. You have prepared a high-level description of the changes made and referenced any corresponding Issues.


## Commit rules

Please follow [these rules](https://github.com/spring-projects/spring-framework/blob/30bce7/CONTRIBUTING.md#format-commit-messages).

You may also like:
  - [How to write a good commit message](https://chris.beams.io/posts/git-commit/)
  - [Keep your commits "Atomic"](https://www.freshconsulting.com/atomic-commits/)
  - [Contributing to a project with Git](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)


## Coding style

Use [our coding style](coding-style.md).