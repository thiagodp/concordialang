# Breaking Changes <!-- omit in toc -->

Before reading, you may wish to know [how the Concordia project numbers its versions](versioning.md).

- [From version `0.x` to `1.x`](#from-version-0x-to-1x)
  - [What did break the compatibility?](#what-did-break-the-compatibility)
  - [FAQ](#faq)
  - [How to migrate](#how-to-migrate)

## From version `0.x` to `1.x`

### What did break the compatibility?

In the **Concordia Compiler**:

1. It changed the way that all the plug-in operations are handled. See [Issue #34](https://github.com/thiagodp/concordialang/issues/34) for details.
2. The behavior of the following plug-in commands:

| COMMAND          | NOW | BEFORE |
| ---------------- | --- | ------ |
| `plugin-list`    | It lists all the plug-ins **installed for the application**. | It listed all the plug-ins **available** in the compiler. |
| `plugin-install` | It installs a **plug-in and its dependencies**. | **Only the plugin's dependencies** were installed, since the plug-in was embedded in the compiler. |
| `plugin-uninstall` | It uninstalls a **plug-in and its dependencies** using `npm`. | **Only the plugin's dependencies** were uninstalled, since the plug-in was embedded in the compiler. |
| `plugin-info` | It shows information about a plug-in **installed for the application**. | It shows information about a plug-in **available** in the compiler. |
| `plugin-serve` | It starts a testing server using a plug-in **installed for the application**. | It started a testing server **available** in the compiler. |

👉 See the [Command Documentation](./commands.md) to know the commands' syntax.


No compatibility breaks in the **Concordia Language**.

### FAQ

1. *Were there any changes in commands' syntaxes?*

    No, there were not.

2. *Is my configuration file still compatible?*

    It depends. All the properties keep compatible, except for `"plugin"`. Whether your configuration file has that property, you should [update it](./migration.md).

3. *Is it possible now to install or uninstall a plug-in with NPM ?*

    Yes, it is possible to do both now.

### How to migrate

Please see the [Migration Guide](./migration.md).