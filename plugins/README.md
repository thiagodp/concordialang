# Plug-ins

Currently available plug-ins:

- **CodeceptJS + WebDriverIO** - *test web applications*
- **CodeceptJS + Appium** - *test mobile and desktop applications*

***Help us to develop new plug-ins !*** ✌

> By default, we use [Mustache](https://github.com/janl/mustache.js) templates to generate code. Basically, a JSON object with all the things needed is given and you just have to transform it into code.

A plug-in can generate code for any programming language and testing framework.

## CodeceptJS

*Plugin for [CodeceptJS](https://codecept.io) has two versions:*
- *WebDriverIO - tests web applications with different browsers, such as Chrome, Firefox, and IE.*
- *Appium - tests mobile (native or web-based) applications or desktop applications*

**Note**: Commands from *WebDriverIO* are also supported by *Appium*. The command mapping from JSON to code is available in `codeceptjs/Commands.ts`.

Left column indicates currently available actions in Concordia, while the right column lists those commands available in the framework.  A tick (✓) means "checked with a test".

```
 +-------------------------------------------+-------------------------------
 | Concordia action/keywords                 | CodeceptJS with WebDriverIO
 +-------------------------------------------+-------------------------------
 | -                                         | _locate
 | -                                         | _locateCheckable
 | -                                         | _locateClickable
 | -                                         | _locateFields
 | -                                         | acceptPopup
 | amOn                                      | amOnPage ✓
 | append                                    | appendField ✓
 | attachFile                                | attachFile ✓
 | check                                     | checkOption ✓
 | clear + cookie                            | clearCookie ✓
 | clear                                     | clearField ✓
 | click                                     | click ✓
 | close + app                               | closeApp ✓ (Appium only)
 | close + currentTab                        | closeCurrentTab ✓
 | close + otherTabs                         | closeOtherTabs ✓
 | -                                         | defineTimeout
 | not + see                                 | dontSee ✓
 | not + see + checkbox                      | dontSeeCheckboxIsChecked ✓
 | not + see + cookie                        | dontSeeCookie ✓
 | not + see + url                           | dontSeeCurrentUrlEquals ✓
 | not + see + uielement | uiliteral         | dontSeeElement ✓
 | -                                         | dontSeeElementInDOM
 | not + see + inside | with + url           | dontSeeInCurrentUrl ✓
 | not + see + textbox | textarea            | dontSeeInField ✓
 | -                                         | dontSeeInSource
 | not + see + title                         | dontSeeInTitle ✓
 | doubleClick                               | doubleClick ✓
 | drag                                      | dragAndDrop ✓
 | -                                         | executeAsyncScript
 | -                                         | executeScript
 | fill                                      | fillField ✓
 | -                                         | grabAttributeFrom
 | -                                         | grabBrowserLogs
 | -                                         | grabCookie
 | -                                         | grabCssPropertyFrom
 | -                                         | grabCurrentUrl
 | -                                         | grabHTMLFrom
 | -                                         | grabNumberOfOpenTabs
 | -                                         | grabNumberOfVisibleElements
 | -                                         | grabPageScrollPosition
 | -                                         | grabPopupText
 | -                                         | grabSource
 | -                                         | grabTextFrom
 | -                                         | grabTitle
 | -                                         | grabValueFrom
 | hide + keyboard                           | hideDeviceKeyboard ✓ (Appium only)
 | install + app                             | installApp ✓ (Appium only)
 | move + cursor                             | moveCursorTo ✓
 | mouseOut                                  | -
 | mouseOver                                 | -
 | open + new tab                            | openNewTab
 | open + notifications                      | openNotifications ✓ (Appium only)
 | press                                     | pressKey ✓
 | pull + file                               | pullFile ✓ (Appium only)
 | refresh                                   | refreshPage
 | remove + app                              | removeApp ✓ (Appium only)
 | resize + window                           | resizeWindow
 | rightClick                                | rightClick ✓
 | -                                         | runInWeb
 | -                                         | runOnAndroid
 | -                                         | runOnIOS
 | saveScreenshot                            | saveScreenshot ✓
 | -                                         | scrollTo
 | see                                       | see ✓
 | see + app + installed                     | seeAppIsInstalled ✓ (Appium only)
 | see + app + installed + not               | seeAppIsNotInstalled ✓ (Appium only)
 | -                                         | seeAttributesOnElements
 | see + checkbox                            | seeCheckboxIsChecked ✓
 | see + cookie                              | seeCookie ✓
 | -                                         | seeCssPropertiesOnElements
 | see + currentActivity + value             | seeCurrentActivityIs ✓ (Appium only)
 | see + device + locked                     | seeDeviceIsLocked ✓ (Appium only)
 | see + device + unlocked                   | seeDeviceIsUnlocked ✓ (Appium only)
 | see + ( with | inside ) + url             | seeCurrentUrlEquals ✓
 | see + uielement | uiliteral               | seeElement ✓
 | -                                         | seeElementInDOM
 | see + inside + url                        | seeInCurrentUrl ✓
 | see + ( textbox | textarea )              | seeInField ✓
 | -                                         | seeInPopup
 | -                                         | seeInSource
 | see + title                               | seeInTitle ✓
 | -                                         | seeNumberOfElements
 | -                                         | seeNumberOfVisibleElements
 | see + orientation + landscape             | seeOrientationIs("LANDSCAPE") ✓ (Appium only)
 | see + orientation + portrait              | seeOrientationIs("PORTRAIT") ✓ (Appium only)
 | -                                         | seeTextEquals
 | -                                         | seeTitleEquals
 | select                                    | selectOption ✓
 | -                                         | setCookie
 | shake                                     | shakeDevice ✓ (Appium only)
 | show                                      | -
 | swipe + values                            | swipe ✓ (Appium only)
 | swipe + down                              | swipeDown ✓ (Appium only)
 | swipe + left                              | swipeLeft ✓ (Appium only)
 | swipe + right                             | swipeRight ✓ (Appium only)
 | swipe + up                                | swipeUp ✓ (Appium only)
 | switch + native                           | switchToNative ✓ (Appium only)
 | switch + web                              | switchToWeb ✓ (Appium only)
 | -                                         | switchTo
 | -                                         | switchToNextTab
 | -                                         | switchToPreviousTab
 | tap                                       | tap ✓ (Appium only)
 | uncheck                                   | uncheckOption ✓
 | wait + number                             | wait ✓
 | -                                         | waitForDetached
 | wait + uielement                          | waitForElement ✓
 | wait + enabled + uielement | uiliteral    | waitForEnabled ✓
 | wait + invisible + uielement | uiliteral  | waitForInvisible ✓
 | wait + text + value                       | waitForText ✓
 | -                                         | waitForValue
 | wait + visible + uielement | uiliteral    | waitForVisible ✓
 | -                                         | waitInUrl
 | -                                         | waitNumberOfVisibleElements
 | -                                         | waitToHide
 | -                                         | waitUntil
 | wait + url + value                        | waitUrlEquals ✓
 | -                                         | locator
```