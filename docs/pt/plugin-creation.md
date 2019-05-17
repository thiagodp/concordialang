# Creating a plugin

> Esse arquivo necessita de tradução para Português.

A plug-in can **generate** test scripts (source code) for *any* programming language or testing framework.

A plug-in can be **developed** with JavaScript or [any other language](https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js) that "transpiles" to JavaScript, such as [TypeScript](https://typescriptlang.org) (recommended), [Dart](https://dartlang.org), or [CoffeeScript](http://coffeescript.org).

A plug-in must implement the `Plugin` interface, from [concordialang-plugin](https://github.com/thiagodp/concordialang-plugin), and must deal with three tasks:

1. Transforming [Abstract Test Scripts](https://github.com/thiagodp/concordialang-plugin/blob/master/src/AbstractTestScript.ts) into test scripts, *i.e.*, source code.

2. Executing the produced test scripts, regarding some [filtering options](https://github.com/thiagodp/concordialang-plugin/blob/master/src/TestScriptExecutionOptions.ts).

3. Transforming the test execution results produced by the testing framework - *e.g.*, a XML or JSON file - into [the expected format](https://github.com/thiagodp/concordialang-plugin/blob/master/src/TestScriptExecutionResult.ts).


A plug-in must be published at [NPM](https://npmjs.com) with a name that starts with `concordialang-`, *e.g.,* `concordialang-my-awesome-plugin`.

A plug-in must have a `package.json` file, with a property called `concordiaPlugin`, like in the following example:

```json
  "concordiaPlugin": {
    "isFake": false,
    "targets": [
      "a-cool-testing-framework"
    ],
    "file": "dist/my-awesome-plugin.js",
    "class": "MyAwesomePlugin",
    "install": "npm install --color=always -g foo",
    "uninstall": "npm uninstall --color=always -g foo",
    "serve": "foo start"
  }
```

These are the properties in `concordiaPlugin`:

- `isFake: boolean` (*optional*): Indicates whether it is a fake plug-in, *i.e.,* if it does not perform real work.
- `targets: string[]`: Target technologies, usually the name of the target framework, tool, and programming language.
- `file: string`: Relative path of the file that contains an implementation of the `Plugin` interface.
- `class: string`: Class (name) that implements `Plugin`.
- `install: string`: Multi-platform console command that needs to be executed immediately after the NPM package is installed.
- `uninstall: string`: Multi-platform console command that needs to be executed immediately before the NPM package is uninstalled.
- `serve: string`: Multi-platform console command that needs to be executed to start the testing server.

**NOTE**: We opted to *not* use the properties `postinstall` and `postuninstall` from [`package.json`](https://docs.npmjs.com/misc/scripts) because, according to the [NPM Script Best Practices](https://docs.npmjs.com/misc/scripts#best-practices):

> Don’t exit with a non-zero error code unless you really mean it. Except for uninstall scripts, this will cause the npm action to fail, and potentially be rolled back.

In our opinion, the effect of rolling back the plug-in installation in case of an error with the `postinstall` script is very undesirable, since we use `postinstall` to perform **additional** installation or environment setup, which a user could do manually. Preventing a user of installing the plug-in because the `postinstall` script is failing is, in our opinion, a wrong decision from the NPM team. It would be better to warn the user about the error and show him/her the corresponding script.

## Step-by-step guide

We recommend to follow these steps to create a new plug-in. They may help you getting it done faster.

1. [Open an issue](https://github.com/thiagodp/concordialang/issues/new) to indicate that you are interested in developing a new plug-in for a certain testing framework or programming language. This is good to make others aware of your work.

2. **Choose a good name** for your plug-in and check whether it registered at [NPM](https://www.npmjs.com/). Remember that it must start with `concordialang-`.We recommend that it includes the target framework, tools or language. Example: `concordialang-selenium-python` to create a plug-in that generates test scripts for the Selenium framework and the Python language. You may use the opened issue (step 1) to get feedback about the name, if you wish.

3. **Create an online repository** for it (at GitHub, GitLab, or any other service) and **clone** the repository.

4. **Create a NPM package** with `npm --init`.

5. **Add the property** `concordiaPlugin` to your `package.json` file. Empty the values that you don't know how to fill now, but do not forget to  fill them later.

6. **Install** [concordialang-plugin](https://github.com/thiagodp/concordialang-plugin):

```bash
npm install --save concordialang-plugin
```

7. **Add your files**. We recommend the following structure, but *you can adapt it as you wish*. For example, if you use [TypeScript](https://typescriptlang.org), you will probably add a `tsconfig.json` file. If you use [Jest](https://facebook.github.io/jest/), your test folder can be named `__tests__`. We also recommend you to add a [`.editorconfig`](http://editorconfig.org) file.

```
 ┃
 ┣ dist/           🡐 distribued javascript files
 ┣ src/            🡐 plug-in code
 ┣ test/           🡐 your tests
 ┣ .gitignore
 ┗ package.json
```

8. **Implement the interface** [Plugin](https://github.com/thiagodp/concordialang-plugin/blob/master/src/Plugin.ts). We recommend you to [take a look at other plugins](plugins.md#available-plug-ins) that did a similar job. As always, you are free to proceed as you wish. However, we strongly recommend that you:
   1.  separate your implementation in different files;
   2.  unit test your files individually;
   3.  unit test your implementation of `Plugin`.

9. **Test it with the Concordia Compiler**. Create a simple project that uses your plug-in then install your plug-in with NPM from a directory in your computer or your remote git repository. Yep, you don't need to have it published at NPM before trying it (see the following command). Make sure that your plug-in behaves perfectly with Concordia.

```bash
cd path/to/test/project/
npm install <folder or git repository>
```

10. **Publish your plug-in** at [NPM](https://www.npmjs.com/) and tell everybody to give you feedback! Make sure you are using [Semantic Versioning](http://semver.org).

```bash
npm publish
```

11. **Update the Issue** (step 1) when the plug-in is stable. *Congratulations!* 😃
