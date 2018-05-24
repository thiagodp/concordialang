# Plug-ins

Currently available plug-ins:

- [CodeceptJS + WebDriverIO](#CodeceptJS%20with%20WebDriverIO) - *test web applications*

Planned:
 - CodeceptJS + Appium - *test mobile and desktop applications*

***Help us to develop new plug-ins !*** ✌

> By default, we use [Mustache](https://github.com/janl/mustache.js) templates to generate code. Basically, a JSON object with all the things needed is given and you just have to transform it into code.

A plug-in can generate code for any programming language and testing framework.

## CodeceptJS with WebDriverIO

*Plugin for [CodeceptJS](https://codecept.io) that tests web applications with different browsers, such as Chrome, Firefox, and IE.*

Mapping from JSON into code is available in `codeceptjs/CommandMapper.ts`.

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
 | hide                                      | -
 | move + cursor                             | moveCursorTo ✓
 | mouseOut                                  | -
 | mouseOver                                 | -
 | open + new tab                            | openNewTab
 | press                                     | pressKey ✓
 | refresh                                   | refreshPage
 | resize + window                           | resizeWindow
 | rightClick                                | rightClick ✓
 | -                                         | runInWeb
 | -                                         | runOnAndroid
 | -                                         | runOnIOS
 | saveScreenshot                            | saveScreenshot ✓
 | -                                         | scrollTo
 | see                                       | see ✓
 | -                                         | seeAttributesOnElements
 | see + checkbox                            | seeCheckboxIsChecked ✓
 | see + cookie                              | seeCookie ✓
 | -                                         | seeCssPropertiesOnElements
 | see + with | inside + url                 | seeCurrentUrlEquals ✓
 | see + uielement | uiliteral               | seeElement ✓
 | -                                         | seeElementInDOM
 | see + inside + url                        | seeInCurrentUrl ✓
 | see + textbox | textarea                  | seeInField ✓
 | -                                         | seeInPopup
 | -                                         | seeInSource
 | see + title                               | seeInTitle ✓
 | -                                         | seeNumberOfElements
 | -                                         | seeNumberOfVisibleElements
 | -                                         | seeTextEquals
 | -                                         | seeTitleEquals
 | select                                    | selectOption ✓
 | -                                         | setCookie
 | show                                      | -
 | swipe                                     | -
 | switch                                    | -
 | -                                         | switchTo
 | -                                         | switchToNextTab
 | -                                         | switchToPreviousTab
 | tap                                       | -
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