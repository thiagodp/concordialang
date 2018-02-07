# Welcome

## Directories

- `doc` - documentation
  - `examples` - requirement specification examples
  - `formats` - specification of file formats
  - `langspec` - language specification
  - `tutorial` - tutorials about the usage of this tool
- `src` - source code
  - `__tests__` - test scripts
  - `data` - data used by the tool
  - `dist` - output directory for typescript files (tsc)
  - `lib` - manually installed libraries
  - `modules` - modules of the project
  - `node_modules` - installed libraries
  - `plugins` - plugins


## Before starting

Go to the `src` folder:
```shell
$ cd src
```

### Installation
```shell
$ npm install
$ npm install -g jest ts-jest
```

### How to run the project
```shell
$ node dist/main.js
```

### How to run the tests
```shell
$ npm test
```
or
```shell
$ jest --watch
```