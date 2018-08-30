import { CmdCmp, CmdCfg } from "./CommandMapper";

/** Maps available commands. ORDER MATTERS */
export const CODECEPTJS_COMMANDS: CmdCfg[] = [
    // accept
    { action: 'accept', comp: CmdCmp.SAME_OPTION, options: [ 'alert' ], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CmdCmp.SAME_OPTION, options: [ 'confirm' ], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CmdCmp.SAME_OPTION, options: [ 'popup' ], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CmdCmp.SAME_OPTION, options: [ 'prompt' ], template: 'I.acceptPopup();' },
    // amOn
    { action: 'amOn', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
    { action: 'amOn', comp: CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
    { action: 'amOn', comp: CmdCmp.ONE_TARGET, template: 'I.amOnPage({{{target}}});' },
    // append
    { action: 'append', comp: CmdCmp.ONE_TARGET__ONE_VALUE_OR_NUMBER, template: 'I.appendField({{{target}}}, {{{value}}});' },
    // attachFile
    { action: 'attachFile', comp: CmdCmp.ONE_TARGET__ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
    { action: 'fill', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'inputFile', template: 'I.attachFile({{{target}}}, {{{value}}});' },
    // cancel
    { action: 'cancel', comp: CmdCmp.SAME_OPTION, options: [ 'alert' ], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CmdCmp.SAME_OPTION, options: [ 'confirm' ], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CmdCmp.SAME_OPTION, options: [ 'popup' ], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CmdCmp.SAME_OPTION, options: [ 'prompt' ], template: 'I.cancelPopup();' },
    // check
    { action: 'check', comp: CmdCmp.ONE_VALUE__ONE_TARGET, template: 'I.checkOption({{{value}}}, {{{target}}});' },
    { action: 'check', comp: CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CmdCmp.TWO_TARGETS, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.checkOption({{{value}}});' },
    // clear + cookie
    { action: 'clear', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
    { action: 'clear', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'cookie', template: 'I.clearCookie({{{value}}});' },
    { action: 'clear', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, targetType: 'cookie', template: 'I.clearCookie({{{value}}});' },
    // clear + field
    { action: 'clear', comp: CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
    { action: 'clear', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'field' ], template: 'I.clearField({{{target}}});' },
    // click
    { action: 'click', comp: CmdCmp.ONE_VALUE_OR_NUMBER__ONE_TARGET, template: 'I.click({{{value}}}, {{{target}}});' },
    { action: 'click', comp: CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
    { action: 'click', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.click({{{value}}});' },
    { action: 'click', comp: CmdCmp.TWO_TARGETS, template: 'I.click({{{target}}});' },
    // close + app (Appium only)
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'app' ], template: 'I.closeApp();' },
    // close + currentTab
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'currentTab' ], template: 'I.closeCurrentTab();' },
    // close + otherTabs
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'otherTabs' ], template: 'I.closeOtherTabs();' },
    // connect + database (usually during a Test Event)
    { action: 'connect', comp: CmdCmp.TWO_VALUES_SAME_OPTION, options: [ 'database' ], valuesAsNonArray: true, template: 'I.connect({{{value}}});' },
    // disconnect + database (usually during a Test Event)
    { action: 'disconnect', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'database' ], valuesAsNonArray: true, template: 'await I.disconnect({{{value}}});' },
    // doubleClick
    { action: 'doubleClick', comp: CmdCmp.ONE_VALUE_OR_NUMBER__ONE_TARGET, template: 'I.doubleClick({{{value}}}, {{{target}}});' },
    { action: 'doubleClick', comp: CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
    { action: 'doubleClick', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.doubleClick({{{value}}});' },
    { action: 'doubleClick', comp: CmdCmp.TWO_TARGETS, template: 'I.doubleClick({{{target}}});' },
    // drag
    { action: 'drag', comp: CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
    // fill
    { action: 'fill', comp: CmdCmp.ONE_TARGET__ONE_VALUE_OR_NUMBER, template: 'I.fillField({{{target}}}, {{{value}}});' },
    // hide + keyboard (Appium only)
    { action: 'hide', comp: CmdCmp.SAME_OPTION, options: [ 'keyboard' ], template: 'I.hideDeviceKeyboard();' },
    // install (Appium only)
    { action: 'install', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'app' ], template: 'I.installApp({{{value}}});' },
    { action: 'install', comp: CmdCmp.ONE_VALUE, template: 'I.installApp({{{value}}});' },
    // maximize + window
    { action: 'maximize', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'window', template: 'I.resizeWindow("maximize");' },
    { action: 'maximize', comp: CmdCmp.SAME_OPTION, options: [ 'window' ], template: 'I.resizeWindow("maximize");' },
    // move + cursor + target [ + x, y ]
    { action: 'move', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__TWO_NUMBERS, targetType: 'cursor', valuesAsNonArray: true, template: 'I.moveCursorTo({{{target}}}, {{{value}}});' },
    { action: 'move', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'cursor', template: 'I.moveCursorTo({{{target}}});' },
    { action: 'move', comp: CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: [ 'cursor' ], valuesAsNonArray: true, template: 'I.moveCursorTo({{{target}}}, {{{value}}});' },
    { action: 'move', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'cursor' ], template: 'I.moveCursorTo({{{target}}});' },
    // open + notifications (Appium only)
    { action: 'open', comp: CmdCmp.SAME_OPTION, options: [ 'notifications' ], template: 'I.openNotifications();' },
    // press
    { action: 'press', comp: CmdCmp.ONE_VALUE_OR_NUMBER__OR_ARRAY, template: 'I.pressKey({{{value}}});' },
    // pull + file (Appium only)
    { action: 'pull', comp: CmdCmp.TWO_VALUES_SAME_OPTION, targetType: 'fileInput', valuesAsNonArray: true, template: 'I.pullFile({{{value}}});' },
    { action: 'pull', comp: CmdCmp.TWO_VALUES_SAME_OPTION, options: [ 'file' ], valuesAsNonArray: true, template: 'I.pullFile({{{value}}});' },
    // refresh + ( page | currentPage )
    { action: 'refresh', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'page', template: 'I.refreshPage();' },
    { action: 'refresh', comp: CmdCmp.SAME_OPTION, options: [ 'currentPage' ], template: 'I.refreshPage();' },
    { action: 'refresh', comp: CmdCmp.SAME_OPTION, options: [ 'page' ], template: 'I.refreshPage();' },
    // remove + app (Appium only)
    { action: 'remove', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'app' ], template: 'I.removeApp({{{value}}});' },
    // resize + window
    { action: 'resize', comp: CmdCmp.TWO_NUMBERS_SAME_TARGET_TYPE, targetType: 'window', valuesAsNonArray: true, template: 'I.resizeWindow({{{value}}});' },
    { action: 'resize', comp: CmdCmp.TWO_NUMBERS_SAME_OPTION, options: [ 'window' ], valuesAsNonArray: true, template: 'I.resizeWindow({{{value}}});' },
    // rightClick
    { action: 'rightClick', comp: CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
    { action: 'rightClick', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.rightClick({{{value}}});' },
    // rotate (Appium only)
    { action: 'rotate', comp: CmdCmp.TWO_NUMBERS, valuesAsNonArray: true, template: 'I.rotate({{{value}}});' },
    // run + command (usually during a Test Event)
    { action: 'run', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'command' ], singleQuotedValues: true, template: 'await I.runCommand({{{value}}});' },
    // run + script (usually during a Test Event)
    { action: 'run', comp: CmdCmp.TWO_VALUES_SAME_OPTION, options: [ 'script' ], valuesAsNonArray: true, singleQuotedValues: true, template: 'await I.run({{{value}}});' },
    // saveScreenshot
    { action: 'saveScreenshot', comp: CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
    // scrollTo + ( value | number | target )
    { action: 'scrollTo', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.scrollTo({{{value}}});' },
    { action: 'scrollTo', comp: CmdCmp.ONE_TARGET, template: 'I.scrollTo({{{target}}});' },
    // see + app + installed (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: [ 'app', 'installed' ], template: 'I.seeAppIsInstalled({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: [ 'app', 'uninstalled' ], modifier: 'not', template: 'I.seeAppIsInstalled({{{value}}});' },
    // see + app + installed + not (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: [ 'app', 'installed' ], modifier: 'not', template: 'I.seeAppIsNotInstalled({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: [ 'app', 'uninstalled' ], template: 'I.seeAppIsNotInstalled({{{value}}});' },
    // see + currentActivity + value (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: [ 'currentActivity' ], template: 'I.seeCurrentActivityIs({{{value}}});' },
    // see + device + locked (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'device', 'locked' ], template: 'I.seeDeviceIsLocked();' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'device', 'locked' ], modifier: 'not', template: 'I.seeDeviceIsUnlocked();' },
    // see + device + unlocked (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'device', 'unlocked' ], template: 'I.seeDeviceIsUnlocked();' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'device', 'unlocked' ], modifier: 'not', template: 'I.seeDeviceIsLocked();' },
    // see + orientation + landscape (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'orientation', 'landscape' ], template: 'I.seeOrientationIs("LANDSCAPE");' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'orientation', 'landscape' ], modifier: 'not', template: 'I.seeOrientationIs("PORTRAIT");' },
    // see + orientation + portrait (Appium only)
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'orientation', 'portrait' ], template: 'I.seeOrientationIs("PORTRAIT");' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION, options: [ 'orientation', 'portrait' ], modifier: 'not', template: 'I.seeOrientationIs("LANDSCAPE");' },

    // see + field as option + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'field' ], template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + field as option + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'field' ], modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + textbox as target type + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textbox as target type + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + textarea as target type + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textarea as target type + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },

    // see + value | number + inside + target
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'inside' ], template: 'I.see({{{value}}}, {{{target}}});' },
    // see + value | number + not + inside + target
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'inside' ], modifier: 'not', template: 'I.dontSee({{{value}}}, {{{target}}});' },
    // see + with + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'with' ], template: 'I.see({{{value}}}, {{{target}}});' },
    // see + with + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'with' ], modifier: 'not', template: 'I.dontSee({{{value}}}, {{{target}}});' },

    // see + checkbox [+ not] + checked
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: [ 'checked' ], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: [ 'checked' ], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET, options: [ 'checked' ], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET, options: [ 'checked' ], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    // see + checkbox [+ not] + unchecked
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: [ 'unchecked' ], modifier: 'not', template: 'I.seeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: [ 'unchecked' ], template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET, options: [ 'unchecked' ], modifier: 'not', template: 'I.seeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET, options: [ 'unchecked' ], template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },

    // see + cookie + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'cookie' ], template: 'I.seeCookie({{{value}}});' },
    // see + cookie + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'cookie' ], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },

    // see + text + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'text', template: 'I.seeTextEquals({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'text' ], template: 'I.seeTextEquals({{{value}}});' },
    // see + text + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'text', modifier: 'not', template: 'I.dontSeeTextEquals({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'text' ], modifier: 'not', template: 'I.dontSeeTextEquals({{{value}}});' },

    // see + title + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'title' ], template: 'I.seeInTitle({{{value}}});' },
    // see + title + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'title' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },

    // see + url + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'url' ], template: 'I.seeInCurrentUrl({{{value}}});' },
    // see + url + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'url' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },

    // see + target
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__ONE_TARGET, template: 'I.seeElement({{{target}}});' },
    // see + target + not
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__ONE_TARGET, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },

    // see + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__ONE_VALUE_OR_NUMBER, template: 'I.see({{{value}}});' },
    // see + not + value | number
    { action: 'see', comp: CmdCmp.SAME_MODIFIER__ONE_VALUE_OR_NUMBER, modifier: 'not', template: 'I.dontSee({{{value}}});' },

    // select + value | number
    { action: 'select', comp: CmdCmp.ONE_TARGET__ONE_VALUE_OR_NUMBER, template: 'I.selectOption({{{target}}}, {{{value}}});' },

    // shake (Appium only)
    { action: 'shake', comp: CmdCmp.SAME_OPTION, options: [], template: 'I.shakeDevice();' },

    // swipe + down (Appium only)
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: [ 'down' ], valuesAsNonArray: true, template: 'I.swipeDown({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'down' ], template: 'I.swipeDown({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'down' ], template: 'I.swipeDown({{{target}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: [ 'down' ], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'down' ], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'down' ], template: 'I.swipeDown({{{value}}});' },
    // swipe + left (Appium only)
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: [ 'left' ], valuesAsNonArray: true, template: 'I.swipeLeft({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'left' ], template: 'I.swipeLeft({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'left' ], template: 'I.swipeLeft({{{target}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: [ 'left' ], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'left' ], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'left' ], template: 'I.swipeLeft({{{value}}});' },
    // swipe + right (Appium only)
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: [ 'right' ], valuesAsNonArray: true, template: 'I.swipeRight({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'right' ], template: 'I.swipeRight({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'right' ], template: 'I.swipeRight({{{target}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: [ 'right' ], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'right' ], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'right' ], template: 'I.swipeRight({{{value}}});' },
    // swipe + up (Appium only)
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: [ 'up' ], valuesAsNonArray: true, template: 'I.swipeUp({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'up' ], template: 'I.swipeUp({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'up' ], template: 'I.swipeUp({{{target}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: [ 'up' ], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'up' ], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'up' ], template: 'I.swipeUp({{{value}}});' },

    // swipe (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_TARGET__TWO_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_TARGET__THREE_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{target}}}, {{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE__TWO_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE__THREE_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.TWO_TARGETS, template: 'I.swipeTo({{{target}}});' },

    // switch + native (Appium only)
    { action: 'switch', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'native' ], template: 'I.switchToNative({{{value}}});' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'native' ], template: 'I.switchToNative();' },
    // switch + web (Appium only)
    { action: 'switch', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'web' ], template: 'I.switchToWeb({{{value}}});' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'web' ], template: 'I.switchToWeb();' },

    // switch + tab + number
    { action: 'switch', comp: CmdCmp.SAME_TARGET_TYPE__ONE_NUMBER, targetType: 'tab', template: 'I.switchToNextTab({{{value}}});' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION__ONE_NUMBER, options: [ 'tab' ], template: 'I.switchToNextTab({{{value}}});' },
    // switch + next + tab
    { action: 'switch', comp: CmdCmp.SAME_OPTION__SAME_TARGET_TYPE, targetType: 'tab', options: [ 'next' ], template: 'I.switchToNextTab();' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'next', 'tab' ], template: 'I.switchToNextTab();' },
    // switch + previous + tab
    { action: 'switch', comp: CmdCmp.SAME_OPTION__SAME_TARGET_TYPE, targetType: 'tab', options: [ 'previous' ], template: 'I.switchToPreviousTab();' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'previous', 'tab' ], template: 'I.switchToPreviousTab();' },

    // tap (Appium only)
    { action: 'tap', comp: CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
    { action: 'tap', comp: CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },

    // uncheck
    { action: 'uncheck', comp: CmdCmp.ONE_VALUE_OR_NUMBER__ONE_TARGET, template: 'I.uncheckOption({{{value}}}, {{{target}}});' },
    { action: 'uncheck', comp: CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
    { action: 'uncheck', comp: CmdCmp.TWO_TARGETS, template: 'I.uncheckOption({{{target}}});' },
    { action: 'uncheck', comp: CmdCmp.ONE_VALUE_OR_NUMBER, template: 'I.uncheckOption({{{value}}});' },

    // uninstall (Appium only)
    { action: 'uninstall', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'app' ], template: 'I.removeApp({{{value}}});' },
    { action: 'uninstall', comp: CmdCmp.ONE_VALUE, template: 'I.removeApp({{{value}}});' },

    // wait + url
    { action: 'wait', comp: CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'url', options: [ 'inside' ], template: 'I.waitInUrl({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER, targetType: 'url', options: [ 'inside' ], valuesAsNonArray: true, template: 'I.waitInUrl({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE__ONE_NUMBER, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'url' ], template: 'I.waitUrlEquals({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'url' ], template: 'I.waitUrlEquals({{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE, options: [ 'url' ], template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'url' ], valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },

    // wait + target + number + visible + elements
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'visible', 'elements' ], valuesAsNonArray: true, template: 'I.waitNumberOfVisibleElements({{{target}}}, {{{value}}});' },

    // wait + visible
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'visible' ], template: 'I.waitForVisible({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'visible' ], template: 'I.waitForVisible({{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER, options: [ 'visible' ], valuesAsNonArray: true, template: 'I.waitForVisible({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'visible' ], template: 'I.waitForVisible({{{value}}});' },

    // wait + invisible
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'invisible' ], template: 'I.waitForInvisible({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'invisible' ], template: 'I.waitForInvisible({{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER, options: [ 'invisible' ], valuesAsNonArray: true, template: 'I.waitForInvisible({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'invisible' ], template: 'I.waitForInvisible({{{value}}});' },

    // wait + enabled
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'enabled' ], template: 'I.waitForEnabled({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'enabled' ], template: 'I.waitForEnabled({{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER, options: [ 'enabled' ], valuesAsNonArray: true, template: 'I.waitForEnabled({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'enabled' ], template: 'I.waitForEnabled({{{value}}});' },

    // wait + hidden
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'hidden' ], template: 'I.waitToHide({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'hidden' ], template: 'I.waitToHide({{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER, options: [ 'hidden' ], valuesAsNonArray: true, template: 'I.waitToHide({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'hidden' ], template: 'I.waitToHide({{{value}}});' },

    // wait + text
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER, targetType: 'text', template: 'I.waitForText({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER, targetType: 'text', template: 'I.waitForText({{{value}}}, 1, {{{target}}});' },

    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER__ONE_TARGET, targetType: 'text', valuesAsNonArray: true, template: 'I.waitForText({{{value}}}, {{{target}}});' },
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'text', template: 'I.waitForText({{{target}}});' },

    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER, targetType: 'text', valuesAsNonArray: true, template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER, targetType: 'text', template: 'I.waitForText({{{value}}});' },

    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET, options: [ 'text' ], valuesAsNonArray: true, template: 'I.waitForText({{{value}}}, {{{target}}});' },

    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: [ 'text' ], template: 'I.waitForText({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET, options: [ 'text' ], template: 'I.waitForText({{{target}}});' },

    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER, options: [ 'text' ], template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: [ 'text' ], valuesAsNonArray: true, template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE, options: [ 'text' ], valuesAsNonArray: true, template: 'I.waitForText({{{value}}});' },

    // wait + value
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER__ONE_NUMBER, options: [ 'value' ], valuesAsNonArray: true, template: 'I.waitForValue({{{target}}}, {{{value}}});' }, // target, value, duration
    { action: 'wait', comp: CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER, options: [ 'value' ], template: 'I.waitForValue({{{target}}}, {{{value}}});' }, // target, value

    // wait + target
    { action: 'wait', comp: CmdCmp.ONE_TARGET__ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' }, // target, duration
    { action: 'wait', comp: CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },
    { action: 'wait', comp: CmdCmp.ONE_VALUE, template: 'I.waitForElement({{{value}}});' }, // value, duration
    { action: 'wait', comp: CmdCmp.ONE_VALUE_OR_NUMBER__ONE_NUMBER, valuesAsNonArray: true, template: 'I.waitForElement({{{value}}});' }, // value, duration

    // wait
    { action: 'wait', comp: CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' }
];