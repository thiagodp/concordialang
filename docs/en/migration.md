# Migration Guide <!-- omit in toc -->


- [From `0.x` to `1.x`](#from-0x-to-1x)
- [See also](#see-also)

## From `0.x` to `1.x`

1. **Update your configuration file, if needed**

    1. Whether you project has a configuration file `.concordiarc`, open it with a text editor.
    2. If the file has a property `"plugin"` with the value `"codeceptjs"`, you must change it to `"codeceptjs-webdriverio"`.

2. **Install the new plug-in**

    You can install any of the [available plug-ins](./plugins.md), currently `codeceptjs-webdriverio` or `codeceptjs-appium`.

    Example:
    ```bash
    concordia --plugin-install codeceptjs-webdriverio
    ```

    👉 On **Linux** and **MacOS**, it is needed to use `sudo` before the command. Example:
    ```bash
    sudo concordia --plugin-install codeceptjs-webdriverio
    ```

## See also

- [Information about the breaking changes](breaking-changes.md)
- [Concordia's version numbering](versioning.md)