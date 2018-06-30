# Plug-ins

## Available plug-ins:

- `codeceptjs` - *test web applications with **CodeceptJS + WebDriverIO***
- `codeceptjs-appium` - *test mobile and desktop applications with **CodeceptJS + Appium***

You may run the following command to list the available plug-ins:
```console
concordia --plugin-list
```

## Using a plug-in

### Installing dependencies of a plug-in

*Do it just once, before using the plug-in for the first time:*
```console
concordia --plugin-install <plugin>
````

### Starting a test server

*Do it before executing the test scripts:*
```console
concordia --plugin-serve <plugin>
````

### Stopping a test server

Press <kbd>Ctrl</kbd> + <kbd>C</kbd>


### Generating and executing test scripts

*Do it every time you want to generate and execute test scripts:*

```console
concordia --plugin <plugin>
````

To avoid generating new test scripts:

```console
concordia --plugin <plugin> --no-script
````

To avoid both executing test scripts and reading their results:

```console
concordia --plugin <plugin> --no-run --no-result
````


## Developing new plug-ins

By default, we use [Mustache](https://github.com/janl/mustache.js) templates to generate code. Basically, a JSON object with all the things needed is given and you just have to transform it into code.

A plug-in can generate code for any programming language and testing framework.

See [examples of actions](../docs/actions.md) in Concordia Language. 👀


## CodeceptJS

*Plugin for [CodeceptJS](https://codecept.io) has two versions:*
- *WebDriverIO - tests web applications with different browsers, such as Chrome, Firefox, and IE.*
- *Appium - tests mobile (native or web-based) applications or desktop applications*

**Note**: Commands from *WebDriverIO* are also supported by *Appium*. The command mapping from JSON to code is available in `codeceptjs/Commands.ts`.

### Test Events

| Concordia declaration  | CodeceptJS support (method/other)                                  |
|------------------------|--------------------------------------------------------------------|
| `Before All`           | Manually, through hooks. See [hooks](https://codecept.io/hooks/).  |
| `After All`            | Manually, through hooks. See [hooks](https://codecept.io/hooks/).  |
| `Before Feature`       | `BeforeSuite`                                                      |
| `After Feature`        | `AfterSuite`                                                       |
| `Before Each Scenario` | `Before` or `Background`                                           |
| `After Each Scenario`  | `After`                                                            |


### Actions

See [examples of actions](../actions.md) to know how to write them in your specification.

Left column indicates currently available actions in Concordia, while the right column lists those commands available in the framework.  A tick (✓) means "checked with a test".


 | Concordia action/keywords                 | CodeceptJS with WebDriverIO or Appium
 |-------------------------------------------|---------------------------------------|
 | -                                         | _locate |
 | -                                         | _locateCheckable |
 | -                                         | _locateClickable |
 | -                                         | _locateFields |
 | accept + (alert|confirm|popup|prompt)     | acceptPopup ✓ |
 | amOn                                      | amOnPage ✓ |
 | append                                    | appendField ✓ |
 | attachFile                                | attachFile ✓ |
 | cancel + (alert|confirm|popup|prompt)     | cancelPopup ✓ |
 | check                                     | checkOption ✓ |
 | clear + cookie                            | clearCookie ✓ |
 | clear                                     | clearField ✓ |
 | click                                     | click ✓ |
 | close + app                               | closeApp ✓ (Appium only) |
 | close + currentTab                        | closeCurrentTab ✓ |
 | close + otherTabs                         | closeOtherTabs ✓ |
 | connect + database                        | N/A - supported via [dbhelper](https://github.com/thiagodp/codeceptjs-dbhelper) |
 | -                                         | defineTimeout
 | disconnect + database                     | N/A - supported via [dbhelper](https://github.com/thiagodp/codeceptjs-dbhelper) |
 | not + see                                 | dontSee ✓ |
 | not + see + checkbox                      | dontSeeCheckboxIsChecked ✓ |
 | not + see + cookie                        | dontSeeCookie ✓ |
 | not + see + url                           | dontSeeCurrentUrlEquals ✓ |
 | not + see + uielement | uiliteral         | dontSeeElement ✓ |
 | -                                         | dontSeeElementInDOM |
 | not + see + inside | with + url           | dontSeeInCurrentUrl ✓ |
 | not + see + textbox | textarea            | dontSeeInField ✓ |
 | -                                         | dontSeeInSource |
 | not + see + title                         | dontSeeInTitle ✓ |
 | doubleClick                               | doubleClick ✓ |
 | drag                                      | dragAndDrop ✓ |
 | -                                         | executeAsyncScript |
 | -                                         | executeScript |
 | fill                                      | fillField ✓ |
 | -                                         | grabAttributeFrom |
 | -                                         | grabBrowserLogs |
 | -                                         | grabCookie |
 | -                                         | grabCssPropertyFrom |
 | -                                         | grabCurrentUrl |
 | -                                         | grabHTMLFrom |
 | -                                         | grabNumberOfOpenTabs |
 | -                                         | grabNumberOfVisibleElements |
 | -                                         | grabPageScrollPosition |
 | -                                         | grabPopupText |
 | -                                         | grabSource |
 | -                                         | grabTextFrom |
 | -                                         | grabTitle |
 | -                                         | grabValueFrom |
 | hide + keyboard                           | hideDeviceKeyboard ✓ (Appium only) |
 | install + app                             | installApp ✓ (Appium only) |
 | -                                         | locator |
 | maximize + window                         | resizeWindow( 'maximize' ) ✓ |
 | move + cursor                             | moveCursorTo ✓ |
 | mouseOut                                  | - |
 | mouseOver                                 | - |
 | open + new tab                            | openNewTab |
 | open + notifications                      | openNotifications ✓ (Appium only) |
 | press                                     | pressKey ✓ |
 | pull + file                               | pullFile ✓ (Appium only) |
 | refresh + currentPage                     | refreshPage ✓ |
 | refresh + url                             | |
 | remove + app                              | removeApp ✓ (Appium only) |
 | resize + window                           | resizeWindow ✓ |
 | rightClick                                | rightClick ✓ |
 | run + command                             | N/A - supported via [cmdhelper](https://github.com/thiagodp/codeceptjs-cmdhelper) |
 | run + script                              | N/A - supported via [dbhelper](https://github.com/thiagodp/codeceptjs-dbhelper) |
 | -                                         | runInWeb |
 | -                                         | runOnAndroid |
 | -                                         | runOnIOS |
 | saveScreenshot                            | saveScreenshot ✓ |
 | -                                         | scrollTo |
 | see                                       | see ✓ |
 | see + app + installed                     | seeAppIsInstalled ✓ (Appium only) |
 | see + app + installed + not               | seeAppIsNotInstalled ✓ (Appium only) |
 | -                                         | seeAttributesOnElements |
 | see + checkbox                            | seeCheckboxIsChecked ✓ |
 | see + cookie                              | seeCookie ✓ |
 | -                                         | seeCssPropertiesOnElements |
 | see + currentActivity + value             | seeCurrentActivityIs ✓ (Appium only) |
 | see + device + locked                     | seeDeviceIsLocked ✓ (Appium only) |
 | see + device + unlocked                   | seeDeviceIsUnlocked ✓ (Appium only) |
 | see + ( with | inside ) + url             | seeCurrentUrlEquals ✓ |
 | see + uielement | uiliteral               | seeElement ✓ |
 | -                                         | seeElementInDOM |
 | see + inside + url                        | seeInCurrentUrl ✓ |
 | see + ( textbox | textarea )              | seeInField ✓ |
 | -                                         | seeInPopup |
 | -                                         | seeInSource |
 | see + title                               | seeInTitle ✓ |
 | -                                         | seeNumberOfElements |
 | -                                         | seeNumberOfVisibleElements |
 | see + orientation + landscape             | seeOrientationIs("LANDSCAPE") ✓ (Appium only) |
 | see + orientation + portrait              | seeOrientationIs("PORTRAIT") ✓ (Appium only) |
 | -                                         | seeTextEquals |
 | -                                         | seeTitleEquals |
 | select                                    | selectOption ✓ |
 | -                                         | setCookie |
 | shake                                     | shakeDevice ✓ (Appium only) |
 | show                                      | - |
 | swipe + values                            | swipe ✓ (Appium only) |
 | swipe + down                              | swipeDown ✓ (Appium only) |
 | swipe + left                              | swipeLeft ✓ (Appium only) |
 | swipe + right                             | swipeRight ✓ (Appium only) |
 | swipe + up                                | swipeUp ✓ (Appium only) |
 | swipe + targets                           | swipeTo ✓ (Appium only) |
 | switch + native                           | switchToNative ✓ (Appium only) |
 | switch + web                              | switchToWeb ✓ (Appium only) |
 | switch + tab + number                     | switchToNextTab ✓ |
 | switch + next + tab                       | switchToNextTab ✓ |
 | switch + previous + tab                   | switchToPreviousTab ✓ |
 | tap                                       | tap ✓ (Appium only) |
 | uncheck                                   | uncheckOption ✓ |
 | wait + number                             | wait ✓ |
 | -                                         | waitForDetached |
 | wait + uielement                          | waitForElement ✓ |
 | wait + enabled + uielement | uiliteral    | waitForEnabled ✓ |
 | wait + invisible + uielement | uiliteral  | waitForInvisible ✓ |
 | wait + text + value                       | waitForText ✓ |
 | wait + option value + value               | waitForValue ✓ |
 | wait + visible + uielement | uiliteral    | waitForVisible ✓ |
 | -                                         | waitInUrl |
 | -                                         | waitNumberOfVisibleElements ✓ |
 | wait + hide + uielement | uiliteral       | waitToHide ✓ |
 | -                                         | waitUntil |
 | wait + url + value                        | waitUrlEquals ✓ |
 |                                           | |