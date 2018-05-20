# Plug-ins

## CodeceptJS

Mapping available in `ActionMapper.ts`.

```
 +----------------------------+-------------------------------
 | Concordia action/keywords  | CodeceptJS with WebDriverIO
 +----------------------------+-------------------------------
 | -                          | _locate
 | -                          | _locateCheckable
 | -                          | _locateClickable
 | -                          | _locateFields
 | -                          | acceptPopup
 | amIn                       | amOnPage
 | append                     | appendField
 | attachFile                 | attachFile
 | check                      | checkOption
 | clear + cookie             | clearCookie
 | clear                      | clearField
 | click                      | click
 | close                      | closeCurrentTab
 |                            | closeOtherTabs
 | -                          | defineTimeout
 | dont + see                 | dontSee
 | -                          | dontSeeCheckboxIsChecked
 | dont + see + cookie        | dontSeeCookie
 | -                          | dontSeeCurrentUrlEquals
 | -                          | dontSeeElement
 | -                          | dontSeeElementInDOM
 | -                          | dontSeeInCurrentUrl
 | -                          | dontSeeInField
 | -                          | dontSeeInSource
 | -                          | dontSeeInTitle
 | doubleClick                | doubleClick
 | drag                       | dragAndDrop
 | drop                       | dragAndDrop
 | -                          | executeAsyncScript
 | -                          | executeScript
 | fill                       | fillField
 | -                          | grabAttributeFrom
 | -                          | grabBrowserLogs
 | -                          | grabCookie
 | -                          | grabCssPropertyFrom
 | -                          | grabCurrentUrl
 | -                          | grabHTMLFrom
 | -                          | grabNumberOfOpenTabs
 | -                          | grabNumberOfVisibleElements
 | -                          | grabPageScrollPosition
 | -                          | grabPopupText
 | -                          | grabSource
 | -                          | grabTextFrom
 | -                          | grabTitle
 | -                          | grabValueFrom
 | hide                       | -
 | move + cursor              | moveCursorTo
 | mouseOut                   | -
 | mouseOver                  | -
 | open + new tab             | openNewTab
 | press                      | pressKey
 | refresh                    | refreshPage
 | resize + window            | resizeWindow
 | rightClick                 | rightClick
 | -                          | runInWeb
 | -                          | runOnAndroid
 | -                          | runOnIOS
 | -                          | saveScreenshot
 | -                          | scrollTo
 | see                        | see
 | -                          | seeAttributesOnElements
 | -                          | seeCheckboxIsChecked
 | see + cookie               | seeCookie
 | -                          | seeCssPropertiesOnElements
 | -                          | seeCurrentUrlEquals
 | -                          | seeElement
 | -                          | seeElementInDOM
 | -                          | seeInCurrentUrl
 | -                          | seeInField
 | -                          | seeInPopup
 | -                          | seeInSource
 | see + title                | seeInTitle
 | -                          | seeNumberOfElements
 | -                          | seeNumberOfVisibleElements
 | -                          | seeTextEquals
 | -                          | seeTitleEquals
 | select                     | selectOption
 | -                          | setCookie
 | show                       | -
 | swipe                      | -
 | switch                     | -
 | -                          | switchTo
 | -                          | switchToNextTab
 | -                          | switchToPreviousTab
 | tap                        | -
 | uncheck                    | uncheckOption
 | wait                       | wait
 | -                          | waitForDetached
 | -                          | waitForElement
 | -                          | waitForEnabled
 | -                          | waitForInvisible
 | -                          | waitForText
 | -                          | waitForValue
 | -                          | waitForVisible
 | -                          | waitInUrl
 | -                          | waitNumberOfVisibleElements
 | -                          | waitToHide
 | -                          | waitUntil
 | -                          | waitUrlEquals
 | -                          | locator
```

## Fake

