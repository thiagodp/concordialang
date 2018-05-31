import { CmdCmp, CmdCfg } from "./CommandMapper";

/** Maps available commands. ORDER MATTERS */
export const CODECEPTJS_COMMANDS: CmdCfg[] = [
    // amOn
    { action: 'amOn', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
    { action: 'amOn', comp: CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
    // append
    { action: 'append', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.appendField({{{target}}}, {{{value}}});' },
    // attachFile
    { action: 'attachFile', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
    // check
    { action: 'check', comp: CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },
    // clear + cookie
    { action: 'clear', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
    // clear + field
    { action: 'clear', comp: CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
    // click
    { action: 'click', comp: CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
    { action: 'click', comp: CmdCmp.ONE_VALUE, template: 'I.click({{{value}}});' },
    // close + app (Appium only)
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'app' ], template: 'I.closeApp();' },
    // close + currentTab
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'currentTab' ], template: 'I.closeCurrentTab();' },
    // close + otherTabs
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'otherTabs' ], template: 'I.closeOtherTabs();' },
    // doubleClick
    { action: 'doubleClick', comp: CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
    { action: 'doubleClick', comp: CmdCmp.ONE_VALUE, template: 'I.doubleClick({{{value}}});' },
    // drag
    { action: 'drag', comp: CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
    // fill
    { action: 'fill', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.fillField({{{target}}}, {{{value}}});' },
    // hide + keyboard (Appium only)
    { action: 'hide', comp: CmdCmp.SAME_OPTION, options: [ 'keyboard' ], template: 'I.hideDeviceKeyboard();' },
    // install (Appium only)
    { action: 'install', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'app' ], template: 'I.installApp({{{value}}});' },
    // maximize + window
    { action: 'maximize', comp: CmdCmp.SAME_OPTION, options: [ 'window' ], template: 'I.resizeWindow("maximize");' },
    // move + cursor
    { action: 'move', comp: CmdCmp.ONE_TARGET_TWO_NUMBERS_SAME_OPTION, options: [ 'cursor' ], valuesAsNonArray: true, template: 'I.moveCursorTo({{{target}}}, {{{value}}});' },
    { action: 'move', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'cursor' ], template: 'I.moveCursorTo({{{target}}});' },
    // open + notifications (Appium only)
    { action: 'open', comp: CmdCmp.SAME_OPTION, options: [ 'notifications' ], template: 'I.openNotifications();' },
    // press
    { action: 'press', comp: CmdCmp.ONE_VALUE_OR_ARRAY, template: 'I.pressKey({{{value}}});' },
    // pull + file (Appium only)
    { action: 'pull', comp: CmdCmp.TWO_VALUES_SAME_OPTION, options: [ 'file' ], valuesAsNonArray: true, template: 'I.pullFile({{{value}}});' },
    // refresh + currentPage
    { action: 'refresh', comp: CmdCmp.SAME_OPTION, options: [ 'currentPage' ], template: 'I.refreshPage();' },
    // refresh + url
    { action: 'refresh', comp: CmdCmp.SAME_OPTION, options: [ 'url' ], template: 'I.refreshPage();' },
    // remove + app (Appium only)
    { action: 'remove', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'app' ], template: 'I.removeApp({{{value}}});' },
    // resize + window
    { action: 'resize', comp: CmdCmp.TWO_NUMBERS_SAME_OPTION, options: [ 'window' ], valuesAsNonArray: true, template: 'I.resizeWindow({{{value}}});' },
    // rightClick
    { action: 'rightClick', comp: CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
    { action: 'rightClick', comp: CmdCmp.ONE_VALUE, template: 'I.rightClick({{{value}}});' },
    // rotate (Appium only)
    { action: 'rotate', comp: CmdCmp.TWO_NUMBERS, valuesAsNonArray: true, template: 'I.rotate({{{value}}});' },
    // saveScreenshot
    { action: 'saveScreenshot', comp: CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
    // see + app + installed (Appium only)
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'app', 'installed' ], template: 'I.seeAppIsInstalled({{{value}}});' },
    // see + app + installed + not (Appium only)
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'app', 'installed' ], modifier: 'not', template: 'I.seeAppIsNotInstalled({{{value}}});' },
    // see + currentActivity + value (Appium only)
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'currentActivity' ], template: 'I.seeCurrentActivityIs({{{value}}});' },
    // see + device + locked (Appium only)
    { action: 'see', comp: CmdCmp.SAME_OPTION, options: [ 'device', 'locked' ], template: 'I.seeDeviceIsLocked();' },
    // see + device + unlocked (Appium only)
    { action: 'see', comp: CmdCmp.SAME_OPTION, options: [ 'device', 'unlocked' ], template: 'I.seeDeviceIsUnlocked();' },
    // see + orientation + landscape (Appium only)
    { action: 'see', comp: CmdCmp.SAME_OPTION, options: [ 'orientation', 'landscape' ], template: 'I.seeOrientationIs("LANDSCAPE");' },
    // see + orientation + portrait (Appium only)
    { action: 'see', comp: CmdCmp.SAME_OPTION, options: [ 'orientation', 'portrait' ], template: 'I.seeOrientationIs("PORTRAIT");' },
    // see + textbox
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textbox + not
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + textarea
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textarea + not
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + checkbox
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: [ 'checked' ], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    // see + checkbox + not
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: [ 'checked' ], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    // see + cookie
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'cookie' ], template: 'I.seeCookie({{{value}}});' },
    // see + cookie + not
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'cookie' ], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    // see + title
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'title' ], template: 'I.seeInTitle({{{value}}});' },
    // see + title + not
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'title' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    // see + url
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'url' ], template: 'I.seeInCurrentUrl({{{value}}});' },
    // see + url + not
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'url' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    // see + target
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, template: 'I.seeElement({{{target}}});' },
    // see + target + not
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },
    // see
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, template: 'I.see({{{value}}});' },
    // see + not
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, modifier: 'not', template: 'I.dontSee({{{value}}});' },
    // select
    { action: 'select', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.selectOption({{{target}}}, {{{value}}});' },
    // shake (Appium only)
    { action: 'shake', comp: CmdCmp.SAME_OPTION, options: [], template: 'I.shakeDevice();' },
    // swipe + down (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION, options: [ 'down' ], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION, options: [ 'down' ], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    // swipe + left (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION, options: [ 'left' ], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION, options: [ 'left' ], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    // swipe + right (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION, options: [ 'right' ], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION, options: [ 'right' ], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    // swipe + up (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION, options: [ 'up' ], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION, options: [ 'up' ], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    // swipe (Appium only)
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_TWO_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    { action: 'swipe', comp: CmdCmp.ONE_VALUE_THREE_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    // switch + native (Appium only)
    { action: 'switch', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'native' ], template: 'I.switchToNative({{{value}}});' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'native' ], template: 'I.switchToNative();' },
    // switch + web (Appium only)
    { action: 'switch', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'web' ], template: 'I.switchToWeb({{{value}}});' },
    { action: 'switch', comp: CmdCmp.SAME_OPTION, options: [ 'web' ], template: 'I.switchToWeb();' },
    // tap (Appium only)
    { action: 'tap', comp: CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
    { action: 'tap', comp: CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },
    // uncheck
    { action: 'uncheck', comp: CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
    // wait + url
    { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
    // wait + visible
    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'visible' ], template: 'I.waitForVisible({{{target}}});' },
    // wait + invisible
    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'invisible' ], template: 'I.waitForInvisible({{{target}}});' },
    // wait + enabled
    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'enabled' ], template: 'I.waitForEnabled({{{target}}});' },
    // wait + text
    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'text', template: 'I.waitForText({{{target}}});' },
    { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'text' ], template: 'I.waitForText({{{value}}});' },
    // wait + target
    { action: 'wait', comp: CmdCmp.ONE_TARGET_ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },
    // wait
    { action: 'wait', comp: CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' },
];