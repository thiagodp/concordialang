# Plug-ins

## Available plug-ins

Currently available plug-ins are:

| Plug-in                   | Target Applications | Frameworks | Generated Language |
| ------------------------ | ------------------- | ---------- | -------- |
| [`codeceptjs-webdriverio`](https://github.com/thiagodp/concordialang-codeceptjs-webdriverio) | web                 | [CodeceptJS](http://codecept.io) and [WebDriverIO](http://webdriver.io) | JavaScript |
| [`codeceptjs-appium`](https://github.com/thiagodp/concordialang-codeceptjs-appium)      | mobile, desktop     | [CodeceptJS](http://codecept.io) and [Appium](http://appium.io) | JavaScript |

NOTES:

1. **WebDriverIO** requires [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html). You must install JRE **before** installing the plug-in.

2. **Appium** uses WebDriverIO only if you want to test **web-based** mobile or desktop applications. Native mobile applications or native desktop applications do *not* require Java.

3. Any other needed dependencies are installed automatically, in order to make the setup process simpler.

Please tell us whether you [created a new plug-in](plugin-creation.md) by [opening an issue](https://github.com/thiagodp/concordialang/issues/new) for it!


## Commands

For the following commands, please consider that `<plugin>` is the plug-in name and that **it is optional** if you set the `plugin` property in the [configuration file](config.md).

### plugin-install

Installs a plug-in available at [NPM](https://www.npmjs.com/).

```bash
concordia --plugin-install <plugin>
```

### plugin-list

Gives you a list of the installed plug-ins:

```bash
concordia --plugin-list
```

### plugin-about

Gives you information about an installed plug-in:

```bash
concordia --plugin-about <plugin>
```

### plugin-serve

Starts a test server of an installed plug-in.

We recommend to run it in a separate terminal/console since it usually blocks the terminal/console.

```bash
concordia --plugin-serve <plugin>
```

### plugin-uninstall

Uninstall a plug-in.

```bash
concordia --plugin-uninstall <plugin>
```


## Roadmap

Planned plug-ins:

| Issue | Plug-in                   | Target Applications | Frameworks | Generated Language |
| ----- | ------------------------ | ------------------- | ---------- |---------- |
| [#32](https://github.com/thiagodp/concordialang/issues/32) | `cypress` | web | [Cypress](https://cypress.io) | JavaScript |
| [#33](https://github.com/thiagodp/concordialang/issues/33) | `testcafe` | web, mobile, desktop | [TestCafe](https://devexpress.github.io/testcafe/) | JavaScript |
| [#28](https://github.com/thiagodp/concordialang/issues/28) | `macacajs` | web, mobile, desktop | [MacacaJS](https://macacajs.com) | JavaScript |

Would you like to create a plug-in for **another framework** or **programming language**? We would love it! 💖

See [how to create a plug-in](plugin-creation.md).


## FAQ

1. **I have a *desktop* application. Can I test it with one of the available plug-ins?**

    *Yes, you can*. Please see in the [list of available plug-ins](#available-plug-ins) for those that support `desktop` applications.

2. **My application is not developed with JavaScript. Can I test it with a plug-in that generates JavaScript test scripts?**

    *Yes, you can*. Usually the produced test scripts will interface with a *test server* or *driver* that controls your application directly or by controlling a browser, device emulator or device in which it runs.

3. **Is it difficult to create a plug-in? How is it?**

    *No, it's not*. Basically you have to transform a JSON (that contains all the data that you need) into source code, run the framework or tool that will execute the source code, and read the test results. See [more details](plugin-creation.md).

4. **Can I create a plug-in that generates source code to a language other than JavaScript?**

    *Yes, please! We'll really love it!*