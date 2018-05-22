# Plug-ins

## CodeceptJS

Mapping available in `ActionMapper.ts`. A tick (✓) means "checked with a test".

```
 +--------------------------------+-------------------------------
 | Concordia action/keywords      | CodeceptJS with WebDriverIO
 +--------------------------------+-------------------------------
 | -                              | _locate
 | -                              | _locateCheckable
 | -                              | _locateClickable
 | -                              | _locateFields
 | -                              | acceptPopup
 | amIn                           | amOnPage ✓
 | append                         | appendField ✓
 | attachFile                     | attachFile ✓
 | check                          | checkOption ✓
 | clear + cookie                 | clearCookie ✓
 | clear                          | clearField ✓
 | click                          | click ✓
 | close                          | closeCurrentTab ✓
 |                                | closeOtherTabs ✓
 | -                              | defineTimeout
 | not + see                      | dontSee ✓
 | not + see + checkbox           | dontSeeCheckboxIsChecked ✓
 | not + see + cookie             | dontSeeCookie ✓
 | not + see + url                | dontSeeCurrentUrlEquals ✓
 | not + see                      | dontSeeElement ✓
 | -                              | dontSeeElementInDOM
 | not + see + inside + url       | dontSeeInCurrentUrl ✓
 | not + see + textbox | textarea | dontSeeInField ✓
 | -                              | dontSeeInSource
 | not + see + title              | dontSeeInTitle ✓
 | doubleClick                    | doubleClick ✓
 | drag                           | dragAndDrop ✓
 | -                              | executeAsyncScript
 | -                              | executeScript
 | fill                           | fillField ✓
 | -                              | grabAttributeFrom
 | -                              | grabBrowserLogs
 | -                              | grabCookie
 | -                              | grabCssPropertyFrom
 | -                              | grabCurrentUrl
 | -                              | grabHTMLFrom
 | -                              | grabNumberOfOpenTabs
 | -                              | grabNumberOfVisibleElements
 | -                              | grabPageScrollPosition
 | -                              | grabPopupText
 | -                              | grabSource
 | -                              | grabTextFrom
 | -                              | grabTitle
 | -                              | grabValueFrom
 | hide                           | -
 | move + cursor                  | moveCursorTo ✓
 | mouseOut                       | -
 | mouseOver                      | -
 | open + new tab                 | openNewTab
 | press                          | pressKey ✓
 | refresh                        | refreshPage
 | resize + window                | resizeWindow
 | rightClick                     | rightClick
 | -                              | runInWeb
 | -                              | runOnAndroid
 | -                              | runOnIOS
 | saveScreenshot                 | saveScreenshot ✓
 | -                              | scrollTo
 | see                            | see ✓
 | -                              | seeAttributesOnElements
 | see + checkbox                 | seeCheckboxIsChecked ✓
 | see + cookie                   | seeCookie ✓
 | -                              | seeCssPropertiesOnElements
 | see + url                      | seeCurrentUrlEquals ✓
 | -                              | seeElement
 | -                              | seeElementInDOM
 | see + inside + url             | seeInCurrentUrl ✓
 | see + textbox | textarea       | seeInField ✓
 | -                              | seeInPopup
 | -                              | seeInSource
 | see + title                    | seeInTitle ✓
 | -                              | seeNumberOfElements
 | -                              | seeNumberOfVisibleElements
 | -                              | seeTextEquals
 | -                              | seeTitleEquals
 | select                         | selectOption ✓
 | -                              | setCookie
 | show                           | -
 | swipe                          | -
 | switch                         | -
 | -                              | switchTo
 | -                              | switchToNextTab
 | -                              | switchToPreviousTab
 | tap                            | -
 | uncheck                        | uncheckOption ✓
 | wait + number                  | wait ✓
 | -                              | waitForDetached
 | wait + uielement               | waitForElement ✓
 | -                              | waitForEnabled
 | -                              | waitForInvisible
 | wait + value                   | waitForText ✓
 | -                              | waitForValue
 | -                              | waitForVisible
 | -                              | waitInUrl
 | -                              | waitNumberOfVisibleElements
 | -                              | waitToHide
 | -                              | waitUntil
 | -                              | waitUrlEquals
 | -                              | locator
```

## Fake

