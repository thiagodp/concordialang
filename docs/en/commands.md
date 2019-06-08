# Usage <!-- omit in toc -->

This document describes how to use the tool (Concordia Compiler).

## Contents <!-- omit in toc -->
- [Basic syntax](#basic-syntax)
- [Getting started](#getting-started)
  - [Defining the directory](#defining-the-directory)
  - [Defining the language](#defining-the-language)
  - [Installing a plug-in](#installing-a-plug-in)
  - [Using a installed plug-in](#using-a-installed-plug-in)
    - [Changing output directories](#changing-output-directories)
  - [Special setup command](#special-setup-command)
- [Processing commands](#processing-commands)
- [Plug-in commands](#plug-in-commands)
- [Information commands](#information-commands)

## Basic syntax

Commands' syntax may vary when a [configuration file](./config.md) (`.concordiarc`) is used. By default, the examples here do *not* consider a configuration file.

As usual, you may run `concordia --help` to see all the available commands.

Basic syntax is:

```bash
concordia [<dir>] [options]
```
where:
- `[<dir>]` is the directory that contains your specification files (`.feature`). *Optional*. By default it assumes the current directory.
- `options` can be none, one or more options explained by this document.

---
**Example:** Processing all the features from the current directory and using the plugin for CodeceptJS with WebDriverIO to generate and execute test scripts:

```bash
concordia --plugin codeceptjs-webdriverio
```

**Example:** Processing all the features from the subdirectory `features` and using the plugin for CodeceptJS with Appium to generate and execute test scripts:

```bash
concordia ./features --plugin codeceptjs-appium
```

**Example:** Processing all the features from the subdirectory `features`,  using the plugin for CodeceptJS with WebDriverIO, and avoid running any  test scripts:

```bash
concordia ./features --plugin codeceptjs-webdriverio --no-run
```

## Getting started

When you run the tool without any parameters, that is,
```bash
concordia
```
it will:
1. Try to load options from a [configuration file](./config.md) in the current directory.
2. Search all the `.feature` and `.testcase` files (recursively) from the current directory.*
3. Process all the files using the English language.*
4. Generate `.testcase` files for the `.feature` files that declare Variants.
5. Ask you to inform a plug-in in order to generate and then execute test scripts.*

*= Assuming that the corresponding parameter was not defined in a configuration file.

### Defining the directory

We recommend you to create any `.feature` or `.testcase` files inside a `features` directory and inform this directory to speed up the search for files:

```bash
concordia ./features
```

An alternative way to do the same thing:
```bash
concordia --directory ./features
```

However, you can avoid passing the directory over and over again, by adding it once to the configuration file. You may use the parameter `--save-config` for that purpose:

```bash
concordia --directory ./features --save-config
```

It will generate a file named `.concordiarc` with the following content:

```json
{
    "directory": "./features"
}
```
From now on you don't need to inform the directory anymore, since it will be loaded from the configuration file.

> ```bash
> concordia
> ```
> will now search for files in the directory `./features`


### Defining the language

English is used by default. You can change that with the parameter `--language`:

```bash
concordia --language pt
```

To see available languages:
```bash
concordia --language-list
```

To include the language in the configuration file, so you don't have to inform it anymore:

```bash
concordia --language pt --save-config
```

Alternatively, you add the property `language` to the configuration file:

```json
{
    "directory": "./features",
    "language": "pt"
}
```

👉 Although you have defined the language to be used, every document can use its own language by defining the special comment `#language` at the top of the file.

> Example:
> ```gherkin
> #language: pt
>
> Funcionalidade: Login
> ...
> ```

### Installing a plug-in

Syntax is:
```bash
concordia --plugin-install <name>
```
where `<name>` is an [available plug-in](plugins.md).

We recommend you to see the *optional installations* in the plugin documentation. They may include database drivers and useful additional tools.

### Using a installed plug-in

```bash
concordia --plugin <name>
```
where `<name>` is an installed plug-in.

To avoid informing the plugin over and over again, add it to the configuration file. Example:

```bash
concordia --plugin codeceptjs-webdriverio --save-config
```

Alternatively, you add the property `plugin` to the configuration file:
```json
{
    "directory": "./features",
    "language": "pt",
    "plugin": "codeceptjs-webdriverio"
}
```

#### Changing output directories

By default, a plug-in will:
- generate test scripts in the directory `test`;
- generate other output files, such as test reports and screenshots, in a the directory `output`.

If you wish, you can change these defaults by using parameters or setting the configuration file.

Using parameters:

```bash
concordia --dir-script "./test/e2e" --dir-output "./test/e2e-output"
```

Setting them in the configuration file:
```json
{
    "dirScript": "./test/e2e",
    "dirOutput": "./test/e2e-output"
}
```

### Special setup command

There is a command that can guide you with all the above setup process at once:

```bash
concordia --init
```

This command can be very useful to configure a new project. Next time you may prefer using it.


## Processing commands

To-Do


## Plug-in commands

All the plug-ins' names have the prefix `concordialang-`. However, **you don't need to write it**.
> For instance, `concordialang-codeceptjs-webdriverio` becomes `codeceptjs-webdriverio`.

List installed plug-ins:

```bash
concordia --plugin-list
```

Start a test server of an installed plug-in:
```bash
concordia --plugin-serve <name>
```
> where `<name>` is an installed plug-in.

Start a test server of an installed plug-in that is also defined in the configuration file:
```bash
concordia --plugin-serve
```

Show information about an installed plug-in:
```bash
concordia --plugin-info <name>
```
> where `<name>` is an installed plug-in.

Show information about an installed plug-in that is also defined in the configuration file:
```bash
concordia --plugin-info
```

Uninstall a plug-in:

```bash
concordia --plugin-uninstall <name>
```
> where `<name>` is an installed plug-in.

Install a plug-in:
```bash
concordia --plugin-install <name>
```
> where `<name>` is an [available plug-in](plugins.md).


## Information commands

Shows the current version of the tool:

```bash
concordia --version
```

Shows information about the tool:

```bash
concordia --about
```

Shows available commands:

```bash
concordia --help
```

Checks whether there is a newer version of the tool:

```bash
concordia --newer
```